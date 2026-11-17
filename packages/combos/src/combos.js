/**
 * Lógica pura de combos "Compra X lleva Y" (SPEC-005).
 *
 * IMPORTANTE: esta lógica NO cobra nada. El precio real lo pone Shopify con descuentos
 * automáticos nativos "Compra X lleva Y" (plan Basic, sin Functions propias). Este módulo solo
 * existe para que el tema calcule y MUESTRE en el carrito el ahorro esperado y mensajes como
 * "Agrega 1 par y activa Eclipse". Debe reproducir las reglas de los descuentos configurados
 * en el admin; si se cambian allá, se cambian en la configuración que el tema le pasa aquí.
 * Fuente única: este archivo; el tema usa la copia de theme/assets/combos.js (npm run sync:combos).
 *
 * Precios y montos en centavos de COP, igual que Shopify (cart.items[].final_price / original_price).
 *
 * API pública (exports):
 *   comboVigente(combo, hoy)                  -> boolean
 *   evaluarCarrito(lineas, combos, { hoy })   -> Resultado (qué combo aplica y cuánto ahorra)
 *   estadoCombos(lineas, combos, { hoy })     -> Estado (aplicado + qué falta para cada combo)
 *   grupoDesdeEtiquetas(etiquetas)            -> string | null (ayuda opcional)
 *
 * Formato de datos que el tema debe pasar:
 *   Linea = { id: string, precio: number, cantidad: number, grupo: string | null }
 *     - id: clave de la línea del carrito (line.key); precio: precio unitario en centavos
 *       (usar original_price: el descuento nativo se calcula sobre el precio de lista);
 *       grupo: identificador de la colección a la que pertenece el producto, p. ej.
 *       'tenis-en-combo' o 'gorras-en-combo' (el tema lo deduce del handle de la colección;
 *       los grupos deben coincidir con compra.grupo / lleva.grupo). Sin grupo = fuera de combos.
 *   Combo = {
 *     id, nombre, tipo: 'compraXllevaY',
 *     compra: { grupo, cantidad },
 *     lleva:  { grupo, cantidad, valor: { tipo: 'gratis' } | { tipo: 'porcentaje', valor: 1..100 }
 *                                      | { tipo: 'monto', valor: centavos por unidad } },
 *     limitePorPedido: 1 (por defecto 1), desde?: 'YYYY-MM-DD', hasta?: 'YYYY-MM-DD', activo?: boolean
 *   }
 *   Los combos vienen de configuración editable (metacampos/metaobjetos o ajustes del tema).
 *
 * Reglas modeladas:
 *   - Solo se aplica UN combo por pedido (los descuentos no se combinan entre sí): el de mayor
 *     ahorro; un combo sin ahorro positivo nunca se aplica. Se repite solo hasta limitePorPedido.
 *   - Las unidades de "compra" son las más caras del grupo. Las de "lleva" son las de MENOR
 *     precio entre las elegibles restantes. Si compra y lleva son el mismo grupo, las unidades
 *     se reparten del mismo conjunto (primero las más caras compran, la más barata se lleva).
 *   - 'monto' descuenta ese valor por unidad "lleva", sin superar su precio.
 */

/** Indica si un combo está vigente y bien formado en la fecha dada (YYYY-MM-DD, hora de Colombia). */
export function comboVigente(combo, hoy) {
  if (!combo || combo.tipo !== 'compraXllevaY') return false;
  if (combo.activo === false) return false;
  if (combo.desde && hoy < combo.desde) return false;
  if (combo.hasta && hoy > combo.hasta) return false;
  const { compra, lleva } = combo;
  if (!compra?.grupo || !lleva?.grupo) return false;
  if (!Number.isInteger(compra.cantidad) || compra.cantidad <= 0) return false;
  if (!Number.isInteger(lleva.cantidad) || lleva.cantidad <= 0) return false;
  const v = lleva.valor;
  if (!v) return false;
  if (v.tipo === 'gratis') return true;
  if (v.tipo === 'porcentaje') return typeof v.valor === 'number' && v.valor > 0 && v.valor <= 100;
  if (v.tipo === 'monto') return Number.isInteger(v.valor) && v.valor > 0;
  return false;
}

function hoyColombia(opciones) {
  return opciones.hoy ?? new Date(Date.now() - 5 * 3600 * 1000).toISOString().slice(0, 10);
}

/** Descuento de una unidad "lleva" según el valor del combo (centavos, nunca mayor al precio). */
function descuentoUnidad(valor, precio) {
  if (valor.tipo === 'gratis') return precio;
  if (valor.tipo === 'porcentaje') return Math.min(precio, Math.round((precio * valor.valor) / 100));
  return Math.min(precio, valor.valor);
}

/** Expande líneas en unidades; las de la misma línea comparten lineaId. Mayor a menor precio. */
function expandir(lineas) {
  const unidades = [];
  for (const l of lineas) {
    if (!l.grupo) continue;
    for (let i = 0; i < l.cantidad; i++) unidades.push({ lineaId: l.id, precio: l.precio, grupo: l.grupo });
  }
  return unidades.sort((a, b) => b.precio - a.precio);
}

/** Elige unidades de compra (las más caras) y de lleva (las más baratas restantes), o null. */
function seleccionar(combo, disponibles) {
  const { compra, lleva } = combo;
  const deCompra = disponibles.filter((u) => u.grupo === compra.grupo);
  if (deCompra.length < compra.cantidad) return null;
  const compradas = deCompra.slice(0, compra.cantidad);
  const restantes = disponibles.filter((u) => u.grupo === lleva.grupo && !compradas.includes(u));
  if (restantes.length < lleva.cantidad) return null;
  const llevadas = restantes.slice(restantes.length - lleva.cantidad);
  return { compradas, llevadas };
}

function ahorroDe(combo, llevadas) {
  return llevadas.reduce((s, u) => s + descuentoUnidad(combo.lleva.valor, u.precio), 0);
}

/**
 * Calcula qué combo aplica (como mucho uno, el de mayor ahorro) y el total esperado.
 * @returns {{ aplicaciones: Array<{comboId, nombre, ahorro, reparto}>, descuentoTotal: number,
 *             descuentoPorLinea: Record<string, number>, subtotal: number, total: number }}
 */
export function evaluarCarrito(lineas, combos, opciones = {}) {
  const hoy = hoyColombia(opciones);
  const vigentes = combos.filter((c) => comboVigente(c, hoy));
  const subtotal = lineas.reduce((s, l) => s + l.precio * l.cantidad, 0);
  let disponibles = expandir(lineas);

  let mejor = null;
  for (const combo of vigentes) {
    const sel = seleccionar(combo, disponibles);
    if (!sel) continue;
    const ahorro = ahorroDe(combo, sel.llevadas);
    if (ahorro > 0 && (!mejor || ahorro > mejor.ahorro)) mejor = { combo, ahorro };
  }

  const aplicaciones = [];
  if (mejor) {
    const limite = mejor.combo.limitePorPedido ?? 1;
    for (let uso = 0; uso < limite; uso++) {
      const sel = seleccionar(mejor.combo, disponibles);
      if (!sel) break;
      const ahorro = ahorroDe(mejor.combo, sel.llevadas);
      if (ahorro <= 0) break;
      const reparto = sel.llevadas.map((u) => ({ lineaId: u.lineaId, descuento: descuentoUnidad(mejor.combo.lleva.valor, u.precio) }));
      aplicaciones.push({ comboId: mejor.combo.id, nombre: mejor.combo.nombre, ahorro, reparto });
      const usadas = new Set([...sel.compradas, ...sel.llevadas]);
      disponibles = disponibles.filter((u) => !usadas.has(u));
    }
  }

  const descuentoPorLinea = {};
  for (const ap of aplicaciones) {
    for (const r of ap.reparto) descuentoPorLinea[r.lineaId] = (descuentoPorLinea[r.lineaId] ?? 0) + r.descuento;
  }
  const descuentoTotal = aplicaciones.reduce((s, a) => s + a.ahorro, 0);
  return { aplicaciones, descuentoTotal, descuentoPorLinea, subtotal, total: subtotal - descuentoTotal };
}

/**
 * Estado de cada combo vigente para armar mensajes del carrito.
 * Cada elemento de `combos`:
 *   { comboId, nombre, califica, aplicado, faltan: { compra, lleva, total, grupoCompra, grupoLleva },
 *     elegirLleva }
 *   - califica: el carrito ya tiene las unidades que el combo exige y habría ahorro.
 *   - aplicado: es el combo que realmente se aplica (el de mayor ahorro).
 *   - faltan.compra / faltan.lleva: unidades que faltan en cada parte (0 si ya están).
 *   - elegirLleva: la parte "compra" ya está completa, falta la parte "lleva" y esta es gratis
 *     (p. ej. Eclipse con 2 tenis y sin gorra: mostrar "Elige tu gorra de regalo").
 * `sugerencia`: el combo no calificado al que menos le falta y con algún avance en el carrito, o null.
 * @returns {{ aplicado: object | null, combos: object[], sugerencia: object | null, resultado: object }}
 */
export function estadoCombos(lineas, combos, opciones = {}) {
  const hoy = hoyColombia(opciones);
  const resultado = evaluarCarrito(lineas, combos, { hoy });
  const aplicadoId = resultado.aplicaciones[0]?.comboId ?? null;
  const unidades = expandir(lineas);
  const cuenta = (g) => unidades.filter((u) => u.grupo === g).length;

  const estados = combos.filter((c) => comboVigente(c, hoy)).map((combo) => {
    const { compra, lleva } = combo;
    let faltaCompra;
    let faltaLleva;
    if (compra.grupo === lleva.grupo) {
      const n = cuenta(compra.grupo);
      faltaCompra = Math.max(0, compra.cantidad - n);
      faltaLleva = Math.max(0, compra.cantidad + lleva.cantidad - n) - faltaCompra;
    } else {
      faltaCompra = Math.max(0, compra.cantidad - cuenta(compra.grupo));
      faltaLleva = Math.max(0, lleva.cantidad - cuenta(lleva.grupo));
    }
    const total = faltaCompra + faltaLleva;
    const sel = total === 0 ? seleccionar(combo, unidades) : null;
    const califica = !!sel && ahorroDe(combo, sel.llevadas) > 0;
    return {
      comboId: combo.id,
      nombre: combo.nombre,
      califica,
      aplicado: combo.id === aplicadoId,
      faltan: { compra: faltaCompra, lleva: faltaLleva, total, grupoCompra: compra.grupo, grupoLleva: lleva.grupo },
      elegirLleva: faltaCompra === 0 && faltaLleva > 0 && lleva.valor.tipo === 'gratis',
    };
  });

  const candidatos = estados.filter((e) => !e.califica && e.faltan.total > 0
    && (e.faltan.total < cuentaRequerida(combos, e.comboId)));
  candidatos.sort((a, b) => a.faltan.total - b.faltan.total);
  return {
    aplicado: resultado.aplicaciones[0] ?? null,
    combos: estados,
    sugerencia: candidatos[0] ?? null,
    resultado,
  };
}

/** Unidades totales que exige un combo (para saber si el carrito ya tiene algún avance). */
function cuentaRequerida(combos, id) {
  const c = combos.find((x) => x.id === id);
  return c.compra.cantidad + c.lleva.cantidad;
}

/** Devuelve el grupo de un producto a partir de sus etiquetas (`grupo-tenis` → `tenis`). */
export function grupoDesdeEtiquetas(etiquetas = []) {
  const etiqueta = etiquetas.find((t) => String(t).toLowerCase().startsWith('grupo-'));
  return etiqueta ? String(etiqueta).toLowerCase().slice('grupo-'.length) : null;
}
