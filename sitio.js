'use strict';

document.documentElement.classList.add('js');

const menuToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

function setMenuOpen(open) {
  menuToggle.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('click', (event) => {
  if (!event.target.closest('a')) return;

  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenuOpen(false);
  if (isOpen && event.target.closest('a').hash) menuToggle.focus({ preventScroll: true });
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

const solutionNav = document.querySelector('.solution-nav');

if (solutionNav) {
  const tabs = [...solutionNav.querySelectorAll('[data-solution]')];
  const panels = tabs.map((tab) => document.getElementById('solucion-' + tab.dataset.solution));

  solutionNav.setAttribute('role', 'tablist');
  solutionNav.setAttribute('aria-orientation', 'vertical');

  function selectSolution(index, animate = false) {
    tabs.forEach((tab, position) => {
      const panel = panels[position];
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panel.hidden = !active;
      panel.classList.toggle('is-entering', active && animate);
    });
  }

  function syncSolution() {
    const index = panels.findIndex((panel) => '#' + panel.id === location.hash);
    if (index >= 0) selectSolution(index);
    return index >= 0;
  }

  tabs.forEach((tab, index) => {
    const panel = panels[index];
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;

    tab.addEventListener('click', (event) => {
      event.preventDefault();
      selectSolution(index, true);
    });

    tab.addEventListener('keydown', (event) => {
      let next;
      switch (event.key) {
        case 'ArrowDown': next = (index + 1) % tabs.length; break;
        case 'ArrowUp': next = (index - 1 + tabs.length) % tabs.length; break;
        case 'Home': next = 0; break;
        case 'End': next = tabs.length - 1; break;
        case ' ': next = index; break;
        default: return;
      }
      event.preventDefault();
      selectSolution(next, true);
      tabs[next].focus();
    });
  });

  if (!syncSolution()) selectSolution(0);
  window.addEventListener('hashchange', syncSolution);
}

const brief = document.querySelector('#brief');

if (brief) {
  const idea = document.querySelector('#idea');
  const preview = document.querySelector('#brief-preview');
  const heading = document.querySelector('#brief-heading');
  const output = document.querySelector('#brief-output');
  const generate = document.querySelector('#generar');
  const download = document.querySelector('#descargar');
  const status = document.querySelector('#brief-status');
  const studio = document.querySelector('#direccion-estudio');
  const nextSteps = new Map([
    ['Una web nueva', 'Elegir la acción principal del visitante y reunir los textos, las fotos y los datos del negocio.'],
    ['Mejorar mi web actual', 'Revisar la web actual en móvil y apuntar dónde se atascan los clientes.'],
    ['Alojamiento y mantenimiento', 'Revisar el dominio, el software y las copias actuales antes de planificar una migración o un mantenimiento.'],
    ['Explorar opciones', 'Anotar las preguntas más frecuentes de los clientes y decidir cuáles puede resolver la web.']
  ]);

  function buildSummary(data) {
    const field = (name) => data.get(name).trim();
    const description = field('idea');
    const firstSentence = description.split(/(?<=[.!?])\s+|\r?\n/, 1)[0];
    const limit = 200;
    const objective = firstSentence.length <= limit
      ? firstSentence
      : firstSentence.slice(0, limit).replace(/\s+\S*$/, '') + '…';

    const need = field('necesidad');
    const lines = [
      'MI PROYECTO WEB',
      '',
      'Negocio: ' + (field('negocio') || 'Por definir'),
      'Necesidad: ' + need,
      'Objetivo principal: ' + objective,
      '',
      'Primer paso sugerido',
      nextSteps.get(need)
    ];

    if (objective !== description) lines.push('', 'Notas de partida', description);

    const contact = [
      ['Nombre', field('nombre')],
      ['Correo', field('correo')],
      ['Teléfono', field('telefono')]
    ].filter(([, value]) => value);
    if (contact.length) {
      lines.push('', 'Contacto del proyecto', ...contact.map(([label, value]) => label + ': ' + value));
    }

    lines.push(
      '',
      'Contacto del estudio',
      'Complementos López',
      studio.querySelector('strong').textContent,
      studio.querySelector('p').textContent,
      ''
    );
    return lines.join('\n');
  }

  brief.addEventListener('input', () => {
    idea.setCustomValidity('');
    preview.hidden = true;
    output.textContent = '';
    status.textContent = '';
  });

  brief.addEventListener('invalid', (event) => {
    const details = event.target.closest('details');
    if (details) details.open = true;
  }, true);

  brief.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!idea.value.trim()) {
      idea.setCustomValidity('Escribe qué te gustaría conseguir con tu web.');
      idea.reportValidity();
      return;
    }

    output.textContent = buildSummary(new FormData(brief));
    preview.hidden = false;
    status.textContent = '';
    heading.focus();
  });

  download.addEventListener('click', () => {
    if (preview.hidden) return;

    const summary = output.textContent.replace(/\r?\n/g, '\r\n');
    const url = URL.createObjectURL(new Blob([summary], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mi-idea-complementos-lopez.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 10000);
    status.textContent = 'Se ha iniciado la descarga de tu resumen.';
  });

  generate.disabled = false;
}

/* Adrián comparte el mismo recorrido en todas las páginas del sitio. */
{
  const logo = document.querySelector('.site-header .brand img');
  const avatar = document.createElement('div');
  avatar.id = 'avatar-adrian';
  avatar.className = 'adrian-avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.innerHTML = `
    <svg viewBox="0 0 128 154" focusable="false" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="64" cy="145" rx="31" ry="4" fill="#211737" opacity=".19"/>
      <g stroke="#201730" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <g class="adrian-step adrian-step-left">
          <path d="M53 110l-3 28" stroke-width="12"/>
          <path d="M53 110l-3 24" stroke="#47395c" stroke-width="7"/>
          <path d="M47 134h7l1 8H38c-2-5 5-7 9-8Z" fill="#ddfb8d"/>
        </g>
        <g class="adrian-step adrian-step-right">
          <path d="M75 110l3 28" stroke-width="12"/>
          <path d="M75 110l3 24" stroke="#47395c" stroke-width="7"/>
          <path d="M81 134h-7l-1 8h17c2-5-5-7-9-8Z" fill="#ddfb8d"/>
        </g>
        <g class="adrian-weigh adrian-weigh-left">
          <path d="M47 79 38 93 25 86" stroke-width="13"/>
          <path d="M47 79 38 93 25 86" stroke="#9da4b0" stroke-width="8"/>
          <path d="M28 84c-3 5-10 5-14 1l-4-4c-1-2 1-4 3-3l5 3 1-3c1-2 4-1 4 1v2l5 3Z" fill="#ffb587"/>
        </g>
        <g class="adrian-weigh adrian-weigh-right">
          <path d="m81 79 9 14 13-7" stroke-width="13"/>
          <path d="m81 79 9 14 13-7" stroke="#9da4b0" stroke-width="8"/>
          <path d="M100 84c3 5 10 5 14 1l4-4c1-2-1-4-3-3l-5 3-1-3c-1-2-4-1-4 1v2l-5 3Z" fill="#ffb587"/>
        </g>
        <g class="adrian-torso">
          <path d="M46 78q-2-12 18-12t18 12" fill="#777f8d"/>
          <path d="M51 74h26q12 9 11 39-24 10-48 0-1-30 11-39Z" fill="#b7bdc6"/>
          <path d="M55 78 64 86l9-8M60 86l-2 9m10-9 2 9M55 102l-3 6h24l-3-6" fill="none" stroke="#555e6e" stroke-width="1.8"/>
          <path d="M42 112q22 6 44 0" stroke="#777f8d" stroke-width="1.6"/>
        </g>
      </g>
      <svg class="adrian-head" x="32" y="1" width="63" height="79" viewBox="276 388 329 419" overflow="visible">
        <defs>
          <clipPath id="adrian-face-cutout">
            <path d="M313 585Q306 577 308 559Q309 546 313 532Q308 526 314 511Q315 493 326 483Q323 473 336 462Q334 450 350 438Q351 428 373 419Q381 408 400 406Q411 396 429 397Q439 388 453 395Q466 388 478 395Q500 389 515 403Q527 404 538 417Q554 415 567 432Q579 438 585 454Q597 465 595 483Q601 499 594 512Q602 530 596 548Q601 563 596 582L588 634Q601 634 598 663Q598 690 587 711Q580 729 552 724Q541 753 513 780Q485 804 451 805Q413 803 381 785Q353 769 334 741Q318 716 317 679Q296 687 286 671Q277 660 281 649Q275 625 286 605Q297 582 313 585Z"/>
          </clipPath>
        </defs>
        <image width="1254" height="1254" clip-path="url(#adrian-face-cutout)"/>
      </svg>
      <g class="adrian-numbers" text-anchor="middle">
        <g class="adrian-drop adrian-drop-left">
          <rect x="6" y="62" width="29" height="19" rx="5" fill="#ddfb8d" stroke="#211737" stroke-width="1.4"/>
          <text x="20.5" y="76" fill="#211737">67</text>
        </g>
        <g class="adrian-drop adrian-drop-right">
          <rect x="93" y="62" width="29" height="19" rx="5" fill="#ffddc6" stroke="#211737" stroke-width="1.4"/>
          <text x="107.5" y="76" fill="#211737">67</text>
        </g>
      </g>
    </svg>`;
  avatar.querySelector('image').setAttribute('href', logo.src);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'adrian-toggle';
  toggle.setAttribute('aria-controls', avatar.id);
  toggle.innerHTML = `
    <svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M2 12s3.4-6 10-6 10 6 10 6-3.4 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.7"/>
      <path class="adrian-toggle-slash" d="M4 4l16 16"/>
    </svg>`;

  const storageKey = 'complementos-avatar-oculto';
  const patrolDuration = 26000;
  function setAvatarHidden(hidden) {
    avatar.hidden = hidden;
    if (!hidden) {
      avatar.style.setProperty('--adrian-duration', patrolDuration + 'ms');
      avatar.style.setProperty('--adrian-phase', -(Date.now() % patrolDuration) + 'ms');
    }
    const label = (hidden ? 'Mostrar' : 'Ocultar') + ' avatar de Adrián';
    toggle.setAttribute('aria-label', label);
    toggle.title = label;
    toggle.classList.toggle('is-hidden', hidden);
  }

  let avatarHidden = false;
  try {
    avatarHidden = sessionStorage.getItem(storageKey) === '1';
  } catch {
    // La animación sigue disponible si el navegador restringe el almacenamiento local.
  }
  setAvatarHidden(avatarHidden);
  toggle.addEventListener('click', () => {
    const hidden = !avatar.hidden;
    setAvatarHidden(hidden);
    try {
      sessionStorage.setItem(storageKey, hidden ? '1' : '0');
    } catch {
      // El control conserva su estado en la página actual.
    }
  });
  document.body.append(avatar, toggle);
}
