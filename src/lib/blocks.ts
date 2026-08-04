import type { BlockTypeDef, PageBlock, PageBlockType } from './types'
import { uid } from './utils'

/**
 * The block registry: one definition per block type, describing its
 * editable fields. The page builder's palette, canvas preview, and
 * inspector form are all generated from this list — adding a new block
 * type here is enough to make it available everywhere in the builder.
 */
export const blockRegistry: BlockTypeDef[] = [
  {
    type: 'hero',
    label: 'Hero',
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
]

export function getBlockTypeDef(type: PageBlockType): BlockTypeDef {
  const def = blockRegistry.find((b) => b.type === type)
  if (!def) throw new Error(`Unknown block type: ${type}`)
  return def
}

export function createBlock(type: PageBlockType): PageBlock {
  const def = getBlockTypeDef(type)
  return { id: uid('block'), type, data: { ...def.defaultData } }
}
