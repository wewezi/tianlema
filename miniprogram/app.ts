import { login } from './utils/api'
import { syncFromServer } from './utils/store'

export interface SimpRecord {
  id: string
  action: string
  target: string
  amount: number
  simpIndex: number
  date: string
  note: string
  type?: 'in' | 'out' | 'none'
  images?: string[]
}

App<IAppOption>({
  globalData: {},
  onLaunch() {
    const records = wx.getStorageSync('simp_records')
    if (!records) {
      wx.setStorageSync('simp_records', [])
    }
    login()
      .then(() => syncFromServer())
      .then(() => console.log('登录并同步成功'))
      .catch((err) => console.error('启动同步失败', err))
  },
})
