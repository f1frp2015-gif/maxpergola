import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const primaryPages = [
  'index.html',
  'pergola-kits/index.html',
  'pergola-kits/louvered/index.html',
  'pergola-lighting-ideas/index.html',
  'pergola-installation/index.html',
  'pergola-cost/index.html',
  'diy-pergola/index.html',
  'backyard-pergola-ideas/index.html',
  'pergola-vs-gazebo/index.html',
  'partner-program/index.html'
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

for (const file of allHtml) {
  const relative = file.slice(root.length + 1);
  const html = readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  idsByFile.set(file, new Set(ids));
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${relative}: duplicate IDs: ${[...new Set(duplicateIds)].join(', ')}`);

  const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  for (const image of images) {
    if (!/\salt="[^"]+"/.test(image)) errors.push(`${relative}: image missing a useful alt attribute`);
    const src = image.match(/\ssrc="([^"]+)"/)?.[1];
    if (src?.startsWith('/') && !existsSync(join(root, src.split('#')[0]))) errors.push(`${relative}: missing image ${src}`);
  }

  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(script[1]); }
    catch (error) { errors.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }
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
  if (!/<title>[^<]{15,65}<\/title>/.test(html)) errors.push(`${relative}: title missing or outside 15–65 characters`);
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  if (description.length < 100 || description.length > 170) errors.push(`${relative}: description length is ${description.length}, expected 100–170`);
  if (!/<link rel="canonical" href="https:\/\/maxpergola\.com\//.test(html)) errors.push(`${relative}: canonical URL missing`);
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

for (const required of ['robots.txt', 'sitemap.xml', 'maxpergola-icon.svg', 'vercel.json', 'assets/styles.css', 'assets/site.js']) {
  if (!existsSync(join(root, required))) errors.push(`Missing required file: ${required}`);
}

const packagingImage = 'assets/images/maxpergola-export-packaging.png';
const legacyPackagingImage = 'assets/images/export-packaging.jpg';
if (!existsSync(join(root, packagingImage))) errors.push(`Missing required packaging image: ${packagingImage}`);
if (existsSync(join(root, legacyPackagingImage))) errors.push(`Legacy packaging image must be removed: ${legacyPackagingImage}`);
for (const relative of ['index.html', 'pergola-kits/index.html', 'pergola-installation/index.html', 'pergola-cost/index.html', 'diy-pergola/index.html', 'sitemap.xml']) {
  const content = readFileSync(join(root, relative), 'utf8');
  if (!content.includes(packagingImage)) errors.push(`${relative}: approved packaging image missing`);
  if (content.includes(legacyPackagingImage)) errors.push(`${relative}: legacy packaging image still referenced`);
}

const kitsHtml = readFileSync(join(root, 'pergola-kits/index.html'), 'utf8');
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
