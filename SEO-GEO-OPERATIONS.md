# Max Pergola SEO/GEO Operations

This repository is the source of truth for the crawl, indexation and machine-readable context served by `https://maxpergola.com/`.

## Infrastructure map

| Capability | Source |
| --- | --- |
| Canonical host and duplicate-path redirects | `vercel.json` |
| Page-level indexation, canonical, hreflang and social metadata | each public HTML `<head>` |
| Brand, website, page, product, guide and FAQ entity relationships | page-level JSON-LD |
| Search and AI crawler access | `robots.txt` |
| Canonical URL and image discovery | `sitemap.xml` |
| LLM-oriented site summary | `llms.txt` |
| Consolidated factual context and claim boundaries | `llms-full.txt` |
| Update discovery | `feed.xml` |
| IndexNow host ownership | `7728d1e43c48ba5d3a9c7d6411fb24fc.txt` |
| IndexNow payload and endpoint | `scripts/submit-indexnow.mjs` |
| Regression checks | `scripts/check-site.mjs`, `scripts/check-seo.mjs` |
| PR validation and post-production submission | `.github/workflows/site-quality.yml` |

Vercel Services and persistent storage are intentionally not used. The site and its discovery resources are static, so adding a backend or database would create operational risk without improving crawlability or entity understanding.

## Required checks for every change

Run:

```bash
npm run check
INDEXNOW_DRY_RUN=1 npm run seo:submit
```

For every new or materially updated indexable page:

1. Give the page one search intent, one canonical URL and one H1.
2. Add or update its description, robots directives, self-referencing `en-US` and `x-default` hreflang, Open Graph and Twitter fields.
3. Connect the page to the stable `Organization` and `WebSite` JSON-LD IDs and add only schema claims visible on the page.
4. Add the canonical URL and accurate `lastmod` to `sitemap.xml`.
5. Add the page to `llms.txt` when it is a primary resource, and update `llms-full.txt` when it changes a product, fulfillment or safety fact.
6. Add an Atom entry when the page is a product or planning resource whose update should be discoverable.
7. Never add invented prices, availability, reviews, ratings, engineering values, certifications, addresses, warranties or social profiles.

## Search-engine onboarding

- Google Search Console domain ownership is already present in public DNS through a `google-site-verification` TXT record. Submit `https://maxpergola.com/sitemap.xml` in the domain property and use URL Inspection after major releases.
- Bing Webmaster Tools can import the verified Google Search Console property. Submit the same sitemap there. IndexNow then handles routine URL-update notifications automatically after successful pushes to `main`.
- The GitHub workflow waits until the deployed IndexNow key is available on the canonical production host before posting the sitemap URLs. HTTP 200 or 202 is treated as accepted; it does not guarantee indexing.

## Canonical hostname

The preferred host is `maxpergola.com`. Vercel is configured to permanently redirect `www.maxpergola.com/:path*` to the matching apex URL, and the www hostname is attached to the `maxpergola` Vercel project.

The authoritative DNS provider is Cloudflare. If www does not resolve, add this Cloudflare DNS record and leave it DNS-only until Vercel issues the certificate:

```text
Type: A
Name: www
Value: 76.76.21.21
```

Then run `vercel domains verify www.maxpergola.com` and verify that `https://www.maxpergola.com/pergola-kits/` returns a permanent redirect to `https://maxpergola.com/pergola-kits/`.

## Entity and claim rules

The stable entity IDs are:

- `https://maxpergola.com/#organization`
- `https://maxpergola.com/#website`
- each page's canonical URL followed by `#webpage`

Use `inquiry@maxpergola.com` as the only public email. Internal mailbox-forwarding recipients must never appear in HTML, XML, JSON-LD, manifests, crawler files or repository documentation intended for public deployment.

Current fulfillment language must state that factory-direct DDP delivery from Chongqing can be quoted to supported destinations worldwide. Every public claim must remain destination- and route-specific: the written quote controls included duties and taxes, unloading, access, exclusions, and ship-from location. Regional inventory is a secondary option for confirmed standard stock and must never replace the worldwide factory-direct positioning or be presented as guaranteed availability.
