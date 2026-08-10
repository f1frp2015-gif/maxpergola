import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const siteOrigin = 'https://maxpergola.com';
const brandIcon = '/maxpergola-icon.svg';
const pages = [
  {file: 'index.html', canonical: `${siteOrigin}/`, keyword: 'aluminum pergola', headingKeyword: 'aluminum pergola kits', keywordMinimum: 10, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'FAQPage']},
  {file: 'pergola-kits/index.html', canonical: `${siteOrigin}/pergola-kits/`, keyword: 'pergola kits', headingKeyword: 'pergola kits', keywordMinimum: 10, minWords: 1200, maxWords: 2050, types: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList', 'ItemList']},
  {file: 'pergola-kits/louvered/index.html', canonical: `${siteOrigin}/pergola-kits/louvered/`, keyword: 'louvered pergola', headingKeyword: 'louvered pergola', keywordMinimum: 12, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage']},
  {file: 'pergola-kits/freestanding/index.html', canonical: `${siteOrigin}/pergola-kits/freestanding/`, keyword: 'freestanding pergola', headingKeyword: 'freestanding pergola', keywordMinimum: 6, minWords: 1000, types: ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'FAQPage']},
  {file: 'pergola-kits/attached/index.html', canonical: `${siteOrigin}/pergola-kits/attached/`, keyword: 'attached pergola', headingKeyword: 'attached pergola', keywordMinimum: 6, minWords: 900, types: ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'FAQPage']},
  {file: 'pergola-kits/deck/index.html', canonical: `${siteOrigin}/pergola-kits/deck/`, keyword: 'pergola on deck', headingKeyword: 'pergola on deck', keywordMinimum: 5, minWords: 950, types: ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'FAQPage']},
  {file: 'best-aluminum-pergola-kits/index.html', canonical: `${siteOrigin}/best-aluminum-pergola-kits/`, keyword: 'best aluminum pergola kits', headingKeyword: 'best aluminum pergola kits', keywordMinimum: 5, minWords: 1000, types: ['Organization', 'WebSite', 'WebPage', 'Article', 'BreadcrumbList', 'FAQPage']},
  {file: 'pergola-kits/standard/index.html', canonical: `${siteOrigin}/pergola-kits/standard/`, keyword: 'manual louvered pergola', headingKeyword: 'manual louvered pergola', keywordMinimum: 4, minWords: 1200, types: ['Product', 'BreadcrumbList']},
  {file: 'pergola-kits/pro/index.html', canonical: `${siteOrigin}/pergola-kits/pro/`, keyword: 'motorized louvered pergola', headingKeyword: 'motorized pergola', keywordMinimum: 4, minWords: 1200, types: ['Product', 'BreadcrumbList']},
  {file: 'pergola-kits/max/index.html', canonical: `${siteOrigin}/pergola-kits/max/`, keyword: 'motorized louvered pergola', headingKeyword: 'motorized louvered pergola', keywordMinimum: 4, minWords: 1200, types: ['Product', 'BreadcrumbList']},
  {file: 'engineering/specifications/index.html', canonical: `${siteOrigin}/engineering/specifications/`, keyword: 'aluminum pergola', headingKeyword: 'aluminum pergola specifications', keywordMinimum: 4, minWords: 1200, types: ['TechArticle']},
  {file: 'pergola-calculator/index.html', canonical: `${siteOrigin}/pergola-calculator/`, keyword: 'pergola', headingKeyword: 'pergola calculator', keywordMinimum: 20, minWords: 1200, types: ['WebApplication', 'BreadcrumbList']},
  {file: 'pergola-lighting-ideas/index.html', canonical: `${siteOrigin}/pergola-lighting-ideas/`, keyword: 'pergola lighting', headingKeyword: 'pergola lighting ideas', keywordMinimum: 8, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article', 'FAQPage']},
  {file: 'pergola-installation/index.html', canonical: `${siteOrigin}/pergola-installation/`, keyword: 'how to install a pergola', headingKeyword: 'pergola installation', keywordMinimum: 3, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'HowTo', 'FAQPage']},
  {file: 'pergola-cost/index.html', canonical: `${siteOrigin}/pergola-cost/`, keyword: 'pergola cost', headingKeyword: 'pergola cost', keywordMinimum: 8, minWords: 1300, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article', 'FAQPage']},
  {file: 'diy-pergola/index.html', canonical: `${siteOrigin}/diy-pergola/`, keyword: 'diy pergola', headingKeyword: 'diy pergola', keywordMinimum: 5, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'HowTo']},
  {file: 'backyard-pergola-ideas/index.html', canonical: `${siteOrigin}/backyard-pergola-ideas/`, keyword: 'backyard pergola ideas', headingKeyword: 'backyard pergola ideas', keywordMinimum: 6, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article']},
  {file: 'pergola-vs-gazebo/index.html', canonical: `${siteOrigin}/pergola-vs-gazebo/`, keyword: 'pergola vs gazebo', headingKeyword: 'pergola vs gazebo', keywordMinimum: 8, minWords: 1200, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article']},
  {file: 'partner-program/index.html', canonical: `${siteOrigin}/partner-program/`, keyword: 'partner program', headingKeyword: 'pergola dealer', keywordMinimum: 6, minWords: 800, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'FAQPage']}
];
const noindexPages = [
  {file: 'warranty/index.html', canonical: `${siteOrigin}/warranty/`},
  {file: 'privacy-policy/index.html', canonical: `${siteOrigin}/privacy-policy/`},
  {file: 'terms-of-use/index.html', canonical: `${siteOrigin}/terms-of-use/`},
  {file: 'shipping-returns/index.html', canonical: `${siteOrigin}/shipping-returns/`}
];
const legalPaths = noindexPages
  .filter((page) => page.file !== 'warranty/index.html')
  .map((page) => new URL(page.canonical).pathname);

const errors = [];
const canonicalUrls = new Set();

function requireMatch(value, pattern, message) {
  if (!pattern.test(value)) errors.push(message);
}

function read(relative) {
  return readFileSync(resolve(root, relative), 'utf8');
}

function plainText(value) {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:[a-z0-9#]+);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectTypedNodes(value, type, found = []) {
  if (Array.isArray(value)) {
    for (const entry of value) collectTypedNodes(entry, type, found);
    return found;
  }
  if (!value || typeof value !== 'object') return found;

  const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
  if (types.includes(type)) found.push(value);
  for (const entry of Object.values(value)) collectTypedNodes(entry, type, found);
  return found;
}

for (const page of pages) {
  const html = read(page.file);
  const keywordPattern = new RegExp(page.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const keywordCount = (html.match(keywordPattern) || []).length;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
  const titleLength = title.replace(/&(?:[a-z0-9#]+);/gi, '&').length;
  const metaDescription = html.match(/<meta name="description" content="([^"]+)"/)?.[1] || '';
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const mainWordCount = plainText(main).split(/\s+/).filter(Boolean).length;
  const h1 = plainText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || '');
  const h2s = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi)].map((match) => plainText(match[1]));
  if (keywordCount < page.keywordMinimum) errors.push(`${page.file}: expected at least ${page.keywordMinimum} uses of focus phrase "${page.keyword}", found ${keywordCount}`);
  if (titleLength < 15 || titleLength > 60) errors.push(`${page.file}: title length is ${titleLength}, expected 15–60 characters`);
  if (!title.toLowerCase().includes(page.keyword)) errors.push(`${page.file}: protected keyword "${page.keyword}" missing from title`);
  if (!metaDescription.toLowerCase().includes(page.keyword)) errors.push(`${page.file}: protected keyword "${page.keyword}" missing from meta description`);
  if (!h1.toLowerCase().includes(page.keyword)) errors.push(`${page.file}: focus phrase "${page.keyword}" missing from H1`);
  if (!h2s.some((heading) => heading.toLowerCase().includes(page.headingKeyword))) errors.push(`${page.file}: no H2 contains heading phrase "${page.headingKeyword}"`);
  if (mainWordCount < page.minWords) errors.push(`${page.file}: expected at least ${page.minWords} main-content words, found ${mainWordCount}`);
  if (page.maxWords && mainWordCount > page.maxWords) errors.push(`${page.file}: expected no more than ${page.maxWords} main-content words, found ${mainWordCount}`);
  requireMatch(html, /<html lang="en-US" dir="ltr">/, `${page.file}: expected en-US language and ltr direction`);
  requireMatch(html, /<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">/, `${page.file}: complete robots directive missing`);
  requireMatch(html, /<meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">/, `${page.file}: Googlebot directive missing`);
  requireMatch(html, /<meta name="author" content="Max Pergola">/, `${page.file}: author metadata missing`);
  requireMatch(html, new RegExp(`<link rel="canonical" href="${page.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${page.file}: canonical does not match ${page.canonical}`);
  requireMatch(html, new RegExp(`<link rel="alternate" hreflang="en-US" href="${page.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${page.file}: en-US hreflang missing`);
  requireMatch(html, new RegExp(`<link rel="alternate" hreflang="x-default" href="${page.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${page.file}: x-default hreflang missing`);
  requireMatch(html, /<link rel="sitemap" type="application\/xml" href="https:\/\/maxpergola\.com\/sitemap\.xml">/, `${page.file}: sitemap discovery link missing`);
  requireMatch(html, /<link rel="alternate" type="application\/atom\+xml"[^>]+href="https:\/\/maxpergola\.com\/feed\.xml">/, `${page.file}: Atom discovery link missing`);
  requireMatch(html, /<link rel="manifest" href="\/site\.webmanifest">/, `${page.file}: web manifest link missing`);
  requireMatch(html, new RegExp(`<link rel="icon" href="${brandIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" type="image/svg\\+xml">`), `${page.file}: official brand icon missing`);

  for (const property of ['og:type', 'og:title', 'og:description', 'og:url', 'og:site_name', 'og:locale', 'og:image', 'og:image:width', 'og:image:height', 'og:image:alt']) {
    requireMatch(html, new RegExp(`<meta property="${property.replace(':', '\\:')}" content="[^"]+">`), `${page.file}: ${property} missing`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    requireMatch(html, new RegExp(`<meta name="${name.replace(':', '\\:')}" content="[^"]+">`), `${page.file}: ${name} missing`);
  }

  const ogUrl = html.match(/<meta property="og:url" content="([^"]+)">/)?.[1];
  if (ogUrl !== page.canonical) errors.push(`${page.file}: og:url must equal canonical`);
  if (canonicalUrls.has(page.canonical)) errors.push(`${page.file}: duplicate canonical ${page.canonical}`);
  canonicalUrls.add(page.canonical);

  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  const nodes = scripts.flatMap((data) => data['@graph'] || [data]);
  const types = new Set(nodes.flatMap((node) => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]).filter(Boolean));
  for (const type of page.types) {
    if (!types.has(type)) errors.push(`${page.file}: JSON-LD type ${type} missing`);
  }
  const ids = nodes.map((node) => node['@id']).filter(Boolean);
  if (ids.length !== new Set(ids).size) errors.push(`${page.file}: duplicate JSON-LD @id values`);

  const products = scripts.flatMap((data) => collectTypedNodes(data, 'Product'));
  for (const product of products) {
    const productLabel = product.name || product['@id'] || 'unnamed Product';
    if (!product.offers && !product.review && !product.aggregateRating) {
      errors.push(`${page.file}: ${productLabel} needs offers, review, or aggregateRating for a Product snippet`);
    }
    const offers = product.offers ? (Array.isArray(product.offers) ? product.offers : [product.offers]) : [];
    for (const offer of offers) {
      if (offer['@type'] !== 'Offer') continue;
      const price = offer.price ?? offer.priceSpecification?.price;
      const priceCurrency = offer.priceCurrency ?? offer.priceSpecification?.priceCurrency;
      if (price === undefined || price === null || price === '') errors.push(`${page.file}: ${productLabel} Offer price missing`);
      if (!priceCurrency) errors.push(`${page.file}: ${productLabel} Offer priceCurrency missing`);
      if (!offer.url) errors.push(`${page.file}: ${productLabel} Offer URL missing`);
      if (!offer.availability) errors.push(`${page.file}: ${productLabel} Offer availability missing`);
      if (!offer.itemCondition) errors.push(`${page.file}: ${productLabel} Offer itemCondition missing`);
    }
  }

  if (page.file === 'pergola-kits/index.html') {
    const catalog = nodes.find((node) => node['@id'] === `${siteOrigin}/pergola-kits/#catalog`);
    if (catalog?.numberOfItems !== 4) errors.push('pergola-kits/index.html: catalog must declare four package paths');
    const expectedItems = [
      {position: 1, name: 'Standard Manual Louvered Pergola', url: `${siteOrigin}/pergola-kits/standard/`},
      {position: 2, name: 'Pro Motorized Louvered Pergola', url: `${siteOrigin}/pergola-kits/pro/`},
      {position: 3, name: 'Max Premium Louvered Pergola', url: `${siteOrigin}/pergola-kits/max/`},
      {position: 4, name: 'Custom Pergola Configuration', url: `${siteOrigin}/pergola-kits/#custom`}
    ];
    const catalogItems = catalog?.itemListElement || [];
    if (catalogItems.length !== expectedItems.length) errors.push('pergola-kits/index.html: catalog must contain four ListItem entries');
    for (const expected of expectedItems) {
      const item = catalogItems.find((entry) => entry.position === expected.position);
      if (item?.['@type'] !== 'ListItem' || item.name !== expected.name || item.url !== expected.url) {
        errors.push(`pergola-kits/index.html: catalog item ${expected.position} is incomplete`);
      }
      if (item?.item?.['@type'] === 'Product') errors.push(`pergola-kits/index.html: catalog item ${expected.position} must not embed Product markup`);
    }
  }
}

for (const page of noindexPages) {
  const html = read(page.file);
  requireMatch(html, /<html lang="en-US" dir="ltr">/, `${page.file}: expected en-US language and ltr direction`);
  requireMatch(html, /<meta name="robots" content="noindex, follow">/, `${page.file}: noindex, follow robots directive missing`);
  requireMatch(html, /<meta name="googlebot" content="noindex, follow">/, `${page.file}: noindex, follow Googlebot directive missing`);
  requireMatch(html, new RegExp(`<link rel="canonical" href="${page.canonical.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`), `${page.file}: canonical does not match ${page.canonical}`);
  requireMatch(html, new RegExp(`<link rel="icon" href="${brandIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" type="image/svg\\+xml">`), `${page.file}: official brand icon missing`);
}

const contactFiles = [...pages.map((page) => page.file), ...noindexPages.map((page) => page.file)];
for (const file of contactFiles) {
  const html = read(file);
  requireMatch(html, /<div class="utility-contact"><span>Sales Director: Doris Li<\/span>\s*<a href="tel:\+8613883338993">\+86 138 8333 8993<\/a><\/div>/, `${file}: sales contact must appear in the top-right utility bar`);
  requireMatch(html, /<div class="footer-bottom"><span>©[\s\S]*?All rights reserved\.<\/span><nav class="footer-legal" aria-label="Legal">/, `${file}: legal navigation must replace the footer-bottom note`);
  if (html.includes('contact-policy-bar')) errors.push(`${file}: oversized contact-policy bar must not be present`);
  const footerLegal = html.match(/<nav class="footer-legal" aria-label="Legal">([\s\S]*?)<\/nav>/)?.[1] || '';
  for (const path of legalPaths) {
    if (!footerLegal.includes(`href="${path}"`)) errors.push(`${file}: footer legal link ${path} missing`);
  }
}

const notFound = read('404.html');
requireMatch(notFound, /<html lang="en-US" dir="ltr">/, '404.html: expected en-US language and ltr direction');
requireMatch(notFound, /<meta name="robots" content="noindex, follow">/, '404.html: noindex, follow missing');
requireMatch(notFound, new RegExp(`<link rel="icon" href="${brandIcon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}" type="image/svg\\+xml">`), '404.html: official brand icon missing');
if (/rel="canonical"/.test(notFound)) errors.push('404.html: should not declare a canonical URL');

const sitemap = read('sitemap.xml');
requireMatch(sitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/, 'sitemap.xml: image namespace missing');
const sitemapUrls = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== pages.length) errors.push(`sitemap.xml: expected ${pages.length} canonical URLs, found ${sitemapUrls.length}`);
for (const page of pages) {
  if (!sitemapUrls.includes(page.canonical)) errors.push(`sitemap.xml: missing ${page.canonical}`);
}
for (const page of noindexPages) {
  if (sitemapUrls.includes(page.canonical)) errors.push(`sitemap.xml: noindex URL must be excluded: ${page.canonical}`);
}
for (const date of sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date[1])) errors.push(`sitemap.xml: invalid lastmod ${date[1]}`);
}
if ((sitemap.match(/<lastmod>/g) || []).length !== pages.length) errors.push('sitemap.xml: every URL needs one lastmod');
for (const image of sitemap.matchAll(/<image:loc>https:\/\/maxpergola\.com\/([^<]+)<\/image:loc>/g)) {
  if (!existsSync(resolve(root, image[1]))) errors.push(`sitemap.xml: missing image file ${image[1]}`);
}

const robots = read('robots.txt');
for (const bot of ['Googlebot', 'Google-Extended', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'ClaudeBot', 'Claude-SearchBot', 'PerplexityBot']) {
  requireMatch(robots, new RegExp(`User-agent: ${bot}\\nAllow: /`), `robots.txt: explicit allow missing for ${bot}`);
}
requireMatch(robots, /Sitemap: https:\/\/maxpergola\.com\/sitemap\.xml/, 'robots.txt: sitemap declaration missing');

const llms = read('llms.txt');
requireMatch(llms, /^# Max Pergola\n\n> /, 'llms.txt: required H1 and blockquote summary missing');
for (const page of pages) {
  if (!llms.includes(`](${page.canonical})`)) errors.push(`llms.txt: missing canonical link ${page.canonical}`);
}
requireMatch(llms, /https:\/\/maxpergola\.com\/llms-full\.txt/, 'llms.txt: full-context link missing');

const llmsFull = read('llms-full.txt');
requireMatch(llmsFull, /^# Max Pergola — Full Site Context\n\n> /, 'llms-full.txt: required H1 and blockquote summary missing');
for (const page of pages) {
  if (!llmsFull.includes(page.canonical)) errors.push(`llms-full.txt: missing canonical URL ${page.canonical}`);
}

const publicFiles = [...pages.map((page) => read(page.file)), ...noindexPages.map((page) => read(page.file)), llms, llmsFull, read('feed.xml')].join('\n');
if (/ori@f1composite\.com|doris\.li@f1composite\.com/i.test(publicFiles)) errors.push('Public SEO/GEO resources expose an internal forwarding address');

const feed = read('feed.xml');
requireMatch(feed, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom" xml:lang="en-US">/, 'feed.xml: valid Atom root missing');
for (const page of pages.slice(1)) {
  if (!feed.includes(`<id>${page.canonical}</id>`)) errors.push(`feed.xml: missing entry ${page.canonical}`);
}

const manifest = JSON.parse(read('site.webmanifest'));
if (manifest.name !== 'Max Pergola' || manifest.lang !== 'en-US' || manifest.start_url !== '/') errors.push('site.webmanifest: brand, language or start URL is invalid');
if (!manifest.icons?.some((icon) => icon.src === brandIcon)) errors.push('site.webmanifest: official brand icon missing');

const indexNowKey = read('7728d1e43c48ba5d3a9c7d6411fb24fc.txt').trim();
if (indexNowKey !== '7728d1e43c48ba5d3a9c7d6411fb24fc') errors.push('IndexNow key file content does not match its filename');

const vercel = JSON.parse(read('vercel.json'));
if (vercel.trailingSlash !== true) errors.push('vercel.json: trailingSlash must remain true');
const redirects = new Map((vercel.redirects || []).map((redirect) => [redirect.source, redirect]));
const headersBySource = new Map((vercel.headers || []).map((entry) => [entry.source, entry.headers || []]));
const wwwRedirect = (vercel.redirects || []).find((redirect) => redirect.has?.some((condition) => condition.type === 'host' && condition.value === 'www.maxpergola.com'));
if (!wwwRedirect || wwwRedirect.destination !== 'https://maxpergola.com/:path*' || wwwRedirect.permanent !== true) errors.push('vercel.json: permanent www-to-apex redirect missing');
const legacyCalculatorRedirect = redirects.get('/engineering-calculator/');
if (!legacyCalculatorRedirect || legacyCalculatorRedirect.destination !== '/pergola-calculator/' || legacyCalculatorRedirect.permanent !== true) {
  errors.push('vercel.json: legacy engineering calculator must permanently redirect to /pergola-calculator/');
}
for (const page of pages) {
  const source = page.file === 'index.html' ? '/index.html' : `/${page.file}`;
  const redirect = redirects.get(source);
  if (!redirect || redirect.destination !== new URL(page.canonical).pathname || redirect.permanent !== true) errors.push(`vercel.json: permanent canonical redirect missing for ${source}`);
}
for (const page of noindexPages) {
  const source = `/${page.file}`;
  const path = new URL(page.canonical).pathname;
  const redirect = redirects.get(source);
  if (!redirect || redirect.destination !== path || redirect.permanent !== true) errors.push(`vercel.json: permanent canonical redirect missing for ${source}`);
  const xRobotsTag = headersBySource.get(path)?.find((header) => header.key.toLowerCase() === 'x-robots-tag')?.value;
  if (xRobotsTag !== 'noindex, follow') errors.push(`vercel.json: ${path} must send X-Robots-Tag: noindex, follow`);
}

if (errors.length) {
  console.error(`SEO/GEO check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO/GEO check passed: ${pages.length} canonical pages, crawler policy, sitemap, entity graph, AI context, Atom feed and IndexNow infrastructure validated.`);
