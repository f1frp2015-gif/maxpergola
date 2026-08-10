# Max Pergola

Static, multi-page marketing site for `maxpergola.com`.

## Local development

```bash
npm run dev
```

The site is served at `http://localhost:4173`.

## Validation

```bash
npm run check
```

The checker validates primary-page metadata, one H1 per page, local assets, JSON-LD, duplicate IDs, internal routes and fragment links. It also enforces canonical URLs, hreflang, robots directives, social metadata, schema entity graphs, sitemap coverage, AI context files, Atom discovery, IndexNow ownership and canonical redirects.

SEO/GEO maintenance and search-engine onboarding are documented in [`SEO-GEO-OPERATIONS.md`](./SEO-GEO-OPERATIONS.md).

## Page ownership

- `/` — Max Pergola brand + aluminum pergola category
- `/pergola-kits/` — `pergola kits`
- `/pergola-kits/louvered/` — `louvered pergola kits`, `pergola roof`, `pergola with roof`
- `/pergola-lighting-ideas/` — `pergola lighting ideas`, `LED pergola lights`
- `/pergola-installation/` — `pergola installation`, DIY versus professional scope
- `/pergola-cost/` — `pergola cost`, complete-project budgeting
- `/diy-pergola/` — `diy pergola`
- `/backyard-pergola-ideas/` — `backyard pergola ideas`
- `/pergola-vs-gazebo/` — `pergola vs gazebo`
- `/partner-program/` — trade pricing, partner qualification, support, and application

## Intent-led browsing path

The site moves visitors through one primary decision sequence while preserving direct access to every search-intent page:

1. **Discover** — backyard layouts and lighting ideas help visitors define the outdoor use.
2. **Compare** — the pergola-versus-gazebo and louvered-roof guides resolve structure and roof questions.
3. **Plan** — DIY, installation, and cost guides turn the preferred concept into site facts and a complete-project budget.
4. **Choose** — the pergola kit comparison and configurator create a package, footprint, layout, finish, accessory list, and delivery ZIP.
5. **Inquire** — the configurator opens a prefilled request containing the quote-ready SKU and project scope; the Vercel Function saves it to the private CRM database.

Global navigation groups pages by these user tasks. Contextual next-step cards connect every informational guide to the most relevant planning page and then to `/pergola-kits/#configure`; informational pages do not send visitors directly to an unqualified blank email.

## Content notes

- Product selection is organized into Standard, Pro, Max and Custom package paths. The seven standard sizes are 10 × 10 ft, 10 × 13 ft, 10 × 16 ft, 10 × 19 ft, 13 × 13 ft, 13 × 16 ft and 13 × 19 ft; Custom dimensions are planning inputs until approved drawings are issued.
- Accessories remain optional across all packages and are represented as quote-planning flags, not confirmed compatibility or price.
- Published 10 × 10 starting / compare-at prices are Standard $4,089 / $5,841, Pro $5,034 / $7,191, and Max $7,239 / $10,341. These are dated Max Pergola reference prices for base configurations; final quotes still require configuration and delivery ZIP.
- Lead intake uses `/api/inquiries`; the private `/crm/` workspace uses `CRM_ADMIN_TOKEN` and Neon Postgres. Pull `.env.local`, run `npm run db:migrate`, then use `npm run dev` for local Function testing.
- Images are supplied concept/configuration visuals and are labeled accordingly.
- The 45-minute message is scoped to typical structural frame assembly by an experienced crew. Site preparation, anchoring, roof components and accessories take additional time.
- Wind, snow, permit, foundation and delivery claims must be updated only from approved engineering and commercial documentation.
