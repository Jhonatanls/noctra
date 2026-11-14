// Filtros de colección (SPEC-003). Mejora progresiva: sin JavaScript el formulario GET sigue funcionando.
// Con JavaScript: panel modal en celular, actualización sin recarga (Section Rendering API) y URL compartible.

class FiltrosColeccion extends HTMLElement {
  connectedCallback() {
    this.formulario = this.querySelector('[data-filtros-form]');
    this.panel = this.querySelector('dialog.filtros__panel');
    if (!this.formulario || !this.panel) return;

    this.resultados = this.querySelector('[data-resultados]');
    this.anuncio = this.querySelector('[data-anuncio]');
    this.abrir = this.querySelector('[data-abrir-filtros]');
    this.escritorio = window.matchMedia('(min-width: 990px)');
    this.espera = null;
    this.peticion = null;

    this.classList.add('filtros--js');
    this.ajustarPanel();
    this.escritorio.addEventListener('change', () => this.ajustarPanel());

    this.abrir?.addEventListener('click', () => this.abrirPanel());
    this.panel.addEventListener('click', (evento) => {
      if (evento.target.closest('[data-cerrar-filtros]')) { this.panel.close(); return; }
      // Clic en el fondo oscuro, fuera de la hoja
      if (evento.target === this.panel && this.panel.matches(':modal')) this.panel.close();
    });
    this.panel.addEventListener('close', () => {
      if (!this.escritorio.matches) this.abrir?.focus();
    });

    this.formulario.addEventListener('submit', (evento) => { evento.preventDefault(); this.actualizar(); });
    this.addEventListener('change', (evento) => {
      if (evento.target.matches('input, select')) this.programar(evento.target.type === 'number' ? 400 : 0);
    });
    this.addEventListener('input', (evento) => {
      if (evento.target.matches('input[type="number"]')) this.programar(600);
    });

    // En escritorio, cerrar los desplegables al hacer clic fuera
    document.addEventListener('click', (evento) => {
      if (this.escritorio.matches && !evento.target.closest('[data-filtros-grupo]')) this.cerrarGrupos();
    });
  }

  // Escritorio: panel abierto en línea. Celular: cerrado hasta que se toque "Filtrar".
  ajustarPanel() {
    if (this.escritorio.matches) {
      if (this.panel.matches(':modal')) this.panel.close();
      if (!this.panel.open) this.panel.show();
    } else if (this.panel.open && !this.panel.matches(':modal')) {
      this.panel.close();
    }
  }

  abrirPanel() {
    if (!this.panel.matches(':modal')) {
      if (this.panel.open) this.panel.close();
      this.panel.showModal();
    }
  }

  cerrarGrupos() {
    this.querySelectorAll('[data-filtros-grupo][open]').forEach((grupo) => grupo.removeAttribute('open'));
  }

  programar(retraso) {
    clearTimeout(this.espera);
    this.espera = setTimeout(() => this.actualizar(), retraso);
  }

  construirUrl() {
    const datos = new URLSearchParams();
    new FormData(this.formulario).forEach((valor, clave) => {
      if (valor !== '') datos.append(clave, valor);
    });
    // El orden vive en un <select> fuera del formulario (atributo form), así que FormData ya lo incluye.
    const base = this.formulario.getAttribute('action') || window.location.pathname;
    const texto = datos.toString();
    return texto ? `${base}?${texto}` : base;
  }

  async actualizar() {
    const url = this.construirUrl();
    const seccion = this.dataset.seccion;
    if (this.peticion) this.peticion.abort();
    this.peticion = new AbortController();
    const senal = this.peticion.signal;

    this.resultados.style.minBlockSize = `${this.resultados.offsetHeight}px`;
    this.resultados.setAttribute('aria-busy', 'true');

    try {
      const separador = url.includes('?') ? '&' : '?';
      const respuesta = await fetch(`${url}${separador}section_id=${encodeURIComponent(seccion)}`, { signal: senal });
      if (!respuesta.ok) throw new Error(String(respuesta.status));
      const html = await respuesta.text();
      const documento = new DOMParser().parseFromString(html, 'text/html');
      const nuevo = documento.querySelector('[data-resultados]');
      if (!nuevo) throw new Error('sin resultados en la respuesta');

      this.resultados.innerHTML = nuevo.innerHTML;
      this.copiarHtml(documento, '[data-filtrar-etiqueta]');
      this.copiarHtml(documento, '[data-ver]');
      this.copiarHtml(documento, '[data-limpiar]');
      this.sincronizarOpciones(documento);
      history.replaceState(null, '', url);

      const conteo = this.resultados.querySelector('[data-conteo]')?.dataset.conteo ?? '0';
      const n = Number(conteo);
      this.anuncio.textContent = n === 0 ? 'No encontramos productos con esos filtros.' : `${n} ${n === 1 ? 'producto' : 'productos'}`;
    } catch (error) {
      if (error.name === 'AbortError') return;
      // Error de red: caída a la recarga normal con la misma URL
      window.location.href = url;
      return;
    } finally {
      this.resultados.removeAttribute('aria-busy');
      this.resultados.style.minBlockSize = '';
    }
  }

  copiarHtml(documento, selector) {
    const origen = documento.querySelector(selector);
    const destino = this.querySelector(selector);
    if (origen && destino) destino.innerHTML = origen.innerHTML;
  }

  // Actualiza conteos y opciones deshabilitadas sin reemplazar los campos (el foco no se pierde)
  sincronizarOpciones(documento) {
    const clave = (campo) => `${campo.name}\u0000${campo.value}`;
    const nuevas = new Map();
    documento.querySelectorAll('[data-filtros-form] input[type="checkbox"]').forEach((campo) => nuevas.set(clave(campo), campo));
    this.formulario.querySelectorAll('input[type="checkbox"]').forEach((campo) => {
      const nuevo = nuevas.get(clave(campo));
      if (!nuevo) return;
      campo.disabled = nuevo.disabled;
      const conteo = campo.closest('label')?.querySelector('.filtros__conteo');
      const conteoNuevo = nuevo.closest('label')?.querySelector('.filtros__conteo');
      if (conteo && conteoNuevo) conteo.textContent = conteoNuevo.textContent;
    });
  }
}

if (!customElements.get('filtros-coleccion')) customElements.define('filtros-coleccion', FiltrosColeccion);
