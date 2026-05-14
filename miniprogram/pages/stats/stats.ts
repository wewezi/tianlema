import { getRecords } from '../../utils/store'
import { request, isLoggedIn, getUserInfo, updateProfile } from '../../utils/api'
import { RANKS, calcScore, getRankProgress } from '../../utils/rank'
import { ACHIEVEMENTS, getUnlockedAchievements } from '../../utils/achievements'

const DEFAULT_RANK = RANKS[0]

function applyStats(ctx: any, data: any) {
  const score = data.score || 0
  const { rank, percent } = getRankProgress(score)
  ctx.setData({
    totalEvents: data.totalEvents,
    totalAmount: Number(data.totalAmount).toFixed(2),
    avgSimp: Number(data.avgSimp).toFixed(1),
    targetCount: data.targetCount,
    rankInfo: rank,
    rankPercent: percent,
    topTargets: (data.topTargets || []).map((t: any) => ({
      name: t.name,
      count: t.count,
      total: Number(t.total).toFixed(2),
    })),
    topActions: data.topActions || [],
  })
}

Component({
  data: {
    nickname: '',
    avatarUrl: '',
    totalEvents: 0,
    totalAmount: '0',
    avgSimp: '0',
    targetCount: 0,
    rankInfo: DEFAULT_RANK,
    rankPercent: 0,
    topTargets: [] as { name: string; count: number; total: string }[],
    topActions: [] as { name: string; count: number }[],
    achievements: [] as { icon: string; title: string; desc: string; unlocked: boolean }[],
    unlockedCount: 0,
    totalAchievements: ACHIEVEMENTS.length,
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 3 })
      }
      this.loadProfile()
      this.loadStats()
      this.loadAchievements()
    },
  },
  methods: {
    loadProfile() {
      const info = getUserInfo()
      this.setData({
        nickname: info.nickname || '',
        avatarUrl: info.avatarUrl || '',
      })
    },

    onChooseAvatar(e: any) {
      const avatarUrl = e.detail.avatarUrl
      if (!avatarUrl) return
      this.setData({ avatarUrl })
      if (isLoggedIn()) {
        updateProfile({ avatarUrl }).catch(console.error)
      }
    },

    onNicknameChange(e: any) {
      const nickname = (e.detail.value || '').trim()
      if (!nickname) return
      this.setData({ nickname })
      if (isLoggedIn()) {
        updateProfile({ nickname }).catch(console.error)
      }
    },

    loadStats() {
      if (isLoggedIn()) {
        request<any>({ url: '/stats' })
          .then((data) => applyStats(this, data))
          .catch((err) => {
            console.error('加载统计失败', err)
          })
      }
    },

    async loadAchievements() {
      const records = await getRecords()
      const unlocked = getUnlockedAchievements(records)
      const unlockedIds = new Set(unlocked.map(a => a.id))
      const achievements = ACHIEVEMENTS.map(a => ({
        icon: a.icon,
        title: a.title,
        desc: a.desc,
        unlocked: unlockedIds.has(a.id),
      }))
      this.setData({
        achievements,
        unlockedCount: unlocked.length,
      })
    },

    goAchievements() {
      wx.navigateTo({ url: '/pages/achievements/achievements' })
    },

    goQuiz() {
      wx.navigateTo({ url: '/pages/quiz/quiz' })
    },

    async exportData() {
      const records = await getRecords()
      if (records.length === 0) {
        wx.showToast({ title: '暂无数据可导出', icon: 'none' })
        return
      }
      const json = JSON.stringify(records, null, 2)
      wx.setClipboardData({
        data: json,
        success: () => {
          wx.showToast({ title: '已复制到剪贴板', icon: 'none' })
        },
      })
    },
  },
})
