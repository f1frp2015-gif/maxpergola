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

const getAttribution = () => {
  const params = new URLSearchParams(window.location.search);
  return ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']
    .reduce((result, key) => {
      if (params.get(key)) result[key] = params.get(key);
      return result;
    }, {});
};

const submitLead = async (payload) => {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({...payload, pageUrl: window.location.href, utm: getAttribution()})
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) throw new Error(result.error || 'Unable to submit your request.');
  return result;
};

const configurator = document.querySelector('[data-configurator]');

if (configurator) {
  const packageData = {
    ST: {
      name: 'Standard',
      roof: 'Manual louvers',
      included: 'Aluminum frame, manual louvers, integrated gutters and post drainage',
      startPrice: '$4,089',
      comparePrice: '$5,841',
      image: '/assets/images/poolside-glass-pergola.jpg',
      imageAlt: 'Max Pergola Standard manual louver package beside a pool'
    },
    PR: {
      name: 'Pro',
      roof: 'Motorized louvers',
      included: 'Motorized louvers, perimeter LED preparation, controls and wiring review',
      startPrice: '$5,034',
      comparePrice: '$7,191',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: 'Max Pergola Pro motorized louver package with warm lighting'
    },
    MX: {
      name: 'Max',
      roof: 'Motorized louvers with louver-mounted LED preparation',
      included: 'Motorized louvers, louver-mounted LED preparation, accessory compatibility review',
      startPrice: '$7,239',
      comparePrice: '$10,341',
      image: '/assets/images/led-lounge-pergola.jpg',
      imageAlt: 'Max Pergola Max premium motorized package with louver lighting preparation'
    },
    CU: {
      name: 'Custom',
      roof: 'Manual or motorized louvers — selected during review',
      included: 'Custom dimensions, project shop drawings, configuration-specific packing',
      startPrice: 'Written quote',
      comparePrice: '',
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
    setText('[data-config-price]', packageDetails.startPrice);
    setText('[data-config-compare-price]', packageDetails.comparePrice ? `Compare-at ${packageDetails.comparePrice}` : 'Project-specific pricing');
    setText('[data-config-imperial]', size.imperial);
    setText('[data-config-metric]', size.metric);

    const image = configurator.querySelector('[data-config-image]');
    if (image && image.getAttribute('src') !== packageDetails.image) {
      image.setAttribute('src', packageDetails.image);
      image.setAttribute('alt', packageDetails.imageAlt);
    }

    const quoteParams = new URLSearchParams({
      source: 'configurator', package: packageCode, sku, size: size.imperial,
      layout: labels.layout[layoutCode], finish: labels.finish[finishCode], zip,
      accessories: selectedAccessories.join(',')
    });
    const cta = configurator.querySelector('[data-config-cta]');
    if (cta) cta.href = `/request-quote/?${quoteParams.toString()}`;
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

  partnerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!partnerForm.reportValidity()) return;

    const data = new FormData(partnerForm);
    const track = data.get('track');
    const button = partnerForm.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Submitting your application…';
    try {
      const result = await submitLead({
        source: 'partner-program', contactName: data.get('name'), company: data.get('business'),
        email: data.get('email'), phone: data.get('phone'), zipCode: data.get('region'),
        projectType: trackLabels[track] || track, budget: data.get('volume'), consent: true,
        website: '', message: `Website: ${data.get('website') || 'Not supplied'}\n\n${data.get('details')}`
      });
      partnerForm.reset();
      if (status) status.textContent = `Application received. Reference ${result.reference}.`;
    } catch (error) {
      if (status) status.textContent = `${error.message} You can also email inquiry@maxpergola.com.`;
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const inquiryForm = document.querySelector('[data-inquiry-form]');
if (inquiryForm) {
  const params = new URLSearchParams(window.location.search);
  let engineeringInputs = {};
  try { engineeringInputs = JSON.parse(params.get('engineering') || '{}'); } catch {}
  const fieldMap = {package: 'packageCode', sku: 'sku', size: 'sizeLabel', layout: 'layout', finish: 'finish', zip: 'zipCode', message: 'message'};
  Object.entries(fieldMap).forEach(([param, name]) => {
    const field = inquiryForm.elements.namedItem(name);
    if (field && params.get(param)) field.value = params.get(param);
  });
  const accessoryField = inquiryForm.elements.namedItem('accessories');
  if (accessoryField && params.get('accessories')) accessoryField.value = params.get('accessories');
  const messageField = inquiryForm.elements.namedItem('message');
  if (messageField && Object.keys(engineeringInputs).length) {
    messageField.value = `Engineering screening inputs:\n${JSON.stringify(engineeringInputs, null, 2)}\n\nPlease review these values against the selected configuration.`;
    if (engineeringInputs.zip) inquiryForm.elements.namedItem('zipCode').value = engineeringInputs.zip;
  }
  const status = inquiryForm.querySelector('[data-form-status]');
  inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;
    const data = new FormData(inquiryForm);
    const button = inquiryForm.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    if (status) status.textContent = 'Saving your project…';
    try {
      const result = await submitLead({
        source: params.get('source') || inquiryForm.dataset.source || 'quote-form',
        contactName: data.get('contactName'), company: data.get('company'), email: data.get('email'),
        phone: data.get('phone'), zipCode: data.get('zipCode'), projectType: data.get('projectType'),
        packageCode: data.get('packageCode'), sku: data.get('sku'), sizeLabel: data.get('sizeLabel'),
        layout: data.get('layout'), finish: data.get('finish'),
        accessories: String(data.get('accessories') || '').split(',').map((item) => item.trim()).filter(Boolean),
        budget: data.get('budget'), timeline: data.get('timeline'), message: data.get('message'), engineeringInputs,
        consent: data.get('consent'), website: data.get('website')
      });
      inquiryForm.hidden = true;
      const success = document.querySelector('[data-inquiry-success]');
      if (success) {
        success.hidden = false;
        success.querySelector('[data-reference]').textContent = result.reference;
        success.focus();
      }
    } catch (error) {
      if (status) status.textContent = `${error.message} You can also email inquiry@maxpergola.com.`;
    } finally {
      if (button) button.disabled = false;
    }
  });
}

const loadCalculator = document.querySelector('[data-load-calculator]');
if (loadCalculator) {
  const number = (name) => Number(loadCalculator.elements.namedItem(name)?.value || 0);
  const result = document.querySelector('[data-load-result]');
  const calculate = () => {
    if (!loadCalculator.reportValidity()) return;
    const windSpeed = number('windSpeed');
    const groundSnow = number('groundSnow');
    const width = number('width');
    const depth = number('depth');
    const span = number('span');
    const zip = loadCalculator.elements.namedItem('zip').value;
    const exposure = loadCalculator.elements.namedItem('exposure').value;
    const kz = {B: 0.57, C: 0.85, D: 1.03}[exposure];
    const velocityPressure = 0.00256 * kz * 0.85 * windSpeed * windSpeed;
    const roofSnow = 0.7 * groundSnow;
    const area = width * depth;
    const upliftScreen = velocityPressure * 1.5;
    result.querySelector('[data-qz]').textContent = `${velocityPressure.toFixed(1)} psf`;
    result.querySelector('[data-uplift]').textContent = `${upliftScreen.toFixed(1)} psf`;
    result.querySelector('[data-roof-snow]').textContent = `${roofSnow.toFixed(1)} psf`;
    result.querySelector('[data-area]').textContent = `${area.toFixed(0)} sq ft`;
    result.querySelector('[data-span]').textContent = `${span.toFixed(1)} ft entered`;
    result.hidden = false;
    result.dataset.engineering = JSON.stringify({zip, windSpeed, groundSnow, width, depth, span, exposure, velocityPressure, upliftScreen, roofSnow});
  };
  loadCalculator.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
  document.querySelector('[data-send-engineering]')?.addEventListener('click', () => {
    if (result.hidden) calculate();
    const inputs = encodeURIComponent(result.dataset.engineering || '{}');
    window.location.href = `/request-quote/?source=pergola-calculator&engineering=${inputs}`;
  });
}

const crmApp = document.querySelector('[data-crm-app]');
if (crmApp) {
  const tokenInput = crmApp.querySelector('[data-crm-token]');
  const status = crmApp.querySelector('[data-crm-status]');
  const list = crmApp.querySelector('[data-crm-list]');
  const filter = crmApp.querySelector('[data-crm-filter]');
  const search = crmApp.querySelector('[data-crm-search]');
  tokenInput.value = sessionStorage.getItem('maxpergolaCrmToken') || '';

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const loadLeads = async () => {
    const token = tokenInput.value.trim();
    if (!token) { status.textContent = 'Enter the administrator token.'; return; }
    sessionStorage.setItem('maxpergolaCrmToken', token);
    status.textContent = 'Loading leads…';
    const params = new URLSearchParams();
    if (filter.value) params.set('status', filter.value);
    if (search.value.trim()) params.set('search', search.value.trim());
    const response = await fetch(`/api/crm/leads?${params}`, {headers: {Authorization: `Bearer ${token}`}});
    const data = await response.json();
    if (!response.ok) { status.textContent = data.error || 'Unable to load leads.'; return; }
    status.textContent = `${data.leads.length} lead${data.leads.length === 1 ? '' : 's'}`;
    list.innerHTML = data.leads.map((lead) => `
      <article class="crm-lead" data-lead-id="${lead.id}">
        <div class="crm-lead-head"><div><span>${escapeHtml(lead.source)}</span><h2>${escapeHtml(lead.contact_name)}</h2><p>${escapeHtml(lead.email)} · ${escapeHtml(lead.phone || 'No phone')} · ${escapeHtml(lead.zip_code)}</p></div><strong>${lead.lead_score}/100</strong></div>
        <div class="crm-lead-facts"><span>Package <b>${escapeHtml(lead.package_code || '—')}</b></span><span>Size <b>${escapeHtml(lead.size_label || '—')}</b></span><span>Timeline <b>${escapeHtml(lead.timeline || '—')}</b></span><span>Created <b>${new Date(lead.created_at).toLocaleString()}</b></span></div>
        <p>${escapeHtml(lead.message || 'No project note supplied.')}</p>
        <div class="crm-edit"><label>Status<select data-lead-status>${['new','qualified','quoted','won','lost','archived'].map((option) => `<option value="${option}"${option === lead.status ? ' selected' : ''}>${option}</option>`).join('')}</select></label><label>Owner<input data-lead-owner value="${escapeHtml(lead.owner)}"></label><label class="crm-notes">Notes<textarea data-lead-notes>${escapeHtml(lead.notes)}</textarea></label><button class="button button-secondary" type="button" data-save-lead>Save</button></div>
      </article>`).join('') || '<p class="empty-state">No leads match this view.</p>';
  };

  crmApp.querySelector('[data-crm-login]').addEventListener('click', loadLeads);
  filter.addEventListener('change', loadLeads);
  crmApp.querySelector('[data-crm-search-button]').addEventListener('click', loadLeads);
  list.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-save-lead]');
    if (!button) return;
    const card = button.closest('[data-lead-id]');
    button.disabled = true;
    const response = await fetch('/api/crm/leads', {method: 'PATCH', headers: {'Content-Type':'application/json', Authorization: `Bearer ${tokenInput.value.trim()}`}, body: JSON.stringify({id: card.dataset.leadId, status: card.querySelector('[data-lead-status]').value, owner: card.querySelector('[data-lead-owner]').value, notes: card.querySelector('[data-lead-notes]').value})});
    const data = await response.json();
    status.textContent = response.ok ? 'Lead updated.' : (data.error || 'Update failed.');
    button.disabled = false;
  });
}
