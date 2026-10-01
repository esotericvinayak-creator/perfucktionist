import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

// Each category is its own chunk, so opening one tool doesn't download all 60.
const mind = () => import('./mind')
const focus = () => import('./focus')
const body = () => import('./body')
const money = () => import('./money')
const safety = () => import('./safety')
const people = () => import('./people')
const grow = () => import('./grow')

type Loader<M> = () => Promise<M>
const pickFrom = <M,>(load: Loader<M>, get: (m: M) => ComponentType) => lazy(() => load().then((m) => ({ default: get(m) })))

export const TOOL_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  checkin: pickFrom(mind, (m) => m.CheckInTool),
  'mood-insights': pickFrom(mind, (m) => m.MoodInsights),
  panic: pickFrom(mind, (m) => m.Panic),
  'safety-plan': pickFrom(mind, (m) => m.SafetyPlan),
  'thought-flip': pickFrom(mind, (m) => m.ThoughtFlip),
  'worry-box': pickFrom(mind, (m) => m.WorryBox),
  journal: pickFrom(mind, (m) => m.Journal),
  'one-line': pickFrom(mind, (m) => m.OneLine),
  'hype-file': pickFrom(mind, (m) => m.HypeFile),
  'bad-day': pickFrom(mind, (m) => m.BadDay),
  affirm: pickFrom(mind, (m) => m.Affirm),
  urge: pickFrom(mind, (m) => m.Urge),

  focus: pickFrom(focus, (m) => m.FocusTimer),
  'focus-stats': pickFrom(focus, (m) => m.FocusStats),
  sounds: pickFrom(focus, (m) => m.Sounds),
  'brain-dump': pickFrom(focus, (m) => m.BrainDump),
  'done-list': pickFrom(focus, (m) => m.DoneList),
  starter: pickFrom(focus, (m) => m.Starter),
  countdowns: pickFrom(focus, (m) => m.Countdowns),
  flashcards: pickFrom(focus, (m) => m.Flashcards),
  timetable: pickFrom(focus, (m) => m.Timetable),
  'eye-care': pickFrom(focus, (m) => m.EyeCare),
  'phone-down': pickFrom(focus, (m) => m.PhoneDown),

  workout: pickFrom(body, (m) => m.Workout),
  stretch: pickFrom(body, (m) => m.Stretch),
  water: pickFrom(body, (m) => m.Water),
  'sleep-calc': pickFrom(body, (m) => m.SleepCalc),
  'wind-down': pickFrom(body, (m) => m.WindDown),
  period: pickFrom(body, (m) => m.Period),
  caffeine: pickFrom(body, (m) => m.Caffeine),

  expenses: pickFrom(money, (m) => m.Expenses),
  budget: pickFrom(money, (m) => m.Budget),
  split: pickFrom(money, (m) => m.Split),
  subs: pickFrom(money, (m) => m.Subs),
  savings: pickFrom(money, (m) => m.Savings),
  sip: pickFrom(money, (m) => m.Sip),
  salary: pickFrom(money, (m) => m.Salary),
  'worth-it': pickFrom(money, (m) => m.WorthIt),
  emi: pickFrom(money, (m) => m.Emi),
  'scam-check': pickFrom(money, (m) => m.ScamCheck),

  'safe-walk': pickFrom(safety, (m) => m.SafeWalk),
  ice: pickFrom(safety, (m) => m.IceCard),
  password: pickFrom(safety, (m) => m.Password),
  privacy: pickFrom(safety, (m) => m.Privacy),
  'red-flags': pickFrom(safety, (m) => m.RedFlags),

  boundaries: pickFrom(people, (m) => m.Boundaries),
  breakup: pickFrom(people, (m) => m.Breakup),
  friends: pickFrom(people, (m) => m.Friends),
  kindness: pickFrom(people, (m) => m.Kindness),
  convo: pickFrom(people, (m) => m.Convo),

  habits: pickFrom(grow, (m) => m.Habits),
  quit: pickFrom(grow, (m) => m.QuitTool),
  capsule: pickFrom(grow, (m) => m.Capsule),
  bucket: pickFrom(grow, (m) => m.BucketList),
  wallpaper: pickFrom(grow, (m) => m.Wallpaper),
  dopamine: pickFrom(grow, (m) => m.Dopamine),
  career: pickFrom(grow, (m) => m.Career),
  interview: pickFrom(grow, (m) => m.Interview),
  decide: pickFrom(grow, (m) => m.Decide),
  speak: pickFrom(grow, (m) => m.Speak),
}
