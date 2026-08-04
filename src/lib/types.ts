/**
 * Core domain types for Atlas CMS.
 *
 * The shape here is intentionally close to what a real headless CMS
 * persists: content is an instance of a schema-defined Content Type,
 * so the same editor UI can render any type by reading its field list.
 */

export type ContentStatus = 'draft' | 'in-review' | 'scheduled' | 'published' | 'archived'

export type FieldType =
  | 'text'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'date'
  | 'media'
  | 'select'
  | 'reference'

export interface FieldOption {
  label: string
  value: string
}

export interface FieldDef {
  id: string
  key: string
  label: string
  type: FieldType
  required: boolean
  helpText?: string
  options?: FieldOption[]
}

export interface ContentTypeDef {
  id: string
  name: string
  pluralName: string
  slug: string
  description: string
  icon: string
  fields: FieldDef[]
  createdAt: string
}

export type UserRole = 'Admin' | 'Editor' | 'Author' | 'Contributor'

export interface UserAccount {
  id: string
  name: string
  email: string
  role: UserRole
  status: 'active' | 'invited'
  avatarColor: string
  lastActive: string
  createdAt: string
}

export interface ContentItem {
  id: string
  contentTypeId: string
  title: string
  slug: string
  status: ContentStatus
  authorId: string
  excerpt: string
  body: string
  featuredImageId?: string
  tags: string[]
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  scheduledFor?: string
  /** Optional visual layout, assembled in the drag-and-drop page builder. */
  blocks?: PageBlock[]
}

/**
 * Page Builder block model.
 *
 * Mirrors the ContentTypeDef/FieldDef schema pattern: each block *type* is
 * described once (src/lib/blocks.ts) as a list of editable fields, and the
 * builder UI renders the palette, canvas preview, and inspector form from
 * that single definition instead of hardcoding a form per block.
 *
 * Two kinds of block live in the same registry:
 *  - "content" blocks are simple, single-purpose (Hero, Text, Image…).
 *  - "widget" blocks bundle several related, repeatable pieces of content
 *    behind one purpose-built name — a Footer widget knows it needs a link
 *    list, a social link list, and a copyright line; a Product Gallery
 *    widget knows it needs a list of products. That repeatable list is a
 *    "repeater" field: a field whose value is an array of items, where each
 *    item has its own small set of sub-fields (itemFields).
 */
export type PageBlockType =
  | 'hero'
  | 'text'
  | 'image'
  | 'columns'
  | 'quote'
  | 'cta'
  | 'spacer'
  | 'footer'
  | 'product-gallery'
  | 'testimonials'
  | 'faq'
  | 'blurb'
  | 'notification'
  | 'product-details'

export type BlockCategory = 'content' | 'widget'

/** One entry inside a repeater field's list, e.g. one product or one link. */
export interface RepeaterItem {
  id: string
  [key: string]: string
}

export type BlockFieldValue = string | RepeaterItem[]

export interface PageBlock {
  id: string
  type: PageBlockType
  data: Record<string, BlockFieldValue>
}

export type BlockInputKind = 'text' | 'textarea' | 'select' | 'media' | 'url' | 'boolean' | 'repeater'

export interface BlockFieldDef {
  key: string
  label: string
  input: BlockInputKind
  options?: FieldOption[]
  placeholder?: string
  /** Value a new repeater item's field starts with. Ignored outside itemFields. */
  default?: string
  /**
   * Enforced on text/textarea inputs via the native `maxlength` attribute,
   * and surfaced to the content manager as a live "x/N characters" counter
   * — the same treatment already used for the SEO title/description fields
   * in the content editor. Keeps widget copy from overflowing its layout
   * (a testimonial quote, an FAQ answer, a notification message all read
   * best within a bounded length).
   */
  maxLength?: number
  /**
   * Guidance shown under the field, alongside the character counter when
   * both are present. Used for accessibility reminders a content manager
   * wouldn't otherwise know to think about — e.g. "give this image real
   * alt text in the Media Library" or "avoid vague link text like 'click
   * here'" — not just generic help copy.
   */
  helpText?: string
  /** Only set when input is 'repeater': the shape of each item in the list. */
  itemFields?: BlockFieldDef[]
  /** Only set when input is 'repeater': singular noun used for "Add {itemLabel}". */
  itemLabel?: string
}

export interface BlockTypeDef {
  type: PageBlockType
  label: string
  description: string
  icon: string
  category: BlockCategory
  fields: BlockFieldDef[]
  defaultData: Record<string, BlockFieldValue>
}

export type MediaKind = 'image' | 'document' | 'video'

export interface MediaItem {
  id: string
  filename: string
  kind: MediaKind
  mime: string
  sizeKb: number
  width?: number
  height?: number
  alt: string
  uploadedById: string
  uploadedAt: string
  colorFrom: string
  colorTo: string
  /** Data URL for a real uploaded preview image, when available. */
  dataUrl?: string
}

export interface ActivityEntry {
  id: string
  message: string
  actorId: string
  targetId?: string
  timestamp: string
  kind: 'created' | 'updated' | 'published' | 'deleted' | 'uploaded' | 'invited'
}

export interface SiteSettings {
  siteName: string
  siteUrl: string
  tagline: string
  description: string
  supportEmail: string
  timezone: string
  defaultLocale: string
  postsPerPage: number
  maintenanceMode: boolean
  allowComments: boolean
  requireReviewBeforePublish: boolean
}

export interface AppData {
  contentTypes: ContentTypeDef[]
  content: ContentItem[]
  media: MediaItem[]
  users: UserAccount[]
  activity: ActivityEntry[]
  settings: SiteSettings
}
