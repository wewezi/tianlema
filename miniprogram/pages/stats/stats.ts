import { getRecords } from '../../utils/store'
import { request, isLoggedIn, getUserInfo, updateProfile, BASE_URL, uploadFile } from '../../utils/api'
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
      let avatarUrl = info.avatarUrl || ''
      if (avatarUrl && avatarUrl.startsWith('/')) {
        avatarUrl = BASE_URL + avatarUrl
      }
      this.setData({
        nickname: info.nickname || '',
        avatarUrl: avatarUrl,
      })
    },

    async onChooseAvatar(e: any) {
      const localAvatarUrl = e.detail.avatarUrl
      if (!localAvatarUrl) return

      wx.showLoading({ title: '上传中...', mask: true })
      try {
        // 1. 上传头像到服务器
        const serverAvatarUrl = await uploadFile(localAvatarUrl)
        
        // 2. 更新个人资料
        await updateProfile({ avatarUrl: serverAvatarUrl })
        
        // 3. 更新页面显示（带上域名）
        this.setData({ avatarUrl: BASE_URL + serverAvatarUrl })
        wx.hideLoading()
        wx.showToast({ title: '头像已同步', icon: 'success' })
      } catch (err) {
        wx.hideLoading()
        console.error('更新头像失败', err)
        wx.showToast({ title: '更新失败', icon: 'none' })
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

    clearAllData() {
      wx.showModal({
        title: '确认销毁',
        content: '这将永久删除服务器上所有的记录，此操作不可恢复！',
        confirmText: '销毁',
        confirmColor: '#ef4444',
        success: async (res) => {
          if (res.confirm) {
            try {
              wx.showLoading({ title: '正在销毁...', mask: true })
              await request({ url: '/records', method: 'DELETE' })
              wx.hideLoading()
              wx.showToast({ title: '已全部销毁', icon: 'success' })
              this.loadStats()
              this.loadAchievements()
            } catch (err) {
              wx.hideLoading()
              wx.showToast({ title: '操作失败', icon: 'none' })
              console.error('销毁失败', err)
            }
          }
        },
      })
    },
  },
})
