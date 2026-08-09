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
  const packageData = {
    ST: {
      name: 'Standard',
      roof: 'Manual louvers',
      included: 'Aluminum frame, manual louvers, integrated gutters and post drainage',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: 'Max Pergola Standard manual louver package beside a pool'
    },
    PR: {
      name: 'Pro',
      roof: 'Motorized louvers',
      included: 'Motorized louvers, perimeter LED preparation, controls and wiring review',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: 'Max Pergola Pro motorized louver package with warm lighting'
    },
    MX: {
      name: 'Max',
      roof: 'Motorized louvers with louver-mounted LED preparation',
      included: 'Motorized louvers, louver-mounted LED preparation, accessory compatibility review',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: 'Max Pergola Max premium motorized package with louver lighting preparation'
    },
    CU: {
      name: 'Custom',
      roof: 'Manual or motorized louvers — selected during review',
      included: 'Custom dimensions, project shop drawings, configuration-specific packing',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: 'Custom-sized Max Pergola with optional glass wall system'
    }
  };

  const sizeData = {
    1010: {
      imperial: "10' × 10'",
      metric: '3.05 × 3.05 m',
      millimeters: '3048 × 3048 mm',
      area: '100 sq ft • 9.3 m²',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: "Max 10 foot by 10 foot aluminum pergola kit"
    },
    1013: {
      imperial: "10' × 13'",
      metric: '3.05 × 3.96 m',
      millimeters: '3048 × 3962 mm',
      area: '130 sq ft • 12.1 m²',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: "Max 10 foot by 13 foot aluminum pergola kit"
    },
    1016: {
      imperial: "10' × 16'",
      metric: '3.05 × 4.88 m',
      millimeters: '3048 × 4877 mm',
      area: '160 sq ft • 14.9 m²',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: "Max 10 foot by 16 foot aluminum pergola kit"
    },
    1019: {
      imperial: "10' × 19'",
      metric: '3.05 × 5.79 m',
      millimeters: '3048 × 5791 mm',
      area: '190 sq ft • 17.7 m²',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: "Max 10 foot by 19 foot aluminum pergola kit"
    },
    1313: {
      imperial: "13' × 13'",
      metric: '3.96 × 3.96 m',
      millimeters: '3962 × 3962 mm',
      area: '169 sq ft • 15.7 m²',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: "Max 13 foot by 13 foot aluminum pergola kit"
    },
    1316: {
      imperial: "13' × 16'",
      metric: '3.96 × 4.88 m',
      millimeters: '3962 × 4877 mm',
      area: '208 sq ft • 19.3 m²',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: "Max 13 foot by 16 foot aluminum pergola kit"
    },
    1319: {
      imperial: "13' × 19'",
      metric: '3.96 × 5.79 m',
      millimeters: '3962 × 5791 mm',
      area: '247 sq ft • 22.9 m²',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: "Max 13 foot by 19 foot aluminum pergola kit"
    }
  };

  const labels = {
    layout: { FS: 'Freestanding', WM: 'Attached — wall connection review' },
    finish: { GR: 'Graphite', WH: 'Matte white — availability review', CX: 'Custom finish — color-match review' },
    accessories: {
      LED: 'Additional LED lighting',
      SCR: 'Retractable screens',
      GLS: 'Glass wall system',
      SLT: 'Privacy slat wall',
      HTR: 'Radiant heater preparation',
      OUT: 'Outlet preparation'
    }
  };

  const getValue = (name) => configurator.querySelector(`[name="${name}"]:checked`)?.value;
  const setText = (selector, value) => {
    const element = configurator.querySelector(selector);
    if (element) element.textContent = value;
  };

  const updateConfigurator = () => {
    const packageCode = getValue('kit-package');
    const sizeCode = getValue('kit-size');
    const layoutCode = getValue('kit-layout');
    const finishCode = getValue('kit-finish');
    const selectedAccessories = [...configurator.querySelectorAll('[name="kit-accessory"]:checked')]
      .map((input) => input.value);
    const zip = configurator.querySelector('[data-config-zip]')?.value.trim() || '';
    const customWidth = Number(configurator.querySelector('[data-custom-width]')?.value || 0);
    const customDepth = Number(configurator.querySelector('[data-custom-depth]')?.value || 0);
    const customHeight = Number(configurator.querySelector('[data-custom-height]')?.value || 0);
    const isCustom = packageCode === 'CU';
    const packageDetails = packageData[packageCode];
    const customDimensionsReady = customWidth > 0 && customDepth > 0;
    const customMetricWidth = customWidth * 0.3048;
    const customMetricDepth = customDepth * 0.3048;
    const customArea = customWidth * customDepth;
    const customAreaMetric = customArea * 0.092903;
    const customImperial = customDimensionsReady ? `${customWidth}' × ${customDepth}'` : 'Enter custom width × depth';
    const customMetric = customDimensionsReady ? `${customMetricWidth.toFixed(2)} × ${customMetricDepth.toFixed(2)} m` : 'Metric dimensions appear after entry';
    const customMillimeters = customDimensionsReady ? `${Math.round(customWidth * 304.8)} × ${Math.round(customDepth * 304.8)} mm` : 'Confirmed on shop drawings';
    const customHeightText = customHeight > 0 ? `${customHeight}' target (${(customHeight * 0.3048).toFixed(2)} m)` : 'Not supplied';
    const size = isCustom ? {
      imperial: customImperial,
      metric: customMetric,
      millimeters: customMillimeters,
      area: customDimensionsReady ? `${customArea.toFixed(customArea % 1 ? 1 : 0)} sq ft • ${customAreaMetric.toFixed(1)} m²` : 'Calculated after dimensions are entered'
    } : sizeData[sizeCode];
    const sizeGrid = configurator.querySelector('.config-choice-grid-size');
    const customPanel = configurator.querySelector('[data-custom-dimensions]');
    if (sizeGrid) sizeGrid.hidden = isCustom;
    if (customPanel) customPanel.hidden = !isCustom;
    const accessorySuffix = selectedAccessories.length ? `+${selectedAccessories.join('+')}` : '';
    const sku = `MP-${packageCode}-${layoutCode}-${isCustom ? 'CUSTOM' : sizeCode}-${finishCode}${accessorySuffix}`;
    const accessoryText = selectedAccessories.length
      ? selectedAccessories.map((code) => labels.accessories[code]).join(', ')
      : 'None selected';

    setText('[data-config-name]', `${packageDetails.name} · ${size.imperial}`);
    setText('[data-config-sku]', sku);
    setText('[data-config-package]', packageDetails.name);
    setText('[data-config-size]', size.imperial);
    setText('[data-config-size-metric]', `${size.metric} • ${size.millimeters}${isCustom ? ` • Clear height: ${customHeightText}` : ''}`);
    setText('[data-config-area]', size.area);
    setText('[data-config-layout]', labels.layout[layoutCode]);
    setText('[data-config-roof]', packageDetails.roof);
    setText('[data-config-included]', packageDetails.included);
    setText('[data-config-finish]', labels.finish[finishCode]);
    setText('[data-config-accessories]', accessoryText);
    setText('[data-config-imperial]', size.imperial);
    setText('[data-config-metric]', size.metric);

    const image = configurator.querySelector('[data-config-image]');
    if (image && image.getAttribute('src') !== packageDetails.image) {
      image.setAttribute('src', packageDetails.image);
      image.setAttribute('alt', packageDetails.imageAlt);
    }

    const subject = `Max Pergola configuration ${sku}`;
    const body = [
      'Hello Max Pergola,',
      '',
      'Please provide a quote for this configuration:',
      `Configuration SKU: ${sku}`,
      `Package: ${packageDetails.name}`,
      `Nominal size: ${size.imperial} (${size.metric}; ${size.millimeters})`,
      ...(isCustom ? [`Target clear height: ${customHeightText}`] : []),
      `Covered area: ${size.area}`,
      `Layout: ${labels.layout[layoutCode]}`,
      `Roof: ${packageDetails.roof}`,
      `Package includes: ${packageDetails.included}`,
      `Finish request: ${labels.finish[finishCode]}`,
      `Optional accessories: ${accessoryText}`,
      'Current shipping route: Chongqing factory → U.S. destination (DDP through June 2027)',
      `U.S. delivery ZIP code: ${zip || 'Not supplied'}`,
      '',
      'Please confirm overall dimensions, option compatibility, applicable design criteria, ship-from location, DDP terms, and current price.'
    ].join('\n');
    const cta = configurator.querySelector('[data-config-cta]');
    if (cta) cta.href = `mailto:inquiry@maxpergola.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  configurator.querySelectorAll('input').forEach((input) => {
    input.addEventListener(input.matches('[data-config-zip], [data-custom-width], [data-custom-depth], [data-custom-height]') ? 'input' : 'change', updateConfigurator);
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
      const customPackage = configurator.querySelector('[name="kit-package"][value="CU"]');
      const standardPackage = configurator.querySelector('[name="kit-package"][value="ST"]');
      if (customPackage?.checked && standardPackage) standardPackage.checked = true;
      sizeInput.checked = true;
      updateConfigurator();
      document.querySelector('#configure')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => sizeInput.focus({ preventScroll: true }), 550);
    });
  });

  document.querySelectorAll('[data-select-package]').forEach((button) => {
    button.addEventListener('click', () => {
      const packageInput = configurator.querySelector(`[name="kit-package"][value="${button.dataset.selectPackage}"]`);
      if (!packageInput) return;
      packageInput.checked = true;
      updateConfigurator();
      document.querySelector('#configure')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => packageInput.focus({ preventScroll: true }), 550);
    });
  });

  const requestedPackage = new URLSearchParams(window.location.search).get('package')?.toUpperCase();
  if (requestedPackage && packageData[requestedPackage]) {
    const requestedInput = configurator.querySelector(`[name="kit-package"][value="${requestedPackage}"]`);
    if (requestedInput) requestedInput.checked = true;
  }

  updateConfigurator();
}

const partnerForm = document.querySelector('[data-partner-form]');

if (partnerForm) {
  const trackSelect = partnerForm.querySelector('[data-partner-track-select]');
  const status = partnerForm.querySelector('[data-partner-form-status]');
  const trackLabels = {
    dealer: 'Dealer / Fabricator',
    installer: 'Certified Installer',
    builder: 'Builder / Project Partner'
  };

  const selectTrack = (track) => {
    if (!trackSelect || !trackLabels[track]) return;
    trackSelect.value = track;
  };

  selectTrack(new URLSearchParams(window.location.search).get('track'));

  document.querySelectorAll('[data-partner-track]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      selectTrack(link.dataset.partnerTrack);
      document.querySelector('#apply')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => trackSelect?.focus({ preventScroll: true }), 550);
    });
  });

  partnerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!partnerForm.reportValidity()) return;

    const data = new FormData(partnerForm);
    const track = data.get('track');
    const subject = `Max Pergola partner application — ${trackLabels[track] || 'Trade account'}`;
    const body = [
      'Hello Max Pergola,',
      '',
      'Please review this partner application:',
      `Partner track: ${trackLabels[track] || track}`,
      `Name: ${data.get('name')}`,
      `Business: ${data.get('business')}`,
      `Work email: ${data.get('email')}`,
      `Phone: ${data.get('phone') || 'Not supplied'}`,
      `Service area or ZIP: ${data.get('region')}`,
      `Website or social profile: ${data.get('website') || 'Not supplied'}`,
      `Expected annual volume: ${data.get('volume')}`,
      '',
      'Customers and typical projects:',
      data.get('details'),
      '',
      'Please share qualification questions, the applicable pricing structure, commercial terms, and next steps.'
    ].join('\n');

    if (status) status.textContent = 'Your email app is opening with the completed application.';
    window.location.href = `mailto:inquiry@maxpergola.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
