import { request, isLoggedIn } from '../../utils/api'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    todos: [] as any[],
    inputValue: '',
    completedCount: 0,
    pendingCount: 0,
    loading: false,
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.loadTodos()
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadTodos().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onInput(e: any) {
    this.setData({ inputValue: e.detail.value })
  },

  async loadTodos() {
    if (!isLoggedIn()) return
    
    this.setData({ loading: true })
    try {
      const list = await request({ url: '/todos' })
      const enriched = (list || []).map((item: any) => ({
        ...item,
        timeLabel: this.formatTime(item.createdAt)
      }))
      
      const completedCount = enriched.filter((t: any) => t.completed).length
      this.setData({
        todos: enriched,
        completedCount: completedCount,
        pendingCount: enriched.length - completedCount,
        loading: false
      })
    } catch (err) {
      this.setData({ loading: false })
      console.error('加载待办失败', err)
    }
  },

  async addTodo() {
    const title = this.data.inputValue.trim()
    if (!title) return

    wx.showLoading({ title: '记录中...' })
    try {
      await request({
        url: '/todos',
        method: 'POST',
        data: { title: title }
      })
      this.setData({ inputValue: '' })
      await this.loadTodos()
      wx.hideLoading()
      wx.vibrateShort({ type: 'medium' })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '记录失败', icon: 'none' })
    }
  },

  async toggleTodo(e: any) {
    const id = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'light' })
    
    try {
      await request({
        url: `/todos/${id}/toggle`,
        method: 'POST'
      })
      await this.loadTodos()
    } catch (err) {
      console.error('切换状态失败', err)
    }
  },

  deleteTodo(e: any) {
    const id = e.currentTarget.dataset.id
    wx.vibrateShort({ type: 'medium' })
    
    wx.showModal({
      title: '删除待办',
      content: '真的要删除这条心愿吗？',
      confirmColor: '#ef4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            await request({
              url: `/todos/${id}`,
              method: 'DELETE'
            })
            await this.loadTodos()
            wx.showToast({ title: '已删除', icon: 'none' })
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  formatTime(dateStr: string): string {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return '刚刚'
    if (mins < 60) return `${mins}分钟前`
    
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}小时前`
    
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
})
