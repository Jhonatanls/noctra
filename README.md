# Noctra: tienda online

Tema de Shopify hecho a la medida y lógica de combos para Noctra, tienda de tenis y gorras en Colombia, desarrollada con Claude Code y subagentes siguiendo specs (ASDD).

- Empieza por **[CLAUDE.md](CLAUDE.md)**: visión, reglas, roles, etapas, agentes y MCP.
- Requerimientos: [docs/contexto/requerimientos.md](docs/contexto/requerimientos.md).
- Specs: [specs/README.md](specs/README.md).
- Configuración inicial de la tienda: [docs/operaciones/configuracion-inicial.md](docs/operaciones/configuracion-inicial.md).
- Ramas, ambientes y despliegue: [docs/operaciones/ramas-y-despliegue.md](docs/operaciones/ramas-y-despliegue.md).
- Cómo cargar productos, precios y fotos: [docs/operaciones/cargar-productos.md](docs/operaciones/cargar-productos.md).
- **Guía paso a paso para trabajar con Claude Code: [docs/GUIA-CLAUDE-CODE.md](docs/GUIA-CLAUDE-CODE.md).**

## Arranque rápido

```bash
npm test                          # pruebas de la lógica de combos
shopify theme dev -e desarrollo   # ver el tema en la tienda de desarrollo
claude                            # abrir Claude Code en esta carpeta
```

Primeras instrucciones sugeridas para Claude Code:

1. "Lee CLAUDE.md y el índice de specs, y dime qué falta para cerrar la etapa 1."
2. "Con el agente qa-calidad, revisa el tema en la tienda de desarrollo a 360 y 1280 px en ambos modos."
3. "Con el agente disenador-ui, revisa el uso del logo según docs/marca/README.md en todas las pantallas."
