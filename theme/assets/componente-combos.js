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

  /** Texto "3 pares" o "1 par y 1 gorra" a partir de { grupo: unidades } de siguientePaso. */
  textoAgregar(agregar) {
    return Object.entries(agregar).map(([grupo, n]) => this.unidades(grupo, n)).join(' y ');
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
      // Lo mínimo que conviene agregar: pasar a un combo mejor o repetir el actual (hasta su tope)
      const paso = this.motor.siguientePaso(lineas, combos, { hoy });
      if (paso && paso.ahorroTotal > real.monto) {
        const valores = { faltan: this.textoAgregar(paso.agregar), combo: paso.nombre, ahorro: formatoPesos(paso.ahorroTotal), veces: paso.usos };
        texto += ' ' + rellenar(paso.comboId === real.combo.id ? t.repite : t.mejor, valores);
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
        const estimado = estado.resultado.aplicaciones;
        const usos = estimado[0]?.comboId === real.combo.id ? estimado.length : 1;
        const gratis = usos * lleva.cantidad;
        if (cantidad > gratis) {
          const precio = Math.min(...gorras.map((l) => l.precio));
          mensajes.push(rellenar(t.extra_gorra, { combo: real.combo.nombre, gratis: this.unidades(lleva.grupo, gratis), precio_gorra: formatoPesos(precio) }));
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
      const tope = Math.max(...combos.map((c) => c.limitePorPedido ?? 1));
      mensajes.push(t.no_acumulan, tope > 1 ? rellenar(t.varios_usos, { n: tope }) : t.un_uso);
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

/**
 * Envuelve la sección del carrito: agrega la gorra de regalo y cambia cantidades sin recargar,
 * y refresca la sección para que total, descuentos de Shopify y mensajes de combo queden al día.
 * Sin JavaScript siguen funcionando los formularios normales ("Actualizar cantidades").
 */
class CarritoCombos extends HTMLElement {
  connectedCallback() {
    this.addEventListener('submit', (evento) => {
      const formulario = evento.target.closest('[data-regalo-formulario]');
      if (!formulario) return;
      evento.preventDefault();
      this.agregarRegalo(formulario);
    });
    this.addEventListener('change', (evento) => {
      if (!evento.target.matches('input[data-clave]')) return;
      clearTimeout(this.espera);
      this.espera = setTimeout(() => this.actualizarCantidades(evento.target.dataset.clave), 350);
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
      await this.refrescar();
      this.querySelector('[data-foco]')?.focus();
    } catch (fallo) {
      if (error) { error.textContent = this.textos().regalo_error; error.hidden = false; }
      if (boton) boton.disabled = false;
    }
  }

  /** Vuelve a pintar la sección con la Section Rendering API (precios y descuentos reales de Shopify). */
  async refrescar() {
    const html = await (await fetch(`${this.dataset.url}?section_id=${encodeURIComponent(this.dataset.seccion)}`)).text();
    const nuevo = new DOMParser().parseFromString(html, 'text/html').querySelector('[data-reemplazable]');
    const actual = this.querySelector('[data-reemplazable]');
    if (!nuevo || !actual) throw new Error('refrescar');
    actual.replaceChildren(...nuevo.childNodes);
  }

  /** Envía todas las cantidades a /cart/update.js y refresca; devuelve el foco al campo editado. */
  async actualizarCantidades(clave) {
    const textos = this.textos();
    const anuncio = this.querySelector('[data-anuncio-combos]');
    const updates = {};
    for (const campo of this.querySelectorAll('input[data-clave]')) {
      updates[campo.dataset.clave] = Math.max(0, Number.parseInt(campo.value, 10) || 0);
    }
    this.setAttribute('aria-busy', 'true');
    let fallo = false;
    try {
      const respuesta = await fetch(`${this.dataset.url}/update.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ updates }),
      });
      fallo = !respuesta.ok;
    } catch (error) {
      fallo = true;
    }
    try {
      await this.refrescar();
    } catch (error) {
      window.location.reload();
      return;
    }
    this.removeAttribute('aria-busy');
    const campo = [...this.querySelectorAll('input[data-clave]')].find((c) => c.dataset.clave === clave);
    (campo || this.querySelector('[data-foco]'))?.focus();
    const total = this.querySelector('[data-total]')?.textContent.trim() ?? '';
    if (anuncio) anuncio.textContent = fallo ? textos.cantidades_error : rellenar(textos.cantidades_actualizadas, { total });
  }
}
if (!customElements.get('carrito-combos')) customElements.define('carrito-combos', CarritoCombos);
