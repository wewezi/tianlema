import { getRecords, deleteRecord } from '../../utils/store'
import { getActionMeta, ICONS } from '../../utils/meta'
import { formatDate } from '../../utils/util'
import type { SimpRecord } from '../../app'

type EnrichedRecord = SimpRecord & { icon: string; color: string; amountLabel: string; amountClass: string }
type Group = { label: string; records: EnrichedRecord[] }

function groupRecords(records: SimpRecord[]): Group[] {
  const now = new Date()
  const todayStr = formatDate(now)

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  const yesterdayStr = formatDate(yesterday)

  const dow = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((dow + 6) % 7))
  const mondayStr = formatDate(monday)

  const firstOfMonthStr = formatDate(new Date(now.getFullYear(), now.getMonth(), 1))

  const groups: Group[] = [
    { label: '今天', records: [] },
    { label: '昨天', records: [] },
    { label: '本周', records: [] },
    { label: '本月', records: [] },
    { label: '更早', records: [] },
  ]

  for (const r of records) {
    const meta = getActionMeta(r.action)
    // Smart compatibility for old records without 'type' field
    const effectiveType = r.type || (r.amount > 0 ? 'out' : 'none')

    let amountLabel = ''
    let amountClass = ''
    let displayIcon = ''
    let displayColor = ''

    if (effectiveType === 'out') {
      displayIcon = ICONS.EXPENSE
      displayColor = '#ff4d6a'
      amountLabel = `- ¥${r.amount}`
      amountClass = 'expense'
    } else if (effectiveType === 'in') {
      displayIcon = ICONS.INCOME
      displayColor = '#10b981'
      amountLabel = `+ ¥${r.amount}`
      amountClass = 'income'
    } else {
      displayIcon = ICONS.DAILY
      displayColor = '#8b5cf6'
      amountLabel = r.amount > 0 ? `¥${r.amount}` : '-'
      amountClass = 'none'
    }

    const enriched: EnrichedRecord = { 
      ...r, 
      icon: displayIcon, 
      color: displayColor,
      amountLabel,
      amountClass
    } as any
    if (r.date === todayStr) groups[0].records.push(enriched)
    else if (r.date === yesterdayStr) groups[1].records.push(enriched)
    else if (r.date >= mondayStr) groups[2].records.push(enriched)
    else if (r.date >= firstOfMonthStr) groups[3].records.push(enriched)
    else groups[4].records.push(enriched)
  }

  return groups.filter(g => g.records.length > 0)
}

Component({
  data: {
    groups: [] as Group[],
    totalAmount: '0',
    totalCount: 0,
    currentTab: 'week',
    weekDays: [] as any[],
    monthDays: [] as any[],
    monthTitle: '',
    emptyDays: [] as number[],
    selectedDate: '' as string, // Currently selected date for filtering
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 2 })
      }
      this.loadRecords()
    },
  },
  methods: {
    onPullDownRefresh() {
      this.loadRecords()
      wx.stopPullDownRefresh()
    },

    switchTab(e: any) {
      const tab = e.currentTarget.dataset.tab
      this.setData({ currentTab: tab }, () => {
        this.loadRecords()
      })
    },

    async loadRecords() {
      const records = await getRecords()
      
      let allGroups = groupRecords(records)
      let displayGroups = allGroups
      
      // Handle tab-based filtering
      if (this.data.currentTab === 'week') {
        displayGroups = allGroups.filter(g => ['今天', '昨天', '本周'].includes(g.label))
      } else if (this.data.currentTab === 'month') {
        displayGroups = allGroups.filter(g => ['今天', '昨天', '本周', '本月'].includes(g.label))
      }

      // Handle specific date selection filter
      if (this.data.selectedDate) {
        displayGroups = displayGroups.map(g => ({
          ...g,
          records: g.records.filter(r => r.date === this.data.selectedDate)
        })).filter(g => g.records.length > 0)
      }

      // Calculate totals based on the currently displayed groups
      let currentTotalAmount = 0;
      let currentTotalCount = 0;
      for (const g of displayGroups) {
        currentTotalCount += g.records.length;
        for (const r of g.records) {
          currentTotalAmount += r.amount;
        }
      }

      this.setData({
        groups: displayGroups,
        totalAmount: currentTotalAmount.toFixed(2),
        totalCount: currentTotalCount,
      })
      this.buildCalendar(records)
    },

    selectDay(e: any) {
      const date = e.currentTarget.dataset.date
      const newSelectedDate = this.data.selectedDate === date ? '' : date
      this.setData({ selectedDate: newSelectedDate }, () => {
        this.loadRecords()
      })
    },

    buildCalendar(records: SimpRecord[]) {
      const now = new Date()
      const todayStr = formatDate(now)
      
      // Build Week
      const dow = now.getDay()
      const monday = new Date(now)
      monday.setDate(now.getDate() - ((dow + 6) % 7))
      
      const weekDays = []
      const weekNames = ['一', '二', '三', '四', '五', '六', '日']
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + i)
        const dStr = formatDate(d)
        weekDays.push({
          day: d.getDate(),
          name: weekNames[i],
          fullDate: dStr,
          isToday: dStr === todayStr,
          isSelected: dStr === this.data.selectedDate,
          hasRecord: records.some(r => r.date === dStr)
        })
      }

      // Build Month
      const year = now.getFullYear()
      const month = now.getMonth()
      const monthTitle = `${year}年 ${month + 1}月`
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // Day of week for 1st (0=Sun, 1=Mon...) -> we want 1=Mon, 0=Sun
      let firstDow = firstDay.getDay()
      if (firstDow === 0) firstDow = 7
      const emptyCount = firstDow - 1
      const emptyDays = Array.from({ length: emptyCount }, (_, i) => i)

      const monthDays = []
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const dStr = formatDate(new Date(year, month, i))
        monthDays.push({
          day: i,
          fullDate: dStr,
          isToday: dStr === todayStr,
          isSelected: dStr === this.data.selectedDate,
          hasRecord: records.some(r => r.date === dStr)
        })
      }

      this.setData({ weekDays, monthDays, monthTitle, emptyDays })
    },

    onSwipeStart(e: any) {
      const touch = e.touches[0]
      const gi = e.currentTarget.dataset.gi
      const gk = e.currentTarget.dataset.gk
      const groupIdx = this.data.groups.findIndex((g: any) => g.label === gk)
      ;(this as any)._swipe = { startX: touch.clientX, startY: touch.clientY, gi, groupIdx, moved: false }
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
      this.setData({ [`groups[${s.groupIdx}].records[${s.gi}].swipeX`]: x })
    },

    onSwipeEnd(_e: any) {
      const s = (this as any)._swipe
      if (!s) return
      const cur = (this.data.groups[s.groupIdx] as any).records[s.gi].swipeX || 0
      this.setData({ [`groups[${s.groupIdx}].records[${s.gi}].swipeX`]: cur < -30 ? -65 : 0 })
      ;(this as any)._swipe = null
    },

    deleteItem(e: any) {
      const id = e.currentTarget.dataset.id
      wx.showModal({
        title: '确认删除',
        content: '真的要删掉这条记录吗？',
        confirmColor: '#ef4444',
        success: async (res) => {
          if (res.confirm) {
            wx.vibrateShort({ type: 'medium' })
            wx.showLoading({ title: '删除中...', mask: true })
            try {
              await deleteRecord(id)
              wx.hideLoading()
              wx.showToast({ title: '已删除', icon: 'none' })
              this.loadRecords()
            } catch (e) {
              wx.hideLoading()
              wx.showToast({ title: '删除失败', icon: 'none' })
            }
          } else {
            // 取消时收回滑动
            this.loadRecords()
          }
        },
      })
    },
  },
})
