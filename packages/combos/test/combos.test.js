import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluarCarrito, estadoCombos, comboVigente, grupoDesdeEtiquetas, siguientePaso } from '../src/combos.js';

const p = (pesos) => pesos * 100; // pesos → centavos
const HOY = '2026-12-10';
const T = 'tenis-en-combo';
const G = 'gorras-en-combo';

const lunaNueva = {
  id: 'luna-nueva', nombre: 'Luna Nueva', tipo: 'compraXllevaY', limitePorPedido: 1,
  compra: { grupo: T, cantidad: 1 },
  lleva: { grupo: G, cantidad: 1, valor: { tipo: 'monto', valor: p(45000) } },
};
const eclipse = {
  id: 'eclipse', nombre: 'Eclipse', tipo: 'compraXllevaY', limitePorPedido: 1,
  compra: { grupo: T, cantidad: 2 },
  lleva: { grupo: G, cantidad: 1, valor: { tipo: 'gratis' } },
};
const lunaLlena = {
  id: 'luna-llena', nombre: 'Luna Llena', tipo: 'compraXllevaY', limitePorPedido: 1,
  compra: { grupo: T, cantidad: 2 },
  lleva: { grupo: T, cantidad: 1, valor: { tipo: 'monto', valor: p(125000) } },
};
const COMBOS = [lunaNueva, eclipse, lunaLlena];

const tenis = (n, precio = 175000, id = 't') => ({ id, precio: p(precio), cantidad: n, grupo: T });
const gorras = (n, precio = 60000, id = 'g') => ({ id, precio: p(precio), cantidad: n, grupo: G });
const total = (lineas) => evaluarCarrito(lineas, COMBOS, { hoy: HOY });

test('1 tenis + 1 gorra = $190.000 (Luna Nueva)', () => {
  const r = total([tenis(1), gorras(1)]);
  assert.equal(r.aplicaciones[0].comboId, 'luna-nueva');
  assert.equal(r.total, p(190000));
});

test('2 tenis + 1 gorra = $350.000 (Eclipse gana a Luna Nueva)', () => {
  const r = total([tenis(2), gorras(1)]);
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.aplicaciones[0].comboId, 'eclipse');
  assert.equal(r.total, p(350000));
});

test('2 tenis + 2 gorras = $410.000 (un solo uso, la segunda gorra paga completa)', () => {
  const r = total([tenis(2), gorras(2)]);
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.total, p(410000));
});

test('3 tenis = $400.000 (Luna Llena)', () => {
  const r = total([tenis(3)]);
  assert.equal(r.aplicaciones[0].comboId, 'luna-llena');
  assert.equal(r.total, p(400000));
});

test('3 tenis + 1 gorra = $460.000 (Luna Llena ahorra más que Eclipse)', () => {
  const r = total([tenis(3), gorras(1)]);
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.aplicaciones[0].comboId, 'luna-llena');
  assert.equal(r.total, p(460000));
});

test('4 tenis = $575.000 (1 uso por pedido, el cuarto paga completo)', () => {
  const r = total([tenis(4)]);
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.total, p(575000));
});

test('1 tenis solo, o 2 tenis sin gorra, no activan descuento', () => {
  assert.equal(total([tenis(1)]).descuentoTotal, 0);
  assert.equal(total([tenis(2)]).total, p(350000));
});

test('Luna Llena descuenta al tenis de menor precio: 2x$175.000 + 1x$210.000', () => {
  const r = total([tenis(2, 175000, 'a'), tenis(1, 210000, 'b')]);
  assert.equal(r.aplicaciones[0].comboId, 'luna-llena');
  // 560.000 - 125.000; el descuento cae en un tenis de $175.000, no en el de $210.000
  assert.equal(r.total, p(435000));
  assert.equal(r.descuentoPorLinea.b, undefined);
  assert.equal(r.descuentoPorLinea.a, p(125000));
});

test('el monto fijo nunca supera el precio de la unidad', () => {
  const r = total([tenis(1), gorras(1, 30000)]);
  assert.equal(r.descuentoTotal, p(30000));
});

test('Eclipse regala la gorra de menor precio', () => {
  const r = total([tenis(2), gorras(1, 80000, 'cara'), gorras(1, 60000, 'barata')]);
  assert.equal(r.aplicaciones[0].comboId, 'eclipse');
  assert.equal(r.descuentoPorLinea.barata, p(60000));
  assert.equal(r.descuentoPorLinea.cara, undefined);
});

test('un producto fuera de la colección no cuenta', () => {
  const fuera = { id: 'x', precio: p(300000), cantidad: 2, grupo: null };
  const r = total([tenis(2), fuera]);
  assert.equal(r.descuentoTotal, 0);
  assert.equal(r.subtotal, p(950000));
  assert.equal(r.total, p(950000));
  // 2 tenis en combo + 1 fuera de colección no completan Luna Llena
  assert.equal(total([tenis(2), { ...fuera, cantidad: 1 }]).aplicaciones.length, 0);
});

test('combos fuera de vigencia, inactivos o mal formados no se aplican', () => {
  assert.equal(comboVigente({ ...eclipse, hasta: '2026-12-01' }, HOY), false);
  assert.equal(comboVigente({ ...eclipse, desde: '2026-12-20' }, HOY), false);
  assert.equal(comboVigente({ ...eclipse, activo: false }, HOY), false);
  assert.equal(comboVigente({ ...eclipse, compra: { grupo: T, cantidad: 0 } }, HOY), false);
  assert.equal(comboVigente({ ...eclipse, lleva: { ...eclipse.lleva, valor: { tipo: 'porcentaje', valor: 150 } } }, HOY), false);
  assert.equal(comboVigente(eclipse, HOY), true);
  const r = evaluarCarrito([tenis(2), gorras(1)], [{ ...eclipse, activo: false }], { hoy: HOY });
  assert.equal(r.descuentoTotal, 0);
});

test('porcentaje: 50% a la gorra', () => {
  const mitad = { ...lunaNueva, id: 'mitad', lleva: { ...lunaNueva.lleva, valor: { tipo: 'porcentaje', valor: 50 } } };
  const r = evaluarCarrito([tenis(1), gorras(1)], [mitad], { hoy: HOY });
  assert.equal(r.total, p(205000));
});

test('qué falta: 1 tenis + 1 gorra, para Eclipse falta 1 tenis', () => {
  const e = estadoCombos([tenis(1), gorras(1)], COMBOS, { hoy: HOY });
  const ecl = e.combos.find((c) => c.comboId === 'eclipse');
  assert.equal(ecl.califica, false);
  assert.deepEqual([ecl.faltan.compra, ecl.faltan.lleva, ecl.faltan.total], [1, 0, 1]);
  assert.equal(e.aplicado.comboId, 'luna-nueva');
  assert.equal(e.sugerencia.comboId, 'eclipse');
  assert.equal(e.sugerencia.faltan.grupoCompra, T);
});

test('qué falta: 2 tenis para Luna Llena falta 1 tenis (mismo grupo)', () => {
  const e = estadoCombos([tenis(2)], COMBOS, { hoy: HOY });
  const ll = e.combos.find((c) => c.comboId === 'luna-llena');
  assert.deepEqual([ll.faltan.compra, ll.faltan.lleva, ll.faltan.total], [0, 1, 1]);
  assert.equal(ll.elegirLleva, false); // no es gratis
});

test('qué falta: 1 tenis solo, Luna Nueva falta 1 gorra y Eclipse 1 tenis y 1 gorra', () => {
  const e = estadoCombos([tenis(1)], COMBOS, { hoy: HOY });
  const ln = e.combos.find((c) => c.comboId === 'luna-nueva');
  const ec = e.combos.find((c) => c.comboId === 'eclipse');
  assert.deepEqual([ln.faltan.compra, ln.faltan.lleva], [0, 1]);
  assert.deepEqual([ec.faltan.compra, ec.faltan.lleva, ec.faltan.total], [1, 1, 2]);
  assert.equal(e.aplicado, null);
  assert.equal(e.sugerencia.comboId, 'luna-nueva');
});

test('califica para Eclipse sin gorra: 2 tenis y 0 gorras pide elegir la gorra de regalo', () => {
  const e = estadoCombos([tenis(2)], COMBOS, { hoy: HOY });
  const ec = e.combos.find((c) => c.comboId === 'eclipse');
  assert.equal(ec.elegirLleva, true);
  assert.equal(ec.califica, false);
  assert.equal(ec.faltan.compra, 0);
  assert.equal(ec.faltan.lleva, 1);
  assert.equal(e.combos.find((c) => c.comboId === 'luna-nueva').elegirLleva, false);
});

test('con Eclipse completo no hay elegirLleva y está aplicado', () => {
  const e = estadoCombos([tenis(2), gorras(1)], COMBOS, { hoy: HOY });
  const ec = e.combos.find((c) => c.comboId === 'eclipse');
  assert.equal(ec.elegirLleva, false);
  assert.equal(ec.califica, true);
  assert.equal(ec.aplicado, true);
});

test('carrito vacío o sin productos de combo no sugiere nada', () => {
  assert.equal(estadoCombos([], COMBOS, { hoy: HOY }).sugerencia, null);
  const fuera = { id: 'x', precio: p(100000), cantidad: 1, grupo: null };
  assert.equal(estadoCombos([fuera], COMBOS, { hoy: HOY }).sugerencia, null);
});

test('grupoDesdeEtiquetas lee la etiqueta grupo-*', () => {
  assert.equal(grupoDesdeEtiquetas(['nuevo', 'grupo-tenis']), 'tenis');
  assert.equal(grupoDesdeEtiquetas(['nuevo']), null);
});

// --- Tope de 3 usos por pedido (decisión del equipo, 16 nov 2026) ---
const COMBOS_3 = COMBOS.map((c) => ({ ...c, limitePorPedido: 3 }));
const total3 = (lineas) => evaluarCarrito(lineas, COMBOS_3, { hoy: HOY });

const CASOS_TOPE_3 = [
  ['1T + 1G', [tenis(1), gorras(1)], 190000, 'luna-nueva', 1],
  ['2T + 1G', [tenis(2), gorras(1)], 350000, 'eclipse', 1],
  ['2T + 2G (Luna Nueva x2 gana a Eclipse)', [tenis(2), gorras(2)], 380000, 'luna-nueva', 2],
  ['3T', [tenis(3)], 400000, 'luna-llena', 1],
  ['3T + 1G', [tenis(3), gorras(1)], 460000, 'luna-llena', 1],
  ['3T + 3G (Luna Nueva x3)', [tenis(3), gorras(3)], 570000, 'luna-nueva', 3],
  ['4T', [tenis(4)], 575000, 'luna-llena', 1],
  ['4T + 4G (Luna Nueva topado en 3 usos)', [tenis(4), gorras(4)], 805000, 'luna-nueva', 3],
  ['6T (Luna Llena x2)', [tenis(6)], 800000, 'luna-llena', 2],
  ['6T + 3G (Luna Llena x2)', [tenis(6), gorras(3)], 980000, 'luna-llena', 2],
  ['9T (Luna Llena x3)', [tenis(9)], 1200000, 'luna-llena', 3],
  ['12T (tope de 3 usos)', [tenis(12)], 1725000, 'luna-llena', 3],
];

for (const [nombre, lineas, esperado, combo, usos] of CASOS_TOPE_3) {
  test('tope 3: ' + nombre + ' = ' + esperado, () => {
    const r = total3(lineas);
    assert.equal(r.total, p(esperado));
    assert.equal(r.aplicaciones[0].comboId, combo);
    assert.equal(r.aplicaciones.length, usos);
  });
}

test('siguientePaso: con 3 tenis y tope 3, sugiere 3 pares más para repetir Luna Llena', () => {
  const paso = siguientePaso([tenis(3)], COMBOS_3, { hoy: HOY });
  assert.deepEqual(paso.agregar, { [T]: 3 });
  assert.equal(paso.comboId, 'luna-llena');
  assert.equal(paso.usos, 2);
  assert.equal(paso.ahorroTotal, p(250000));
});

test('siguientePaso: con 1 tenis + 1 gorra sugiere 1 par para pasar a Eclipse', () => {
  const paso = siguientePaso([tenis(1), gorras(1)], COMBOS_3, { hoy: HOY });
  assert.deepEqual(paso.agregar, { [T]: 1 });
  assert.equal(paso.comboId, 'eclipse');
  assert.equal(paso.ahorroTotal, p(60000));
});

test('siguientePaso: con el tope alcanzado no sugiere repetir más', () => {
  assert.equal(siguientePaso([tenis(9)], COMBOS_3, { hoy: HOY }), null);
});

test('siguientePaso: sin productos de combo no sugiere nada', () => {
  assert.equal(siguientePaso([], COMBOS_3, { hoy: HOY }), null);
});

// --- Precios reales de la tienda (medidos en la tienda de desarrollo el 16 nov 2026) ---
// Tenis en combo $174.900, gorras en combo $49.900, Luna Nueva con $35.000 de descuento, tope de 3 usos.
// Los totales esperados son los que cobró Shopify en el carrito con esos descuentos.
const REALES = [
  { ...lunaNueva, limitePorPedido: 3, lleva: { ...lunaNueva.lleva, valor: { tipo: 'monto', valor: p(35000) } } },
  { ...eclipse, limitePorPedido: 3 },
  { ...lunaLlena, limitePorPedido: 3 },
];
const tReal = (n) => tenis(n, 174900);
const gReal = (n) => gorras(n, 49900);

const CASOS_REALES = [
  ['1T + 1G', [tReal(1), gReal(1)], 189800, 'luna-nueva'],
  ['2T + 1G', [tReal(2), gReal(1)], 349800, 'eclipse'],
  ['2T + 2G', [tReal(2), gReal(2)], 379600, 'luna-nueva'],
  ['3T', [tReal(3)], 399700, 'luna-llena'],
  ['3T + 1G', [tReal(3), gReal(1)], 449600, 'luna-llena'],
  ['4T', [tReal(4)], 574600, 'luna-llena'],
  ['6T', [tReal(6)], 799400, 'luna-llena'],
];

for (const [nombre, lineas, esperado, combo] of CASOS_REALES) {
  test('precios reales: ' + nombre + ' = ' + esperado + ' (igual a lo que cobró Shopify)', () => {
    const r = evaluarCarrito(lineas, REALES, { hoy: HOY });
    assert.equal(r.total, p(esperado));
    assert.equal(r.aplicaciones[0].comboId, combo);
  });
}
