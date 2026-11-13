// Comportamiento progresivo del tema de Noctra (SPEC-001, SPEC-002, SPEC-004). Sin dependencias.

const formatoCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const pesos = (centavos) => formatoCOP.format(Math.round(centavos / 100));

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
    document.getElementById(abrir.dataset.abrirDialogo)?.showModal?.();
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
    this.variantes = JSON.parse(this.querySelector('[data-variantes]')?.textContent || '[]');
    this.opciones = this.querySelector('[data-opciones]');
    this.select = this.querySelector('select[name="id"]');
    if (!this.opciones || !this.select || this.variantes.length === 0) return;

    // Con JS: botones de opciones en vez del select de respaldo
    this.opciones.hidden = false;
    const respaldo = this.querySelector('[data-select-variantes]');
    if (respaldo) respaldo.hidden = true;

    this.pintarCentimetros();
    this.opciones.addEventListener('change', () => this.actualizar(true));
    this.actualizar(false);
  }

  elegidos() {
    return [...this.opciones.querySelectorAll('fieldset')].map(
      (fieldset) => fieldset.querySelector('input:checked')?.value ?? null
    );
  }

  actualizar(cambiarUrl) {
    const elegidos = this.elegidos();
    const variante = this.variantes.find((v) => v.options.every((valor, i) => valor === elegidos[i]));

    this.marcarDisponibilidad(elegidos);
    this.opciones.querySelectorAll('fieldset').forEach((fieldset, i) => {
      const destino = fieldset.querySelector('[data-valor-elegido]');
      if (destino) destino.textContent = elegidos[i] ?? '';
    });

    const botonAgregar = this.querySelector('[data-boton-agregar]');
    if (!variante) {
      if (botonAgregar) { botonAgregar.disabled = true; botonAgregar.textContent = 'Combinación no disponible'; }
      return;
    }

    this.select.value = String(variante.id);
    this.pintarPrecio(variante);

    if (botonAgregar) {
      botonAgregar.disabled = !variante.available;
      botonAgregar.textContent = variante.available ? 'Agregar al carrito' : 'Agotado';
    }
    this.pintarWhatsApp(variante);

    if (cambiarUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('variant', variante.id);
      window.history.replaceState({}, '', url);
    }
  }

  // Una opción está disponible si existe una variante disponible con ese valor y los demás elegidos (RF-07)
  marcarDisponibilidad(elegidos) {
    this.opciones.querySelectorAll('fieldset').forEach((fieldset, i) => {
      fieldset.querySelectorAll('input[type="radio"]').forEach((input) => {
        const prueba = [...elegidos];
        prueba[i] = input.value;
        const disponible = this.variantes.some((v) => v.available && v.options.every((valor, j) => valor === prueba[j]));
        const etiqueta = fieldset.querySelector(`label[for="${input.id}"]`);
        if (!etiqueta) return;
        etiqueta.classList.toggle('ficha__valor--agotado', !disponible);
        let aviso = etiqueta.querySelector('.oculto-visual');
        if (!disponible && !aviso) {
          aviso = document.createElement('span');
          aviso.className = 'oculto-visual';
          aviso.textContent = ', agotada';
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
      if (rebajado) anterior.textContent = pesos(variante.compare_at_price);
    }
  }

  pintarWhatsApp(variante) {
    const boton = this.querySelector('[data-boton-whatsapp]');
    const numero = this.dataset.whatsapp;
    if (!boton || !numero) return;
    const producto = this.dataset.producto;
    const enlace = `${this.dataset.url}?variant=${variante.id}`;
    const detalle = variante.title && variante.title !== 'Default Title' ? ` (${variante.title})` : '';
    const mensaje = variante.available
      ? `Hola, quiero pedir ${producto}${detalle}: ${enlace}`
      : `Hola, avísenme cuando llegue ${producto}${detalle}: ${enlace}`;
    boton.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
    boton.textContent = variante.available ? 'Pedir por WhatsApp' : 'Avísame por WhatsApp';
  }

  // Muestra los centímetros de pie debajo de cada talla EUR (RF-05)
  pintarCentimetros() {
    const datos = this.querySelector('[data-datos-guia-tallas]') || document.querySelector('[data-datos-guia-tallas]');
    if (!datos) return;
    let tabla = [];
    try { tabla = JSON.parse(datos.textContent); } catch (_) { return; }
    const porEur = new Map(tabla.map((fila) => [String(fila.eur).trim(), String(fila.cm).replace('.', ',')]));
    this.querySelectorAll('[data-cm-para]').forEach((destino) => {
      const cm = porEur.get(destino.dataset.cmPara.trim());
      if (cm) destino.textContent = `${cm} cm`;
    });
  }
}

if (!customElements.get('ficha-producto')) customElements.define('ficha-producto', FichaProducto);
