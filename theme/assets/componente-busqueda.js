// Búsqueda predictiva del encabezado (SPEC-003, RF-02). Sin JavaScript, el ícono sigue siendo un enlace a /search.
// Patrón combobox de ARIA: flechas para recorrer, Enter para abrir, Escape para cerrar.

class BusquedaPredictiva extends HTMLElement {
  connectedCallback() {
    this.icono = this.querySelector('[data-abrir-busqueda]');
    this.panel = this.querySelector('.sugerencias');
    this.campo = this.querySelector('input[type="search"]');
    this.lista = this.querySelector('[data-resultados]');
    this.anuncio = this.querySelector('[data-anuncio]');
    if (!this.icono || !this.panel || !this.campo || !this.lista || !this.dataset.url) return;

    this.espera = null;
    this.peticion = null;
    this.ultimo = '';
    this.activo = -1;

    this.icono.addEventListener('click', (evento) => {
      evento.preventDefault();
      this.panel.hidden ? this.abrir() : this.cerrar(true);
    });
    this.querySelector('[data-cerrar-busqueda]')?.addEventListener('click', () => this.cerrar(true));

    this.campo.addEventListener('input', () => {
      clearTimeout(this.espera);
      this.espera = setTimeout(() => this.buscar(), 200);
    });
    this.campo.addEventListener('keydown', (evento) => this.teclado(evento));
    this.panel.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') { evento.preventDefault(); this.cerrar(true); }
    });

    document.addEventListener('click', (evento) => {
      if (!this.panel.hidden && !this.contains(evento.target)) this.cerrar(false);
    });
  }

  abrir() {
    this.panel.hidden = false;
    this.icono.setAttribute('aria-expanded', 'true');
    this.campo.focus();
    this.campo.select();
  }

  cerrar(devolverFoco) {
    this.panel.hidden = true;
    this.icono.setAttribute('aria-expanded', 'false');
    this.campo.setAttribute('aria-expanded', 'false');
    this.campo.removeAttribute('aria-activedescendant');
    this.marcar(-1);
    if (devolverFoco) this.icono.focus();
  }

  opciones() {
    return Array.from(this.lista.querySelectorAll('[role="option"]'));
  }

  marcar(indice) {
    const opciones = this.opciones();
    opciones.forEach((opcion, i) => opcion.setAttribute('aria-selected', i === indice ? 'true' : 'false'));
    this.activo = indice;
    if (indice >= 0 && opciones[indice]) {
      this.campo.setAttribute('aria-activedescendant', opciones[indice].id);
      opciones[indice].scrollIntoView({ block: 'nearest' });
    } else {
      this.campo.removeAttribute('aria-activedescendant');
    }
  }

  teclado(evento) {
    const opciones = this.opciones();
    if (evento.key === 'ArrowDown' && opciones.length) {
      evento.preventDefault();
      this.marcar((this.activo + 1) % opciones.length);
    } else if (evento.key === 'ArrowUp' && opciones.length) {
      evento.preventDefault();
      this.marcar(this.activo <= 0 ? opciones.length - 1 : this.activo - 1);
    } else if (evento.key === 'Enter' && this.activo >= 0 && opciones[this.activo]) {
      evento.preventDefault();
      window.location.href = opciones[this.activo].href;
    }
  }

  async buscar() {
    const texto = this.campo.value.trim();
    if (texto === this.ultimo) return;
    this.ultimo = texto;

    if (this.peticion) this.peticion.abort();
    if (texto.length < 2) {
      this.lista.innerHTML = '';
      this.campo.setAttribute('aria-expanded', 'false');
      this.anuncio.textContent = '';
      this.marcar(-1);
      return;
    }

    this.peticion = new AbortController();
    const parametros = new URLSearchParams({
      q: texto,
      'resources[type]': 'product,collection',
      'resources[limit]': '4',
      'resources[limit_scope]': 'each',
      section_id: this.dataset.seccion,
    });

    try {
      const respuesta = await fetch(`${this.dataset.url}?${parametros}`, { signal: this.peticion.signal });
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      const html = await respuesta.text();
      const documento = new DOMParser().parseFromString(html, 'text/html');
      const contenido = documento.querySelector('[data-total]');
      this.lista.innerHTML = contenido ? contenido.innerHTML : '';
      const total = Number(contenido?.dataset.total ?? 0);
      this.campo.setAttribute('aria-expanded', total > 0 ? 'true' : 'false');
      this.marcar(-1);
      this.anuncio.textContent = total > 0 ? `${total} ${total === 1 ? 'sugerencia' : 'sugerencias'}` : 'Sin resultados';
    } catch (error) {
      if (error.name === 'AbortError') return;
      // Sin sugerencias: el formulario sigue llevando a /search con Enter
      this.lista.innerHTML = '';
      this.campo.setAttribute('aria-expanded', 'false');
    }
  }
}

if (!customElements.get('busqueda-predictiva')) customElements.define('busqueda-predictiva', BusquedaPredictiva);
