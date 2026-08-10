import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = [
  'index.html',
  'pergola-kits/index.html',
  'pergola-kits/louvered/index.html',
  'pergola-kits/freestanding/index.html',
  'pergola-kits/attached/index.html',
  'pergola-kits/deck/index.html',
  'best-aluminum-pergola-kits/index.html',
  'pergola-kits/standard/index.html',
  'pergola-kits/pro/index.html',
  'pergola-kits/max/index.html',
  'engineering/specifications/index.html',
  'pergola-calculator/index.html',
  'pergola-lighting-ideas/index.html',
  'pergola-installation/index.html',
  'pergola-cost/index.html',
  'diy-pergola/index.html',
  'backyard-pergola-ideas/index.html',
  'pergola-vs-gazebo/index.html',
  'partner-program/index.html'
  ,'about-max-pergola/index.html'
];

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&times;/g, '×')
    .replace(/&(?:nbsp|#160);/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ');
}

function plainText(value) {
  return decode(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(value) {
  return plainText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const paragraphMap = new Map();
const reports = [];

for (const file of pages) {
  const html = readFileSync(resolve(root, file), 'utf8');
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const text = plainText(main);
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.split(/\s+/).length >= 3);
  const sentenceLengths = sentences.map((sentence) => sentence.split(/\s+/).filter(Boolean).length);
  const longSentences = sentenceLengths.filter((length) => length > 32).length;
  const internalLinks = [...main.matchAll(/\shref="(\/[^"#?]*(?:#[^"]*)?)"/g)]
    .map((match) => match[1].split('#')[0]);
  const paragraphs = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => plainText(match[1]))
    .filter((paragraph) => paragraph.split(/\s+/).length >= 12);

  for (const paragraph of paragraphs) {
    const key = normalize(paragraph);
    const entries = paragraphMap.get(key) || [];
    entries.push({file, paragraph});
    paragraphMap.set(key, entries);
  }

  const stockPhrasePatterns = [
    /\bin today'?s\b/gi,
    /\bwhether you(?:'re| are)\b/gi,
    /\belevate your\b/gi,
    /\bseamlessly\b/gi,
    /\blook no further\b/gi,
    /\bgame[- ]changer\b/gi,
    /\bnot only\b[^.!?]{0,80}\bbut also\b/gi,
    /\bdelve(?:s|d)?\b/gi,
    /\bunlock(?:s|ed|ing)?\b/gi,
    /\btransform your\b/gi
  ];
  const stockPhrases = stockPhrasePatterns.reduce((total, pattern) => total + (text.match(pattern) || []).length, 0);

  reports.push({
    file,
    words: words.length,
    paragraphs: paragraphs.length,
    sentences: sentences.length,
    averageSentenceWords: sentences.length ? Number((sentenceLengths.reduce((sum, length) => sum + length, 0) / sentences.length).toFixed(1)) : 0,
    longSentencePercent: sentences.length ? Math.round((longSentences / sentences.length) * 100) : 0,
    uniqueInternalLinks: new Set(internalLinks).size,
    stockPhrases,
    visiblePublisher: /class="content-meta"/.test(main)
  });
}

const duplicateParagraphs = [...paragraphMap.values()]
  .filter((entries) => new Set(entries.map((entry) => entry.file)).size > 1)
  .map((entries) => ({
    files: [...new Set(entries.map((entry) => entry.file))],
    words: entries[0].paragraph.split(/\s+/).length,
    excerpt: entries[0].paragraph.slice(0, 180)
  }))
  .sort((a, b) => b.words - a.words);

console.log(JSON.stringify({pages: reports, duplicateParagraphs}, null, 2));
