import { request, isLoggedIn } from '../../utils/api'

interface ConfessionItem {
  id: string
  content: string
  sympathy: number
  deserved: number
  createdAt: string
  timeAgo: string
}

function timeAgo(dateStr: string): string {
  var now = Date.now()
  var diff = now - new Date(dateStr).getTime()
  var min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return min + '分钟前'
  var h = Math.floor(min / 60)
  if (h < 24) return h + '小时前'
  var d = Math.floor(h / 24)
  if (d < 30) return d + '天前'
  return Math.floor(d / 30) + '个月前'
}

Component({
  data: {
    confessions: [] as ConfessionItem[],
    inputText: '',
    showForm: false,
    loading: true,
  },
  pageLifetimes: {
    show() {
      this.loadList()
    },
  },
  methods: {
    onPullDownRefresh() {
      this.loadList()
      wx.stopPullDownRefresh()
    },

    loadList() {
      var self = this as any
      self.setData({ loading: true })
      request<any[]>({ url: '/treehole' })
        .then(function(list: any[]) {
          var confessions = list.map(function(item: any) {
            return {
              id: item.id,
              content: item.content,
              sympathy: item.sympathy || 0,
              deserved: item.deserved || 0,
              createdAt: item.createdAt,
              timeAgo: timeAgo(item.createdAt),
            }
          })
          self.setData({ confessions: confessions, loading: false })
        })
        .catch(function(err: any) {
          console.error('加载树洞失败', err)
          self.setData({ loading: false })
        })
    },

    openForm() {
      this.setData({ showForm: true, inputText: '' })
    },

    closeForm() {
      this.setData({ showForm: false })
    },

    onInput(e: any) {
      this.setData({ inputText: e.detail.value })
    },

    submit() {
      var self = this as any
      var content = self.data.inputText.trim()
      if (content.length < 5) {
        wx.showToast({ title: '至少写5个字哦', icon: 'none' })
        return
      }
      if (!isLoggedIn()) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        return
      }
      request({
        url: '/treehole',
        method: 'POST',
        data: { content: content },
      })
        .then(function() {
          wx.showToast({ title: '发布成功', icon: 'none' })
          self.setData({ showForm: false })
          self.loadList()
        })
        .catch(function(err: any) {
          console.error('发布失败', err)
          wx.showToast({ title: '发布失败', icon: 'none' })
        })
    },

    voteSympathy(e: any) {
      wx.vibrateShort({ type: 'light' })
      var self = this as any
      var id = e.currentTarget.dataset.id
      request({ url: '/treehole/' + id + '/vote', method: 'PUT', data: { type: 'sympathy' } })
        .then(function() { self.loadList() })
        .catch(console.error)
    },

    voteDeserved(e: any) {
      wx.vibrateShort({ type: 'light' })
      var self = this as any
      var id = e.currentTarget.dataset.id
      request({ url: '/treehole/' + id + '/vote', method: 'PUT', data: { type: 'deserved' } })
        .then(function() { self.loadList() })
        .catch(console.error)
    },

    goBack() {
      wx.navigateBack()
    },
  },
})
