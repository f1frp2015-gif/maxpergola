import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const root = document.querySelector('[data-max-configurator]');
const viewport = root?.querySelector('[data-pergola-3d]');
const preview = root?.querySelector('[data-builder-preview]');

if (root && viewport && preview) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCompact = window.matchMedia('(max-width: 700px)').matches;
  const colorValues = {
    Graphite: 0x202220,
    White: 0xeee9df,
    Bronze: 0x6b5747,
    Sandstone: 0xb9a98d
  };
  const inch = 0.0254;
  const profile = {
    post: 0.15,
    postWall: 0.0022,
    beamHeight: 0.165,
    beamDepth: 0.04,
    beamWall: 0.0018,
    gutterWidth: 0.08375,
    gutterDepth: 0.065,
    louverChord: 0.175,
    louverHeight: 0.035,
    louverWall: 0.0012
  };
  const defaultConfiguration = {
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

  let renderer;
  let controls;
  let camera;
  let scene;
  let modelGroup;
  let stageGroup;
  let environmentTarget;
  let state;
  let modelSignature = '';
  let active = true;
  let autoRotate = !reducedMotion && !isCompact;
  let targetLouverAngle = 38;
  let lastTime = performance.now();
  let firstFramePainted = false;
  let renderFailed = false;
  let blankFrameCount = 0;
  let healthCheckCountdown = 0;
  let maximumDrawingBufferSize = 4096;
  let pergolaPixelProbePassed = false;
  let pergolaProbeTarget;
  let dimensions = { width: 4.2672, length: 3.048, height: 2.4384 };
  const louverMeshes = [];
  const fanGroups = [];

  const status = root.querySelector('[data-3d-status]');
  const resetButton = root.querySelector('[data-3d-reset]');
  const orbitButton = root.querySelector('[data-3d-orbit]');
  const liveLabel = root.querySelector('[data-3d-live-label]');

  const disposeGroup = (group) => {
    if (!group) return;
    group.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });
    group.removeFromParent();
  };

  const createMetal = (color, options = {}) => new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? 0.72,
    roughness: options.roughness ?? 0.28,
    envMapIntensity: options.envMapIntensity ?? 1.3,
    side: options.side ?? THREE.DoubleSide
  });

  const addBox = (group, size, position, material, options = {}) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    mesh.position.set(...position);
    if (options.rotation) mesh.rotation.set(...options.rotation);
    mesh.castShadow = options.castShadow ?? true;
    mesh.receiveShadow = options.receiveShadow ?? true;
    group.add(mesh);
    return mesh;
  };

  const createGrassTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#477238';
    context.fillRect(0, 0, 256, 256);
    let seed = 74291;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const colors = ['#315f2d', '#5f8743', '#78984e', '#244e28', '#8aa95b'];
    for (let index = 0; index < 5200; index += 1) {
      const x = random() * 256;
      const y = random() * 256;
      const bladeHeight = 1 + random() * 3.5;
      context.globalAlpha = 0.18 + random() * 0.42;
      context.strokeStyle = colors[Math.floor(random() * colors.length)];
      context.lineWidth = 0.45 + random() * 0.7;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random() - 0.5) * 1.8, y - bladeHeight);
      context.stroke();
    }
    context.globalAlpha = 1;
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(22, 22);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  };

  const createDeckTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    let seed = 29117;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const boardHeight = 64;
    const boardColors = ['#9a6840', '#a87549', '#8d5d39', '#b17d50', '#96633c', '#a46e43'];

    context.fillStyle = '#4b3526';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < canvas.height / boardHeight; row += 1) {
      const y = row * boardHeight + 3;
      const offset = row % 2 ? -128 : 0;
      for (let x = offset; x < canvas.width; x += 256) {
        const color = boardColors[Math.floor(random() * boardColors.length)];
        const gradient = context.createLinearGradient(x, y, x, y + boardHeight - 6);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color);
        gradient.addColorStop(1, '#765033');
        context.fillStyle = gradient;
        context.fillRect(x + 3, y, 250, boardHeight - 6);
        context.strokeStyle = 'rgba(62, 36, 20, .24)';
        context.lineWidth = 1;
        for (let grain = 0; grain < 13; grain += 1) {
          const grainY = y + 6 + random() * (boardHeight - 18);
          context.beginPath();
          context.moveTo(x + 9, grainY);
          context.bezierCurveTo(x + 72, grainY + (random() - 0.5) * 7, x + 172, grainY + (random() - 0.5) * 8, x + 245, grainY + (random() - 0.5) * 5);
          context.stroke();
        }
        context.fillStyle = 'rgba(39, 25, 17, .28)';
        context.beginPath();
        context.ellipse(x + 36 + random() * 170, y + 14 + random() * 34, 8 + random() * 13, 2 + random() * 3, 0, 0, Math.PI * 2);
        context.fill();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.25, 1.75);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    return texture;
  };

  const addLandscapeStage = () => {
    stageGroup = new THREE.Group();
    stageGroup.name = 'Maximum-size lawn installation area';
    scene.add(stageGroup);

    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x6f914a,
      map: createGrassTexture(),
      roughness: 0.98,
      metalness: 0
    });
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), grassMaterial);
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.y = -0.047;
    lawn.receiveShadow = true;
    stageGroup.add(lawn);

    const maximumPadWidth = 25 * 12 * inch;
    const maximumPadLength = 19 * 12 * inch;
    const padMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      map: createDeckTexture(),
      metalness: 0,
      roughness: 0.72,
      clearcoat: 0.12,
      clearcoatRoughness: 0.76,
      envMapIntensity: 0.62
    });
    const pad = new THREE.Mesh(new THREE.BoxGeometry(maximumPadWidth, 0.075, maximumPadLength), padMaterial);
    pad.name = 'Maximum-size timber deck';
    pad.position.y = -0.038;
    pad.receiveShadow = true;
    stageGroup.add(pad);
  };

  const addBasePlate = (group, x, z, frameMaterial) => {
    const plate = addBox(group, [0.23, 0.018, 0.23], [x, 0.009, z], frameMaterial);
    const boltMaterial = createMetal(0x91958f, { roughness: 0.34 });
    for (const [dx, dz] of [[-0.075, -0.075], [0.075, -0.075], [-0.075, 0.075], [0.075, 0.075]]) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.014, 10), boltMaterial);
      bolt.position.set(x + dx, 0.026, z + dz);
      bolt.castShadow = true;
      group.add(bolt);
    }
    return plate;
  };

  const addPost = (group, x, z, clearHeight, frameMaterial) => {
    addBox(group, [profile.post, clearHeight, profile.post], [x, clearHeight / 2, z], frameMaterial);
    addBasePlate(group, x, z, frameMaterial);
    const capMaterial = createMetal(0x111311, { roughness: 0.3 });
    addBox(group, [0.126, 0.014, 0.126], [x, clearHeight - 0.04, z], capMaterial);
  };

  const postPositions = (configuration, width, length) => {
    const outerX = width / 2 - profile.post / 2;
    const outerZ = length / 2 - profile.post / 2;
    const insetX = Math.max(profile.post, Math.min(width * 0.13, 0.52));
    const insetZ = Math.max(profile.post, Math.min(length * 0.13, 0.52));
    if (configuration.mounting === 'wallMount') {
      return [[-outerX, outerZ], [outerX, outerZ]];
    }
    if (configuration.postLayout === 'singleLong') {
      return [[-outerX, -outerZ + insetZ], [outerX, -outerZ + insetZ], [-outerX, outerZ], [outerX, outerZ]];
    }
    if (configuration.postLayout === 'singleShort') {
      return [[-outerX, -outerZ], [outerX - insetX, -outerZ], [-outerX, outerZ], [outerX - insetX, outerZ]];
    }
    if (configuration.postLayout === 'doubleShort') {
      return [[-outerX + insetX, -outerZ], [outerX - insetX, -outerZ], [-outerX + insetX, outerZ], [outerX - insetX, outerZ]];
    }
    return [[-outerX, -outerZ], [outerX, -outerZ], [-outerX, outerZ], [outerX, outerZ]];
  };

  const addWall = (group, width, clearHeight) => {
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd9d1c2, roughness: 0.92, metalness: 0 });
    const wall = addBox(
      group,
      [width + 1.5, clearHeight + 1.3, 0.12],
      [0, (clearHeight + 1.3) / 2 - 0.05, -dimensions.length / 2 - 0.105],
      wallMaterial,
      { castShadow: false }
    );
    wall.receiveShadow = true;
    const seamMaterial = new THREE.MeshStandardMaterial({ color: 0xbab2a5, roughness: 0.9 });
    for (let y = 0.36; y < clearHeight + 0.9; y += 0.34) {
      addBox(group, [width + 1.51, 0.008, 0.126], [0, y, -dimensions.length / 2 - 0.038], seamMaterial, { castShadow: false });
    }
  };

  const addRoof = (group, configuration, width, length, clearHeight, frameMaterial, louverMaterial) => {
    const beamY = clearHeight + profile.beamHeight / 2;
    addBox(group, [width, profile.beamHeight, profile.beamDepth], [0, beamY, -length / 2 + profile.beamDepth / 2], frameMaterial);
    addBox(group, [width, profile.beamHeight, profile.beamDepth], [0, beamY, length / 2 - profile.beamDepth / 2], frameMaterial);
    addBox(group, [profile.beamDepth, profile.beamHeight, length], [-width / 2 + profile.beamDepth / 2, beamY, 0], frameMaterial);
    addBox(group, [profile.beamDepth, profile.beamHeight, length], [width / 2 - profile.beamDepth / 2, beamY, 0], frameMaterial);

    const gutterMaterial = createMetal(colorValues[configuration.frameColor] ?? colorValues.Graphite, { roughness: 0.31 });
    const gutterY = clearHeight + profile.gutterDepth / 2;
    addBox(group, [width - profile.beamDepth * 2, profile.gutterDepth, profile.gutterWidth], [0, gutterY, -length / 2 + profile.beamDepth + profile.gutterWidth / 2], gutterMaterial);
    addBox(group, [width - profile.beamDepth * 2, profile.gutterDepth, profile.gutterWidth], [0, gutterY, length / 2 - profile.beamDepth - profile.gutterWidth / 2], gutterMaterial);

    if (configuration.trim === 'Architectural') {
      const trimMaterial = createMetal(colorValues[configuration.frameColor] ?? colorValues.Graphite, { roughness: 0.2 });
      const trimY = clearHeight + profile.beamHeight * 0.62;
      addBox(group, [width + 0.025, 0.026, 0.018], [0, trimY, length / 2 + 0.008], trimMaterial);
      addBox(group, [width + 0.025, 0.026, 0.018], [0, trimY, -length / 2 - 0.008], trimMaterial);
      addBox(group, [0.018, 0.026, length], [width / 2 + 0.008, trimY, 0], trimMaterial);
      addBox(group, [0.018, 0.026, length], [-width / 2 - 0.008, trimY, 0], trimMaterial);
    }

    const innerWidth = Math.max(profile.louverChord, width - profile.beamDepth * 2 - 0.11);
    const louverSpan = Math.max(0.5, length - profile.beamDepth * 2 - 0.18);
    const louverCount = Math.max(6, Math.floor(innerWidth / profile.louverChord));
    const spacing = innerWidth / louverCount;
    const louverY = clearHeight + profile.beamHeight * 0.7;
    const louverGeometry = new THREE.BoxGeometry(profile.louverChord * 0.94, profile.louverHeight, louverSpan);
    for (let index = 0; index < louverCount; index += 1) {
      const louver = new THREE.Mesh(louverGeometry, louverMaterial);
      louver.position.set(-innerWidth / 2 + spacing * (index + 0.5), louverY, 0);
      louver.castShadow = true;
      louver.receiveShadow = true;
      louver.rotation.z = THREE.MathUtils.degToRad(targetLouverAngle);
      group.add(louver);
      louverMeshes.push(louver);
    }
  };

  const addLed = (group, configuration, width, length, clearHeight) => {
    if (configuration.lighting === 'none') return;
    const emissiveMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe7a1,
      emissive: 0xffc85a,
      emissiveIntensity: 2.6,
      toneMapped: false
    });
    const y = clearHeight - 0.015;
    if (configuration.lighting === 'perimeter') {
      addBox(group, [width - 0.2, 0.012, 0.018], [0, y, length / 2 - 0.075], emissiveMaterial, { castShadow: false });
      addBox(group, [width - 0.2, 0.012, 0.018], [0, y, -length / 2 + 0.075], emissiveMaterial, { castShadow: false });
      addBox(group, [0.018, 0.012, length - 0.2], [width / 2 - 0.075, y, 0], emissiveMaterial, { castShadow: false });
      addBox(group, [0.018, 0.012, length - 0.2], [-width / 2 + 0.075, y, 0], emissiveMaterial, { castShadow: false });
    } else {
      for (let x = -width * 0.36; x <= width * 0.36; x += Math.max(0.52, width / 5)) {
        addBox(group, [0.012, 0.012, length - 0.24], [x, y + 0.08, 0], emissiveMaterial, { castShadow: false });
      }
    }
  };

  const addFan = (group, x, clearHeight, frameMaterial) => {
    const fan = new THREE.Group();
    fan.position.set(x, clearHeight - 0.34, 0);
    addBox(fan, [0.035, 0.34, 0.035], [0, 0.17, 0], frameMaterial);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.13, 24), frameMaterial);
    hub.position.y = -0.02;
    hub.castShadow = true;
    fan.add(hub);
    for (let index = 0; index < 3; index += 1) {
      const arm = new THREE.Group();
      arm.rotation.y = index * Math.PI * 2 / 3;
      addBox(arm, [0.62, 0.025, 0.12], [0.29, 0, 0], frameMaterial);
      fan.add(arm);
    }
    fanGroups.push(fan);
    group.add(fan);
  };

  const addComfort = (group, configuration, width, length, clearHeight, frameMaterial) => {
    if (configuration.fan === 'single') addFan(group, 0, clearHeight, frameMaterial);
    if (configuration.fan === 'double') {
      addFan(group, -width * 0.22, clearHeight, frameMaterial);
      addFan(group, width * 0.22, clearHeight, frameMaterial);
    }
    if (configuration.heater !== 'none') {
      const heaterMaterial = createMetal(0x272927, { roughness: 0.33 });
      const elementMaterial = new THREE.MeshStandardMaterial({
        color: 0x632515,
        emissive: 0xff5a20,
        emissiveIntensity: 1.2,
        toneMapped: false
      });
      const heaterPositions = configuration.heater === 'dual' ? [-width * 0.23, width * 0.23] : [0];
      for (const x of heaterPositions) {
        addBox(group, [Math.min(0.84, width * 0.26), 0.075, 0.115], [x, clearHeight - 0.18, -length / 2 + 0.14], heaterMaterial);
        addBox(group, [Math.min(0.7, width * 0.22), 0.012, 0.12], [x, clearHeight - 0.225, -length / 2 + 0.14], elementMaterial, { castShadow: false });
      }
    }
  };

  const addSidePanel = (group, type, index, width, length, clearHeight, frameMaterial) => {
    if (type === 'none') return;
    const isLong = index === 0 || index === 2;
    const span = (isLong ? width : length) - profile.post * 1.1;
    const height = Math.max(0.7, clearHeight - 0.2);
    const x = index === 1 ? width / 2 - 0.015 : index === 3 ? -width / 2 + 0.015 : 0;
    const z = index === 0 ? length / 2 - 0.015 : index === 2 ? -length / 2 + 0.015 : 0;
    const size = isLong ? [span, height, 0.026] : [0.026, height, span];
    const position = [x, height / 2 + 0.09, z];

    if (type === 'slatWall') {
      const slatMaterial = createMetal(0x755d47, { roughness: 0.42 });
      const slatCount = Math.max(8, Math.floor(span / 0.13));
      const step = span / slatCount;
      for (let index2 = 0; index2 < slatCount; index2 += 1) {
        const offset = -span / 2 + step * (index2 + 0.5);
        const slatSize = isLong ? [step * 0.62, height, 0.04] : [0.04, height, step * 0.62];
        const slatPosition = isLong ? [offset, position[1], z] : [x, position[1], offset];
        addBox(group, slatSize, slatPosition, slatMaterial);
      }
      return;
    }

    let panelMaterial;
    if (type === 'glassWall') {
      panelMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xd6f2f5,
        metalness: 0,
        roughness: 0.08,
        transmission: 0.62,
        thickness: 0.035,
        transparent: true,
        opacity: 0.48,
        envMapIntensity: 1.7,
        side: THREE.DoubleSide
      });
    } else if (type === 'motorizedShade') {
      panelMaterial = new THREE.MeshStandardMaterial({ color: 0xb9ad99, roughness: 0.88, transparent: true, opacity: 0.84, side: THREE.DoubleSide });
    } else {
      panelMaterial = new THREE.MeshStandardMaterial({ color: 0x343735, roughness: 0.74, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
    }
    addBox(group, size, position, panelMaterial, { castShadow: type !== 'glassWall' });
    if (type === 'motorizedShade') {
      const cassetteSize = isLong ? [span, 0.095, 0.11] : [0.11, 0.095, span];
      addBox(group, cassetteSize, [x, clearHeight - 0.055, z], frameMaterial);
      const hemSize = isLong ? [span, 0.045, 0.04] : [0.04, 0.045, span];
      addBox(group, hemSize, [x, 0.17, z], frameMaterial);
    }
  };

  const addSmartAccessories = (group, configuration, width, length, clearHeight, frameMaterial) => {
    const accentMaterial = new THREE.MeshPhysicalMaterial({ color: 0xe4e5dd, roughness: 0.28, metalness: 0.28, clearcoat: 0.5 });
    if (configuration.weatherSensor) {
      addBox(group, [0.1, 0.075, 0.16], [width / 2 - 0.11, clearHeight + 0.19, -length / 2 + 0.19], accentMaterial);
      const vane = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.1, 3), accentMaterial);
      vane.rotation.z = Math.PI / 2;
      vane.position.set(width / 2 - 0.11, clearHeight + 0.27, -length / 2 + 0.19);
      group.add(vane);
    }
    if (configuration.signalRepeater) {
      addBox(group, [0.075, 0.18, 0.055], [-width / 2 + 0.11, clearHeight - 0.28, length / 2 - 0.11], accentMaterial);
      addBox(group, [0.008, 0.18, 0.008], [-width / 2 + 0.11, clearHeight - 0.1, length / 2 - 0.11], frameMaterial);
    }
    if (configuration.outlet) {
      addBox(group, [0.09, 0.13, 0.03], [width / 2 - 0.075, 0.7, length / 2 - 0.162], accentMaterial);
    }
  };

  const buildModel = (configuration) => {
    const hadModel = Boolean(modelGroup);
    dimensions = {
      width: (Number(configuration.width) || defaultConfiguration.width) * inch,
      length: (Number(configuration.length) || defaultConfiguration.length) * inch,
      height: (Number(configuration.clearance) || defaultConfiguration.clearance) * inch
    };
    targetLouverAngle = Number(configuration.louverAngle ?? 38);
    louverMeshes.length = 0;
    fanGroups.length = 0;
    disposeGroup(modelGroup);
    modelGroup = new THREE.Group();
    modelGroup.name = 'Max Pergola parametric assembly';
    modelGroup.userData.isPergolaCore = true;
    scene.add(modelGroup);

    const frameMaterial = createMetal(colorValues[configuration.frameColor] ?? colorValues.Graphite);
    const louverMaterial = createMetal(colorValues[configuration.topColor] ?? colorValues.White, { metalness: 0.74, roughness: 0.2, envMapIntensity: 1.45 });
    for (const [x, z] of postPositions(configuration, dimensions.width, dimensions.length)) {
      addPost(modelGroup, x, z, dimensions.height, frameMaterial);
    }
    if (configuration.mounting === 'wallMount') addWall(modelGroup, dimensions.width, dimensions.height);
    addRoof(modelGroup, configuration, dimensions.width, dimensions.length, dimensions.height, frameMaterial, louverMaterial);
    addLed(modelGroup, configuration, dimensions.width, dimensions.length, dimensions.height);
    addComfort(modelGroup, configuration, dimensions.width, dimensions.length, dimensions.height, frameMaterial);
    const sideSelections = Array.isArray(configuration.sides) ? configuration.sides : defaultConfiguration.sides;
    sideSelections.forEach((side, index) => addSidePanel(modelGroup, side || 'none', index, dimensions.width, dimensions.length, dimensions.height, frameMaterial));
    addSmartAccessories(modelGroup, configuration, dimensions.width, dimensions.length, dimensions.height, frameMaterial);

    updateCameraBounds(!hadModel);
    updateDiagnostics(configuration);
  };

  const updateCameraBounds = (resetPosition = true) => {
    if (!camera || !controls) return;
    const maximumPadWidth = 25 * 12 * inch;
    const radius = Math.max(maximumPadWidth, dimensions.width, dimensions.length, dimensions.height) * 0.82;
    const target = new THREE.Vector3(0, dimensions.height * 0.35, 0);
    controls.target.copy(target);
    controls.minDistance = radius * 0.72;
    controls.maxDistance = radius * 3.2;
    if (resetPosition) {
      camera.position.set(radius * 1.16, dimensions.height * 0.72 + radius * 0.5, radius * 1.45);
      camera.lookAt(target);
    }
    camera.near = Math.max(0.05, radius / 80);
    camera.far = radius * 16;
    camera.updateProjectionMatrix();
    controls.update();
  };

  const updateLighting = () => {
    if (!scene || !renderer) return;
    scene.background = new THREE.Color(0xb8d6d3);
    scene.fog = new THREE.Fog(0xb8d6d3, 17, 36);
    scene.children.filter((child) => child.userData.globalLight).forEach((child) => child.removeFromParent());
    const hemisphere = new THREE.HemisphereLight(0xe7f2ff, 0x746c5c, 2.4);
    hemisphere.userData.globalLight = true;
    scene.add(hemisphere);
    const key = new THREE.DirectionalLight(0xfff5db, 4.8);
    key.position.set(dimensions.width * 0.8, dimensions.height * 2.5, dimensions.length * 1.2);
    key.castShadow = true;
    key.shadow.mapSize.set(isCompact ? 1024 : 2048, isCompact ? 1024 : 2048);
    key.shadow.camera.near = 0.1;
    key.shadow.camera.far = 30;
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 8;
    key.shadow.camera.bottom = -8;
    key.shadow.bias = -0.0004;
    key.userData.globalLight = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbcd7ff, 0.75);
    rim.position.set(-dimensions.width, dimensions.height * 1.4, -dimensions.length);
    rim.userData.globalLight = true;
    scene.add(rim);
    renderer.toneMappingExposure = 1.08;
  };

  const modelGeometryIsReady = () => {
    if (!modelGroup || modelGroup.parent !== scene) return false;
    let meshCount = 0;
    modelGroup.traverse((object) => {
      if (object.isMesh && object.visible && object.geometry?.attributes?.position?.count > 0) meshCount += 1;
    });
    if (meshCount < 12) return false;
    const bounds = new THREE.Box3().setFromObject(modelGroup);
    if (bounds.isEmpty()) return false;
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3()).project(camera);
    return size.x > 1 && size.y > 1 && size.z > 1
      && Number.isFinite(center.x) && Number.isFinite(center.y) && Number.isFinite(center.z)
      && Math.abs(center.x) < 1.4 && Math.abs(center.y) < 1.4 && center.z > -1 && center.z < 1;
  };

  const updateDiagnostics = (configuration) => {
    const webglReady = firstFramePainted && !renderFailed;
    viewport.dataset.renderer = webglReady ? 'WebGL2 · PBR' : 'Compatibility preview';
    if (status) status.textContent = `${configuration.width / 12}' × ${configuration.length / 12}' · ${Math.round(targetLouverAngle)}° roof`;
    window.__maxPergola3D = {
      ready: webglReady,
      renderer: webglReady ? 'WebGL2' : (renderFailed ? 'SVG fallback' : 'WebGL2 pending'),
      pbr: webglReady,
      profileMillimeters: { post: 150, beam: [165, 40], gutter: [83.75, 65], louver: [175, 35] },
      installationPadFeet: { width: 25, length: 19, fitsMaximumPergola: true },
      pergolaGeometryReady: modelGeometryIsReady(),
      pergolaPixelProbePassed,
      pergolaMeshCount: modelGroup ? modelGroup.children.filter((child) => child.isMesh || child.isGroup).length : 0,
      state: { ...configuration }
    };
  };

  const resize = () => {
    const width = Math.max(1, viewport.clientWidth);
    const height = Math.max(1, viewport.clientHeight);
    const preferredRatio = Math.min(window.devicePixelRatio || 1, isCompact ? 1.4 : 1.75);
    const safeBufferSize = maximumDrawingBufferSize * 0.9;
    const safeRatio = Math.max(0.5, Math.min(preferredRatio, safeBufferSize / width, safeBufferSize / height));
    if (Math.abs(renderer.getPixelRatio() - safeRatio) > 0.01) renderer.setPixelRatio(safeRatio);
    if (renderer.domElement.width !== Math.round(width * renderer.getPixelRatio()) || renderer.domElement.height !== Math.round(height * renderer.getPixelRatio())) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  };

  const markFramePainted = () => {
    if (firstFramePainted) return;
    firstFramePainted = true;
    blankFrameCount = 0;
    healthCheckCountdown = 180;
    preview.classList.remove('is-3d-fallback');
    preview.classList.add('is-3d-ready');
    viewport.removeAttribute('aria-busy');
    if (liveLabel) liveLabel.textContent = 'Live parametric 3D';
    const currentConfiguration = state || root.maxPergolaState;
    if (currentConfiguration) updateDiagnostics(currentConfiguration);
  };

  const frameHasPergolaPixels = () => {
    if (!modelGeometryIsReady()) return false;
    pergolaProbeTarget ||= new THREE.WebGLRenderTarget(48, 36, {
      depthBuffer: true,
      stencilBuffer: false
    });
    const previousTarget = renderer.getRenderTarget();
    const previousBackground = scene.background;
    const previousFog = scene.fog;
    const stageWasVisible = stageGroup.visible;
    const pixels = new Uint8Array(48 * 36 * 4);
    try {
      stageGroup.visible = false;
      scene.background = new THREE.Color(0x000000);
      scene.fog = null;
      renderer.setRenderTarget(pergolaProbeTarget);
      renderer.clear(true, true, true);
      renderer.render(scene, camera);
      renderer.readRenderTargetPixels(pergolaProbeTarget, 0, 0, 48, 36, pixels);
      let pergolaPixels = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index] + pixels[index + 1] + pixels[index + 2] > 24) pergolaPixels += 1;
      }
      return pergolaPixels >= 8;
    } catch {
      return false;
    } finally {
      stageGroup.visible = stageWasVisible;
      scene.background = previousBackground;
      scene.fog = previousFog;
      renderer.setRenderTarget(previousTarget);
    }
  };

  const renderFrame = (time) => {
    resize();
    const delta = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;
    const targetRotation = THREE.MathUtils.degToRad(targetLouverAngle);
    for (const louver of louverMeshes) louver.rotation.z = THREE.MathUtils.damp(louver.rotation.z, targetRotation, 8, delta);
    if (!reducedMotion) fanGroups.forEach((fan) => { fan.rotation.y -= delta * 2.3; });
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 0.42;
    controls.update(delta);
    renderer.render(scene, camera);
    if (renderer.getContext().isContextLost()) throw new Error('WebGL context was lost while rendering.');
    healthCheckCountdown -= 1;
    if (!firstFramePainted || healthCheckCountdown <= 0) {
      pergolaPixelProbePassed = frameHasPergolaPixels();
      if (pergolaPixelProbePassed) {
        blankFrameCount = 0;
        healthCheckCountdown = 180;
        markFramePainted();
      } else {
        blankFrameCount += 1;
        healthCheckCountdown = 0;
        if (blankFrameCount >= 3) fallback(modelGeometryIsReady() ? 'WebGL produced blank frames' : 'Pergola geometry did not initialize');
      }
    }
  };

  const fallback = (reason = 'WebGL unavailable') => {
    renderFailed = true;
    active = false;
    firstFramePainted = false;
    blankFrameCount = 0;
    healthCheckCountdown = 0;
    pergolaPixelProbePassed = false;
    preview.classList.remove('is-3d-ready');
    preview.classList.add('is-3d-fallback');
    viewport.setAttribute('hidden', '');
    viewport.removeAttribute('aria-busy');
    if (liveLabel) liveLabel.textContent = 'Configuration preview';
    window.__maxPergola3D = { ready: false, renderer: 'SVG fallback', reason };
  };

  const animate = (time) => {
    window.requestAnimationFrame(animate);
    if (!active || document.hidden || renderFailed) return;
    try {
      renderFrame(time);
    } catch (error) {
      console.warn('Max Pergola 3D preview stopped; using the architectural fallback.', error);
      fallback(error instanceof Error ? error.message : 'Render failed');
    }
  };

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default', failIfMajorPerformanceCaveat: false });
    maximumDrawingBufferSize = renderer.getContext().getParameter(renderer.getContext().MAX_RENDERBUFFER_SIZE) || maximumDrawingBufferSize;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional model of the configured Max Pergola. Drag to rotate and scroll or pinch to zoom.');
    renderer.domElement.addEventListener('webglcontextlost', (event) => {
      event.preventDefault();
      fallback('WebGL context lost');
    }, false);
    renderer.domElement.addEventListener('webglcontextrestored', () => {
      renderFailed = false;
      active = true;
      firstFramePainted = false;
      blankFrameCount = 0;
      healthCheckCountdown = 0;
      viewport.hidden = false;
      viewport.setAttribute('aria-busy', 'true');
      try {
        updateLighting();
        renderFrame(performance.now());
      } catch (error) {
        fallback(error instanceof Error ? error.message : 'WebGL restore failed');
      }
    }, false);
    viewport.append(renderer.domElement);

    scene = new THREE.Scene();
    addLandscapeStage();
    camera = new THREE.PerspectiveCamera(37, 1, 0.05, 100);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.minPolarAngle = THREE.MathUtils.degToRad(26);
    controls.maxPolarAngle = THREE.MathUtils.degToRad(82);
    controls.addEventListener('start', () => {
      autoRotate = false;
      orbitButton?.setAttribute('aria-pressed', 'false');
    });
    orbitButton?.setAttribute('aria-pressed', String(autoRotate));

    const pmrem = new THREE.PMREMGenerator(renderer);
    environmentTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = environmentTarget.texture;
    pmrem.dispose();
    state = {...defaultConfiguration, ...(root.maxPergolaState || {})};
    modelSignature = JSON.stringify({...state, louverAngle: undefined});
    buildModel(state);
    updateLighting();
    updateCameraBounds(true);

    root.addEventListener('maxpergola:configuration', (event) => {
      state = {...defaultConfiguration, ...event.detail};
      targetLouverAngle = Number(state.louverAngle ?? 38);
      const nextSignature = JSON.stringify({...state, louverAngle: undefined});
      if (nextSignature === modelSignature) {
        updateDiagnostics(state);
        return;
      }
      modelSignature = nextSignature;
      updateLighting();
      buildModel(state);
    });

    resetButton?.addEventListener('click', () => updateCameraBounds(true));
    orbitButton?.addEventListener('click', () => {
      autoRotate = !autoRotate;
      orbitButton.setAttribute('aria-pressed', String(autoRotate));
    });
    renderer.domElement.addEventListener('dblclick', () => updateCameraBounds(true));
    new ResizeObserver(resize).observe(viewport);
    new IntersectionObserver((entries) => { active = entries[0]?.isIntersecting ?? true; }, { threshold: 0.01 }).observe(preview);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !renderFailed) {
        active = true;
        window.requestAnimationFrame((time) => {
          try {
            renderFrame(time);
          } catch (error) {
            fallback(error instanceof Error ? error.message : 'Resume render failed');
          }
        });
      }
    });
    renderFrame(performance.now());
    window.requestAnimationFrame(animate);
  } catch (error) {
    console.warn('Max Pergola 3D preview could not start; using the architectural fallback.', error);
    environmentTarget?.dispose();
    renderer?.dispose();
    fallback(error instanceof Error ? error.message : 'WebGL initialization failed');
  }
}
