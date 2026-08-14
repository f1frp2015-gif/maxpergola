import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const primaryPages = [
  'index.html',
  'pergola-kits/index.html',
  'configure/index.html',
  'pergola-kits/louvered/index.html',
  'pergola-kits/freestanding/index.html',
  'pergola-kits/attached/index.html',
  'pergola-kits/deck/index.html',
  'best-aluminum-pergola-kits/index.html',
  'pergola-calculator/index.html',
  'pergola-lighting-ideas/index.html',
  'pergola-installation/index.html',
  'pergola-cost/index.html',
  'diy-pergola/index.html',
  'backyard-pergola-ideas/index.html',
  'pergola-vs-gazebo/index.html',
  'partner-program/index.html',
  'about-max-pergola/index.html'
];

const allHtml = [];
function walk(directory) {
  for (const entry of readdirSync(directory)) {
    if (entry === '.git' || entry === 'node_modules') continue;
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith('.html')) allHtml.push(path);
  }
}
walk(root);

const errors = [];
const idsByFile = new Map();
const oversizedImages = new Set();
const maxImageBytes = 1_000_000;
const ahrefsAnalyticsTag = '<script src="https://analytics.ahrefs.com/analytics.js" data-key="uyE2fwY9SZcf986LJ72lAA" async></script>';

for (const file of allHtml) {
  const relative = file.slice(root.length + 1);
  const html = readFileSync(file, 'utf8');
  if (relative !== 'crm/index.html') {
    const head = html.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || '';
    const ahrefsTagCount = html.split(ahrefsAnalyticsTag).length - 1;
    if (ahrefsTagCount !== 1) errors.push(`${relative}: expected exactly one Ahrefs Analytics tag, found ${ahrefsTagCount}`);
    if (!head.includes(ahrefsAnalyticsTag)) errors.push(`${relative}: Ahrefs Analytics tag must be inside <head>`);
  }
  const competitorBrandTerms = [
    /\bpergolux\b/i,
    /\bsundream\b/i,
    /\bskydance\b/i,
    /\bsnapfit\b/i,
    /\bseries\s+4\b/i
  ];
  for (const term of competitorBrandTerms) {
    if (term.test(html)) errors.push(`${relative}: competitor brand fingerprint ${term} must not appear in public copy`);
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  idsByFile.set(file, new Set(ids));
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${relative}: duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);

  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  for (const image of images) {
    if (!/\salt="[^"]+"/.test(image)) errors.push(`${relative}: image missing a useful alt attribute`);
    const src = image.match(/\ssrc="([^"]+)"/)?.[1];
    if (src?.startsWith('/')) {
      const imagePath = join(root, src.split('#')[0]);
      if (!existsSync(imagePath)) errors.push(`${relative}: missing image ${src}`);
      else if (statSync(imagePath).size > maxImageBytes) oversizedImages.add(src);
    }
  }

  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(script[1]); }
    catch (error) { errors.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }
}

for (const image of oversizedImages) {
  errors.push(`${image}: referenced image exceeds ${maxImageBytes.toLocaleString('en-US')} bytes`);
}

for (const relative of primaryPages) {
  const file = join(root, relative);
  if (!existsSync(file)) {
    errors.push(`Missing primary page: ${relative}`);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const h1Count = (html.match(/<h1\b/g) || []).length;
  if (h1Count !== 1) errors.push(`${relative}: expected 1 H1, found ${h1Count}`);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]?.replace(/&(?:[a-z0-9#]+);/gi, '&') || '';
  if (title.length < 15 || title.length > 60) errors.push(`${relative}: title length is ${title.length}, expected 15–60 characters`);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  if (description.length < 100 || description.length > 170) errors.push(`${relative}: description length is ${description.length}, expected 100–170`);
  if (!/<link rel="canonical" href="https:\/\/maxpergola\.com\//.test(html)) errors.push(`${relative}: canonical URL missing`);
}

const longformPurchasePages = [
  'best-aluminum-pergola-kits/index.html',
  'pergola-kits/freestanding/index.html',
  'pergola-kits/attached/index.html',
  'pergola-kits/deck/index.html'
];
for (const relative of longformPurchasePages) {
  const html = readFileSync(join(root, relative), 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const wordCount = main
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (wordCount < 1200 || wordCount > 1800) {
    errors.push(`${relative}: expected 1200–1800 main-content words, found ${wordCount}`);
  }

  const internalLinks = [...main.matchAll(/\shref="(\/[^"#?]*(?:#[^"]*)?)"/g)]
    .map((match) => match[1].split('#')[0]);
  const uniqueInternalLinks = new Set(internalLinks);
  if (uniqueInternalLinks.size < 7) {
    errors.push(`${relative}: expected at least 7 unique main-content internal destinations, found ${uniqueInternalLinks.size}`);
  }
  for (const requiredPath of ['/pergola-kits/', '/pergola-cost/', '/pergola-installation/', '/request-quote/']) {
    if (!uniqueInternalLinks.has(requiredPath)) errors.push(`${relative}: purchasing journey link missing ${requiredPath}`);
  }
  if ((main.match(/class="decision-path-grid"/g) || []).length < 2) {
    errors.push(`${relative}: expected an opening and closing decision-path navigation`);
  }
  if (!html.includes('"@type":["WebPage","Article"]') || !html.includes('"@type":"FAQPage"')) {
    errors.push(`${relative}: Article or FAQPage structured data missing`);
  }
}

for (const file of allHtml) {
  const relative = file.slice(root.length + 1);
  const html = readFileSync(file, 'utf8');
  const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const [urlPath, fragment] = href.split('#');
    const cleanPath = urlPath.split('?')[0];
    let target;
    if (!cleanPath || cleanPath === '/') target = join(root, 'index.html');
    else if (cleanPath.endsWith('/')) target = join(root, cleanPath, 'index.html');
    else target = join(root, cleanPath);
    if (!existsSync(target)) {
      errors.push(`${relative}: broken internal link ${href}`);
      continue;
    }
    if (fragment && target.endsWith('.html')) {
      const targetIds = idsByFile.get(target) || new Set([...readFileSync(target, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]));
      if (!targetIds.has(fragment)) errors.push(`${relative}: missing fragment #${fragment} in ${target.slice(root.length + 1)}`);
    }
  }
}

for (const required of ['robots.txt', 'sitemap.xml', 'maxpergola-icon.svg', 'vercel.json', 'assets/styles.css', 'assets/site.js', 'assets/configurator.js', 'assets/configurator-3d.js', 'assets/images/timber-deck-floor-texture.webp', 'src/configurator-3d.js', 'scripts/build-configurator-3d.mjs']) {
  if (!existsSync(join(root, required))) errors.push(`Missing required file: ${required}`);
}

const configuratorHtml = readFileSync(join(root, 'configure/index.html'), 'utf8');
const configuratorScript = readFileSync(join(root, 'assets/configurator.js'), 'utf8');
const configurator3dSource = readFileSync(join(root, 'src/configurator-3d.js'), 'utf8');
for (const marker of ['data-pergola-3d', 'data-3d-reset', 'data-3d-orbit', 'name="louverAngle"', '/assets/configurator-3d.js']) {
  if (!configuratorHtml.includes(marker)) errors.push(`configure/index.html: real-time 3D marker missing (${marker})`);
}
for (const marker of ['maxpergola:configuration', 'louverAngle', 'root.maxPergolaState', 'updateWithoutJump', 'restoreInteractionScroll']) {
  if (!configuratorScript.includes(marker)) errors.push(`assets/configurator.js: 3D state bridge missing (${marker})`);
}
for (const marker of ['WebGLRenderer', 'MeshPhysicalMaterial', 'PMREMGenerator', 'OrbitControls', 'profileMillimeters', 'Maximum-size lawn installation area', 'installationPadFeet', 'boardWidthInches: 5.5', 'gapInches: 0.125', "direction: 'parallel to the 19-foot span'", '/assets/images/timber-deck-floor-texture.webp']) {
  if (!configurator3dSource.includes(marker)) errors.push(`src/configurator-3d.js: rendering capability missing (${marker})`);
}

const styles = readFileSync(join(root, 'assets/styles.css'), 'utf8');
if (!/\.builder-buybox\s*\{[^}]*position:\s*relative;[^}]*bottom:\s*auto;/s.test(styles)) {
  errors.push('assets/styles.css: configuration action bar must occupy layout space instead of covering options');
}
if (!/@media\s*\(min-width:\s*981px\)[\s\S]*?\.builder-form\s*\{[^}]*overflow-y:\s*auto;/s.test(styles)) {
  errors.push('assets/styles.css: desktop configuration options need an independent scroll region');
}
if (!/\.faq-list\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s.test(styles)) {
  errors.push('assets/styles.css: FAQ lists must use the shared two-column desktop grid');
}
if (!/@media\s*\(max-width:\s*760px\)[\s\S]*?\.faq-list\s*\{[^}]*grid-template-columns:\s*1fr;/s.test(styles)) {
  errors.push('assets/styles.css: FAQ lists must collapse to one column on small screens');
}
for (const file of allHtml) {
  const relative = file.slice(root.length + 1);
  const html = readFileSync(file, 'utf8');
  if (!html.includes('class="faq-list')) continue;
  const faqItems = [...html.matchAll(/<details\b[^>]*class="[^"]*faq-item[^"]*"[^>]*>/g)];
  if (!faqItems.length) errors.push(`${relative}: FAQ list has no collapsible questions`);
  if (faqItems.some((match) => /\bopen(?:\s|=|>)/.test(match[0]))) {
    errors.push(`${relative}: FAQ answers must be collapsed by default`);
  }
}

const packagingImage = 'assets/images/maxpergola-export-packaging.webp';
const legacyPackagingImages = [
  'assets/images/maxpergola-export-packaging.png',
  'assets/images/export-packaging.jpg'
];
if (!existsSync(join(root, packagingImage))) {
  errors.push(`Missing required packaging image: ${packagingImage}`);
} else {
  const packagingImageBytes = statSync(join(root, packagingImage)).size;
  if (packagingImageBytes > maxImageBytes) {
    errors.push(`${packagingImage}: optimized packaging image exceeds ${maxImageBytes.toLocaleString('en-US')} bytes`);
  }
}
for (const legacyPackagingImage of legacyPackagingImages) {
  if (existsSync(join(root, legacyPackagingImage))) errors.push(`Legacy packaging image must be removed: ${legacyPackagingImage}`);
}
const vercelConfig = JSON.parse(readFileSync(join(root, 'vercel.json'), 'utf8'));
const legacyPackagingRedirect = vercelConfig.redirects?.find(
  (redirect) => redirect.source === '/assets/images/maxpergola-export-packaging.png'
);
if (legacyPackagingRedirect?.destination !== '/assets/images/maxpergola-export-packaging.webp' || legacyPackagingRedirect?.permanent !== true) {
  errors.push('vercel.json: legacy packaging PNG must permanently redirect to the optimized WebP');
}
for (const relative of ['index.html', 'pergola-kits/index.html', 'pergola-installation/index.html', 'pergola-cost/index.html', 'diy-pergola/index.html', 'sitemap.xml']) {
  const content = readFileSync(join(root, relative), 'utf8');
  if (!content.includes(packagingImage)) errors.push(`${relative}: approved packaging image missing`);
  for (const legacyPackagingImage of legacyPackagingImages) {
    if (content.includes(legacyPackagingImage)) errors.push(`${relative}: legacy packaging image still referenced`);
  }
}

const kitsHtml = readFileSync(join(root, 'pergola-kits/index.html'), 'utf8');
if (!kitsHtml.includes('href="/pergola-calculator/"')) errors.push('pergola-kits/index.html: pergola calculator must be linked from the selection flow');
if (!kitsHtml.includes('config-calculator-cta')) errors.push('pergola-kits/index.html: calculator callout missing from the footprint step');
if (existsSync(join(root, 'engineering-calculator'))) errors.push('Legacy engineering-calculator directory must be removed');

const installationHtml = readFileSync(join(root, 'pergola-installation/index.html'), 'utf8');
const installationMain = installationHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] || '';
const installationWordCount = installationMain
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .trim()
  .split(/\s+/)
  .filter(Boolean).length;
if (!installationHtml.includes('<h1>How to Install a Pergola: <span>From Jobsite to Handoff</span></h1>')) {
  errors.push('pergola-installation/index.html: required How to Install a Pergola H1 missing');
}
if (installationWordCount < 1200) {
  errors.push(`pergola-installation/index.html: expected at least 1200 main-content words, found ${installationWordCount}`);
}
for (const packageCode of ['ST', 'PR', 'MX', 'CU']) {
  if (!kitsHtml.includes(`name="kit-package" value="${packageCode}"`)) errors.push(`pergola-kits/index.html: package ${packageCode} missing from configurator`);
}
const expectedSizeCodes = ['1010', '1013', '1016', '1019', '1313', '1316', '1319'];
const actualSizeCodes = [...kitsHtml.matchAll(/name="kit-size" value="(\d+)"/g)].map((match) => match[1]);
if (actualSizeCodes.join(',') !== expectedSizeCodes.join(',')) {
  errors.push(`pergola-kits/index.html: expected seven standard size codes (${expectedSizeCodes.join(', ')}), found ${actualSizeCodes.join(', ')}`);
}
for (const accessoryCode of ['LED', 'SCR', 'GLS', 'SLT', 'HTR', 'OUT']) {
  if (!kitsHtml.includes(`name="kit-accessory" value="${accessoryCode}"`)) errors.push(`pergola-kits/index.html: accessory ${accessoryCode} missing from configurator`);
}
for (const customField of ['data-custom-width', 'data-custom-depth', 'data-custom-height']) {
  if (!kitsHtml.includes(customField)) errors.push(`pergola-kits/index.html: ${customField} missing from Custom package inputs`);
}
if (!kitsHtml.includes('id="package-comparison"')) errors.push('pergola-kits/index.html: package comparison missing');

const siteScript = readFileSync(join(root, 'assets/site.js'), 'utf8');
if (!siteScript.includes("const packageData = {") || !siteScript.includes("'CUSTOM'") || !siteScript.includes('URLSearchParams')) {
  errors.push('assets/site.js: package selection, Custom SKU, or deep-link behavior missing');
}
for (const sizeCode of expectedSizeCodes) {
  if (!siteScript.includes(`    ${sizeCode}: {`)) errors.push(`assets/site.js: size data ${sizeCode} missing`);
}

if (errors.length) {
  console.error(`Site check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Site check passed: ${primaryPages.length} primary pages, ${allHtml.length} HTML files, internal links and structured data validated.`);
