import { getRecords, addRecord, deleteRecord, generateId } from '../../utils/store'
import { getActionMeta, ICONS } from '../../utils/meta'
import { formatDate } from '../../utils/util'
import { getTodayChallenge, isChallengeCompleted, completeChallenge, getChallengeStreak } from '../../utils/challenge'
import type { SimpRecord } from '../../app'

const ACTIONS_OUT = ['请吃饭', '送礼物', '发红包', '买东西', '转账']
const ACTIONS_IN = ['对方请客', '收到礼物', '收到红包', '对方回礼', '对方主动']
const ACTIONS_NONE = ['陪聊天', '帮忙干活', '偷看主页', '换了头像', '梦见对方']
const NO_MONEY_ACTIONS = ['陪聊天', '帮忙干活', '对方安慰', '对方帮忙']
const SIMP_LABELS = ['略有心动', '情之所至', '深陷其中', '无可救药', '至死不渝']
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']

Component({
  data: {
    greeting: '',
    dateText: '',
    showForm: false,
    actions: ACTIONS_OUT,
    simpLabels: SIMP_LABELS,
    selectedAction: '',
    customAction: '',
    target: '',
    amount: '',
    simpIndex: 1,
    hasAmount: true,
    showAmountField: true,
    note: '',
    weekDays: [] as { date: string; label: string; count: number; barH: number; isToday: boolean }[],
    weekRecords: [] as (SimpRecord & { dateLabel: string; simpLabel: string; icon: string; color: string })[],
    weekTotal: 0,
    weekAmount: '0',
    challengeText: '',
    challengeBonus: 0,
    challengeDone: false,
    challengeStreak: 0,
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 0 })
      }
      this.refresh()
    },
  },
  methods: {
    onPullDownRefresh() {
      this.refresh()
      wx.stopPullDownRefresh()
    },

    async refresh() {
      const now = new Date()
      const h = now.getHours()
      let greeting = '晚上好'
      if (h < 6) greeting = '夜深了'
      else if (h < 12) greeting = '早上好'
      else if (h < 14) greeting = '中午好'
      else if (h < 18) greeting = '下午好'

      const dateText = `${now.getMonth() + 1}月${now.getDate()}日 周${DAY_NAMES[now.getDay()]}`
      this.setData({ greeting, dateText })

      const challenge = getTodayChallenge()
      this.setData({
        challengeText: challenge.text,
        challengeBonus: challenge.bonus,
        challengeDone: isChallengeCompleted(),
        challengeStreak: getChallengeStreak(),
      })

      const all = await getRecords()
      this.buildWeek(all)
    },

    buildWeek(all: SimpRecord[]) {
      const now = new Date()
      const todayStr = formatDate(now)
      const dow = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - ((dow + 6) % 7))

      const weekDates: string[] = []
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        weekDates.push(formatDate(d))
      }

      const countMap: Record<string, number> = {}
      for (const r of all) {
        countMap[r.date] = (countMap[r.date] || 0) + 1
      }

      const maxCount = Math.max(1, ...weekDates.map(d => countMap[d] || 0))
      const weekDays = weekDates.map((date, i) => ({
        date,
        label: DAY_NAMES[(i + 1) % 7],
        count: countMap[date] || 0,
        barH: Math.max(10, Math.round(((countMap[date] || 0) / maxCount) * 100)),
        isToday: date === todayStr,
      }))

      const weekRecords = all
        .filter(r => weekDates.indexOf(r.date) !== -1)
        .map(r => {
          const effectiveType = r.type || (r.amount > 0 ? 'out' : 'none')
          let icon = ICONS.DAILY
          let color = '#8b5cf6'
          if (effectiveType === 'out') { icon = ICONS.EXPENSE; color = '#ff4d6a' }
          else if (effectiveType === 'in') { icon = ICONS.INCOME; color = '#10b981' }

          return {
            ...r,
            dateLabel: r.date === todayStr ? '今天' : r.date.slice(5),
            simpLabel: SIMP_LABELS[r.simpIndex - 1],
            icon,
            color,
          }
        })

      const weekTotal = weekRecords.length
      const weekAmount = weekRecords.reduce((s, r) => s + r.amount, 0).toFixed(2)

      this.setData({ weekDays, weekRecords, weekTotal, weekAmount })
    },

    toggleChallenge() {
      if (this.data.challengeDone) {
        wx.showToast({ title: '今日任务已完成啦', icon: 'none' })
        return
      }
      wx.vibrateShort({ type: 'medium' })
      const bonus = completeChallenge()
      this.setData({ challengeDone: true, challengeStreak: getChallengeStreak() })
      wx.showLoading({ title: '打卡中...', mask: true })
      setTimeout(() => {
        wx.hideLoading()
        wx.showToast({ title: '深情值 +' + bonus, icon: 'none' })
      }, 500)
    },

    openForm() {
      wx.vibrateShort({ type: 'light' })
      wx.navigateTo({ url: '/pages/record-add/record-add' })
    },
  },
})
