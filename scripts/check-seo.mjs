import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const siteOrigin = 'https://maxpergola.com';
const pages = [
  {file: 'index.html', canonical: `${siteOrigin}/`, types: ['Organization', 'WebSite', 'WebPage', 'FAQPage']},
  {file: 'pergola-kits/index.html', canonical: `${siteOrigin}/pergola-kits/`, types: ['Organization', 'WebSite', 'CollectionPage', 'BreadcrumbList', 'ItemList']},
  {file: 'diy-pergola/index.html', canonical: `${siteOrigin}/diy-pergola/`, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'HowTo']},
  {file: 'backyard-pergola-ideas/index.html', canonical: `${siteOrigin}/backyard-pergola-ideas/`, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article']},
  {file: 'pergola-vs-gazebo/index.html', canonical: `${siteOrigin}/pergola-vs-gazebo/`, types: ['Organization', 'WebSite', 'WebPage', 'BreadcrumbList', 'Article']}
];

const errors = [];
const canonicalUrls = new Set();

function requireMatch(value, pattern, message) {
  if (!pattern.test(value)) errors.push(message);
}

function read(relative) {
  return readFileSync(resolve(root, relative), 'utf8');
}

for (const page of pages) {
  const html = read(page.file);
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
}

const notFound = read('404.html');
requireMatch(notFound, /<html lang="en-US" dir="ltr">/, '404.html: expected en-US language and ltr direction');
requireMatch(notFound, /<meta name="robots" content="noindex, follow">/, '404.html: noindex, follow missing');
if (/rel="canonical"/.test(notFound)) errors.push('404.html: should not declare a canonical URL');

const sitemap = read('sitemap.xml');
requireMatch(sitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/, 'sitemap.xml: image namespace missing');
const sitemapUrls = [...sitemap.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== pages.length) errors.push(`sitemap.xml: expected ${pages.length} canonical URLs, found ${sitemapUrls.length}`);
for (const page of pages) {
  if (!sitemapUrls.includes(page.canonical)) errors.push(`sitemap.xml: missing ${page.canonical}`);
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

const publicFiles = [...pages.map((page) => read(page.file)), llms, llmsFull, read('feed.xml')].join('\n');
if (/ori@f1composite\.com|doris\.li@f1composite\.com/i.test(publicFiles)) errors.push('Public SEO/GEO resources expose an internal forwarding address');

const feed = read('feed.xml');
requireMatch(feed, /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom" xml:lang="en-US">/, 'feed.xml: valid Atom root missing');
for (const page of pages.slice(1)) {
  if (!feed.includes(`<id>${page.canonical}</id>`)) errors.push(`feed.xml: missing entry ${page.canonical}`);
}

const manifest = JSON.parse(read('site.webmanifest'));
if (manifest.name !== 'Max Pergola' || manifest.lang !== 'en-US' || manifest.start_url !== '/') errors.push('site.webmanifest: brand, language or start URL is invalid');
if (!manifest.icons?.some((icon) => icon.src === '/favicon.svg')) errors.push('site.webmanifest: favicon icon missing');

const indexNowKey = read('7728d1e43c48ba5d3a9c7d6411fb24fc.txt').trim();
if (indexNowKey !== '7728d1e43c48ba5d3a9c7d6411fb24fc') errors.push('IndexNow key file content does not match its filename');

const vercel = JSON.parse(read('vercel.json'));
if (vercel.trailingSlash !== true) errors.push('vercel.json: trailingSlash must remain true');
const redirects = new Map((vercel.redirects || []).map((redirect) => [redirect.source, redirect]));
const wwwRedirect = (vercel.redirects || []).find((redirect) => redirect.has?.some((condition) => condition.type === 'host' && condition.value === 'www.maxpergola.com'));
if (!wwwRedirect || wwwRedirect.destination !== 'https://maxpergola.com/:path*' || wwwRedirect.permanent !== true) errors.push('vercel.json: permanent www-to-apex redirect missing');
for (const page of pages) {
  const source = page.file === 'index.html' ? '/index.html' : `/${page.file}`;
  const redirect = redirects.get(source);
  if (!redirect || redirect.destination !== new URL(page.canonical).pathname || redirect.permanent !== true) errors.push(`vercel.json: permanent canonical redirect missing for ${source}`);
}

if (errors.length) {
  console.error(`SEO/GEO check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`SEO/GEO check passed: ${pages.length} canonical pages, crawler policy, sitemap, entity graph, AI context, Atom feed and IndexNow infrastructure validated.`);
