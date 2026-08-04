import type { PageBlockType } from './types'

/**
 * Page templates: a named, ordered recipe of block types that gives every
 * page of the same kind a consistent starting structure — the same way a
 * design system's page templates keep a marketing site's Landing and
 * Product pages recognizably alike, instead of every author inventing
 * their own layout from scratch.
 *
 * Applying a template just calls createBlock() for each type in order, so
 * a block added via a template starts with exactly the same example
 * content as adding that block on its own from the palette — no separate
 * content to keep in sync.
 */
export interface PageTemplateDef {
  id: string
  name: string
  description: string
  icon: string
  blockTypes: PageBlockType[]
}

export const pageTemplates: PageTemplateDef[] = [
  {
    id: 'landing-page',
    name: 'Landing Page',
    description: 'A focused pitch: lead with the value, back it up, then ask for the click.',
    icon: 'Rocket',
    blockTypes: ['hero', 'blurb', 'testimonials', 'faq', 'cta', 'footer'],
  },
  {
    id: 'product-page',
    name: 'Product Page',
    description: 'Puts the product up front, then proof and answers before the footer.',
    icon: 'PackageSearch',
    blockTypes: ['product-details', 'blurb', 'testimonials', 'faq', 'footer'],
  },
]

export function getPageTemplate(id: string): PageTemplateDef | undefined {
  return pageTemplates.find((t) => t.id === id)
}
