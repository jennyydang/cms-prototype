import {
  PanelTop,
  AlignLeft,
  Image as ImageIcon,
  Columns2,
  Quote,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  LayoutGrid,
  MessageSquareQuote,
  HelpCircle,
  Sparkles,
  Megaphone,
  PackageSearch,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps a BlockTypeDef's `icon` (a string, so the registry stays plain data)
 * to the actual Lucide component. Shared between the Page Builder palette
 * and the Widget Manager so both render block/widget icons identically.
 */
export const blockIcons: Record<string, LucideIcon> = {
  PanelTop,
  AlignLeft,
  Image: ImageIcon,
  Columns2,
  Quote,
  MousePointerClick,
  MoveVertical,
  PanelBottom,
  LayoutGrid,
  MessageSquareQuote,
  HelpCircle,
  Sparkles,
  Megaphone,
  PackageSearch,
}

export const defaultBlockIcon: LucideIcon = PanelTop

export function getBlockIcon(name: string): LucideIcon {
  return blockIcons[name] ?? defaultBlockIcon
}
