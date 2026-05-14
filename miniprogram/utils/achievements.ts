import type { SimpRecord } from '../app'

export interface Achievement {
  id: string
  icon: string
  title: string
  desc: string
  check: (records: SimpRecord[]) => boolean
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_record',
    icon: '🎯',
    title: '初心',
    desc: '记录第一次付出',
    check: (r) => r.length >= 1,
  },
  {
    id: 'five_records',
    icon: '✋',
    title: '五次付出',
    desc: '累计记录 5 次',
    check: (r) => r.length >= 5,
  },
  {
    id: 'twenty_records',
    icon: '🔥',
    title: '热恋进行时',
    desc: '累计记录 20 次',
    check: (r) => r.length >= 20,
  },
  {
    id: 'fifty_records',
    icon: '💯',
    title: '半百付出',
    desc: '累计记录 50 次',
    check: (r) => r.length >= 50,
  },
  {
    id: 'hundred_records',
    icon: '👑',
    title: '百次真心',
    desc: '累计记录 100 次',
    check: (r) => r.length >= 100,
  },
  {
    id: 'spend_100',
    icon: '💸',
    title: '小破费',
    desc: '累计花费超过 100 元',
    check: (r) => r.reduce((s, x) => s + x.amount, 0) >= 100,
  },
  {
    id: 'spend_1000',
    icon: '💰',
    title: '千金散尽',
    desc: '累计花费超过 1000 元',
    check: (r) => r.reduce((s, x) => s + x.amount, 0) >= 1000,
  },
  {
    id: 'spend_5000',
    icon: '🏦',
    title: '倾心而为',
    desc: '累计付出超过 5000 元',
    check: (r) => r.reduce((s, x) => s + x.amount, 0) >= 5000,
  },
  {
    id: 'multi_target_3',
    icon: '🎭',
    title: '多元守护',
    desc: '对 3 个不同的人表达过在意',
    check: (r) => new Set(r.map(x => x.target)).size >= 3,
  },
  {
    id: 'multi_target_5',
    icon: '🌟',
    title: '博爱之光',
    desc: '对 5 个不同的人表达过在意',
    check: (r) => new Set(r.map(x => x.target)).size >= 5,
  },
  {
    id: 'max_simp',
    icon: '😭',
    title: '真心满分',
    desc: '有一条记录真心指数达到满分',
    check: (r) => r.some(x => x.simpIndex >= 5),
  },
  {
    id: 'streak_3',
    icon: '📅',
    title: '三日不辍',
    desc: '连续 3 天都有记录',
    check: (r) => getMaxStreak(r) >= 3,
  },
  {
    id: 'streak_7',
    icon: '🗓️',
    title: '周周付出',
    desc: '连续 7 天都有记录',
    check: (r) => getMaxStreak(r) >= 7,
  },
  {
    id: 'streak_30',
    icon: '🏆',
    title: '月度之星',
    desc: '连续 30 天都有记录',
    check: (r) => getMaxStreak(r) >= 30,
  },
  {
    id: 'multi_action_5',
    icon: '🎪',
    title: '花样付出',
    desc: '使用过 5 种不同的付出方式',
    check: (r) => new Set(r.map(x => x.action)).size >= 5,
  },
  {
    id: 'single_day_3',
    icon: '⚡',
    title: '日行三善',
    desc: '同一天记录 3 次以上',
    check: (r) => {
      const map: Record<string, number> = {}
      for (const x of r) { map[x.date] = (map[x.date] || 0) + 1 }
      return Object.values(map).some(v => v >= 3)
    },
  },
]

function getMaxStreak(records: SimpRecord[]): number {
  if (records.length === 0) return 0
  const dates = Array.from(new Set(records.map(r => r.date))).sort()
  let max = 1
  let cur = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) {
      cur++
      if (cur > max) max = cur
    } else {
      cur = 1
    }
  }
  return max
}

export function getUnlockedAchievements(records: SimpRecord[]): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.check(records))
}
