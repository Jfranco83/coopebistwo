/* =====================================================================
   COOINDEGABO · COMPORTAMIENTO (JavaScript)
   ---------------------------------------------------------------------
   ÍNDICE
     0. Datos editables: lista de CONVENIOS  <- EDITA AQUÍ nombres, textos e imágenes
     1. Preparación general
     2. Tamaño de letra (A− / A+)
     3. Encabezado: efecto al hacer scroll
     4. Menú hamburguesa y submenús
     5. Carrusel principal
     6. Animaciones al hacer scroll (reveal)
     7. Navegación activa según la sección visible
     8. Botón "volver arriba"
     9. Convenios: tarjetas, buscador y ventana emergente
    10. Detalles finales (año del pie, enlaces provisionales)

   NOTA DE SEGURIDAD: para insertar textos usamos textContent / createElement
   (nunca innerHTML con datos). Así, aunque un texto trajera código malicioso,
   el navegador lo mostraría como texto y NO lo ejecutaría.
   ===================================================================== */


/* =====================================================================
   0. DATOS EDITABLES: CONVENIOS
   Cada convenio tiene:
     nombre      -> título de la tarjeta
     descripcion -> texto corto de la tarjeta
     detalle     -> texto largo que se ve en la ventana emergente
     imagen      -> ruta de la imagen (ej: "img/kfc.jpg"). Déjala "" si aún no la tienes.
   Para AGREGAR un convenio, copia un bloque { ... }, pégalo y cambia los textos.
   IMPORTANTE: los textos son de ejemplo. Verifica con la cooperativa
   los beneficios reales de cada aliado antes de publicar.
   ===================================================================== */
const CONVENIOS = [
  { nombre: "KFC",           descripcion: "Beneficios para asociados en comidas y celebraciones en familia.", detalle: "Disfruta de beneficios en tus comidas con familia y amigos. Consulta restaurantes participantes y condiciones vigentes.", imagen: "" },
  { nombre: "Popsy",         descripcion: "Un plan dulce para compartir con los tuyos.", detalle: "Aprovecha el convenio en productos del aliado. Consulta puntos de venta y condiciones vigentes.", imagen: "" },
  { nombre: "Playland",      descripcion: "Diversión y recreación para toda la familia.", detalle: "Un espacio para que los más pequeños disfruten. Consulta sedes, horarios y condiciones del beneficio.", imagen: "" },
  { nombre: "Viacoop",       descripcion: "Planes de turismo y viajes para asociados.", detalle: "Descubre planes de viaje pensados para el sector solidario. Consulta destinos y condiciones vigentes.", imagen: "" },
  { nombre: "Cine Colombia", descripcion: "Tu próxima película, con beneficio para asociados.", detalle: "Disfruta del cine con condiciones especiales. Consulta salas participantes y vigencia.", imagen: "" },
  { nombre: "Cinemark",      descripcion: "Cine para compartir en pareja, con amigos o en familia.", detalle: "Aprovecha el convenio en salas participantes. Consulta condiciones y vigencia.", imagen: "" },
  { nombre: "Casa E Borrero", descripcion: "Beneficios para asociados en productos y servicios del aliado.", detalle: "Consulta con nuestro equipo cuáles productos y servicios incluye este convenio.", imagen: "" },
  { nombre: "EMI",           descripcion: "Respaldo en atención médica de emergencia.", detalle: "Un apoyo para la tranquilidad de tu familia. Consulta coberturas y condiciones del convenio.", imagen: "" },
  { nombre: "Los Olivos",    descripcion: "Previsión y acompañamiento para ti y tu familia.", detalle: "Conoce los servicios del convenio y sus condiciones con nuestro equipo.", imagen: "" },
  { nombre: "Chevrolet",     descripcion: "Condiciones especiales para asociados en el mundo automotor.", detalle: "Consulta vehículos y servicios incluidos en el convenio, y sus condiciones vigentes.", imagen: "" },
  { nombre: "Casa Toro",     descripcion: "Movilidad con respaldo y beneficios para asociados.", detalle: "Consulta vehículos y servicios incluidos en el convenio, y sus condiciones vigentes.", imagen: "" }
];


/* Todo el código va dentro de una función que se ejecuta sola (IIFE).
   Así nuestras variables no chocan con las de otros scripts. */
(function () {
  "use strict"; // Modo estricto: el navegador avisa de errores comunes

  /* ===================================================================
     1. PREPARACIÓN GENERAL
     =================================================================== */

  // Atajos para buscar elementos (más corto que escribir document.querySelector)
  const $  = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const root = document.documentElement;       // La etiqueta <html>
  root.classList.add("js");                    // Le avisa al CSS que JavaScript funciona (activa .reveal)

  // ¿El usuario pidió menos animaciones en su dispositivo?
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Guardar/leer preferencias. Se envuelve en try/catch porque algunos
  // navegadores (modo privado) bloquean localStorage y daría error.
  const storage = {
    get(key)        { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* no pasa nada */ } }
  };


  /* ===================================================================
     2. TAMAÑO DE LETRA
     Tres niveles: 0 = normal, 1 = grande, 2 = muy grande.
     El CSS lee el atributo data-font del <html> y cambia el tamaño base.
     =================================================================== */
  const FONT_MIN = 0;
  const FONT_MAX = 2;
  let fontLevel = parseInt(storage.get("coop-font"), 10);
  if (isNaN(fontLevel) || fontLevel < FONT_MIN || fontLevel > FONT_MAX) fontLevel = 0;

  const btnFontUp   = $("#font-up");
  const btnFontDown = $("#font-down");

  function applyFont() {
    if (fontLevel === 0) root.removeAttribute("data-font");
    else root.setAttribute("data-font", String(fontLevel));
    storage.set("coop-font", String(fontLevel));          // Recuerda la elección en la próxima visita
    // Desactiva el botón cuando ya no se puede agrandar/disminuir más
    if (btnFontUp)   btnFontUp.disabled   = fontLevel === FONT_MAX;
    if (btnFontDown) btnFontDown.disabled = fontLevel === FONT_MIN;
  }

  if (btnFontUp)   btnFontUp.addEventListener("click",   () => { if (fontLevel < FONT_MAX) { fontLevel++; applyFont(); } });
  if (btnFontDown) btnFontDown.addEventListener("click", () => { if (fontLevel > FONT_MIN) { fontLevel--; applyFont(); } });
  applyFont();


  /* ===================================================================
     3. ENCABEZADO: al bajar, se oculta la barra superior
     =================================================================== */
  const header = $(".site-header");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }


  /* ===================================================================
     4. MENÚ HAMBURGUESA Y SUBMENÚS
     =================================================================== */
  const burger   = $("#burger");
  const nav      = $("#menu");
  const backdrop = $("#nav-backdrop");

  function setMenu(open) {
    nav.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.style.overflow = open ? "hidden" : "";  // Evita que la página se mueva detrás del menú
  }

  burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  backdrop.addEventListener("click", () => setMenu(false));

  // Submenús: cada botón .has-sub se abre/cierra con un clic o toque
  const subItems = $$(".has-sub");
  function closeSubs(except) {
    subItems.forEach(item => {
      if (item !== except) {
        item.classList.remove("open");
        $(".nav__link", item).setAttribute("aria-expanded", "false");
      }
    });
  }
  subItems.forEach(item => {
    const trigger = $(".nav__link", item);
    trigger.addEventListener("click", () => {
      const willOpen = !item.classList.contains("open");
      closeSubs(item);                                    // Cierra los demás
      item.classList.toggle("open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  // Cerrar al hacer clic fuera del menú o al presionar Escape
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".has-sub")) closeSubs();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeSubs(); setMenu(false); }
  });

  // Al elegir un enlace del menú, se cierra el panel móvil
  $$("a", nav).forEach(link => link.addEventListener("click", () => { setMenu(false); closeSubs(); }));

  // Si se agranda la ventana a modo escritorio, se limpia el estado móvil
  window.matchMedia("(min-width: 1081px)").addEventListener("change", () => setMenu(false));


  /* ===================================================================
     5. CARRUSEL PRINCIPAL
     - Cambio automático cada AUTOPLAY_MS milisegundos (se pausa al pasar el mouse/foco)
     - Flechas, puntos, teclado (← →) y deslizar con el dedo
     =================================================================== */
  const AUTOPLAY_MS = 7000;                 // 7 segundos por slide (cámbialo si quieres)

  const track   = $("#slider-track");
  const slides  = $$(".slide", track);
  const dotsBox = $("#slider-dots");
  const slider  = $("#slider");
  let current   = 0;
  let timer     = null;

  // Crear un punto por cada slide
  const dots = slides.map((slide, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Ir a la diapositiva " + (i + 1));
    dot.addEventListener("click", () => { goTo(i); restartAutoplay(); });
    dotsBox.appendChild(dot);
    return dot;
  });

  function goTo(index) {
    // El módulo hace que después del último vuelva al primero (y viceversa)
    current = (index + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-current * 100) + "%)";
    slides.forEach((slide, i) => {
      // "inert" evita que se pueda tabular/leer lo que no se ve
      if (i === current) slide.removeAttribute("inert"); else slide.setAttribute("inert", "");
    });
    dots.forEach((dot, i) => dot.setAttribute("aria-selected", String(i === current)));
  }

  function startAutoplay() {
    if (reduceMotion) return;               // Respeta la preferencia de menos movimiento
    stopAutoplay();
    timer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
  }
  function stopAutoplay()    { clearInterval(timer); timer = null; }
  function restartAutoplay() { startAutoplay(); }

  $("#slider-prev").addEventListener("click", () => { goTo(current - 1); restartAutoplay(); });
  $("#slider-next").addEventListener("click", () => { goTo(current + 1); restartAutoplay(); });

  // Pausa mientras el usuario interactúa
  slider.addEventListener("mouseenter", stopAutoplay);
  slider.addEventListener("mouseleave", startAutoplay);
  slider.addEventListener("focusin", stopAutoplay);
  slider.addEventListener("focusout", startAutoplay);

  // Flechas del teclado cuando el carrusel tiene el foco
  slider.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { goTo(current - 1); restartAutoplay(); }
    if (e.key === "ArrowRight") { goTo(current + 1); restartAutoplay(); }
  });

  // Deslizar con el dedo (swipe)
  let touchStartX = 0;
  slider.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  slider.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {              // Solo si el movimiento fue claro (más de 50px)
      goTo(diff < 0 ? current + 1 : current - 1);
      restartAutoplay();
    }
  }, { passive: true });

  // No gastar recursos si la pestaña está oculta
  document.addEventListener("visibilitychange", () => { document.hidden ? stopAutoplay() : startAutoplay(); });

  goTo(0);
  startAutoplay();


  /* ===================================================================
     6. ANIMACIONES AL HACER SCROLL
     IntersectionObserver avisa cuando un elemento entra en pantalla.
     =================================================================== */
  function setupReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(el => el.classList.add("is-visible"));   // Sin soporte: mostrar todo
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);                  // Anima una sola vez
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => observer.observe(el));
  }


  /* ===================================================================
     7. NAVEGACIÓN ACTIVA SEGÚN LA SECCIÓN VISIBLE
     Los enlaces del menú con data-spy="id-de-seccion" se resaltan
     cuando esa sección está en pantalla.
     =================================================================== */
  function setupScrollSpy() {
    const links = $$("[data-spy]");
    if (!("IntersectionObserver" in window) || !links.length) return;

    const sections = links
      .map(l => document.getElementById(l.dataset.spy))
      .filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle("is-active", l.dataset.spy === entry.target.id));
        }
      });
    // rootMargin: la sección cuenta como "activa" cuando cruza la franja central de la pantalla
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(s => spy.observe(s));

    // Al volver al inicio, se quita el resaltado
    window.addEventListener("scroll", () => {
      if (window.scrollY < 200) links.forEach(l => l.classList.remove("is-active"));
    }, { passive: true });
  }


  /* ===================================================================
     8. BOTÓN "VOLVER ARRIBA"
     =================================================================== */
  const toTop = $("#to-top");
  function onScrollToTop() { toTop.classList.toggle("show", window.scrollY > 500); }
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Un solo "oyente" de scroll para header y botón (más eficiente).
  // requestAnimationFrame limita el trabajo a una vez por cuadro.
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => { onScrollHeader(); onScrollToTop(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  onScrollHeader();
  onScrollToTop();


  /* ===================================================================
     9. CONVENIOS: TARJETAS, BUSCADOR Y VENTANA EMERGENTE
     =================================================================== */
  const grid      = $("#agreements");
  const emptyMsg  = $("#agreements-empty");
  const searchBox = $("#buscar-convenio");
  const modal     = $("#modal");

  // Crea el espacio de imagen: con <img> si hay ruta, vacío (recuadro) si no
  function buildImageSlot(src, alt, wide) {
    const slot = document.createElement("div");
    slot.className = "img-slot" + (wide ? " img-slot--wide" : "");
    slot.dataset.label = alt;
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.loading = "lazy";                  // Carga la imagen solo cuando se acerca a la pantalla
      slot.appendChild(img);
    }
    return slot;
  }

  // Dibuja una tarjeta por cada convenio de la lista CONVENIOS
  const cards = CONVENIOS.map((c) => {
    const card = document.createElement("button");   // <button>: se puede usar con teclado
    card.type = "button";
    card.className = "agreement reveal";
    card.dataset.search = c.nombre.toLowerCase() + " " + c.descripcion.toLowerCase();

    const body = document.createElement("div");
    body.className = "agreement__body";

    const title = document.createElement("h3");
    title.className = "agreement__title";
    title.textContent = c.nombre;                    // textContent = seguro

    const text = document.createElement("p");
    text.className = "agreement__text";
    text.textContent = c.descripcion;

    const more = document.createElement("span");
    more.className = "agreement__more";
    more.textContent = "Ver detalle";

    body.append(title, text, more);
    card.append(buildImageSlot(c.imagen, "Imagen " + c.nombre, true), body);

    card.addEventListener("click", () => openModal(c));
    grid.appendChild(card);
    return card;
  });

  // Buscador: oculta las tarjetas que no coinciden
  searchBox.addEventListener("input", () => {
    const term = searchBox.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const match = card.dataset.search.includes(term);
      card.hidden = !match;
      if (match) visible++;
    });
    emptyMsg.hidden = visible > 0;
  });

  // Ventana emergente
  function openModal(c) {
    $("#modal-title").textContent = c.nombre;
    $("#modal-text").textContent  = c.detalle;
    const imgBox = $("#modal-img");
    imgBox.replaceChildren();                        // Limpia la imagen anterior
    imgBox.dataset.label = "Imagen " + c.nombre;
    if (c.imagen) {
      const img = document.createElement("img");
      img.src = c.imagen;
      img.alt = "Imagen " + c.nombre;
      imgBox.appendChild(img);
    }
    if (typeof modal.showModal === "function") modal.showModal();   // <dialog> maneja foco y tecla Esc
    else modal.setAttribute("open", "");                            // Respaldo para navegadores muy viejos
  }
  function closeModal() { if (modal.open) modal.close(); }

  $("#modal-close").addEventListener("click", closeModal);
  // Clic en el fondo oscuro (fuera de la caja) también cierra
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });


  /* ===================================================================
     10. DETALLES FINALES
     =================================================================== */
  // Año actual en el pie de página (no hay que actualizarlo cada año)
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  // Enlaces provisionales (href="#"): evitamos que la página salte arriba al tocarlos.
  // Cuando pongas la dirección real, este código deja de afectarlos.
  $$('a[href="#"]').forEach(a => a.addEventListener("click", (e) => e.preventDefault()));

  // Iniciar animaciones y navegación activa (después de crear las tarjetas de convenios)
  setupReveal();
  setupScrollSpy();
})();