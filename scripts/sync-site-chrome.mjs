import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const labels = new Map([
  ['/pergola-kits/', 'Pergola Kits'],
  ['/configure/', 'Build Your Kit'],
  ['/pergola-kits/louvered/', 'Louvered Pergola'],
  ['/pergola-kits/freestanding/', 'Freestanding Pergola'],
  ['/pergola-kits/attached/', 'Attached Pergola'],
  ['/pergola-kits/deck/', 'Deck-Mount Pergola'],
  ['/best-aluminum-pergola-kits/', 'Best Motorized Pergola Kits'],
  ['/pergola-kits/standard/', 'Standard Pergola'],
  ['/pergola-kits/pro/', 'Motorized Pergola Kit'],
  ['/pergola-kits/max/', 'Accessory-Ready Pergola'],
  ['/backyard-pergola-ideas/', 'Ideas & Guides'],
  ['/pergola-lighting-ideas/', 'Pergola Lighting Ideas'],
  ['/diy-pergola/', 'DIY Pergola Guide'],
  ['/pergola-installation/', 'Pergola Installation'],
  ['/pergola-vs-gazebo/', 'Pergola vs Gazebo'],
  ['/pergola-cost/', 'Motorized Pergola Cost'],
  ['/engineering/specifications/', 'Engineering Specifications'],
  ['/pergola-calculator/', 'Pergola Calculator'],
  ['/partner-program/', 'Partner Program'],
  ['/about-max-pergola/', 'About Max Pergola'],
  ['/request-quote/', 'Request a Quote'],
  ['/warranty/', 'Warranty'],
  ['/privacy-policy/', 'Privacy Policy'],
  ['/terms-of-use/', 'Terms of Use'],
  ['/shipping-returns/', 'Shipping & Returns']
]);

const shopRoutes = new Set([
  '/pergola-kits/',
  '/configure/',
  '/pergola-kits/louvered/',
  '/pergola-kits/freestanding/',
  '/pergola-kits/attached/',
  '/pergola-kits/deck/',
  '/best-aluminum-pergola-kits/',
  '/pergola-kits/standard/',
  '/pergola-kits/pro/',
  '/pergola-kits/max/',
  '/request-quote/'
]);

const guideRoutes = new Set([
  '/backyard-pergola-ideas/',
  '/pergola-lighting-ideas/',
  '/diy-pergola/',
  '/pergola-installation/',
  '/pergola-vs-gazebo/',
  '/pergola-cost/'
]);

const engineeringRoutes = new Set([
  '/engineering/specifications/',
  '/pergola-calculator/'
]);

function walk(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (entry.name === 'index.html') files.push(path);
  }
  return files;
}

function routeFromFile(file) {
  const path = relative(root, file).split(sep).join('/');
  return path === 'index.html' ? '/' : `/${path.replace(/index\.html$/, '')}`;
}

function currentAttribute(route, currentRoute) {
  return route === currentRoute ? ' aria-current="page"' : '';
}

function navLink(route, label, currentRoute, description = '') {
  const copy = description
    ? `<strong>${label}</strong><small>${description}</small>`
    : label;
  return `<a href="${route}"${currentAttribute(route, currentRoute)}>${copy}</a>`;
}

function groupAttribute(routes, currentRoute) {
  return routes.has(currentRoute) ? ' data-current="true"' : '';
}

function openAttribute(routes, currentRoute) {
  return routes.has(currentRoute) ? ' open' : '';
}

function header(currentRoute) {
  const headerClass = currentRoute === '/configure/' ? 'site-header builder-header' : 'site-header';
  return `  <header class="${headerClass}"><div class="utility-bar"><div class="container utility-inner"><div class="utility-proof"><span>Factory direct</span><span>Worldwide DDP delivery available</span></div><div class="utility-contact"><span>Sales Director: Doris Li</span> <a href="tel:+8613883338993">+86 138 8333 8993</a></div></div></div>
    <div class="container nav-shell">
      <a class="brand" href="/" aria-label="Max Pergola home"><img class="brand-logo" src="/assets/maxpergola-logo-primary.png" width="1280" height="300" alt="MAX PERGOLA"></a>
      <nav class="desktop-nav" aria-label="Primary navigation">
        <div class="nav-group"${groupAttribute(shopRoutes, currentRoute)}>
          <a class="nav-group-link" href="/pergola-kits/"${currentAttribute('/pergola-kits/', currentRoute)} aria-haspopup="true">Shop Pergola Kits <span aria-hidden="true">⌄</span></a>
          <div class="nav-popover nav-popover-shop">
            <div class="nav-popover-section"><span class="nav-popover-label">By installation</span>${navLink('/pergola-kits/', 'All Pergola Kits', currentRoute, 'Compare every roof package and standard footprint')}${navLink('/pergola-kits/louvered/', 'Louvered Pergola', currentRoute, 'Adjustable shade, airflow, and integrated drainage')}${navLink('/pergola-kits/freestanding/', 'Freestanding Pergola', currentRoute, 'Four-post layouts for open patios and gardens')}${navLink('/pergola-kits/attached/', 'Attached Pergola', currentRoute, 'Coordinate wall connections, flashing, and drainage')}${navLink('/pergola-kits/deck/', 'Deck-Mount Pergola', currentRoute, 'Plan framing, supports, waterproofing, and anchors')}</div>
            <div class="nav-popover-section"><span class="nav-popover-label">Packages & comparison</span>${navLink('/pergola-kits/standard/', 'Standard', currentRoute, 'Manual louver package')}${navLink('/pergola-kits/pro/', 'Pro', currentRoute, 'Motorized louver pergola kit')}${navLink('/pergola-kits/max/', 'Max', currentRoute, 'Lighting and accessory-ready coordination')}${navLink('/best-aluminum-pergola-kits/', 'Best Motorized Kits', currentRoute, 'Compare controls, documents, cost, and project scope')}</div>
          </div>
        </div>
        <div class="nav-group"${groupAttribute(guideRoutes, currentRoute)}>
          <a class="nav-group-link" href="/backyard-pergola-ideas/"${currentAttribute('/backyard-pergola-ideas/', currentRoute)} aria-haspopup="true">Ideas &amp; Guides <span aria-hidden="true">⌄</span></a>
          <div class="nav-popover nav-popover-guides">${navLink('/backyard-pergola-ideas/', 'Backyard Ideas', currentRoute, 'Start with furniture, circulation, and outdoor use')}${navLink('/pergola-lighting-ideas/', 'Lighting Ideas', currentRoute, 'Plan scenes, controls, and wire routes')}${navLink('/diy-pergola/', 'DIY Guide', currentRoute, 'Document the site, foundations, and delivery access')}${navLink('/pergola-installation/', 'Pergola Installation', currentRoute, 'See the jobsite-to-inspection scope')}${navLink('/pergola-vs-gazebo/', 'Pergola vs Gazebo', currentRoute, 'Compare roof behavior, maintenance, and use')}${navLink('/pergola-cost/', 'Motorized Cost Guide', currentRoute, 'Compare kit prices with installed project scope')}</div>
        </div>
        <div class="nav-group"${groupAttribute(engineeringRoutes, currentRoute)}>
          <a class="nav-group-link" href="/engineering/specifications/"${currentAttribute('/engineering/specifications/', currentRoute)} aria-haspopup="true">Engineering <span aria-hidden="true">⌄</span></a>
          <div class="nav-popover nav-popover-engineering">${navLink('/engineering/specifications/', 'Specifications & BOM', currentRoute, 'Review profiles, materials, and package scope')}${navLink('/pergola-calculator/', 'Pergola Calculator', currentRoute, 'Screen wind, snow, span, and site inputs')}</div>
        </div>
        ${navLink('/partner-program/', 'Partners', currentRoute)}
        ${navLink('/about-max-pergola/', 'About', currentRoute)}
      </nav>
      <div class="nav-actions"><a class="nav-cta" href="/configure/"${currentAttribute('/configure/', currentRoute)}>Build Your Kit <span aria-hidden="true">→</span></a><a class="menu-button" href="#mobile-menu" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-menu" data-menu-button><span></span></a></div>
    </div>
    <nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation" data-menu>
      <a class="mobile-menu-close" href="#" aria-label="Close navigation">Menu <span aria-hidden="true">×</span></a>
      <details class="mobile-nav-section"${openAttribute(shopRoutes, currentRoute)}><summary>Shop Pergola Kits</summary><div class="mobile-nav-links">${navLink('/pergola-kits/', 'All Pergola Kits', currentRoute)}${navLink('/pergola-kits/louvered/', 'Louvered Pergola', currentRoute)}${navLink('/pergola-kits/freestanding/', 'Freestanding Pergola', currentRoute)}${navLink('/pergola-kits/attached/', 'Attached Pergola', currentRoute)}${navLink('/pergola-kits/deck/', 'Deck-Mount Pergola', currentRoute)}${navLink('/best-aluminum-pergola-kits/', 'Best Motorized Kits', currentRoute)}${navLink('/pergola-kits/standard/', 'Standard', currentRoute)}${navLink('/pergola-kits/pro/', 'Pro', currentRoute)}${navLink('/pergola-kits/max/', 'Max', currentRoute)}</div></details>
      <details class="mobile-nav-section"${openAttribute(guideRoutes, currentRoute)}><summary>Ideas &amp; Guides</summary><div class="mobile-nav-links">${navLink('/backyard-pergola-ideas/', 'Backyard Ideas', currentRoute)}${navLink('/pergola-lighting-ideas/', 'Lighting Ideas', currentRoute)}${navLink('/diy-pergola/', 'DIY Guide', currentRoute)}${navLink('/pergola-installation/', 'Pergola Installation', currentRoute)}${navLink('/pergola-vs-gazebo/', 'Pergola vs Gazebo', currentRoute)}${navLink('/pergola-cost/', 'Motorized Cost Guide', currentRoute)}</div></details>
      <details class="mobile-nav-section"${openAttribute(engineeringRoutes, currentRoute)}><summary>Engineering</summary><div class="mobile-nav-links">${navLink('/engineering/specifications/', 'Specifications & BOM', currentRoute)}${navLink('/pergola-calculator/', 'Pergola Calculator', currentRoute)}</div></details>
      <div class="mobile-nav-direct">${navLink('/partner-program/', 'Partner Program', currentRoute)}${navLink('/about-max-pergola/', 'About Max Pergola', currentRoute)}</div>
      <a class="button button-primary mobile-nav-cta" href="/configure/"${currentAttribute('/configure/', currentRoute)}>Build Your Kit <span aria-hidden="true">→</span></a>
    </nav>
  </header>`;
}

function footerLink(route, label, currentRoute) {
  return `<a href="${route}"${currentAttribute(route, currentRoute)}>${label}</a>`;
}

function footer(currentRoute) {
  return `  <footer class="site-footer" itemscope itemtype="https://schema.org/Organization">
    <meta itemprop="name" content="Max Pergola">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a class="brand" href="/" itemprop="url" aria-label="Max Pergola home"><img class="brand-logo" itemprop="logo" src="/assets/maxpergola-logo-reversed.png" width="2560" height="599" alt="MAX PERGOLA"></a>
          <p itemprop="description">Max Pergola — aluminum pergola kits for DIY backyard shade, prepared factory-direct in Chongqing with worldwide DDP delivery available.</p>
          <div class="footer-contact">
            <span class="footer-contact-kicker">Sales &amp; project support</span>
            <address itemprop="address" itemscope itemtype="https://schema.org/PostalAddress"><span itemprop="addressLocality">Chongqing</span>, <span itemprop="addressCountry">China</span></address>
            <div class="footer-contact-point" itemprop="contactPoint" itemscope itemtype="https://schema.org/ContactPoint"><meta itemprop="contactType" content="sales and project support"><meta itemprop="availableLanguage" content="English"><a href="mailto:inquiry@maxpergola.com" itemprop="email">inquiry@maxpergola.com</a><a href="tel:+8613883338993" itemprop="telephone">+86 138 8333 8993</a><span itemprop="hoursAvailable" itemscope itemtype="https://schema.org/OpeningHoursSpecification"><meta itemprop="dayOfWeek" content="Monday Tuesday Wednesday Thursday Friday"><span>Mon–Fri · <time itemprop="opens" datetime="09:00">09:00</time>–<time itemprop="closes" datetime="18:00">18:00</time> China Standard Time (UTC+8)</span></span></div>
            <a class="footer-postal-link" href="/request-quote/">Request a DDP quote by country &amp; postal code →</a>
          </div>
        </div>
        <div class="footer-column"><h2>Shop</h2>${footerLink('/pergola-kits/', 'Pergola Kits', currentRoute)}${footerLink('/pergola-kits/louvered/', 'Louvered Pergola', currentRoute)}${footerLink('/pergola-kits/freestanding/', 'Freestanding Pergola', currentRoute)}${footerLink('/pergola-kits/attached/', 'Attached Pergola', currentRoute)}${footerLink('/best-aluminum-pergola-kits/', 'Best Motorized Kits', currentRoute)}</div>
        <div class="footer-column"><h2>Learn</h2>${footerLink('/backyard-pergola-ideas/', 'Backyard Ideas', currentRoute)}${footerLink('/diy-pergola/', 'DIY Guide', currentRoute)}${footerLink('/pergola-installation/', 'Installation', currentRoute)}${footerLink('/pergola-cost/', 'Motorized Cost', currentRoute)}${footerLink('/pergola-calculator/', 'Pergola Calculator', currentRoute)}${footerLink('/engineering/specifications/', 'Specifications', currentRoute)}</div>
        <div class="footer-column"><h2>Company</h2>${footerLink('/about-max-pergola/', 'About & Factory', currentRoute)}${footerLink('/partner-program/', 'Partner Program', currentRoute)}${footerLink('/request-quote/', 'Request a Quote', currentRoute)}${footerLink('/warranty/', 'Warranty', currentRoute)}</div>
      </div>
      <div class="footer-bottom"><span>© <span data-year>2026</span> Max Pergola. All rights reserved.</span><nav class="footer-legal" aria-label="Legal">${footerLink('/privacy-policy/', 'Privacy Policy', currentRoute)} ${footerLink('/terms-of-use/', 'Terms of Use', currentRoute)} ${footerLink('/shipping-returns/', 'Shipping & Returns', currentRoute)}</nav></div>
    </div>
  </footer>`;
}

function breadcrumbTrail(currentRoute) {
  if (currentRoute === '/') return [];
  const current = { name: labels.get(currentRoute) || 'Current Page' };

  if (shopRoutes.has(currentRoute) && currentRoute !== '/pergola-kits/') {
    return [{ name: 'Home', url: '/' }, { name: 'Pergola Kits', url: '/pergola-kits/' }, current];
  }
  if (guideRoutes.has(currentRoute) && currentRoute !== '/backyard-pergola-ideas/') {
    return [{ name: 'Home', url: '/' }, { name: 'Ideas & Guides', url: '/backyard-pergola-ideas/' }, current];
  }
  if (engineeringRoutes.has(currentRoute) && currentRoute !== '/engineering/specifications/') {
    return [{ name: 'Home', url: '/' }, { name: 'Engineering', url: '/engineering/specifications/' }, current];
  }
  if (['/warranty/', '/privacy-policy/', '/terms-of-use/', '/shipping-returns/'].includes(currentRoute)) {
    return [{ name: 'Home', url: '/' }, { name: 'Company', url: '/about-max-pergola/' }, current];
  }
  return [{ name: 'Home', url: '/' }, current];
}

function breadcrumbs(currentRoute) {
  const trail = breadcrumbTrail(currentRoute);
  if (!trail.length) return '';
  const items = trail.map((item, index) => {
    const position = index + 1;
    const name = item.url
      ? `<a itemprop="item" href="${item.url}"><span itemprop="name">${item.name}</span></a>`
      : `<span itemprop="name" aria-current="page">${item.name}</span>`;
    return `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">${name}<meta itemprop="position" content="${position}"></li>`;
  }).join('');
  const breadcrumbClass = currentRoute === '/configure/' ? 'breadcrumbs builder-breadcrumbs' : 'breadcrumbs';
  return `  <nav class="${breadcrumbClass}" aria-label="Breadcrumb"><ol class="container" itemscope itemtype="https://schema.org/BreadcrumbList">${items}</ol></nav>`;
}

let updated = 0;
for (const file of walk(root)) {
  let html = readFileSync(file, 'utf8');
  if (!/class="[^"]*\bsite-header\b/.test(html) || !/class="[^"]*\bsite-footer\b/.test(html)) continue;

  const route = routeFromFile(file);
  html = html
    .replace(/^[ \t]*<header class="[^"]*\bsite-header\b[^"]*">[\s\S]*?<\/header>/m, header(route))
    .replace(/^[ \t]*<footer class="[^"]*\bsite-footer\b[^"]*"[\s\S]*?<\/footer>/m, footer(route))
    .replace(/\/pergola-kits\/\?package=([A-Z]{2})#configure/g, '/configure/?package=$1')
    .replace(/\/pergola-kits\/#configure/g, '/configure/');

  const breadcrumb = breadcrumbs(route);
  if (/<nav class="[^"]*\bbreadcrumbs\b[^"]*"[\s\S]*?<\/nav>/.test(html)) {
    html = html.replace(/^[ \t]*<nav class="[^"]*\bbreadcrumbs\b[^"]*"[\s\S]*?<\/nav>/m, breadcrumb);
  } else if (breadcrumb) {
    html = html.replace(/<\/header>/, `</header>\n${breadcrumb}`);
  }

  const before = readFileSync(file, 'utf8');
  if (html !== before) {
    writeFileSync(file, html);
    updated += 1;
  }
}

console.log(`Synchronized hierarchical navigation, breadcrumbs, and trust footer across ${updated} page(s).`);
