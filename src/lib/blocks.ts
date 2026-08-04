import type { BlockFieldDef, BlockFieldValue, BlockTypeDef, PageBlock, PageBlockType, RepeaterItem } from './types'
import { uid } from './utils'

/**
 * The block registry: one definition per block type, describing its
 * editable fields. The page builder's palette, canvas preview, and
 * inspector form are all generated from this list — adding a new block
 * type here is enough to make it available everywhere in the builder.
 *
 * "content" blocks are simple, single-purpose. "widget" blocks bundle
 * several related, repeatable pieces of content behind one purpose-built
 * name (a Footer needs a link list; a Product Gallery needs a product
 * list) — that repeatability comes from 'repeater' fields, whose value is
 * an array of items shaped by `itemFields`.
 */
export const blockRegistry: BlockTypeDef[] = [
  {
    type: 'hero',
    label: 'Hero',
    category: 'content',
    description: 'Big heading with an optional call-to-action button.',
    icon: 'PanelTop',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text', placeholder: 'A bold statement' },
      { key: 'subheading', label: 'Subheading', input: 'textarea', placeholder: 'Supporting detail' },
      { key: 'align', label: 'Alignment', input: 'select', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
      ] },
      { key: 'ctaLabel', label: 'Button label', input: 'text', placeholder: 'Get started' },
      { key: 'ctaUrl', label: 'Button link', input: 'url', placeholder: 'https://…' },
    ],
    defaultData: {
      heading: 'Your headline goes here',
      subheading: 'A short line that explains the value in one breath.',
      align: 'center',
      ctaLabel: 'Get started',
      ctaUrl: '',
    },
  },
  {
    type: 'text',
    label: 'Text',
    category: 'content',
    description: 'A heading and a paragraph of body copy.',
    icon: 'AlignLeft',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text', placeholder: 'Section title' },
      { key: 'body', label: 'Body', input: 'textarea', placeholder: 'Write something…' },
    ],
    defaultData: { heading: 'Section title', body: 'Write something…' },
  },
  {
    type: 'image',
    label: 'Image',
    category: 'content',
    description: 'A single image from the media library with a caption.',
    icon: 'Image',
    fields: [
      { key: 'mediaId', label: 'Image', input: 'media' },
      { key: 'caption', label: 'Caption', input: 'text', placeholder: 'Optional caption' },
    ],
    defaultData: { mediaId: '', caption: '' },
  },
  {
    type: 'columns',
    label: 'Two columns',
    category: 'content',
    description: 'Side-by-side content, useful for comparisons.',
    icon: 'Columns2',
    fields: [
      { key: 'leftHeading', label: 'Left heading', input: 'text' },
      { key: 'leftBody', label: 'Left body', input: 'textarea' },
      { key: 'rightHeading', label: 'Right heading', input: 'text' },
      { key: 'rightBody', label: 'Right body', input: 'textarea' },
    ],
    defaultData: {
      leftHeading: 'Left column',
      leftBody: 'Describe the first thing.',
      rightHeading: 'Right column',
      rightBody: 'Describe the second thing.',
    },
  },
  {
    type: 'quote',
    label: 'Quote',
    category: 'content',
    description: 'A pull quote with an attribution line.',
    icon: 'Quote',
    fields: [
      { key: 'quote', label: 'Quote', input: 'textarea', placeholder: '“This changed everything.”' },
      { key: 'attribution', label: 'Attribution', input: 'text', placeholder: 'Name, Title' },
    ],
    defaultData: { quote: 'This changed everything.', attribution: 'Someone, Somewhere' },
  },
  {
    type: 'cta',
    label: 'Call to action',
    category: 'content',
    description: 'A banner that drives readers toward one action.',
    icon: 'MousePointerClick',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text' },
      { key: 'body', label: 'Body', input: 'textarea' },
      { key: 'buttonLabel', label: 'Button label', input: 'text' },
      { key: 'buttonUrl', label: 'Button link', input: 'url' },
    ],
    defaultData: {
      heading: 'Ready to get started?',
      body: 'Join the teams already publishing with Atlas CMS.',
      buttonLabel: 'Start free',
      buttonUrl: '',
    },
  },
  {
    type: 'spacer',
    label: 'Spacer',
    category: 'content',
    description: 'Adds vertical breathing room between blocks.',
    icon: 'MoveVertical',
    fields: [
      { key: 'size', label: 'Height', input: 'select', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ] },
    ],
    defaultData: { size: 'md' },
  },
  {
    type: 'footer',
    label: 'Footer',
    category: 'widget',
    description: 'Site footer with nav links, social links, and copyright.',
    icon: 'PanelBottom',
    fields: [
      { key: 'tagline', label: 'Tagline', input: 'text', placeholder: 'Content management, rebuilt for clarity.' },
      {
        key: 'links',
        label: 'Links',
        input: 'repeater',
        itemLabel: 'link',
        itemFields: [
          { key: 'label', label: 'Label', input: 'text', default: 'New link' },
          { key: 'url', label: 'URL', input: 'url', default: '#' },
        ],
      },
      {
        key: 'socialLinks',
        label: 'Social links',
        input: 'repeater',
        itemLabel: 'social link',
        itemFields: [
          {
            key: 'platform',
            label: 'Platform',
            input: 'select',
            default: 'twitter',
            options: [
              { label: 'X (Twitter)', value: 'twitter' },
              { label: 'LinkedIn', value: 'linkedin' },
              { label: 'GitHub', value: 'github' },
              { label: 'Instagram', value: 'instagram' },
              { label: 'YouTube', value: 'youtube' },
            ],
          },
          { key: 'url', label: 'URL', input: 'url', default: '#' },
        ],
      },
      { key: 'copyright', label: 'Copyright', input: 'text', placeholder: '© 2026 Atlas CMS. All rights reserved.' },
    ],
    defaultData: {
      tagline: 'Content management, rebuilt for clarity.',
      links: [
        { id: uid('item'), label: 'Product', url: '#' },
        { id: uid('item'), label: 'Pricing', url: '#' },
        { id: uid('item'), label: 'About', url: '#' },
        { id: uid('item'), label: 'Contact', url: '#' },
      ],
      socialLinks: [
        { id: uid('item'), platform: 'twitter', url: '#' },
        { id: uid('item'), platform: 'github', url: '#' },
        { id: uid('item'), platform: 'linkedin', url: '#' },
      ],
      copyright: `© ${new Date().getFullYear()} Atlas CMS. All rights reserved.`,
    },
  },
  {
    type: 'product-gallery',
    label: 'Product gallery',
    category: 'widget',
    description: 'A grid of products, each with an image, name, price, and description.',
    icon: 'LayoutGrid',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text', placeholder: 'Featured products' },
      {
        key: 'products',
        label: 'Products',
        input: 'repeater',
        itemLabel: 'product',
        itemFields: [
          { key: 'image', label: 'Image', input: 'media' },
          { key: 'name', label: 'Name', input: 'text', default: 'Product name' },
          { key: 'price', label: 'Price', input: 'text', default: '$0', placeholder: '$49/mo' },
          { key: 'description', label: 'Description', input: 'textarea', default: '' },
        ],
      },
    ],
    defaultData: {
      heading: 'Featured products',
      products: [
        {
          id: uid('item'),
          image: '',
          name: 'Atlas CMS — Team plan',
          price: '$49/mo',
          description: 'For growing teams that publish every week.',
        },
        {
          id: uid('item'),
          image: '',
          name: 'Atlas CMS — Enterprise plan',
          price: 'Contact us',
          description: 'Advanced controls for larger organizations.',
        },
      ],
    },
  },
]

export function getBlockTypeDef(type: PageBlockType): BlockTypeDef {
  const def = blockRegistry.find((b) => b.type === type)
  if (!def) throw new Error(`Unknown block type: ${type}`)
  return def
}

/** Builds a new item for a repeater field from its itemFields' defaults. */
export function createRepeaterItem(itemFields: BlockFieldDef[] = []): RepeaterItem {
  const item: RepeaterItem = { id: uid('item') }
  for (const field of itemFields) item[field.key] = field.default ?? ''
  return item
}

// Deep-clones a block's default data so separate instances of the same
// block type never share the same repeater array/item references.
function cloneBlockData(data: Record<string, BlockFieldValue>): Record<string, BlockFieldValue> {
  const clone: Record<string, BlockFieldValue> = {}
  for (const [key, value] of Object.entries(data)) {
    clone[key] = Array.isArray(value) ? value.map((item) => ({ ...item, id: uid('item') })) : value
  }
  return clone
}

export function createBlock(type: PageBlockType): PageBlock {
  const def = getBlockTypeDef(type)
  return { id: uid('block'), type, data: cloneBlockData(def.defaultData) }
}
