import { getRecords, addRecord, deleteRecord, generateId } from '../../utils/store'
import { getActionMeta } from '../../utils/meta'
import { formatDate } from '../../utils/util'
import { getTodayChallenge, isChallengeCompleted, completeChallenge, getChallengeStreak } from '../../utils/challenge'
import type { SimpRecord } from '../../app'

const ACTIONS = ['请吃饭', '送礼物', '发红包', '陪聊天', '帮忙干活']
const NO_MONEY_ACTIONS = ['陪聊天', '帮忙干活']
const SIMP_LABELS = ['略微舔', '一般舔', '认真舔', '疯狂舔', '舔到极致']
const DAY_NAMES = ['日', '一', '二', '三', '四', '五', '六']

Component({
  data: {
    greeting: '',
    dateText: '',
    showForm: false,
    actions: ACTIONS,
    simpLabels: SIMP_LABELS,
    selectedAction: '',
    customAction: '',
    target: '',
    amount: '',
    simpIndex: 1,
    hasAmount: true,
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

    refresh() {
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

      const all = getRecords()
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
          const meta = getActionMeta(r.action)
          return {
            ...r,
            dateLabel: r.date === todayStr ? '今天' : r.date.slice(5),
            simpLabel: SIMP_LABELS[r.simpIndex - 1],
            icon: meta.icon,
            color: meta.color,
          }
        })

      const weekTotal = weekRecords.length
      const weekAmount = weekRecords.reduce((s, r) => s + r.amount, 0).toFixed(2)

      this.setData({ weekDays, weekRecords, weekTotal, weekAmount })
    },

    doneChallenge() {
      if (this.data.challengeDone) return
      var bonus = completeChallenge()
      this.setData({ challengeDone: true, challengeStreak: getChallengeStreak() })
      wx.showToast({ title: '+' + bonus + ' 分！', icon: 'none' })
    },

    openForm() {
      this.setData({ showForm: true })
    },

    closeForm() {
      this.setData({ showForm: false })
    },

    pickAction(e: any) {
      const action = e.currentTarget.dataset.v
      const hasAmount = NO_MONEY_ACTIONS.indexOf(action) === -1
      this.setData({
        selectedAction: action,
        customAction: '',
        hasAmount,
        amount: hasAmount ? this.data.amount : '',
      })
      this.updateSimpIndex()
    },

    onCustomAction(e: any) {
      this.setData({
        customAction: e.detail.value,
        selectedAction: '',
        hasAmount: true,
      })
      this.updateSimpIndex()
    },

    onTarget(e: any) {
      this.setData({ target: e.detail.value })
    },

    onAmount(e: any) {
      this.setData({ amount: e.detail.value })
      this.updateSimpIndex()
    },

    updateSimpIndex() {
      const action = (this.data.selectedAction || this.data.customAction).trim()
      const amount = parseFloat(this.data.amount) || 0

      const actionBase: Record<string, number> = {
        '陪聊天': 1,
        '帮忙干活': 1,
        '请吃饭': 2,
        '送礼物': 3,
        '发红包': 3,
      }
      let score = action in actionBase ? actionBase[action] : (action ? 2 : 1)

      if (amount >= 1000) score += 3
      else if (amount >= 200) score += 2
      else if (amount >= 50) score += 1

      this.setData({ simpIndex: Math.min(5, Math.max(1, score)) })
    },

    pickStar(e: any) {
      wx.vibrateShort({ type: 'light' })
      this.setData({ simpIndex: e.currentTarget.dataset.v })
    },

    onNote(e: any) {
      this.setData({ note: e.detail.value })
    },

    onSwipeStart(e: any) {
      const touch = e.touches[0]
      ;(this as any)._swipe = { startX: touch.clientX, startY: touch.clientY, idx: e.currentTarget.dataset.idx, moved: false }
    },

    onSwipeMove(e: any) {
      const s = (this as any)._swipe
      if (!s) return
      const touch = e.touches[0]
      const dx = touch.clientX - s.startX
      const dy = touch.clientY - s.startY
      if (!s.moved && Math.abs(dy) > Math.abs(dx)) { (this as any)._swipe = null; return }
      s.moved = true
      const x = Math.max(-65, Math.min(0, dx))
      this.setData({ [`weekRecords[${s.idx}].swipeX`]: x })
    },

    onSwipeEnd(_e: any) {
      const s = (this as any)._swipe
      if (!s) return
      const cur = (this.data.weekRecords[s.idx] as any).swipeX || 0
      this.setData({ [`weekRecords[${s.idx}].swipeX`]: cur < -30 ? -65 : 0 })
      ;(this as any)._swipe = null
    },

    deleteWeekRecord(e: any) {
      const id = e.currentTarget.dataset.id
      wx.showModal({
        title: '确认删除',
        content: '真的要删掉这条记录吗？',
        confirmColor: '#ef4444',
        success: (res) => {
          if (res.confirm) {
            wx.vibrateShort({ type: 'medium' })
            deleteRecord(id)
            wx.showToast({ title: '已删除', icon: 'none' })
            this.refresh()
          } else {
            // 取消时收回滑动
            const idx = this.data.weekRecords.findIndex((r: any) => r.id === id)
            if (idx >= 0) this.setData({ [`weekRecords[${idx}].swipeX`]: 0 })
          }
        },
      })
    },

    submit() {
      const action = (this.data.selectedAction || this.data.customAction).trim()
      if (!action) {
        wx.showToast({ title: '请选择或输入行为', icon: 'none' })
        return
      }
      if (!this.data.target.trim()) {
        wx.showToast({ title: '请输入对象', icon: 'none' })
        return
      }

      const record: SimpRecord = {
        id: generateId(),
        action,
        target: this.data.target.trim(),
        amount: Math.round((parseFloat(this.data.amount) || 0) * 100) / 100,
        simpIndex: this.data.simpIndex,
        date: formatDate(new Date()),
        note: this.data.note.trim(),
      }

      addRecord(record)
      wx.vibrateShort({ type: 'medium' })
      wx.showToast({ title: '记录成功', icon: 'none' })

      this.setData({
        showForm: false,
        selectedAction: '',
        customAction: '',
        target: '',
        amount: '',
        simpIndex: 1,
        hasAmount: true,
        note: '',
      })

      this.refresh()
    },
  },
})
