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
  Rocket,
  type LucideIcon,
} from 'lucide-react'

/**
 * Maps a BlockTypeDef's or PageTemplateDef's `icon` (a string, so the
 * registries stay plain data) to the actual Lucide component. Shared by
 * the Page Builder palette, the template picker, and the Widget Manager
 * so all three render block/widget/template icons identically.
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
  Rocket,
}

export const defaultBlockIcon: LucideIcon = PanelTop

export function getBlockIcon(name: string): LucideIcon {
  return blockIcons[name] ?? defaultBlockIcon
}
