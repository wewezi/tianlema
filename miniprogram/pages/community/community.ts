import { request, isLoggedIn } from '../../utils/api'
import { formatScore } from '../../utils/rank'

interface Quote {
  text: string
  author: string
}

interface ConfessionItem {
  id: string
  content: string
  sympathy: number
  deserved: number
  timeAgo: string
}

interface DisplayRankUser {
  rank: number
  name: string
  avatar: string
  title: string
  score: number
  scoreDisplay: string
  posClass: string
  isYou: boolean
}

const QUOTES: Quote[] = [
  { text: '今天你付出了吗？', author: '鲁迅' },
  { text: '付出到最后，应有尽有', author: '论语' },
  { text: '她不爱你，但她的购物车很爱你', author: '佚名' },
  { text: '宁愿为你付出，也不愿对别人上心', author: '佚名' },
  { text: '她回我消息了！虽然只是一个"哦"', author: '日记' },
  { text: '原来你也想成为我的人', author: '佚名' },
  { text: '我永远会站在原地等你，只要你不让我走', author: '箴言' },
  { text: '她让我感觉到了快乐，那是我的错觉', author: '感悟' },
  { text: '只要你愿意理我，多少钱我都愿意花', author: '宣言' },
  { text: '真心，是一种态度；放下，是一种勇气', author: '哲学' },
  { text: '我对她千万好，她以为我什么都没做', author: '佚名' },
  { text: '不是我不努力，是她真的不爱', author: '佚名' },
  { text: '她在的时候你不珍惜，她走了你说她绝情', author: '佚名' },
  { text: '我以为我是你的特别，原来我是你的常态', author: '佚名' },
]

function formatTime(dateStr: string): string {
  const now = Date.now()
  const d = new Date(dateStr).getTime()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 2) return '昨天'
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`
  return dateStr.slice(0, 10)
}

Component({
  data: {
    dailyQuote: { text: '', author: '' } as Quote,
    confessions: [] as ConfessionItem[],
    confessionsPreview: [] as ConfessionItem[],
    showPostForm: false,
    postInput: '',
    ranking: [] as DisplayRankUser[],
    rankingTop3: [] as DisplayRankUser[],
    yourScore: '0',
    yourRank: 0,
    loading: true,
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' && this.getTabBar()) {
        this.getTabBar().setData({ selected: 2 })
      }
      this.loadFeed()
    },
  },
  methods: {
    onPullDownRefresh() {
      this.loadFeed()
      wx.stopPullDownRefresh()
    },

    loadFeed() {
      const start = new Date(new Date().getFullYear(), 0, 0).getTime()
      const dayOfYear = Math.floor((Date.now() - start) / 86400000)
      const dailyQuote = QUOTES[dayOfYear % QUOTES.length]
      this.setData({ dailyQuote, loading: true })

      Promise.all([this.loadConfessions(), this.loadRanking()])
        .then(() => this.setData({ loading: false }))
        .catch(() => this.setData({ loading: false }))
    },

    loadConfessions() {
      var self = this as any
      return request<any[]>({ url: '/treehole' })
        .then(function(list: any[]) {
          var confessions = list.map(function(item: any) {
            return {
              id: item.id,
              content: item.content,
              sympathy: item.sympathy || 0,
              deserved: item.deserved || 0,
              timeAgo: formatTime(item.createdAt),
            }
          })
          self.setData({ confessions: confessions, confessionsPreview: confessions.slice(0, 3) })
        })
        .catch(function(err: any) { console.error('加载树洞失败', err) })
    },

    loadRanking() {
      return request<any[]>({ url: '/stats/ranking' })
        .then((rawRanking) => {
          const ranking: DisplayRankUser[] = rawRanking.map((r, i) => ({
            rank: r.rank,
            name: r.isYou ? '你' : r.nickname,
            avatar: r.isYou ? '🌟' : r.avatar,
            title: r.title,
            score: r.score,
            scoreDisplay: formatScore(r.score),
            posClass: i < 3 ? `pos-${i + 1}` : 'pos-x',
            isYou: r.isYou,
          }))
          const you = ranking.find(u => u.isYou)
          this.setData({
            ranking,
            rankingTop3: ranking.slice(0, 3),
            yourScore: you ? formatScore(you.score) : '0',
            yourRank: you ? you.rank : 0,
          })
        })
        .catch((err) => console.error('加载排行榜失败', err))
    },

    goRankingPage() {
      wx.navigateTo({ url: '/pages/ranking/ranking' })
    },

    goTreeholePage() {
      wx.navigateTo({ url: '/pages/treehole/treehole' })
    },

    openPostForm() {
      this.setData({ showPostForm: true, postInput: '' })
    },

    closePostForm() {
      this.setData({ showPostForm: false })
    },

    onPostInput(e: any) {
      this.setData({ postInput: e.detail.value })
    },

    submitPost() {
      var self = this as any
      var content = self.data.postInput.trim()
      if (content.length < 5) {
        wx.showToast({ title: '至少写5个字哦', icon: 'none' })
        return
      }
      if (!isLoggedIn()) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      request({ url: '/treehole', method: 'POST', data: { content: content } })
        .then(function() {
          wx.showToast({ title: '发布成功', icon: 'none' })
          self.setData({ showPostForm: false })
          self.loadConfessions()
        })
        .catch(function() {
          wx.showToast({ title: '发布失败', icon: 'none' })
        })
    },

    voteSympathy(e: any) {
      wx.vibrateShort({ type: 'light' })
      var self = this as any
      var id = e.currentTarget.dataset.id
      request({ url: '/treehole/' + id + '/vote', method: 'PUT', data: { type: 'sympathy' } })
        .then(function() { self.loadConfessions() })
        .catch(console.error)
    },

    voteDeserved(e: any) {
      wx.vibrateShort({ type: 'light' })
      var self = this as any
      var id = e.currentTarget.dataset.id
      request({ url: '/treehole/' + id + '/vote', method: 'PUT', data: { type: 'deserved' } })
        .then(function() { self.loadConfessions() })
        .catch(console.error)
    },

    copyDaily() {
      const q = this.data.dailyQuote
      wx.setClipboardData({
        data: `"${q.text}" — ${q.author}`,
        success: () => {
          wx.showToast({ title: '已复制', icon: 'none' })
        },
      })
    },
  },
})
