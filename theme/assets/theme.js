// Comportamiento progresivo del tema de Noctra (SPEC-001, SPEC-002, SPEC-004). Sin dependencias.

const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
// Intl pone un espacio duro entre "$" y el número ("$ 180.000"); la tienda escribe "$180.000", como el filtro money de Liquid.
const pesos = (centavos) => formatoCOP.format(Math.round(centavos / 100)).replace(/\$\s+/u, '$');

/* Modo claro / oscuro (RF-34) */
function modoActual() {
  const elegido = document.documentElement.getAttribute('data-tema');
  if (elegido) return elegido;
  // Noctra arranca en oscuro salvo que la tienda esté configurada para seguir al sistema
  if (document.documentElement.dataset.modoBase !== 'sistema') return 'oscuro';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'oscuro';
}

document.addEventListener('click', (evento) => {
  if (!evento.target.closest('[data-cambiar-tema]')) return;
  const nuevo = modoActual() === 'oscuro' ? 'claro' : 'oscuro';
  document.documentElement.setAttribute('data-tema', nuevo);
  try { localStorage.setItem('tema', nuevo); } catch (_) { /* sin almacenamiento: solo dura la visita */ }
});

/* Diálogos (guía de tallas) */
document.addEventListener('click', (evento) => {
  const abrir = evento.target.closest('[data-abrir-dialogo]');
  if (abrir) {
    const dialogo = document.getElementById(abrir.dataset.abrirDialogo);
    // Sin soporte de <dialog>, el enlace sigue su camino (página de guía de tallas)
    if (dialogo && typeof dialogo.showModal === 'function') {
      evento.preventDefault();
      dialogo.abridor = abrir;
      dialogo.showModal();
    }
    return;
  }
  if (evento.target.closest('[data-cerrar-dialogo]')) {
    evento.target.closest('dialog')?.close();
    return;
  }
  // Clic en el fondo oscuro, fuera del cuadro del diálogo
  if (evento.target instanceof HTMLDialogElement) {
    const r = evento.target.getBoundingClientRect();
    const fuera = evento.clientX < r.left || evento.clientX > r.right || evento.clientY < r.top || evento.clientY > r.bottom;
    if (fuera) evento.target.close();
  }
});

// Al cerrar un diálogo el foco vuelve al elemento que lo abrió (el navegador lo hace; esto lo asegura)
document.addEventListener('close', (evento) => {
  const dialogo = evento.target;
  if (dialogo instanceof HTMLDialogElement && dialogo.abridor?.isConnected) dialogo.abridor.focus({ preventScroll: true });
}, true);

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Portada: respetar "reducir movimiento" */
if (reducirMovimiento) {
  document.querySelectorAll('.portada__video').forEach((video) => video.pause());
}

/* Portada animada (SPEC-002): el isotipo crece y el logotipo se superpone al hacer scroll.
   Solo se anima si la sección lo pide y el cliente no activó "reducir movimiento". */
class PortadaNoctra extends HTMLElement {
  connectedCallback() {
    if (!this.hasAttribute('data-animar') || reducirMovimiento) return;
    this.classList.add('portada--animada');
    this.pendiente = false;
    this.alMover = () => {
      if (this.pendiente) return;
      this.pendiente = true;
      requestAnimationFrame(() => { this.pendiente = false; this.pintar(); });
    };
    this.observador = new IntersectionObserver(([entrada]) => {
      if (entrada.isIntersecting) {
        window.addEventListener('scroll', this.alMover, { passive: true });
        window.addEventListener('resize', this.alMover, { passive: true });
        this.pintar();
      } else {
        window.removeEventListener('scroll', this.alMover);
        window.removeEventListener('resize', this.alMover);
      }
    });
    this.observador.observe(this);
    this.pintar();
  }

  disconnectedCallback() {
    this.observador?.disconnect();
    window.removeEventListener('scroll', this.alMover);
    window.removeEventListener('resize', this.alMover);
  }

  pintar() {
    const recorrido = this.offsetHeight - window.innerHeight;
    if (recorrido <= 0) { this.style.setProperty('--p', '1'); return; }
    const avance = Math.min(1, Math.max(0, -this.getBoundingClientRect().top / (recorrido * 0.8)));
    // Suavizado (smoothstep): entra y llega al logo completo con suavidad
    const p = avance * avance * (3 - 2 * avance);
    this.style.setProperty('--p', p.toFixed(4));
  }
}

if (!customElements.get('portada-noctra')) customElements.define('portada-noctra', PortadaNoctra);

/* Ficha de producto (SPEC-004) */
class FichaProducto extends HTMLElement {
  connectedCallback() {
    this.iniciarGaleria();
    this.iniciarZoom();
    this.querySelectorAll('[data-requiere-js]').forEach((el) => { el.hidden = false; });

    this.variantes = JSON.parse(this.querySelector('[data-variantes]')?.textContent || '[]');
    this.opciones = this.querySelector('[data-opciones]');
    this.select = this.querySelector('select[name="id"]');
    this.tabla = this.leerGuia();
    if (!this.opciones || !this.select || this.variantes.length === 0) {
      this.iniciarBarra();
      return;
    }

    // Con JS: botones de opciones en vez del select de respaldo
    this.opciones.hidden = false;
    const respaldo = this.querySelector('[data-select-variantes]');
    if (respaldo) respaldo.hidden = true;

    this.pintarCentimetros();
    this.opciones.addEventListener('change', () => this.actualizar(true));
    this.iniciarBarra();
    this.actualizar(false);
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this.alMoverBarra);
    window.removeEventListener('resize', this.alMoverBarra);
    this.observadorMedios?.disconnect();
    if (this.alVolver) window.removeEventListener('popstate', this.alVolver);
    document.documentElement.removeAttribute('data-barra-compra');
    document.documentElement.style.removeProperty('--alto-barra');
  }

  /* Galería: carrusel con indicador "N de total", botones y flechas del teclado (escritorio) y grupo por color */
  iniciarGaleria() {
    const medios = this.querySelector('[data-medios]');
    if (!medios) return;
    this.medios = medios;
    this.itemsMedios = [...medios.children];
    this.contador = this.querySelector('[data-contador]');
    this.indiceMedio = 0;
    this.colorGaleria = this.dataset.colorInicial ?? null;
    this.grupos = new Set(this.itemsMedios.map((i) => i.dataset.grupo).filter(Boolean));

    if (this.contador) this.contador.hidden = false;
    this.observadorMedios = new IntersectionObserver((entradas) => {
      const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const indice = this.mediosVisibles().indexOf(visible.target);
      if (indice < 0) return;
      this.indiceMedio = indice;
      this.pintarContador();
    }, { root: medios, threshold: [0.6, 0.9] });
    this.itemsMedios.forEach((item) => this.observadorMedios.observe(item));

    if (this.itemsMedios.length > 1) this.crearFlechas();
    this.pintarContador();
    this.querySelector('.ficha__galeria').addEventListener('keydown', (evento) => {
      if (evento.key !== 'ArrowLeft' && evento.key !== 'ArrowRight') return;
      // Los controles de un video usan las flechas para avanzar o retroceder
      if (evento.target.closest('video, iframe, input, select, textarea')) return;
      evento.preventDefault();
      this.moverMedios(evento.key === 'ArrowRight' ? 1 : -1);
    });
  }

  mediosVisibles() {
    return this.itemsMedios.filter((item) => !item.hasAttribute('data-fuera'));
  }

  pintarContador() {
    const total = this.mediosVisibles().length;
    if (this.contador) {
      this.contador.textContent = `${this.indiceMedio + 1} de ${total}`;
      this.contador.hidden = total < 2;
    }
    if (this.flechaAnterior) {
      this.flechaAnterior.setAttribute('aria-disabled', String(this.indiceMedio <= 0));
      this.flechaSiguiente.setAttribute('aria-disabled', String(this.indiceMedio >= total - 1));
    }
  }

  crearFlechas() {
    const galeria = this.querySelector('.ficha__galeria');
    const flecha = (clase, texto) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = `ficha__flecha ficha__flecha--${clase}`;
      boton.setAttribute('aria-disabled', 'false');
      boton.innerHTML = '<span class="oculto-visual"></span><svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="m9 5 7 7-7 7"/></svg>';
      boton.firstElementChild.textContent = texto;
      return boton;
    };
    this.flechaAnterior = flecha('anterior', 'Foto anterior');
    this.flechaSiguiente = flecha('siguiente', 'Foto siguiente');
    this.flechaAnterior.addEventListener('click', () => this.moverMedios(-1));
    this.flechaSiguiente.addEventListener('click', () => this.moverMedios(1));
    galeria.append(this.flechaAnterior, this.flechaSiguiente);
  }

  moverMedios(paso) {
    const visibles = this.mediosVisibles();
    // La posición real del desplazamiento manda: el observador puede ir un paso atrás
    const actual = visibles.reduce((mejor, item, i) => (
      Math.abs(item.offsetLeft - this.medios.offsetLeft - this.medios.scrollLeft) < Math.abs(visibles[mejor].offsetLeft - this.medios.offsetLeft - this.medios.scrollLeft) ? i : mejor
    ), 0);
    const destino = Math.min(visibles.length - 1, Math.max(0, actual + paso));
    if (destino === actual) return;
    this.indiceMedio = destino;
    this.pintarContador();
    this.medios.scrollTo({ left: visibles[destino].offsetLeft - this.medios.offsetLeft, behavior: reducirMovimiento ? 'instant' : 'smooth' });
  }

  /* Muestra solo el grupo del color elegido. Un color sin grupo propio muestra todos los medios. */
  mostrarGrupoColor(color, anunciar) {
    if (!this.medios || !this.grupos.size || color === this.colorGaleria) return;
    this.colorGaleria = color;
    this.itemsMedios.forEach((item) => {
      const propio = !this.grupos.has(color) || item.dataset.grupo === color || item.hasAttribute('data-comun');
      item.toggleAttribute('data-fuera', !propio);
      if (!propio) {
        item.querySelectorAll('video').forEach((video) => video.pause());
        // Un video externo no se puede pausar desde aquí: se recarga para detenerlo
        item.querySelectorAll('iframe').forEach((marco) => { marco.src = marco.src; });
      }
    });
    const visibles = this.mediosVisibles();
    visibles[0]?.querySelector('img')?.setAttribute('loading', 'eager');
    this.medios.scrollTo({ left: 0, behavior: 'instant' });
    this.indiceMedio = 0;
    this.pintarContador();
    this.rotularZoom();
    const aviso = this.querySelector('[data-anuncio-galeria]');
    if (aviso && anunciar) aviso.textContent = `Fotos del color ${color}, ${visibles.length} en total`;
  }

  /* Zoom: diálogo a pantalla completa. Pellizco nativo en celular; clic alterna 2× en escritorio */
  iniciarZoom() {
    const dialogo = this.querySelector('[data-zoom-dialogo]');
    const imagen = this.querySelector('[data-zoom-imagen]');
    if (!dialogo || !imagen || typeof dialogo.showModal !== 'function') return;
    const punteroFino = window.matchMedia('(pointer: fine)').matches;

    this.querySelectorAll('[data-zoom-src]').forEach((item) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'ficha__zoom-boton';
      boton.addEventListener('click', () => {
        imagen.src = item.dataset.zoomSrc;
        imagen.alt = item.dataset.zoomAlt || '';
        imagen.classList.remove('ficha__zoom-imagen--ampliada');
        dialogo.abridor = boton;
        dialogo.showModal();
        // El gesto de volver cierra el zoom
        window.history.pushState({ zoom: true }, '');
      });
      item.append(boton);
    });

    this.rotularZoom();

    imagen.addEventListener('click', () => {
      if (punteroFino) imagen.classList.toggle('ficha__zoom-imagen--ampliada');
    });
    dialogo.addEventListener('close', () => {
      imagen.removeAttribute('src');
      if (window.history.state?.zoom) window.history.back();
    });
    this.alVolver = () => { if (dialogo.open) dialogo.close(); };
    window.addEventListener('popstate', this.alVolver);
  }

  // El número de cada foto cuenta solo las del grupo visible
  rotularZoom() {
    const visibles = this.mediosVisibles?.() ?? [];
    this.querySelectorAll('.ficha__zoom-boton').forEach((boton) => {
      const indice = visibles.indexOf(boton.closest('.ficha__medio'));
      if (indice >= 0) boton.setAttribute('aria-label', `Ampliar foto ${indice + 1}`);
    });
  }

  /* Barra fija de compra (celular) */
  iniciarBarra() {
    this.barra = this.querySelector('[data-barra]');
    const botonCompra = this.querySelector('[data-boton-agregar]');
    if (!this.barra || !botonCompra) return;
    this.barra.hidden = false;
    this.barraBoton = this.barra.querySelector('[data-barra-boton]');
    this.barraBoton.addEventListener('click', () => {
      if (this.barraBoton.type !== 'button') return;
      const destino = this.querySelector('.ficha__selector');
      destino?.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'center' });
      this.querySelector('.ficha__radio:checked')?.focus({ preventScroll: true });
    });
    // Se revisa al hacer scroll (no con IntersectionObserver): un salto largo se saltaría el botón sin avisar
    this.pendienteBarra = false;
    this.alMoverBarra = () => {
      if (this.pendienteBarra) return;
      this.pendienteBarra = true;
      requestAnimationFrame(() => { this.pendienteBarra = false; this.revisarBarra(botonCompra); });
    };
    window.addEventListener('scroll', this.alMoverBarra, { passive: true });
    window.addEventListener('resize', this.alMoverBarra, { passive: true });
    this.revisarBarra(botonCompra);
  }

  // La barra aparece cuando el botón de compra ya quedó arriba, fuera de la pantalla
  revisarBarra(botonCompra) {
    const caja = botonCompra.getBoundingClientRect();
    const mostrar = caja.bottom < 0;
    this.barra.classList.toggle('ficha__barra--visible', mostrar);
    const raiz = document.documentElement;
    if (mostrar) {
      raiz.style.setProperty('--alto-barra', `${this.barra.offsetHeight}px`);
      raiz.setAttribute('data-barra-compra', '');
    } else {
      raiz.removeAttribute('data-barra-compra');
    }
  }

  pintarBarra(variante, elegidos) {
    if (!this.barra) return;
    const seleccion = this.barra.querySelector('[data-barra-seleccion]');
    const precio = this.barra.querySelector('[data-barra-precio]');
    const visibles = elegidos.filter((valor, i) => valor && !this.fieldsets[i]?.hasAttribute('data-unica'));
    if (seleccion) seleccion.textContent = visibles.join(' / ');
    if (precio && variante) precio.textContent = pesos(variante.price);

    const boton = this.barraBoton;
    const hayTalla = this.fieldsets.some((f) => f.hasAttribute('data-talla') && !f.hasAttribute('data-unica'));
    const hayElegible = this.fieldsets.some((f) => !f.hasAttribute('data-unica'));
    if (variante?.available) {
      boton.type = 'submit';
      boton.disabled = false;
      boton.textContent = 'Agregar al carrito';
    } else if (hayElegible && this.variantes.some((v) => v.available)) {
      boton.type = 'button';
      boton.disabled = false;
      boton.textContent = hayTalla ? 'Elegir talla' : 'Elegir opción';
    } else {
      boton.type = 'submit';
      boton.disabled = true;
      boton.textContent = 'Agotado';
    }
  }

  get fieldsets() {
    return [...this.opciones.querySelectorAll('fieldset')];
  }

  elegidos() {
    return this.fieldsets.map((fieldset) => fieldset.querySelector('input:checked')?.value ?? null);
  }

  actualizar(cambiarUrl) {
    const elegidos = this.elegidos();
    const variante = this.variantes.find((v) => v.options.every((valor, i) => valor === elegidos[i]));

    this.marcarDisponibilidad(elegidos);
    this.fieldsets.forEach((fieldset, i) => {
      const destino = fieldset.querySelector('[data-valor-elegido]');
      if (destino) destino.textContent = elegidos[i] ?? '';
    });
    this.pintarEquivalencia(elegidos);

    // Galería por color: solo cambia si cambió el color, no con la talla
    const indiceColor = this.fieldsets.findIndex((f) => f.hasAttribute('data-opcion-color'));
    if (indiceColor >= 0 && elegidos[indiceColor]) this.mostrarGrupoColor(elegidos[indiceColor], cambiarUrl);

    const botonAgregar = this.querySelector('[data-boton-agregar]');
    if (!variante) {
      if (botonAgregar) { botonAgregar.disabled = true; botonAgregar.textContent = 'Combinación no disponible'; }
      this.pintarWhatsApp(null, elegidos);
      this.pintarBarra(null, elegidos);
      return;
    }

    this.select.value = String(variante.id);
    this.pintarPrecio(variante);

    if (botonAgregar) {
      botonAgregar.disabled = !variante.available;
      botonAgregar.textContent = variante.available ? 'Agregar al carrito' : 'Agotado';
    }
    this.pintarWhatsApp(variante, elegidos);
    this.pintarBarra(variante, elegidos);

    if (cambiarUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variante.id);
      window.history.replaceState({}, '', url);
    }
  }

  // Una opción está disponible si existe una variante disponible con ese valor y los demás elegidos (RF-07)
  marcarDisponibilidad(elegidos) {
    this.fieldsets.forEach((fieldset, i) => {
      const palabra = fieldset.dataset.agotado || 'agotado';
      fieldset.querySelectorAll('input[type="radio"]').forEach((input) => {
        const prueba = [...elegidos];
        prueba[i] = input.value;
        const disponible = this.variantes.some((v) => v.available && v.options.every((valor, j) => valor === prueba[j]));
        const etiqueta = fieldset.querySelector(`label[for="${input.id}"]`);
        if (!etiqueta) return;
        etiqueta.classList.toggle('ficha__valor--agotado', !disponible);
        let aviso = etiqueta.querySelector('[data-aviso-agotado]');
        if (!disponible && !aviso) {
          aviso = document.createElement('span');
          aviso.className = 'oculto-visual';
          aviso.dataset.avisoAgotado = '';
          aviso.textContent = `, ${palabra}`;
          etiqueta.append(aviso);
        } else if (disponible && aviso) {
          aviso.remove();
        }
      });
    });
  }

  pintarPrecio(variante) {
    const precio = this.querySelector('[data-precio]');
    const anterior = this.querySelector('[data-precio-anterior]');
    if (precio) precio.textContent = pesos(variante.price);
    if (anterior) {
      const rebajado = variante.compare_at_price && variante.compare_at_price > variante.price;
      anterior.hidden = !rebajado;
      const valor = anterior.querySelector('[data-precio-anterior-valor]');
      if (rebajado && valor) valor.textContent = pesos(variante.compare_at_price);
    }
  }

  // Detalle para el mensaje: talla primero y luego las demás opciones con más de un valor
  detalleElegido(elegidos) {
    const partes = this.fieldsets
      .map((fieldset, i) => ({ talla: fieldset.hasAttribute('data-talla'), unica: fieldset.hasAttribute('data-unica'), valor: elegidos[i] }))
      .filter((o) => !o.unica && o.valor);
    return [...partes.filter((o) => o.talla), ...partes.filter((o) => !o.talla)].map((o) => o.valor).join(' / ');
  }

  pintarWhatsApp(variante, elegidos) {
    const boton = this.querySelector('[data-boton-whatsapp]');
    const numero = this.dataset.whatsapp;
    if (!boton || !numero) return;
    const producto = this.dataset.producto;
    let mensaje;
    let texto = 'Pedir por WhatsApp';
    if (!variante) {
      // Combinación que no existe: se pregunta por el producto sin variante
      mensaje = `Hola, quiero información sobre ${producto}: ${this.dataset.url}`;
      texto = 'Preguntar por WhatsApp';
    } else {
      const detalle = this.variantes.length > 1 ? this.detalleElegido(elegidos) : '';
      const sufijo = detalle ? ` (${detalle})` : '';
      const enlace = `${this.dataset.url}?variant=${variante.id}`;
      if (variante.available) {
        mensaje = `Hola, quiero pedir ${producto}${sufijo}: ${enlace}`;
      } else {
        mensaje = `Hola, avísenme cuando llegue ${producto}${sufijo}: ${enlace}`;
        texto = 'Preguntar disponibilidad por WhatsApp';
      }
    }
    boton.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    boton.textContent = texto;
  }

  leerGuia() {
    const datos = this.querySelector('[data-datos-guia-tallas]') || document.querySelector('[data-datos-guia-tallas]');
    if (!datos) return new Map();
    try {
      const tabla = JSON.parse(datos.textContent);
      return new Map(tabla.map((fila) => [String(fila.eur).trim(), fila]));
    } catch (_) {
      return new Map();
    }
  }

  // Muestra los centímetros de pie debajo de cada talla EUR (RF-05)
  pintarCentimetros() {
    this.querySelectorAll('[data-cm-para]').forEach((destino) => {
      const fila = this.tabla.get(destino.dataset.cmPara.trim());
      if (fila?.cm) destino.textContent = `${String(fila.cm).replace('.', ',')} cm`;
    });
  }

  // Línea de equivalencia de la talla elegida: "Talla 42 EUR · 26,5 cm de pie · US 8,5"
  pintarEquivalencia(elegidos) {
    const destino = this.querySelector('[data-equivalencia]');
    if (!destino) return;
    const indice = this.fieldsets.findIndex((f) => f.hasAttribute('data-talla') && f.querySelector('[data-cm-para]'));
    if (indice < 0 || !elegidos[indice]) { destino.textContent = ''; return; }
    const fila = this.tabla.get(elegidos[indice].trim());
    if (!fila) { destino.textContent = 'Consulta la guía de tallas'; return; }
    const coma = (valor) => String(valor).replace('.', ',');
    const partes = [`Talla ${elegidos[indice]} EUR`];
    if (fila.cm) partes.push(`${coma(fila.cm)} cm de pie`);
    if (fila.us) partes.push(`US ${coma(fila.us)}`);
    destino.textContent = partes.join(' · ');
  }
}

if (!customElements.get('ficha-producto')) customElements.define('ficha-producto', FichaProducto);
