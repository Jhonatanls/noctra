// GENERADO por scripts/sync-combos.mjs desde packages/combos/src/combos.js. No editar a mano.
/**
 * Lógica pura de combos de precio fijo (SPEC-005).
 * Fuente única: la usan la Shopify Function y el tema (copia en theme/assets/combos.js).
 * Precios en centavos de COP, igual que Shopify.
 */

/**
 * @typedef {{ id: string, precio: number, cantidad: number, grupo: string | null }} Linea
 * @typedef {{ id: string, nombre: string, precio: number, requisitos: Record<string, number>,
 *             desde?: string, hasta?: string, activo?: boolean, limitePorPedido?: number }} Combo
 */

/** Indica si un combo está vigente en la fecha dada (YYYY-MM-DD, hora de Colombia). */
export function comboVigente(combo, hoy) {
  if (combo.activo === false) return false;
  if (combo.desde && hoy < combo.desde) return false;
  if (combo.hasta && hoy > combo.hasta) return false;
  return Object.values(combo.requisitos || {}).every((n) => Number.isInteger(n) && n > 0);
}

/** Expande las líneas en unidades individuales, ordenadas de mayor a menor precio. */
function expandir(lineas) {
  const unidades = [];
  for (const linea of lineas) {
    if (!linea.grupo) continue;
    for (let i = 0; i < linea.cantidad; i++) {
      unidades.push({ lineaId: linea.id, precio: linea.precio, grupo: linea.grupo });
    }
  }
  return unidades.sort((a, b) => b.precio - a.precio);
}

/** Elige las unidades más caras disponibles que cumplen los requisitos del combo, o null. */
function seleccionar(combo, disponibles) {
  const elegidas = [];
  for (const [grupo, cantidad] of Object.entries(combo.requisitos)) {
    const delGrupo = disponibles.filter((u) => u.grupo === grupo && !elegidas.includes(u));
    if (delGrupo.length < cantidad) return null;
    elegidas.push(...delGrupo.slice(0, cantidad));
  }
  return elegidas;
}

/** Reparte el descuento entre unidades en proporción a su precio, sin perder centavos. */
function repartir(unidades, descuento) {
  const total = unidades.reduce((s, u) => s + u.precio, 0);
  let asignado = 0;
  return unidades.map((u, i) => {
    const parte = i === unidades.length - 1
      ? descuento - asignado
      : Math.floor((descuento * u.precio) / total);
    asignado += parte;
    return { lineaId: u.lineaId, descuento: parte };
  });
}

/**
 * Aplica los combos al carrito: en cada ronda aplica el combo vigente con mayor ahorro positivo
 * usando las unidades más caras de cada grupo, hasta que ninguno ahorre.
 * @param {Linea[]} lineas
 * @param {Combo[]} combos
 * @param {{ hoy?: string }} [opciones]
 */
export function evaluarCarrito(lineas, combos, opciones = {}) {
  const hoy = opciones.hoy ?? new Date().toISOString().slice(0, 10);
  const vigentes = combos.filter((c) => comboVigente(c, hoy));
  let disponibles = expandir(lineas);
  const usos = new Map();
  const aplicaciones = [];

  for (;;) {
    let mejor = null;
    for (const combo of vigentes) {
      const usados = usos.get(combo.id) ?? 0;
      if (combo.limitePorPedido && usados >= combo.limitePorPedido) continue;
      const unidades = seleccionar(combo, disponibles);
      if (!unidades) continue;
      const ahorro = unidades.reduce((s, u) => s + u.precio, 0) - combo.precio;
      if (ahorro > 0 && (!mejor || ahorro > mejor.ahorro)) mejor = { combo, unidades, ahorro };
    }
    if (!mejor) break;
    aplicaciones.push({
      comboId: mejor.combo.id,
      nombre: mejor.combo.nombre,
      ahorro: mejor.ahorro,
      reparto: repartir(mejor.unidades, mejor.ahorro),
    });
    usos.set(mejor.combo.id, (usos.get(mejor.combo.id) ?? 0) + 1);
    disponibles = disponibles.filter((u) => !mejor.unidades.includes(u));
  }

  const descuentoPorLinea = {};
  for (const ap of aplicaciones) {
    for (const r of ap.reparto) {
      descuentoPorLinea[r.lineaId] = (descuentoPorLinea[r.lineaId] ?? 0) + r.descuento;
    }
  }

  return {
    aplicaciones,
    descuentoTotal: aplicaciones.reduce((s, a) => s + a.ahorro, 0),
    descuentoPorLinea,
    sobrantes: disponibles,
  };
}

/**
 * Calcula el combo más cercano con las unidades que quedaron sin combo (mensaje "te falta…").
 * Devuelve null si no hay ningún combo alcanzable.
 */
export function siguienteCombo(lineas, combos, opciones = {}) {
  const hoy = opciones.hoy ?? new Date().toISOString().slice(0, 10);
  const { sobrantes } = evaluarCarrito(lineas, combos, { hoy });
  let mejor = null;

  for (const combo of combos.filter((c) => comboVigente(c, hoy))) {
    const faltan = {};
    let totalFaltan = 0;
    let tieneAlgo = false;
    for (const [grupo, cantidad] of Object.entries(combo.requisitos)) {
      const tengo = sobrantes.filter((u) => u.grupo === grupo).length;
      if (tengo > 0) tieneAlgo = true;
      const falta = Math.max(0, cantidad - Math.min(tengo, cantidad));
      if (falta > 0) {
        faltan[grupo] = falta;
        totalFaltan += falta;
      }
    }
    if (!tieneAlgo || totalFaltan === 0) continue;
    if (!mejor || totalFaltan < mejor.totalFaltan
      || (totalFaltan === mejor.totalFaltan && combo.precio > mejor.precio)) {
      mejor = { comboId: combo.id, nombre: combo.nombre, faltan, totalFaltan, precio: combo.precio };
    }
  }
  return mejor;
}

/** Devuelve el grupo de un producto a partir de sus etiquetas (`grupo-tenis` → `tenis`). */
export function grupoDesdeEtiquetas(etiquetas = []) {
  const etiqueta = etiquetas.find((t) => String(t).toLowerCase().startsWith('grupo-'));
  return etiqueta ? String(etiqueta).toLowerCase().slice('grupo-'.length) : null;
}
