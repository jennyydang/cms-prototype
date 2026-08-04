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
      { key: 'tagline', label: 'Tagline', input: 'text', maxLength: 100, placeholder: 'Content management, rebuilt for clarity.' },
      {
        key: 'links',
        label: 'Links',
        input: 'repeater',
        itemLabel: 'link',
        itemFields: [
          {
            key: 'label',
            label: 'Label',
            input: 'text',
            maxLength: 24,
            default: 'New link',
            helpText: 'Keep nav labels to 1–3 words so they stay on one line and are quick to scan.',
          },
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
      {
        key: 'copyright',
        label: 'Copyright',
        input: 'text',
        maxLength: 120,
        placeholder: '© 2026 Atlas CMS. All rights reserved.',
      },
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
      { key: 'heading', label: 'Heading', input: 'text', maxLength: 60, placeholder: 'Featured products' },
      {
        key: 'products',
        label: 'Products',
        input: 'repeater',
        itemLabel: 'product',
        itemFields: [
          {
            key: 'image',
            label: 'Image',
            input: 'media',
            helpText: 'Give this image real alt text in the Media Library (e.g. “Team plan dashboard screenshot”), not the filename.',
          },
          { key: 'name', label: 'Name', input: 'text', maxLength: 60, default: 'Product name' },
          { key: 'price', label: 'Price', input: 'text', maxLength: 20, default: '$0', placeholder: '$49/mo' },
          { key: 'description', label: 'Description', input: 'textarea', maxLength: 160, default: '' },
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
  {
    type: 'testimonials',
    label: 'Testimonials',
    category: 'widget',
    description: 'Customer quotes with name, role, and photo.',
    icon: 'MessageSquareQuote',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text', maxLength: 60, placeholder: 'What our customers say' },
      {
        key: 'testimonials',
        label: 'Testimonials',
        input: 'repeater',
        itemLabel: 'testimonial',
        itemFields: [
          {
            key: 'avatar',
            label: 'Photo',
            input: 'media',
            helpText: 'Set real alt text on this photo in the Media Library — e.g. “Photo of Priya Patel” — screen readers read the filename otherwise.',
          },
          {
            key: 'quote',
            label: 'Quote',
            input: 'textarea',
            maxLength: 240,
            default: '',
            placeholder: 'Share what the customer said, in their words.',
          },
          { key: 'name', label: 'Name', input: 'text', maxLength: 60, default: 'Customer name' },
          { key: 'role', label: 'Role & company', input: 'text', maxLength: 60, default: '', placeholder: 'Title, Company' },
        ],
      },
    ],
    defaultData: {
      heading: 'What our customers say',
      testimonials: [
        {
          id: uid('item'),
          avatar: '',
          quote: 'Atlas cut our publishing time in half. The review workflow means nothing goes live by accident.',
          name: 'Priya Patel',
          role: 'Head of Content, Loopline',
        },
        {
          id: uid('item'),
          avatar: '',
          quote: 'The first CMS our whole team actually enjoys using — writers and engineers included.',
          name: 'Marcus Chen',
          role: 'VP Marketing, Fielder',
        },
      ],
    },
  },
  {
    type: 'faq',
    label: 'FAQ',
    category: 'widget',
    description: 'Expandable questions and answers, built on native <details> elements so it works with keyboards and screen readers with no extra ARIA.',
    icon: 'HelpCircle',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text', maxLength: 60, placeholder: 'Frequently asked questions' },
      {
        key: 'items',
        label: 'Questions',
        input: 'repeater',
        itemLabel: 'question',
        itemFields: [
          {
            key: 'question',
            label: 'Question',
            input: 'text',
            maxLength: 120,
            default: 'New question',
            helpText: 'Phrase it the way a visitor would actually ask it out loud.',
          },
          { key: 'answer', label: 'Answer', input: 'textarea', maxLength: 500, default: '' },
        ],
      },
    ],
    defaultData: {
      heading: 'Frequently asked questions',
      items: [
        {
          id: uid('item'),
          question: 'Can I change a content type after content already exists?',
          answer: 'Yes — add, remove, or require fields on a content type at any time from Content Types. Existing items keep their data even if a field is later removed from the schema.',
        },
        {
          id: uid('item'),
          question: 'Who can publish content?',
          answer: 'Admins and Editors can publish directly. Authors can publish their own content. Contributors can create drafts, which move to review before anyone can publish them.',
        },
      ],
    },
  },
  {
    type: 'blurb',
    label: 'Blurb grid',
    category: 'widget',
    description: 'Small icon + heading + text tiles, side by side — good for highlighting a handful of features.',
    icon: 'Sparkles',
    fields: [
      { key: 'heading', label: 'Heading', input: 'text', maxLength: 60, placeholder: 'Why teams choose Atlas' },
      {
        key: 'blurbs',
        label: 'Blurbs',
        input: 'repeater',
        itemLabel: 'blurb',
        itemFields: [
          {
            key: 'icon',
            label: 'Icon',
            input: 'select',
            default: 'Sparkles',
            helpText: 'Decorative only — the title and description carry the meaning, so the icon is hidden from screen readers.',
            options: [
              { label: 'Sparkles', value: 'Sparkles' },
              { label: 'Shield', value: 'Shield' },
              { label: 'Zap', value: 'Zap' },
              { label: 'Heart', value: 'Heart' },
              { label: 'Rocket', value: 'Rocket' },
              { label: 'Star', value: 'Star' },
              { label: 'Lock', value: 'Lock' },
              { label: 'Gauge', value: 'Gauge' },
            ],
          },
          {
            key: 'title',
            label: 'Title',
            input: 'text',
            maxLength: 40,
            default: 'Feature title',
            helpText: 'Keep it to 2–4 words so it stays scannable at a glance.',
          },
          { key: 'body', label: 'Description', input: 'textarea', maxLength: 140, default: '' },
        ],
      },
    ],
    defaultData: {
      heading: 'Why teams choose Atlas',
      blurbs: [
        { id: uid('item'), icon: 'Zap', title: 'Fast to publish', body: 'Draft, review, and ship without leaving the editor.' },
        { id: uid('item'), icon: 'Shield', title: 'Role-based access', body: 'Everyone sees exactly what they need to do their job.' },
        { id: uid('item'), icon: 'Sparkles', title: 'Built to scale', body: 'Add content types and fields as your site grows.' },
      ],
    },
  },
  {
    type: 'notification',
    label: 'Notification banner',
    category: 'widget',
    description: 'A site-wide announcement or alert. Pairs color with an icon and label so the message never relies on color alone.',
    icon: 'Megaphone',
    fields: [
      {
        key: 'variant',
        label: 'Type',
        input: 'select',
        default: 'info',
        options: [
          { label: 'Info', value: 'info' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' },
        ],
      },
      {
        key: 'message',
        label: 'Message',
        input: 'textarea',
        maxLength: 160,
        default: '',
        helpText: 'Lead with the point — screen reader and skimming users often only take in the first few words.',
      },
      {
        key: 'linkLabel',
        label: 'Link label',
        input: 'text',
        maxLength: 30,
        default: '',
        placeholder: 'Learn more',
        helpText: 'Avoid vague text like “click here” — describe where the link goes, since screen readers can list links out of context.',
      },
      { key: 'linkUrl', label: 'Link URL', input: 'url', default: '' },
      {
        key: 'dismissible',
        label: 'Dismissible',
        input: 'boolean',
        default: 'true',
        helpText: 'The dismiss button includes a text label for screen readers, not just an “×”.',
      },
    ],
    defaultData: {
      variant: 'info',
      message: 'Atlas CMS 2.0 is here — new page builder, new widgets.',
      linkLabel: 'See what’s new',
      linkUrl: '#',
      dismissible: 'true',
    },
  },
  {
    type: 'product-details',
    label: 'Product details',
    category: 'widget',
    description: 'A single product in depth: image, price, description, and a feature list.',
    icon: 'PackageSearch',
    fields: [
      {
        key: 'image',
        label: 'Image',
        input: 'media',
        helpText: 'Give this image real alt text in the Media Library — describe the product, not the filename.',
      },
      { key: 'name', label: 'Name', input: 'text', maxLength: 60, default: 'Product name' },
      { key: 'price', label: 'Price', input: 'text', maxLength: 20, default: '$0' },
      { key: 'description', label: 'Description', input: 'textarea', maxLength: 400, default: '' },
      {
        key: 'features',
        label: 'Features',
        input: 'repeater',
        itemLabel: 'feature',
        itemFields: [{ key: 'label', label: 'Feature', input: 'text', maxLength: 80, default: 'New feature' }],
      },
      {
        key: 'buttonLabel',
        label: 'Button label',
        input: 'text',
        maxLength: 30,
        default: 'Buy now',
        helpText: 'Make it specific, e.g. “Buy the Team plan” rather than a generic “Buy now”, so it makes sense out of context.',
      },
      { key: 'buttonUrl', label: 'Button link', input: 'url', default: '' },
    ],
    defaultData: {
      image: '',
      name: 'Atlas CMS — Team plan',
      price: '$49/mo',
      description: 'Everything a growing content team needs: unlimited content types, role-based permissions, and the full page builder.',
      features: [
        { id: uid('item'), label: 'Up to 10 team members' },
        { id: uid('item'), label: 'Unlimited content types' },
        { id: uid('item'), label: 'Page builder with widgets' },
        { id: uid('item'), label: 'Priority support' },
      ],
      buttonLabel: 'Buy the Team plan',
      buttonUrl: '#',
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
