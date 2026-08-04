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

- **My Pages** — a personal view into the review pipeline for the Page
  content type: stat cards for pages you've created, how many need
  approval, how many are published, and how many are still drafts; a
  queue of pages from the rest of the team waiting on your review (if
  you're an Admin or Editor); and a "My pages" / "All pages" table with
  status badges, one-click **Submit for review** on your own drafts, and
  **Approve** on anything in review. The sidebar badge mirrors the pending
  count so reviewers see it without opening the page. Approvals log to the
  same activity feed the Dashboard reads from, so the two stay in sync.
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
    repeatable data, built on a "repeater" field type (a field whose value
    is a reorderable list of items with their own sub-fields), so adding a
    new widget is a registry entry, not new UI code:
    - **Footer** — tagline, a list of nav links, a list of social links, copyright.
    - **Product Gallery** — a list of products, each with an image, name, price, description.
    - **Testimonials** — a list of customer quotes with photo, name, and role.
    - **FAQ** — a list of question/answer pairs, rendered as native
      `<details>`/`<summary>` elements — expandable, keyboard-operable, and
      announced correctly by screen readers with no ARIA required.
    - **Blurb grid** — a list of icon + title + description tiles for
      highlighting a handful of features.
    - **Notification banner** — a site-wide announcement with a type
      (info/success/warning/error), message, optional link, and a
      dismissible toggle.
    - **Product Details** — one product in depth: image, price,
      description, a feature list, and a call-to-action button.

  Drag any block/widget from the palette onto the page, reorder by
  dragging, and edit its content (including adding/removing/reordering
  repeater items) in a field-driven inspector panel. Every drag interaction
  has a keyboard/click equivalent (click a palette item to append it, Move
  up/down buttons to reorder blocks and repeater items) so the builder
  doesn't require a mouse.

  **Page templates, for structural consistency.** A "Templates" button
  (also offered as the empty canvas's main call to action) opens a picker
  with named starting layouts — **Landing Page** (Hero → Blurb grid →
  Testimonials → FAQ → CTA → Footer) and **Product Page** (Product Details
  → Blurb grid → Testimonials → FAQ → Footer) — each shown as a visual
  chip sequence so the structure is obvious before you commit to it.
  Applying one on an empty page just adds the blocks; applying one over
  existing content asks for confirmation first, since it replaces the
  current layout. Templates are defined in `src/lib/pageTemplates.ts` as
  nothing more than an ordered list of block types — every block still
  starts with the same example content it would if added individually
  from the palette, so there's no separate copy to keep in sync.

  Like Content Types, every block and widget type
  is defined once in a registry (`src/lib/blocks.ts`), and the
  palette/canvas/inspector all render from that shared schema.

  **The Page Builder is the only way a Page gets created.** Clicking "New
  Page" anywhere in the app (the Pages list, My Pages, the command palette)
  creates the draft and drops straight into the builder — the classic
  rich-text editor is skipped entirely for Pages, so every page starts as
  a structured layout instead of loose prose (other content types, like
  Blog Posts, still create into the classic editor, since they're written,
  not assembled). The builder's own toolbar carries the workflow forward
  from there: a **Send for review** button while the page is a draft, which
  becomes **Approve & publish** for an Admin or Editor once it's in
  review — the same actions and status transitions as My Pages, available
  without leaving the builder.

  **Character limits and accessibility guidance, built into the fields
  themselves.** Any field can carry a `maxLength` (enforced on the input
  and shown as a live "x/N characters" counter — the Footer link label is
  capped at 24 characters, a testimonial quote at 240, an FAQ answer at
  500, a notification message at 160) and/or `helpText` with accessibility
  reminders a content manager wouldn't otherwise think to look up — e.g.
  "give this image real alt text in the Media Library, not the filename"
  on every image field, "avoid vague link text like 'click here'" on the
  notification's link label, or a note that the dismiss button carries a
  text label for screen readers, not just an "×". Both render together
  under the field in the inspector. See `src/lib/blocks.ts` for the full
  set of examples.

  **Reusable widgets — save once, place on any page, edit from any of
  them.** Select any widget (Footer, Testimonials, FAQ, etc. — content
  blocks like Hero and Text are single-use by design and don't get this
  option) and the inspector offers a "Make reusable" panel: give it a
  name and it becomes a `SharedWidget`, listed in its own **Reusable
  widgets** palette section on every page from then on. Dragging or
  clicking one from that section places a block that's a live reference
  to the saved widget, not a copy — its content lives on the shared
  record, so editing it from *any* page that uses it (including the page
  it was first saved from) updates every other page immediately, and the
  standalone Preview reflects the change too. A blue **Reusable** badge
  marks linked blocks on the canvas, and the inspector shows how many
  pages currently use it, with an **Unlink** button that turns that one
  placement into an independent copy without touching the shared record
  or any other page. Deleting a shared widget (from the Widget Manager)
  never leaves a page pointing at nothing — every block that referenced it
  becomes its own independent copy of the last known content instead. The
  seeded "About us" and "Security & compliance" pages already share one
  footer out of the box, so the effect is visible without setting anything
  up first.
- **Widget Manager** — an Admin-only screen (`/widgets`, next to Content
  Types) that scans every content item's page-builder blocks and reports
  where each widget type is actually placed: stat cards for widget types
  defined vs. in use, total placements, and how many pages use at least
  one; then a type-by-type breakdown — pick a widget on the left and its
  panel on the right lists every page using it, with its content type,
  status, how many times it appears on that page, and a link straight into
  that page's Page Builder. A widget with zero usages shows a real empty
  state rather than being hidden, so "nothing uses this yet" is as visible
  as "used in 5 places."
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
