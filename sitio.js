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
