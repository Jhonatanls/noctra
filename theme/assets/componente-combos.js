/**
 * Mensajes de combos y gorra de regalo (SPEC-005 y SPEC-006).
 * Este código solo MUESTRA: el precio real lo calcula Shopify con los descuentos automáticos.
 * Los combos, los textos y el carrito llegan en el JSON de cada página (snippet combos-datos).
 */
const GRUPO_UNIDAD = { 'tenis-en-combo': 'par', 'gorras-en-combo': 'gorra' };

function formatoPesos(centavos) {
  const numero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0, useGrouping: 'always' }).format(Math.round(centavos / 100));
  return '$' + numero;
}

function rellenar(plantilla, valores) {
  return plantilla.replace(/\{(\w+)\}/g, (_, clave) => (clave in valores ? valores[clave] : ''));
}

class MensajesCombos extends HTMLElement {
  async connectedCallback() {
    const crudo = this.querySelector('script[data-combos-datos]');
    if (!crudo) return;
    try {
      this.datos = JSON.parse(crudo.textContent);
      this.motor = await import(this.dataset.motor);
    } catch (error) {
      return;
    }
    this.pintar();
  }

  unidades(grupo, n) {
    const clave = GRUPO_UNIDAD[grupo];
    if (!clave) return '';
    const t = this.datos.textos;
    return n === 1 ? t[`${clave}_uno`] : rellenar(t[`${clave}_otros`], { n });
  }

  /** Texto "1 gorra" o "2 pares y 1 gorra" con lo que le falta al carrito para un combo. */
  textoFaltan(faltan) {
    const partes = new Map();
    if (faltan.compra > 0) partes.set(faltan.grupoCompra, (partes.get(faltan.grupoCompra) ?? 0) + faltan.compra);
    if (faltan.lleva > 0) partes.set(faltan.grupoLleva, (partes.get(faltan.grupoLleva) ?? 0) + faltan.lleva);
    return [...partes].map(([grupo, n]) => this.unidades(grupo, n)).join(' y ');
  }

  /** Ahorro si el carrito sumara lo que falta para este combo (null si no se puede estimar). */
  ahorroSi(combo, faltan) {
    const { lineas, combos, hoy } = this.datos;
    const extra = [];
    const partes = [[faltan.grupoCompra, faltan.compra], [faltan.grupoLleva, faltan.lleva]];
    for (const [grupo, n] of partes) {
      if (n <= 0) continue;
      const precios = lineas.filter((l) => l.grupo === grupo).map((l) => l.precio);
      if (!precios.length) return null;
      extra.push({ id: `hipotetica-${extra.length}`, precio: Math.max(...precios), cantidad: n, grupo });
    }
    const res = this.motor.evaluarCarrito([...lineas, ...extra], combos, { hoy });
    return res.aplicaciones[0]?.comboId === combo.id ? res.descuentoTotal : null;
  }

  pintar() {
    const { lineas, combos, descuentos, hoy, textos: t, pagina } = this.datos;
    const contexto = this.dataset.contexto || 'carrito';
    const estado = this.motor.estadoCombos(lineas, combos, { hoy });
    const porId = new Map(combos.map((c) => [c.id, c]));
    const mensajes = [];
    let textoActivo = '';

    // El combo activo es el que Shopify realmente aplicó (mismo título que el descuento del admin)
    let real = null;
    for (const combo of combos) {
      const aplicacion = descuentos.find((d) => d.titulo === combo.nombre);
      if (aplicacion && combo.activo !== false) { real = { combo, monto: aplicacion.monto }; break; }
    }

    if (real) {
      textoActivo = rellenar(t.activo, { combo: real.combo.nombre, ahorro: formatoPesos(real.monto) });
      let texto = textoActivo;
      const mejores = estado.combos
        .filter((e) => !e.califica && e.faltan.total > 0 && e.comboId !== real.combo.id)
        .map((e) => ({ e, combo: porId.get(e.comboId), ahorro: this.ahorroSi(porId.get(e.comboId), e.faltan) }))
        .filter((m) => m.ahorro !== null && m.ahorro > real.monto)
        .sort((a, b) => a.e.faltan.total - b.e.faltan.total || b.ahorro - a.ahorro);
      if (mejores.length) {
        const m = mejores[0];
        texto += ' ' + rellenar(t.mejor, { faltan: this.textoFaltan(m.e.faltan), combo: m.combo.nombre, ahorro: formatoPesos(m.ahorro) });
      }
      mensajes.push(texto);

      const otros = estado.combos.filter((e) => e.califica && e.comboId !== real.combo.id);
      if (otros.length && contexto === 'carrito') {
        mensajes.push(rellenar(t.elegido, { combo: real.combo.nombre, ahorro: formatoPesos(real.monto) }));
      }
      const { lleva } = real.combo;
      if (lleva.valor.tipo === 'gratis') {
        const gorras = lineas.filter((l) => l.grupo === lleva.grupo);
        const cantidad = gorras.reduce((s, l) => s + l.cantidad, 0);
        if (cantidad > lleva.cantidad) {
          const precio = Math.min(...gorras.map((l) => l.precio));
          mensajes.push(rellenar(t.extra_gorra, { combo: real.combo.nombre, precio_gorra: formatoPesos(precio) }));
        }
      }
      if (contexto === 'carrito') mensajes.push(t.aplicado_nota);
    } else {
      const requerido = (id) => porId.get(id).compra.cantidad + porId.get(id).lleva.cantidad;
      const candidatos = estado.combos
        .filter((e) => !e.califica && e.faltan.total > 0 && e.faltan.total < requerido(e.comboId))
        .sort((a, b) => Number(b.elegirLleva) - Number(a.elegirLleva) || a.faltan.total - b.faltan.total);
      if (candidatos.length) {
        const c = candidatos[0];
        const combo = porId.get(c.comboId);
        mensajes.push(rellenar(t.agrega, { faltan: this.textoFaltan(c.faltan), combo: combo.nombre, beneficio: combo.beneficio }));
      } else if (contexto === 'ficha' && !pagina.premium) {
        const vigentes = combos.filter((c) => c.activo !== false);
        vigentes.sort((a, b) => (a.compra.cantidad + a.lleva.cantidad) - (b.compra.cantidad + b.lleva.cantidad));
        if (vigentes.length && !estado.combos.some((e) => e.califica)) {
          mensajes.push(rellenar(t.arma, { detalle: vigentes[0].detalle, precio: vigentes[0].precio }));
        }
      }
    }

    if (contexto === 'carrito' && lineas.some((l) => l.grupo)) {
      mensajes.push(t.no_acumulan, t.un_uso);
    }

    const visibles = contexto === 'ficha' ? mensajes.slice(0, 1) : mensajes;
    const lista = this.querySelector('[data-lista]');
    lista.replaceChildren(...visibles.map((texto, i) => {
      const li = document.createElement('li');
      const principal = i === 0 && (real || contexto === 'ficha');
      li.className = principal ? 'combos-mensajes__item combos-mensajes__item--principal' : 'combos-mensajes__item';
      li.textContent = texto;
      return li;
    }));

    // La gorra de regalo solo tiene sentido si ningún otro combo se aplica ya
    const regalo = document.querySelector('[data-regalo]');
    if (regalo) regalo.hidden = !!(estado.aplicado && estado.aplicado.comboId !== regalo.dataset.regaloCombo);

    this.dispatchEvent(new CustomEvent('combos:actualizado', { bubbles: true, detail: { activo: textoActivo } }));
  }
}
if (!customElements.get('mensajes-combos')) customElements.define('mensajes-combos', MensajesCombos);

/** Envuelve la sección del carrito: agrega la gorra de regalo sin recargar y refresca la sección. */
class CarritoCombos extends HTMLElement {
  connectedCallback() {
    this.addEventListener('submit', (evento) => {
      const formulario = evento.target.closest('[data-regalo-formulario]');
      if (!formulario) return;
      evento.preventDefault();
      this.agregarRegalo(formulario);
    });
    this.addEventListener('combos:actualizado', (evento) => {
      if (!this.pendiente) return;
      const anuncio = this.querySelector('[data-anuncio-combos]');
      const textos = this.textos();
      if (anuncio) anuncio.textContent = `${textos.regalo_agregada} ${evento.detail.activo}`.trim();
      this.pendiente = false;
    });
  }

  textos() {
    const crudo = this.querySelector('script[data-combos-datos]');
    try { return JSON.parse(crudo.textContent).textos; } catch (error) { return { regalo_agregada: '', regalo_error: '' }; }
  }

  async agregarRegalo(formulario) {
    const boton = formulario.querySelector('button[type="submit"]');
    const error = formulario.querySelector('[data-regalo-error]');
    if (error) error.hidden = true;
    if (boton) boton.disabled = true;
    try {
      const id = Number(new FormData(formulario).get('id'));
      const respuesta = await fetch(this.dataset.agregar, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: [{ id, quantity: 1 }] }),
      });
      if (!respuesta.ok) throw new Error('agregar');
      this.pendiente = true;
      const html = await (await fetch(`${this.dataset.url}?section_id=${encodeURIComponent(this.dataset.seccion)}`)).text();
      const nuevo = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-reemplazable]');
      const actual = this.querySelector('[data-reemplazable]');
      if (!nuevo || !actual) throw new Error('refrescar');
      actual.replaceChildren(...nuevo.childNodes);
      this.querySelector('[data-foco]')?.focus();
    } catch (fallo) {
      if (error) { error.textContent = this.textos().regalo_error; error.hidden = false; }
      if (boton) boton.disabled = false;
    }
  }
}
if (!customElements.get('carrito-combos')) customElements.define('carrito-combos', CarritoCombos);
