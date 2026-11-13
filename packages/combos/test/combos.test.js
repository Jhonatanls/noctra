import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluarCarrito, siguienteCombo, comboVigente, grupoDesdeEtiquetas } from '../src/combos.js';

const p = (pesos) => pesos * 100; // pesos → centavos
const HOY = '2026-12-10';

const lookCompleto = { id: 'look-completo', nombre: 'Combo Look completo', precio: p(350000), requisitos: { tenis: 2, gorras: 1 } };
const tresTenis = { id: 'tres-tenis', nombre: 'Combo Tres tenis', precio: p(420000), requisitos: { tenis: 3 } };
const COMBOS = [lookCompleto, tresTenis];

test('2 tenis y 1 gorra aplican el combo de $350.000 con ahorro de $80.000', () => {
  const r = evaluarCarrito([
    { id: 'a', precio: p(190000), cantidad: 1, grupo: 'tenis' },
    { id: 'b', precio: p(180000), cantidad: 1, grupo: 'tenis' },
    { id: 'g', precio: p(60000), cantidad: 1, grupo: 'gorras' },
  ], COMBOS, { hoy: HOY });
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.aplicaciones[0].comboId, 'look-completo');
  assert.equal(r.descuentoTotal, p(80000));
});

test('3 tenis aplican el combo de $420.000 con ahorro de $150.000', () => {
  const r = evaluarCarrito([
    { id: 'a', precio: p(200000), cantidad: 1, grupo: 'tenis' },
    { id: 'b', precio: p(190000), cantidad: 1, grupo: 'tenis' },
    { id: 'c', precio: p(180000), cantidad: 1, grupo: 'tenis' },
  ], COMBOS, { hoy: HOY });
  assert.equal(r.aplicaciones[0].comboId, 'tres-tenis');
  assert.equal(r.descuentoTotal, p(150000));
});

test('una línea con cantidad 2 cuenta como 2 unidades', () => {
  const r = evaluarCarrito([
    { id: 'a', precio: p(180000), cantidad: 2, grupo: 'tenis' },
    { id: 'g', precio: p(60000), cantidad: 1, grupo: 'gorras' },
  ], COMBOS, { hoy: HOY });
  assert.equal(r.descuentoTotal, p(70000));
  assert.equal(r.descuentoPorLinea.a + r.descuentoPorLinea.g, p(70000));
});

test('el reparto del descuento suma exactamente el ahorro y es proporcional al precio', () => {
  const r = evaluarCarrito([
    { id: 'a', precio: p(190000), cantidad: 1, grupo: 'tenis' },
    { id: 'b', precio: p(180000), cantidad: 1, grupo: 'tenis' },
    { id: 'g', precio: p(60000), cantidad: 1, grupo: 'gorras' },
  ], COMBOS, { hoy: HOY });
  const suma = Object.values(r.descuentoPorLinea).reduce((s, v) => s + v, 0);
  assert.equal(suma, r.descuentoTotal);
  assert.ok(r.descuentoPorLinea.a > r.descuentoPorLinea.g);
});

test('un combo que no genera ahorro no se aplica', () => {
  const r = evaluarCarrito([
    { id: 'a', precio: p(100000), cantidad: 2, grupo: 'tenis' },
    { id: 'g', precio: p(30000), cantidad: 1, grupo: 'gorras' },
  ], COMBOS, { hoy: HOY });
  assert.equal(r.aplicaciones.length, 0);
  assert.equal(r.descuentoTotal, 0);
});

test('combos inactivos o fuera de vigencia no se aplican', () => {
  assert.equal(comboVigente({ ...lookCompleto, activo: false }, HOY), false);
  assert.equal(comboVigente({ ...lookCompleto, hasta: '2026-11-30' }, HOY), false);
  assert.equal(comboVigente({ ...lookCompleto, desde: '2027-01-01' }, HOY), false);
  assert.equal(comboVigente({ ...lookCompleto, desde: '2026-12-01', hasta: '2026-12-31' }, HOY), true);
});

test('limitePorPedido se respeta', () => {
  const limitado = { ...tresTenis, limitePorPedido: 1 };
  const r = evaluarCarrito([
    { id: 'a', precio: p(200000), cantidad: 6, grupo: 'tenis' },
  ], [limitado], { hoy: HOY });
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.sobrantes.length, 3);
});

test('aplica varios combos cuando alcanza y elige siempre el de mayor ahorro primero', () => {
  const r = evaluarCarrito([
    { id: 'a', precio: p(200000), cantidad: 4, grupo: 'tenis' },
    { id: 'g', precio: p(60000), cantidad: 1, grupo: 'gorras' },
  ], COMBOS, { hoy: HOY });
  // tres-tenis ahorra 180.000; look-completo ahorra 110.000 → primero tres-tenis, luego queda 1 tenis + 1 gorra
  assert.equal(r.aplicaciones[0].comboId, 'tres-tenis');
  assert.equal(r.aplicaciones.length, 1);
  assert.equal(r.descuentoTotal, p(180000));
});

test('productos sin grupo no participan en combos', () => {
  const r = evaluarCarrito([
    { id: 'x', precio: p(500000), cantidad: 3, grupo: null },
  ], COMBOS, { hoy: HOY });
  assert.equal(r.descuentoTotal, 0);
});

test('con 1 tenis el siguiente combo más cercano pide 1 tenis y 1 gorra o 2 tenis', () => {
  const s = siguienteCombo([
    { id: 'a', precio: p(190000), cantidad: 1, grupo: 'tenis' },
  ], COMBOS, { hoy: HOY });
  assert.equal(s.totalFaltan, 2);
  // empate en 2 unidades: gana el combo de mayor precio (mayor ahorro posible)
  assert.equal(s.comboId, 'tres-tenis');
  assert.deepEqual(s.faltan, { tenis: 2 });
});

test('con 2 tenis el siguiente combo pide 1 gorra o 1 tenis', () => {
  const s = siguienteCombo([
    { id: 'a', precio: p(190000), cantidad: 2, grupo: 'tenis' },
  ], COMBOS, { hoy: HOY });
  assert.equal(s.totalFaltan, 1);
});

test('con el carrito vacío no hay siguiente combo', () => {
  assert.equal(siguienteCombo([], COMBOS, { hoy: HOY }), null);
});

test('el grupo sale de la etiqueta grupo-*', () => {
  assert.equal(grupoDesdeEtiquetas(['nuevo', 'grupo-tenis']), 'tenis');
  assert.equal(grupoDesdeEtiquetas(['Grupo-Gorras']), 'gorras');
  assert.equal(grupoDesdeEtiquetas(['nuevo']), null);
});
