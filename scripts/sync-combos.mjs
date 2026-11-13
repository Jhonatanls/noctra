// Copia la lógica pura de combos al tema para que el carrito use exactamente la misma regla que la Function.
import { readFile, writeFile } from 'node:fs/promises';

const origen = new URL('../packages/combos/src/combos.js', import.meta.url);
const destino = new URL('../theme/assets/combos.js', import.meta.url);

const codigo = await readFile(origen, 'utf8');
const encabezado = '// GENERADO por scripts/sync-combos.mjs desde packages/combos/src/combos.js. No editar a mano.\n';
await writeFile(destino, encabezado + codigo);
console.log('combos.js sincronizado en theme/assets/');
