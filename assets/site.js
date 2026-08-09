document.documentElement.classList.add('js');

const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');

if (menuButton && menu) {
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menu.toggleAttribute('data-open', !isOpen);
    document.body.classList.toggle('menu-open', !isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuButton.setAttribute('aria-expanded', 'false');
      menu.removeAttribute('data-open');
      document.body.classList.remove('menu-open');
    });
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('[data-reveal]').forEach((element) => {
  revealObserver.observe(element);
});

document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = new Date().getFullYear();
});

const configurator = document.querySelector('[data-configurator]');

if (configurator) {
  const sizeData = {
    1010: {
      imperial: "10' × 10'",
      metric: '3.05 × 3.05 m',
      millimeters: '3048 × 3048 mm',
      area: '100 sq ft • 9.3 m²',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: "Max 10 foot by 10 foot aluminum pergola kit"
    },
    1216: {
      imperial: "12' × 16'",
      metric: '3.66 × 4.88 m',
      millimeters: '3658 × 4877 mm',
      area: '192 sq ft • 17.8 m²',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: "Max 12 foot by 16 foot aluminum pergola kit"
    },
    1220: {
      imperial: "12' × 20'",
      metric: '3.66 × 6.10 m',
      millimeters: '3658 × 6096 mm',
      area: '240 sq ft • 22.3 m²',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: "Max 12 foot by 20 foot aluminum pergola kit"
    }
  };

  const labels = {
    layout: { FS: 'Freestanding', WM: 'Wall-attached — engineering review' },
    roof: { ML: 'Manual louvers', MR: 'Motor-ready preparation' },
    finish: { GR: 'Graphite', WH: 'Matte white — availability review', CX: 'Custom finish — color-match review' },
    accessories: {
      LED: 'LED preparation',
      SCR: 'Retractable screen preparation',
      GLS: 'Glass wall preparation'
    }
  };

  const getValue = (name) => configurator.querySelector(`[name="${name}"]:checked`)?.value;
  const setText = (selector, value) => {
    const element = configurator.querySelector(selector);
    if (element) element.textContent = value;
  };

  const updateConfigurator = () => {
    const sizeCode = getValue('kit-size');
    const layoutCode = getValue('kit-layout');
    const roofCode = getValue('kit-roof');
    const finishCode = getValue('kit-finish');
    const selectedAccessories = [...configurator.querySelectorAll('[name="kit-accessory"]:checked')]
      .map((input) => input.value);
    const zip = configurator.querySelector('[data-config-zip]')?.value.trim() || '';
    const size = sizeData[sizeCode];
    const accessorySuffix = selectedAccessories.length ? `+${selectedAccessories.join('+')}` : '';
    const sku = `MP-${layoutCode}-${sizeCode}-${roofCode}-${finishCode}${accessorySuffix}`;
    const accessoryText = selectedAccessories.length
      ? selectedAccessories.map((code) => labels.accessories[code]).join(', ')
      : 'None selected';

    setText('[data-config-name]', `Max ${size.imperial} Kit`);
    setText('[data-config-sku]', sku);
    setText('[data-config-size]', size.imperial);
    setText('[data-config-size-metric]', `${size.metric} • ${size.millimeters}`);
    setText('[data-config-area]', size.area);
    setText('[data-config-layout]', labels.layout[layoutCode]);
    setText('[data-config-roof]', labels.roof[roofCode]);
    setText('[data-config-finish]', labels.finish[finishCode]);
    setText('[data-config-accessories]', accessoryText);
    setText('[data-config-imperial]', size.imperial);
    setText('[data-config-metric]', size.metric);

    const image = configurator.querySelector('[data-config-image]');
    if (image && image.getAttribute('src') !== size.image) {
      image.setAttribute('src', size.image);
      image.setAttribute('alt', size.imageAlt);
    }

    const subject = `Max Pergola configuration ${sku}`;
    const body = [
      'Hello Max Pergola,',
      '',
      'Please quote the following configuration:',
      `Configuration SKU: ${sku}`,
      `Nominal size: ${size.imperial} (${size.metric}; ${size.millimeters})`,
      `Covered area: ${size.area}`,
      `Layout: ${labels.layout[layoutCode]}`,
      `Roof: ${labels.roof[roofCode]}`,
      `Finish request: ${labels.finish[finishCode]}`,
      `Add-on planning: ${accessoryText}`,
      `US delivery ZIP: ${zip || 'Not supplied'}`,
      '',
      'Please confirm final dimensions, compatibility, engineering inputs, delivery scope and current pricing.'
    ].join('\n');
    const cta = configurator.querySelector('[data-config-cta]');
    if (cta) cta.href = `mailto:inquiry@maxpergola.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  configurator.querySelectorAll('input').forEach((input) => {
    input.addEventListener(input.matches('[data-config-zip]') ? 'input' : 'change', updateConfigurator);
  });

  const copyButton = configurator.querySelector('[data-copy-sku]');
  copyButton?.addEventListener('click', async () => {
    const sku = configurator.querySelector('[data-config-sku]')?.textContent || '';
    try {
      await navigator.clipboard.writeText(sku);
      copyButton.textContent = 'Copied';
    } catch {
      copyButton.textContent = sku;
    }
    window.setTimeout(() => { copyButton.textContent = 'Copy'; }, 1600);
  });

  document.querySelectorAll('[data-select-size]').forEach((button) => {
    button.addEventListener('click', () => {
      const sizeInput = configurator.querySelector(`[name="kit-size"][value="${button.dataset.selectSize}"]`);
      if (!sizeInput) return;
      sizeInput.checked = true;
      updateConfigurator();
      document.querySelector('#configure')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => sizeInput.focus({ preventScroll: true }), 550);
    });
  });

  updateConfigurator();
}
