import { getRecords, deleteRecord } from '../../utils/store'
import { getActionMeta } from '../../utils/meta'
import { formatDate } from '../../utils/util'
import type { SimpRecord } from '../../app'

type EnrichedRecord = SimpRecord & { icon: string; color: string }
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
    const enriched: EnrichedRecord = { ...r, icon: meta.icon, color: meta.color }
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
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 1 })
      }
      this.loadRecords()
    },
  },
  methods: {
    onPullDownRefresh() {
      this.loadRecords()
      wx.stopPullDownRefresh()
    },

    loadRecords() {
      const records = getRecords()
      const total = records.reduce((sum, r) => sum + r.amount, 0)
      this.setData({
        groups: groupRecords(records),
        totalAmount: total.toFixed(2),
        totalCount: records.length,
      })
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
        success: (res) => {
          if (res.confirm) {
            wx.vibrateShort({ type: 'medium' })
            deleteRecord(id)
            wx.showToast({ title: '已删除', icon: 'none' })
            this.loadRecords()
          } else {
            // 取消时收回滑动
            this.loadRecords()
          }
        },
      })
    },
  },
})
