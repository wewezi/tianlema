import type { SimpRecord } from '../app'

export interface RankItem {
  score: number
  title: string
  icon: string
  desc: string
  next: string | null
}

export const RANKS: RankItem[] = [
  { score: 0, title: '初心萌芽', icon: '🐣', desc: '真心之路刚刚开始...', next: '还需300分升级' },
  { score: 300, title: '默默守候', icon: '🌱', desc: '在付出的路上稳步前进', next: '还需700分升级' },
  { score: 1000, title: '暖心达人', icon: '☀️', desc: '已经养成了温暖的习惯', next: '还需2000分升级' },
  { score: 3000, title: '真心使者', icon: '💫', desc: '在朋友圈里小有名气', next: '还需5000分升级' },
  { score: 8000, title: '付出之王', icon: '🌟', desc: '方圆十里无人不知', next: '还需17000分升级' },
  { score: 25000, title: '真心传奇', icon: '👑', desc: '感情世界里不朽的传奇', next: null },
]

export function calcRecordScore(r: { amount: number; simpIndex: number }): number {
  return r.amount * 10 + r.simpIndex * 20
}

export function calcScore(records: SimpRecord[]): number {
  let score = 0
  for (const r of records) {
    score += calcRecordScore(r)
  }
  return Math.round(score)
}

export function getRank(score: number): RankItem {
  let rank = RANKS[0]
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].score) {
      rank = RANKS[i]
      break
    }
  }
  return rank
}

export function getRankTitle(score: number): string {
  return getRank(score).title
}

export function getRankProgress(score: number): { rank: RankItem; percent: number } {
  let rankIdx = 0
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].score) {
      rankIdx = i
      break
    }
  }

  const prevScore = RANKS[rankIdx].score
  const nextScore = rankIdx + 1 < RANKS.length ? RANKS[rankIdx + 1].score : prevScore
  const rangeSize = nextScore - prevScore || 1
  const percent = Math.min(100, Math.round(((score - prevScore) / rangeSize) * 100))

  return { rank: RANKS[rankIdx], percent }
}

export function formatScore(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
