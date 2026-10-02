// Real icons (Lucide, ISC licence) for the app's structure — tabs, areas, goals, tools.
// Emojis stay for the buddy and casual copy; structure gets consistent line icons.
import {
  Activity, Ban, BarChart3, Bath, BedDouble, BookOpen, Brain, Briefcase, CalendarCheck, CalendarDays, CheckCircle2, ClipboardList, Coffee, Compass, CreditCard, Droplets,
  Dumbbell, Ear, House, Eye, Flag, Flame, Footprints, HandHeart, Headphones, Heart, HeartCrack, Hourglass, IdCard, Image, KeyRound, Layers, LifeBuoy, LineChart, ListChecks, Lock,
  Mail, MessageSquareQuote, MessagesSquare, Mic, Moon, Newspaper, NotebookPen, Package, PenLine, PieChart, PiggyBank, Pizza, Receipt, RefreshCw, Repeat, Rocket, Scale,
  ScanSearch, Shield, Siren, SlidersHorizontal, Smartphone, Smile, Sparkles, Sprout, StretchHorizontal, Sun, Target, Thermometer, Timer, TrendingUp, Trophy, Users,
  UtensilsCrossed, Wallet, Waves, Wind, Zap, type LucideIcon,
} from 'lucide-react'

export const ICONS = {
  // tabs
  today: Sun, home: House, explore: Compass, library: BookOpen, me: Flame,
  // areas / categories
  calm: Wind, focus: Target, body: Dumbbell, money: Wallet, safety: Shield, people: Heart, grow: Sprout, faith: HandHeart, read: Newspaper, listen: Headphones, mind: Brain,
  // goals
  'goal:calm': Wind, 'goal:focus': Target, 'goal:sleep': Moon, 'goal:confidence': Sparkles, 'goal:money': Wallet, 'goal:safety': Shield, 'goal:people': Heart, 'goal:faith': HandHeart, 'goal:habits': Sprout,
  // needs
  anxious: Activity, sad: Moon, 'need:focus': Target, exam: BookOpen, sleep: BedDouble, 'need:money': Wallet, heartbreak: HeartCrack, unsafe: Shield, stuck: Hourglass, bored: Smile,
  // tools
  checkin: Thermometer, 'mood-insights': LineChart, panic: Siren, 'safety-plan': LifeBuoy, 'thought-flip': RefreshCw, 'worry-box': Package, journal: NotebookPen, 'one-line': PenLine, 'hype-file': Trophy, 'bad-day': Heart, affirm: Sparkles, urge: Waves,
  'focus-timer': Timer, 'focus-stats': BarChart3, sounds: SlidersHorizontal, 'brain-dump': Brain, 'done-list': CheckCircle2, starter: Rocket, countdowns: Hourglass, flashcards: Layers, timetable: CalendarDays, 'eye-care': Eye, 'phone-down': Smartphone,
  workout: Dumbbell, stretch: StretchHorizontal, water: Droplets, 'sleep-calc': Moon, 'wind-down': BedDouble, period: CalendarCheck, caffeine: Coffee,
  expenses: Receipt, budget: PieChart, split: Pizza, subs: Repeat, savings: PiggyBank, sip: TrendingUp, salary: Briefcase, 'worth-it': Scale, emi: CreditCard, 'scam-check': ScanSearch,
  'safe-walk': Footprints, ice: IdCard, password: KeyRound, privacy: Lock, 'red-flags': Flag,
  boundaries: MessageSquareQuote, breakup: HeartCrack, friends: Users, kindness: HandHeart, convo: MessagesSquare,
  habits: CalendarCheck, quit: Ban, capsule: Mail, bucket: ListChecks, wallpaper: Image, dopamine: UtensilsCrossed, career: Compass, interview: Mic, decide: Scale, speak: Mic,
  // misc
  sos: Siren, play: Zap, bath: Bath, ear: Ear, list: ClipboardList,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 22, className }: { name: IconName | string; size?: number; className?: string }) {
  const C = (ICONS as Record<string, LucideIcon>)[name] ?? Sparkles
  return <C size={size} strokeWidth={2.25} className={className} aria-hidden="true" />
}

/** Icon in a soft tinted circle — the app's standard "pictogram". */
export function IconBubble({ name, size = 22, className = '' }: { name: IconName | string; size?: number; className?: string }) {
  return (
    <span className={`ibub ${className}`}>
      <Icon name={name} size={size} />
    </span>
  )
}
