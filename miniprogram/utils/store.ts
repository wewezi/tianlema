import type { SimpRecord } from '../app'
import { request, isLoggedIn } from './api'

const KEY = 'simp_records'

export function getRecords(): SimpRecord[] {
  return wx.getStorageSync(KEY) || []
}

export function saveRecords(records: SimpRecord[]): void {
  wx.setStorageSync(KEY, records)
}

export function addRecord(record: SimpRecord): void {
  const records = getRecords()
  records.unshift(record)
  saveRecords(records)
  if (isLoggedIn()) {
    request({ url: '/records', method: 'POST', data: record }).catch(console.error)
  }
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter(r => r.id !== id)
  saveRecords(records)
  if (isLoggedIn()) {
    request({ url: `/records/${id}`, method: 'DELETE' }).catch(console.error)
  }
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function syncFromServer(): Promise<void> {
  const local = getRecords()

  // 先把本地未同步的记录推送到服务器
  const uploadPromise = local.length > 0
    ? request({ url: '/records/sync', method: 'POST', data: { records: local } }).catch(() => {})
    : Promise.resolve()

  return uploadPromise
    .then(() => request<SimpRecord[]>({ url: '/records' }))
    .then((serverRecords) => {
      // 以服务器数据为准，合并本地独有的记录（服务器可能还没收到）
      const serverIds = new Set(serverRecords.map(r => r.id))
      const localOnly = local.filter(r => !serverIds.has(r.id))
      saveRecords([...localOnly, ...serverRecords])
    })
    .catch((err) => {
      console.error('同步记录失败', err)
    })
}
