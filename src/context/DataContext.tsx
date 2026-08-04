import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  ActivityEntry,
  AppData,
  ContentItem,
  ContentStatus,
  ContentTypeDef,
  FieldDef,
  MediaItem,
  SiteSettings,
  UserAccount,
  UserRole,
} from '../lib/types'
import { buildSeedData } from '../lib/seed'
import { uid } from '../lib/utils'

const STORAGE_KEY = 'atlas-cms-data-v1'
const CURRENT_USER_ID = 'user_jenny'

function loadInitialData(): AppData {
  if (typeof window === 'undefined') return buildSeedData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return buildSeedData()
    const parsed = JSON.parse(raw) as AppData
    // Guard against a stale shape from an earlier prototype iteration.
    if (!parsed.contentTypes || !parsed.content || !parsed.users) return buildSeedData()
    return parsed
  } catch {
    return buildSeedData()
  }
}

interface DataContextValue {
  data: AppData
  currentUser: UserAccount

  // content
  getContentType: (id: string) => ContentTypeDef | undefined
  getContentTypeBySlug: (slug: string) => ContentTypeDef | undefined
  createContent: (contentTypeId: string, overrides?: Partial<ContentItem>) => ContentItem
  updateContent: (id: string, patch: Partial<ContentItem>) => void
  deleteContent: (id: string) => void
  bulkUpdateStatus: (ids: string[], status: ContentStatus) => void
  bulkDeleteContent: (ids: string[]) => void

  // content types
  createContentType: (input: Omit<ContentTypeDef, 'id' | 'createdAt' | 'fields'>) => ContentTypeDef
  updateContentType: (id: string, patch: Partial<Omit<ContentTypeDef, 'fields'>>) => void
  addField: (contentTypeId: string, field: Omit<FieldDef, 'id'>) => void
  updateField: (contentTypeId: string, fieldId: string, patch: Partial<FieldDef>) => void
  removeField: (contentTypeId: string, fieldId: string) => void

  // media
  addMedia: (item: Omit<MediaItem, 'id' | 'uploadedAt' | 'uploadedById'>) => MediaItem
  updateMedia: (id: string, patch: Partial<MediaItem>) => void
  deleteMedia: (id: string) => void
  getMedia: (id?: string) => MediaItem | undefined

  // users
  getUser: (id?: string) => UserAccount | undefined
  inviteUser: (input: { name: string; email: string; role: UserRole }) => void
  updateUserRole: (id: string, role: UserRole) => void
  removeUser: (id: string) => void

  // settings
  updateSettings: (patch: Partial<SiteSettings>) => void

  // activity
  logActivity: (entry: Omit<ActivityEntry, 'id' | 'timestamp' | 'actorId'>) => void

  resetDemoData: () => void
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitialData)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const currentUser = useMemo(
    () => data.users.find((u) => u.id === CURRENT_USER_ID) ?? data.users[0],
    [data.users],
  )

  const logActivity = useCallback((entry: Omit<ActivityEntry, 'id' | 'timestamp' | 'actorId'>) => {
    setData((prev) => ({
      ...prev,
      activity: [
        { ...entry, id: uid('act'), timestamp: new Date().toISOString(), actorId: CURRENT_USER_ID },
        ...prev.activity,
      ].slice(0, 50),
    }))
  }, [])

  const getContentType = useCallback((id: string) => data.contentTypes.find((t) => t.id === id), [data.contentTypes])
  const getContentTypeBySlug = useCallback(
    (slug: string) => data.contentTypes.find((t) => t.slug === slug),
    [data.contentTypes],
  )

  const createContent = useCallback((contentTypeId: string, overrides?: Partial<ContentItem>): ContentItem => {
    const now = new Date().toISOString()
    const item: ContentItem = {
      id: uid('content'),
      contentTypeId,
      title: 'Untitled',
      slug: '',
      status: 'draft',
      authorId: CURRENT_USER_ID,
      excerpt: '',
      body: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
      ...overrides,
    }
    setData((prev) => ({ ...prev, content: [item, ...prev.content] }))
    logActivity({ kind: 'created', message: `created draft "${item.title}"`, targetId: item.id })
    return item
  }, [logActivity])

  const updateContent = useCallback((id: string, patch: Partial<ContentItem>) => {
    setData((prev) => ({
      ...prev,
      content: prev.content.map((c) =>
        c.id === id ? { ...c, ...patch, updatedAt: new Date().toISOString() } : c,
      ),
    }))
  }, [])

  const deleteContent = useCallback((id: string) => {
    setData((prev) => {
      const item = prev.content.find((c) => c.id === id)
      if (item) {
        logActivity({ kind: 'deleted', message: `deleted "${item.title}"`, targetId: id })
      }
      return { ...prev, content: prev.content.filter((c) => c.id !== id) }
    })
  }, [logActivity])

  const bulkUpdateStatus = useCallback((ids: string[], status: ContentStatus) => {
    setData((prev) => ({
      ...prev,
      content: prev.content.map((c) =>
        ids.includes(c.id)
          ? {
              ...c,
              status,
              updatedAt: new Date().toISOString(),
              publishedAt: status === 'published' ? new Date().toISOString() : c.publishedAt,
            }
          : c,
      ),
    }))
  }, [])

  const bulkDeleteContent = useCallback((ids: string[]) => {
    setData((prev) => ({ ...prev, content: prev.content.filter((c) => !ids.includes(c.id)) }))
  }, [])

  const createContentType = useCallback(
    (input: Omit<ContentTypeDef, 'id' | 'createdAt' | 'fields'>): ContentTypeDef => {
      const type: ContentTypeDef = {
        ...input,
        id: uid('type'),
        createdAt: new Date().toISOString(),
        fields: [
          { id: uid('field'), key: 'title', label: 'Title', type: 'text', required: true },
          { id: uid('field'), key: 'slug', label: 'Slug', type: 'text', required: true },
          { id: uid('field'), key: 'body', label: 'Body', type: 'richtext', required: true },
        ],
      }
      setData((prev) => ({ ...prev, contentTypes: [...prev.contentTypes, type] }))
      return type
    },
    [],
  )

  const updateContentType = useCallback((id: string, patch: Partial<Omit<ContentTypeDef, 'fields'>>) => {
    setData((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const addField = useCallback((contentTypeId: string, field: Omit<FieldDef, 'id'>) => {
    setData((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.map((t) =>
        t.id === contentTypeId ? { ...t, fields: [...t.fields, { ...field, id: uid('field') }] } : t,
      ),
    }))
  }, [])

  const updateField = useCallback((contentTypeId: string, fieldId: string, patch: Partial<FieldDef>) => {
    setData((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.map((t) =>
        t.id === contentTypeId
          ? { ...t, fields: t.fields.map((f) => (f.id === fieldId ? { ...f, ...patch } : f)) }
          : t,
      ),
    }))
  }, [])

  const removeField = useCallback((contentTypeId: string, fieldId: string) => {
    setData((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.map((t) =>
        t.id === contentTypeId ? { ...t, fields: t.fields.filter((f) => f.id !== fieldId) } : t,
      ),
    }))
  }, [])

  const getMedia = useCallback((id?: string) => data.media.find((m) => m.id === id), [data.media])

  const addMedia = useCallback((item: Omit<MediaItem, 'id' | 'uploadedAt' | 'uploadedById'>): MediaItem => {
    const created: MediaItem = {
      ...item,
      id: uid('media'),
      uploadedAt: new Date().toISOString(),
      uploadedById: CURRENT_USER_ID,
    }
    setData((prev) => ({ ...prev, media: [created, ...prev.media] }))
    logActivity({ kind: 'uploaded', message: `uploaded ${created.filename}`, targetId: created.id })
    return created
  }, [logActivity])

  const updateMedia = useCallback((id: string, patch: Partial<MediaItem>) => {
    setData((prev) => ({ ...prev, media: prev.media.map((m) => (m.id === id ? { ...m, ...patch } : m)) }))
  }, [])

  const deleteMedia = useCallback((id: string) => {
    setData((prev) => ({ ...prev, media: prev.media.filter((m) => m.id !== id) }))
  }, [])

  const getUser = useCallback((id?: string) => data.users.find((u) => u.id === id), [data.users])

  const inviteUser = useCallback((input: { name: string; email: string; role: UserRole }) => {
    const colors = [
      'from-brand-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-sky-500 to-blue-600',
      'from-violet-500 to-purple-600',
    ]
    const newUser: UserAccount = {
      id: uid('user'),
      name: input.name,
      email: input.email,
      role: input.role,
      status: 'invited',
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }
    setData((prev) => ({ ...prev, users: [...prev.users, newUser] }))
    logActivity({ kind: 'invited', message: `invited ${input.name} as ${input.role}`, targetId: newUser.id })
  }, [logActivity])

  const updateUserRole = useCallback((id: string, role: UserRole) => {
    setData((prev) => ({ ...prev, users: prev.users.map((u) => (u.id === id ? { ...u, role } : u)) }))
  }, [])

  const removeUser = useCallback((id: string) => {
    setData((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }))
  }, [])

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setData((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }))
  }, [])

  const resetDemoData = useCallback(() => {
    setData(buildSeedData())
  }, [])

  const value: DataContextValue = {
    data,
    currentUser,
    getContentType,
    getContentTypeBySlug,
    createContent,
    updateContent,
    deleteContent,
    bulkUpdateStatus,
    bulkDeleteContent,
    createContentType,
    updateContentType,
    addField,
    updateField,
    removeField,
    addMedia,
    updateMedia,
    deleteMedia,
    getMedia,
    getUser,
    inviteUser,
    updateUserRole,
    removeUser,
    updateSettings,
    logActivity,
    resetDemoData,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
