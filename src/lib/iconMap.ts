/**
 * DynamicIcon — resolves icon names from database/data to actual Lucide components.
 *
 * WHY THIS EXISTS:
 * Several pages use `import * as Icons from 'lucide-react'` to resolve icon names
 * stored in the database (e.g., service.icon = 'Building2'). That wildcard import
 * prevents tree-shaking and adds ~200KB to every chunk that uses it.
 *
 * This module exports only the icons actually used across all services + categories,
 * allowing full tree-shaking of the remaining 1000+ Lucide icons.
 *
 * To add a new icon: import it above and add to ICON_MAP below.
 */
import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Building,
  Building2,
  Code,
  CreditCard,
  FileCheck,
  FileCode,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  Landmark,
  Laptop,
  Mail,
  Palette,
  Phone,
  Shield,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Globe,
  ShoppingCart,
  Megaphone,
  PenTool,
  Cpu,
  Settings,
  BookMarked,
  Zap,
  Star,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Building,
  Building2,
  Code,
  CreditCard,
  FileCheck,
  FileCode,
  FileText,
  GraduationCap,
  Headphones,
  HelpCircle,
  Landmark,
  Laptop,
  Mail,
  Palette,
  Phone,
  Shield,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Briefcase,
  Globe,
  ShoppingCart,
  Megaphone,
  PenTool,
  Cpu,
  Settings,
  BookMarked,
  Zap,
  Star,
  ChevronRight,
  ChevronLeft,
}

/**
 * Resolves a lucide icon name string to a React component.
 * Falls back to HelpCircle if the icon name is not in the map.
 */
export function getIcon(name: string | undefined | null): LucideIcon {
  if (!name) return HelpCircle
  return ICON_MAP[name] ?? HelpCircle
}

export { HelpCircle, AlertCircle, ArrowRight }
export type { LucideIcon }
