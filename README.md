# Atlas CMS — a content management system prototype

Atlas CMS is a front-end prototype of a headless-style content management
system, built with React, TypeScript, and Tailwind CSS. It's meant to show
what the *foundations* of a real CMS look like: a schema layer that drives
the editor UI, a publishing workflow with real states, role-based access,
a media library, and the small UX details (command palette, autosave,
accessible forms) that make a CMS feel trustworthy to use every day.

There's no backend — all data lives in `localStorage` via a small mock data
layer, seeded with realistic sample content so the app feels alive on first
load.

## Why it's built this way

**Content types are schema, not hardcoded pages.** `Content Types` defines a
list of `ContentTypeDef` records, each with its own `FieldDef[]` (text, rich
text, number, boolean, date, media, select, reference). The content list and
editor pages read that schema at runtime — adding a field to "Blog Post" in
`/content-types` doesn't require touching a route or a form. This is the
same shape real headless CMSs (Contentful, Sanity, Strapi) use under the
hood.

**Publishing is a workflow, not a boolean.** Content moves through
`draft → in-review → scheduled → published → archived`, matching how
editorial teams actually work — someone drafts, someone reviews, something
gets scheduled, and only then does it go live.

**Roles are real constraints, not decoration.** Admin / Editor / Author /
Contributor gate what's visible in the sidebar (Users, Settings, and
Content Types are Admin-only) — a starting point for wiring up proper
permission checks against a real API.

## Features

- **Dashboard** — content stats, recently updated items, an activity feed,
  and a status breakdown at a glance.
- **Content collections** — per-content-type list views with search, status
  filtering, sortable columns, bulk publish/delete, and pagination.
- **Content editor** — inline title/slug editing with slug auto-generation,
  a lightweight rich-text body (bold/italic/underline/lists/links), a
  featured-image picker backed by the media library, tags, an SEO panel with
  a live search-result preview, and debounced autosave with a save-state
  indicator.
- **Content Types** — the schema editor: add/require/remove fields per
  content type and create new content types entirely.
- **Page Builder** — a drag-and-drop layout canvas for any content item.
  The palette has two sections:
  - **Content blocks** — single-purpose pieces: Hero, Text, Image, Two
    Columns, Quote, CTA, Spacer.
  - **Widgets** — pre-composed, purpose-built sections with their own
    repeatable data: a **Footer** widget (tagline, a list of nav links, a
    list of social links, copyright) and a **Product Gallery** widget (a
    list of products, each with its own image, name, price, and
    description). Widgets are built on a "repeater" field type — a field
    whose value is a reorderable list of items with their own sub-fields —
    so adding another widget like this later is a registry entry, not new
    UI code.

  Drag any block/widget from the palette onto the page, reorder by
  dragging, and edit its content (including adding/removing/reordering
  repeater items) in a field-driven inspector panel. Every drag interaction
  has a keyboard/click equivalent (click a palette item to append it, Move
  up/down buttons to reorder blocks and repeater items) so the builder
  doesn't require a mouse. Like Content Types, every block and widget type
  is defined once in a registry (`src/lib/blocks.ts`), and the
  palette/canvas/inspector all render from that shared schema.
- **Preview** — opens a chrome-free render of a content item in a new tab:
  hero image, title, meta, and either its page-builder layout or rich-text
  body, with a desktop/mobile width toggle and a banner when the item isn't
  published yet.
- **Media Library** — drag-and-drop or click-to-upload (real image files are
  read and previewed via `FileReader`; other kinds get a deterministic
  gradient placeholder), search/filter, and an asset detail panel with
  editable alt text.
- **Users & Roles** — role descriptions, inline role changes, invite flow,
  and access removal.
- **Settings** — general site info, publishing rules, and a danger-zone
  reset back to seed data.
- **Command palette** (`⌘K` / `Ctrl+K` / `/`) — jump to any page, create new
  content, or open any existing item without leaving the keyboard.
- **Light / dark / system theme**, persisted across visits.

## Built for accessibility

- Semantic landmarks (`header`, `nav`, `main`) and a "Skip to main content"
  link.
- Every interactive control has a visible `:focus-visible` ring; icon-only
  buttons carry `aria-label`.
- Modals and the command palette trap focus, restore it on close, and close
  on <kbd>Escape</kbd>.
- Menus follow the ARIA menu-button pattern (arrow-key navigation, roving
  focus). Tabs follow the ARIA tabs pattern.
- Form fields link labels, help text, and errors via `aria-describedby`;
  toasts and autosave status announce through `aria-live` regions.
- Tested against both light and dark color schemes for contrast.
- The Page Builder's drag-and-drop has a full non-drag path: palette items
  are focusable and activate on <kbd>Enter</kbd>/<kbd>Space</kbd>, and every
  block carries Move up/down, duplicate, and delete buttons that reach the
  same reorder logic as dragging.

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev) for dev/build tooling
- [Tailwind CSS](https://tailwindcss.com) for styling, with a small custom
  design system layered on top (see `src/components/ui`)
- [React Router](https://reactrouter.com) for client-side routing
- [lucide-react](https://lucide.dev) for icons
- No backend, no database — `src/context/DataContext.tsx` is the entire
  "API layer," backed by `localStorage`

## Project structure

```
src/
  components/
    ui/        Design-system primitives (Button, Modal, Table bits, Toast…)
    layout/    App shell: Sidebar, Topbar, CommandPalette
  context/     ThemeContext, ToastContext, DataContext, CommandPaletteContext
  features/    One folder per screen (dashboard, content, contentTypes, media, users, settings)
  lib/         Domain types, seed data, and utilities
```

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. To type-check and build for production:

```bash
npm run build
```

To reset the demo data at any time, go to **Settings → Advanced → Reset
demo data** (or clear the `atlas-cms-data-v1` key in `localStorage`).
