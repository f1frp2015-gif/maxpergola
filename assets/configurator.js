(() => {
  const root = document.querySelector('[data-max-configurator]');
  if (!root) return;

  const form = root.querySelector('.builder-form');
  const preview = root.querySelector('[data-builder-preview]');
  const concept = root.querySelector('[data-pergola-concept]');
  const rail = root.querySelector('.builder-rail');
  const quoteLink = root.querySelector('[data-builder-quote]');
  const copyButton = root.querySelector('[data-copy-config]');
  const resetButton = root.querySelector('[data-reset-config]');

  const defaults = {
    model: 'Pro',
    frameColor: 'Graphite',
    topColor: 'White',
    width: 168,
    length: 120,
    clearance: 96,
    louverAngle: 38,
    trim: 'Clean',
    mounting: 'freeStanding',
    postLayout: 'corners',
    controls: 'standard',
    smartHub: false,
    weatherSensor: false,
    signalRepeater: false,
    lighting: 'perimeter',
    fan: 'none',
    heater: 'none',
    outlet: false,
    sides: ['none', 'none', 'none', 'none']
  };

  const values = {
    model: ['Standard', 'Pro', 'Max'],
    frameColor: ['Graphite', 'White', 'Bronze'],
    topColor: ['Graphite', 'White', 'Bronze', 'Sandstone'],
    trim: ['Clean', 'Architectural'],
    mounting: ['freeStanding', 'wallMount'],
    postLayout: ['corners', 'singleLong', 'singleShort', 'doubleShort'],
    controls: ['standard', 'smart'],
    lighting: ['none', 'perimeter', 'louver'],
    fan: ['none', 'single', 'double'],
    heater: ['none', 'single', 'dual'],
    side: ['none', 'motorizedShade', 'privacyScreen', 'slatWall', 'glassWall']
  };

  const finishColors = {
    Graphite: {color: '#202220', shadow: '#090a09', highlight: '#454945', code: 'GR'},
    White: {color: '#eee9df', shadow: '#b8b2a8', highlight: '#fffdf8', code: 'WH'},
    Bronze: {color: '#6b5747', shadow: '#30251e', highlight: '#9d826b', code: 'BZ'},
    Sandstone: {color: '#b9a98d', shadow: '#746953', highlight: '#e1d5be', code: 'SD'}
  };

  const modelData = {
    Standard: {code: 'ST', start: '$4,089', roof: 'Manual adjustable louvers'},
    Pro: {code: 'PR', start: '$5,034', roof: 'Motorized louvers'},
    Max: {code: 'MX', start: '$7,239', roof: 'Motorized louvers with louver-light preparation'}
  };

  const labels = {
    mounting: {freeStanding: 'Freestanding', wallMount: 'Wall attached'},
    postLayout: {corners: 'Posts in corners', singleLong: 'Offset long side', singleShort: 'Offset short side', doubleShort: 'Double offset'},
    controls: {standard: 'Standard remote', smart: 'Smart-ready control'},
    lighting: {none: 'No lighting', perimeter: 'Perimeter LED', louver: 'Louver LED'},
    fan: {none: 'No fan', single: 'Single fan', double: 'Dual fans'},
    heater: {none: 'No heater', single: 'Single-zone heat prep', dual: 'Dual-zone heat prep'},
    sides: {none: 'Open', motorizedShade: 'Motorized shade', privacyScreen: 'Privacy screen', slatWall: 'Aluminum slat wall', glassWall: 'Glass wall'}
  };

  const selectedValue = (name) => form.elements.namedItem(name)?.value;
  const checked = (name) => Boolean(form.elements.namedItem(name)?.checked);
  const setRadio = (name, value) => {
    const input = [...form.querySelectorAll(`[name="${name}"]`)].find((item) => item.value === value);
    if (input) input.checked = true;
  };
  const setCheckbox = (name, value) => {
    const input = form.elements.namedItem(name);
    if (input) input.checked = value;
  };
  const setText = (selector, text) => {
    root.querySelectorAll(selector).forEach((element) => { element.textContent = text; });
  };
  const safeValue = (key, value, fallback) => values[key].includes(value) ? value : fallback;
  const safeRange = (value, min, max, step, fallback) => {
    if (value === null || value === '') return fallback;
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, Math.round((number - min) / step) * step + min));
  };
  const feet = (inches) => {
    const wholeFeet = Math.floor(inches / 12);
    const remainder = Math.round(inches % 12);
    return remainder ? `${wholeFeet}' ${remainder}"` : `${wholeFeet}'`;
  };
  const meters = (inches) => (inches * 0.0254).toFixed(2);

  const restoreFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    setRadio('model', safeValue('model', params.get('model'), defaults.model));
    setRadio('frameColor', safeValue('frameColor', params.get('frameColor'), defaults.frameColor));
    setRadio('topColor', safeValue('topColor', params.get('topColor'), defaults.topColor));
    setRadio('trim', safeValue('trim', params.get('trim'), defaults.trim));
    setRadio('mounting', safeValue('mounting', params.get('mounting'), defaults.mounting));
    setRadio('postLayout', safeValue('postLayout', params.get('postLayout'), defaults.postLayout));
    setRadio('controls', safeValue('controls', params.get('controls'), defaults.controls));
    setRadio('lighting', safeValue('lighting', params.get('lighting'), defaults.lighting));
    setRadio('fan', safeValue('fan', params.get('fan'), defaults.fan));
    setRadio('heater', safeValue('heater', params.get('heater'), defaults.heater));
    form.elements.namedItem('width').value = safeRange(params.get('width'), 96, 288, 12, defaults.width);
    form.elements.namedItem('length').value = safeRange(params.get('length'), 96, 216, 24, defaults.length);
    form.elements.namedItem('clearance').value = safeRange(params.get('clearance'), 84, 120, 12, defaults.clearance);
    form.elements.namedItem('louverAngle').value = safeRange(params.get('louverAngle'), 0, 110, 1, defaults.louverAngle);
    setCheckbox('smartHub', params.get('smartHub') === 'true');
    setCheckbox('weatherSensor', params.get('weatherSensor') === 'true');
    setCheckbox('signalRepeater', params.get('signalRepeater') === 'true');
    setCheckbox('outlet', params.get('outlet') === 'true');

    let sides = defaults.sides;
    try {
      const parsed = JSON.parse(params.get('sides') || '[]');
      if (Array.isArray(parsed) && parsed.length === 4) sides = parsed.map((value) => safeValue('side', value, 'none'));
    } catch {}
    sides.forEach((value, index) => { form.elements.namedItem(`side${index}`).value = value; });
  };

  const getState = () => ({
    model: selectedValue('model'),
    frameColor: selectedValue('frameColor'),
    topColor: selectedValue('topColor'),
    width: Number(form.elements.namedItem('width').value),
    length: Number(form.elements.namedItem('length').value),
    clearance: Number(form.elements.namedItem('clearance').value),
    louverAngle: Number(form.elements.namedItem('louverAngle').value),
    trim: selectedValue('trim'),
    mounting: selectedValue('mounting'),
    postLayout: selectedValue('postLayout'),
    controls: selectedValue('controls'),
    smartHub: checked('smartHub'),
    weatherSensor: checked('weatherSensor'),
    signalRepeater: checked('signalRepeater'),
    lighting: selectedValue('lighting'),
    fan: selectedValue('fan'),
    heater: selectedValue('heater'),
    outlet: checked('outlet'),
    sides: [0, 1, 2, 3].map((index) => form.elements.namedItem(`side${index}`).value)
  });

  const normalizeCompatibility = () => {
    const model = selectedValue('model');
    const mounting = selectedValue('mounting');
    const controlsSection = form.elements.namedItem('controls')?.[0]?.closest('.builder-section');
    const smartSection = form.elements.namedItem('smartHub')?.closest('.builder-section');
    const motorized = model !== 'Standard';

    form.querySelectorAll('[name="controls"]').forEach((input) => { input.disabled = !motorized; });
    form.querySelectorAll('[name="smartHub"], [name="weatherSensor"], [name="signalRepeater"]').forEach((input) => { input.disabled = !motorized; });
    controlsSection?.classList.toggle('is-disabled', !motorized);
    smartSection?.classList.toggle('is-disabled', !motorized);
    if (!motorized) {
      setRadio('controls', 'standard');
      setCheckbox('smartHub', false);
      setCheckbox('weatherSensor', false);
      setCheckbox('signalRepeater', false);
    }

    const weatherSensor = form.elements.namedItem('weatherSensor');
    if (weatherSensor?.checked && motorized) {
      setCheckbox('smartHub', true);
      setRadio('controls', 'smart');
    }
    if (form.elements.namedItem('smartHub')?.checked && motorized) setRadio('controls', 'smart');

    const postLayout = root.querySelector('[data-post-layout-field]');
    postLayout.hidden = mounting === 'wallMount';
    form.elements.namedItem('side2').disabled = mounting === 'wallMount';
    if (mounting === 'wallMount') {
      setRadio('postLayout', 'corners');
      form.elements.namedItem('side2').value = 'none';
    }
  };

  const configurationId = (state) => {
    const layoutCode = state.mounting === 'wallMount' ? 'WM' : 'FS';
    const optionCodes = [];
    if (state.smartHub) optionCodes.push('HUB');
    if (state.weatherSensor) optionCodes.push('WX');
    if (state.signalRepeater) optionCodes.push('RF');
    if (state.lighting === 'perimeter') optionCodes.push('LED');
    if (state.lighting === 'louver') optionCodes.push('LVR');
    if (state.fan !== 'none') optionCodes.push(state.fan === 'double' ? 'FAN2' : 'FAN');
    if (state.heater !== 'none') optionCodes.push(state.heater === 'dual' ? 'HTR2' : 'HTR');
    if (state.outlet) optionCodes.push('OUT');
    const sideCount = state.sides.filter((side) => side !== 'none').length;
    if (sideCount) optionCodes.push(`SIDE${sideCount}`);
    const core = `MP-${modelData[state.model].code}-${layoutCode}-W${state.width / 12}-L${state.length / 12}-H${state.clearance / 12}-${finishColors[state.frameColor].code}-${finishColors[state.topColor].code}`;
    return optionCodes.length ? `${core}+${optionCodes.join('+')}` : core;
  };

  const accessoryList = (state) => {
    const accessories = [];
    if (state.smartHub) accessories.push('Max Smart Hub');
    if (state.weatherSensor) accessories.push('Rain, wind and sun sensor');
    if (state.signalRepeater) accessories.push('Outdoor signal extender');
    if (state.lighting !== 'none') accessories.push(labels.lighting[state.lighting]);
    if (state.fan !== 'none') accessories.push(labels.fan[state.fan]);
    if (state.heater !== 'none') accessories.push(labels.heater[state.heater]);
    if (state.outlet) accessories.push('Weather-rated outlet preparation');
    state.sides.forEach((side, index) => {
      if (side !== 'none') accessories.push(`${['Front', 'Right', 'Rear', 'Left'][index]}: ${labels.sides[side]}`);
    });
    return accessories;
  };

  const updateRangeStyles = () => {
    form.querySelectorAll('input[type="range"]').forEach((input) => {
      const progress = (Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min)) * 100;
      input.style.setProperty('--range-progress', `${progress}%`);
    });
  };

  const updatePreview = (state) => {
    const frame = finishColors[state.frameColor];
    const top = finishColors[state.topColor];
    preview.style.setProperty('--frame-color', frame.color);
    preview.style.setProperty('--frame-shadow', frame.shadow);
    preview.style.setProperty('--frame-highlight', frame.highlight);
    preview.style.setProperty('--louver-color', top.color);
    preview.style.setProperty('--louver-shadow', top.shadow);
    preview.style.setProperty('--concept-scale-x', String(0.84 + ((state.width - 96) / 192) * 0.16));
    preview.style.setProperty('--concept-scale-y', String(0.9 + ((state.length - 96) / 120) * 0.1));
    concept.dataset.mounting = state.mounting;
    concept.dataset.postLayout = state.postLayout;
    concept.dataset.trim = state.trim;
    concept.dataset.lighting = state.lighting;
    concept.dataset.fan = state.fan;
    concept.dataset.heater = state.heater;
    state.sides.forEach((side, index) => {
      const panel = concept.querySelector(`[data-side-panel="${index}"]`);
      if (panel) panel.dataset.type = side;
    });

    setText('[data-preview-model]', state.model);
    setText('[data-preview-size]', `${feet(state.width)} × ${feet(state.length)}`);
    setText('[data-preview-mounting]', labels.mounting[state.mounting]);
    setText('[data-preview-width]', feet(state.width));
    setText('[data-preview-length]', feet(state.length));
    setText('[data-preview-height]', feet(state.clearance));
    const configuration = {...state};
    root.maxPergolaState = configuration;
    root.dispatchEvent(new CustomEvent('maxpergola:configuration', {detail: configuration}));
  };

  const updateUrl = (state) => {
    const params = new URLSearchParams(window.location.search);
    const serial = {
      model: state.model,
      frameColor: state.frameColor,
      topColor: state.topColor,
      width: state.width,
      length: state.length,
      clearance: state.clearance,
      louverAngle: state.louverAngle,
      trim: state.trim,
      mounting: state.mounting,
      postLayout: state.postLayout,
      controls: state.controls,
      smartHub: state.smartHub,
      weatherSensor: state.weatherSensor,
      signalRepeater: state.signalRepeater,
      lighting: state.lighting,
      fan: state.fan,
      heater: state.heater,
      outlet: state.outlet,
      sides: JSON.stringify(state.sides)
    };
    Object.entries(serial).forEach(([key, value]) => params.set(key, String(value)));
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
  };

  const updateQuoteLink = (state, id, accessories) => {
    const size = `${feet(state.width)} × ${feet(state.length)} × ${feet(state.clearance)} clear`;
    const finish = `${state.frameColor} frame / ${state.topColor} louvers / ${state.trim} beam`;
    const layout = state.mounting === 'wallMount' ? 'Wall attached — connection review required' : `${labels.mounting[state.mounting]} — ${labels.postLayout[state.postLayout]}`;
    const detailLines = [
      `Configurator reference: ${id}`,
      `Model: ${state.model} — ${modelData[state.model].roof}`,
      `Planning dimensions: ${size} (${meters(state.width)} × ${meters(state.length)} m footprint)`,
      `Previewed louver angle: ${state.louverAngle}°`,
      `Finish: ${finish}`,
      `Installation: ${layout}`,
      `Roof control: ${state.model === 'Standard' ? 'Manual operation' : labels.controls[state.controls]}`,
      `Selected accessories: ${accessories.length ? accessories.join('; ') : 'None'}`,
      '',
      'Please confirm configuration compatibility, current pricing, delivery scope, engineering requirements, and lead time.'
    ];
    const params = new URLSearchParams({
      source: 'advanced-configurator',
      package: modelData[state.model].code,
      sku: id,
      size,
      layout,
      finish,
      accessories: accessories.join(', '),
      message: detailLines.join('\n')
    });
    quoteLink.href = `/request-quote/?${params.toString()}`;
  };

  const update = () => {
    normalizeCompatibility();
    const state = getState();
    const id = configurationId(state);
    const accessories = accessoryList(state);
    const activeSides = state.sides.filter((side) => side !== 'none').length;
    const area = state.width / 12 * state.length / 12;
    const areaMetric = area * 0.092903;
    const smartCount = [state.smartHub, state.weatherSensor, state.signalRepeater].filter(Boolean).length;
    const comfort = [state.lighting !== 'none' ? labels.lighting[state.lighting] : '', state.fan !== 'none' ? labels.fan[state.fan] : '', state.heater !== 'none' ? labels.heater[state.heater] : ''].filter(Boolean);

    setText('[data-output="width"]', feet(state.width));
    setText('[data-output="length"]', feet(state.length));
    setText('[data-output="clearance"]', feet(state.clearance));
    setText('[data-output="louverAngle"]', `${state.louverAngle}°`);
    setText('[data-area]', `${area.toFixed(0)} sq ft / ${areaMetric.toFixed(1)} m²`);
    setText('[data-section-summary="model"]', state.model);
    setText('[data-section-summary="dimensions"]', `${feet(state.width)} × ${feet(state.length)}`);
    setText('[data-section-summary="finish"]', `${state.frameColor} / ${state.topColor}`);
    setText('[data-section-summary="mounting"]', labels.mounting[state.mounting]);
    setText('[data-section-summary="controls"]', `${state.model === 'Standard' ? 'Manual' : labels.controls[state.controls]} · ${state.louverAngle}°`);
    setText('[data-section-summary="smart"]', smartCount ? `${smartCount} selected` : (state.model === 'Standard' ? 'Motorized roof required' : 'Not selected'));
    setText('[data-section-summary="comfort"]', comfort.length ? comfort.join(' · ') : 'Not selected');
    setText('[data-section-summary="sides"]', activeSides ? `${activeSides} configured` : (state.mounting === 'wallMount' ? 'Rear at building' : 'All open'));
    setText('[data-config-id]', id);
    setText('[data-config-status]', `${state.model} 10 × 10 package starts at ${modelData[state.model].start} · this configuration requires a written quote.`);
    updateRangeStyles();
    updatePreview(state);
    updateUrl(state);
    updateQuoteLink(state, id, accessories);
  };

  let interactionScroll = null;
  const captureInteractionScroll = (event) => {
    if (!event.target.closest('label, summary, select, input')) return;
    interactionScroll = {
      pageY: window.scrollY,
      railTop: rail.scrollTop,
      expires: performance.now() + 650
    };
  };
  const restoreInteractionScroll = () => {
    if (!interactionScroll || performance.now() > interactionScroll.expires) return;
    const snapshot = interactionScroll;
    const apply = () => {
      rail.scrollTop = snapshot.railTop;
      if (window.scrollY !== snapshot.pageY) window.scrollTo(0, snapshot.pageY);
    };
    apply();
    window.requestAnimationFrame(() => {
      apply();
      window.requestAnimationFrame(apply);
    });
    window.setTimeout(apply, 80);
  };
  const updateWithoutJump = () => {
    update();
    restoreInteractionScroll();
  };

  form.addEventListener('pointerdown', captureInteractionScroll, true);
  form.addEventListener('click', (event) => {
    const label = event.target.closest('label');
    const control = label?.querySelector('input');
    if (!control || event.target === control || control.disabled || control.type === 'range') return;
    event.preventDefault();
    control.click();
    control.focus({preventScroll: true});
    restoreInteractionScroll();
  }, true);
  form.addEventListener('input', (event) => {
    if (event.target.matches('input[type="range"]')) updateWithoutJump();
  });
  form.addEventListener('change', (event) => {
    if (!event.target.matches('input[type="range"]')) updateWithoutJump();
  });
  form.querySelectorAll('.builder-section').forEach((section) => {
    section.addEventListener('toggle', restoreInteractionScroll);
  });
  window.addEventListener('pointerup', () => {
    window.setTimeout(() => { interactionScroll = null; }, 250);
  }, true);

  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyButton.textContent = 'Link copied';
    } catch {
      copyButton.textContent = 'Copy unavailable';
    }
    window.setTimeout(() => { copyButton.textContent = 'Copy share link'; }, 1800);
  });

  resetButton.addEventListener('click', () => {
    form.reset();
    update();
    rail.scrollTo({top: 0, behavior: 'smooth'});
  });

  restoreFromUrl();
  update();
})();
