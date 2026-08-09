import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const key = '7728d1e43c48ba5d3a9c7d6411fb24fc';
const keyLocation = `https://maxpergola.com/${key}.txt`;
const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<url>\s*<loc>(https:\/\/maxpergola\.com\/[^<]*)<\/loc>/g)].map((match) => match[1]);

if (!urlList.length) throw new Error('No canonical URLs found in sitemap.xml');

const payload = {
  host: 'maxpergola.com',
  key,
  keyLocation,
  urlList
};

if (process.env.INDEXNOW_DRY_RUN === '1') {
  console.log(JSON.stringify({ endpoint, ...payload }, null, 2));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {'content-type': 'application/json; charset=utf-8'},
  body: JSON.stringify(payload)
});

if (response.status !== 200 && response.status !== 202) {
  const details = await response.text();
  throw new Error(`IndexNow submission failed (${response.status}): ${details || response.statusText}`);
}

console.log(`IndexNow accepted ${urlList.length} canonical URLs with HTTP ${response.status}.`);
