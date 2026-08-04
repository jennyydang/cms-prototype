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
