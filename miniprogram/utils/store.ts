import type { SimpRecord } from '../app'
import { request, isLoggedIn } from './api'

const KEY = 'simp_records'

export function getRecords(): Promise<SimpRecord[]> {
  if (!isLoggedIn()) return Promise.resolve([])
  return request<SimpRecord[]>({ url: '/records' })
    .catch((err) => {
      console.error('获取记录失败', err)
      return []
    })
}

export function addRecord(record: SimpRecord): Promise<void> {
  if (!isLoggedIn()) {
    return Promise.reject(new Error('请先登录'))
  }
  return request({ url: '/records', method: 'POST', data: record })
}

export function deleteRecord(id: string): Promise<void> {
  if (!isLoggedIn()) {
    return Promise.reject(new Error('请先登录'))
  }
  return request({ url: `/records/${id}`, method: 'DELETE' })
}

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}
