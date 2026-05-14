import { ICONS } from '../../utils/meta'
import { addRecord, generateId, getRecords } from '../../utils/store'
import { formatDate } from '../../utils/util'
import type { SimpRecord } from '../../app'

const ACTIONS_OUT = ['请吃饭', '送礼物', '发红包', '买东西', '转账']
const ACTIONS_IN = ['收到红包', '收到转账', '对方回礼', '返现']
const ACTIONS_NONE = ['对方请客', '收到礼物', '陪聊天', '帮忙干活', '偷看主页', '梦见对方']

Component({
  data: {
    actions: ACTIONS_OUT,
    selectedAction: '',
    customAction: '',
    target: '',
    amount: '',
    simpIndex: 1,
    showAmountField: true,
    note: '',
    formType: 'out' as 'in' | 'out' | 'none',
    images: [] as string[],
    currentIcon: ICONS.EXPENSE,
    recentNames: [] as string[],
  },
  lifetimes: {
    attached() {
      this.loadRecentNames()
    }
  },
  methods: {
    switchFormType(e: any) {
      const type = e.currentTarget.dataset.type as 'in' | 'out' | 'none'
      let actions = ACTIONS_OUT
      if (type === 'in') actions = ACTIONS_IN
      else if (type === 'none') actions = ACTIONS_NONE

      const currentIcon = type === 'out' ? ICONS.EXPENSE : (type === 'in' ? ICONS.INCOME : ICONS.DAILY)
      this.setData({ 
        formType: type,
        actions,
        selectedAction: '',
        customAction: '',
        amount: '',
        currentIcon,
      })
      wx.vibrateShort({ type: 'light' })
    },

    loadRecentNames() {
      const records = getRecords()
      const names = records
        .map(r => r.target.trim())
        .filter(n => !!n)
      
      // Keep unique and limited to 5
      const uniqueNames = Array.from(new Set(names)).slice(0, 5)
      this.setData({ recentNames: uniqueNames })
    },

    pickName(e: any) {
      const name = e.currentTarget.dataset.v
      this.setData({ target: name })
      wx.vibrateShort({ type: 'light' })
    },

    pickAction(e: any) {
      const action = e.currentTarget.dataset.v
      this.setData({
        selectedAction: action,
        customAction: '',
      })
      this.updateSimpIndex()
    },

    openCustomModal() {
      wx.showModal({
        title: '记录一段独特轨迹',
        editable: true,
        placeholderText: '例如：换了情侣头像',
        content: this.data.customAction,
        success: (res) => {
          if (res.confirm) {
            this.setData({
              customAction: res.content.trim(),
              selectedAction: '',
            })
            this.updateSimpIndex()
            wx.vibrateShort({ type: 'light' })
          }
        }
      })
    },

    onTarget(e: any) {
      this.setData({ target: e.detail.value })
    },

    onAmount(e: any) {
      this.setData({ amount: e.detail.value })
      this.updateSimpIndex()
    },

    onNote(e: any) {
      this.setData({ note: e.detail.value })
    },

    chooseImage() {
      wx.chooseMedia({
        count: 9 - this.data.images.length,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const newImages = res.tempFiles.map(f => f.tempFilePath)
          this.setData({
            images: [...this.data.images, ...newImages]
          })
          wx.vibrateShort({ type: 'light' })
        }
      })
    },

    deleteImage(e: any) {
      const idx = e.currentTarget.dataset.idx
      const images = [...this.data.images]
      images.splice(idx, 1)
      this.setData({ images })
      wx.vibrateShort({ type: 'light' })
    },

    previewImage(e: any) {
      const current = e.currentTarget.dataset.src
      wx.previewImage({
        current,
        urls: this.data.images
      })
    },

    pickStar(e: any) {
      wx.vibrateShort({ type: 'light' })
      this.setData({ simpIndex: e.currentTarget.dataset.v })
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

    submit() {
      const action = (this.data.selectedAction || this.data.customAction).trim()
      if (!action) {
        wx.showToast({ title: '请选择或输入轨迹', icon: 'none' })
        return
      }
      if (!this.data.target.trim()) {
        wx.showToast({ title: '请输入对方的名字', icon: 'none' })
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
        type: this.data.formType,
        images: this.data.images,
      }

      addRecord(record)
      wx.vibrateShort({ type: 'medium' })
      
      wx.showToast({ title: '已镌刻', icon: 'success' })
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    }
  }
})
