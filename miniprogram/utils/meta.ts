export interface ActionMeta {
  icon: string
  color: string
}

const META_MAP: Record<string, ActionMeta> = {
  '请吃饭': { icon: '🍚', color: '#ff7a59' },
  '送礼物': { icon: '🎁', color: '#ff6b81' },
  '发红包': { icon: '🧧', color: '#dc2626' },
  '陪聊天': { icon: '💬', color: '#3b82f6' },
  '帮忙干活': { icon: '🔧', color: '#6b7280' },
}

const DEFAULT_META: ActionMeta = { icon: '🐾', color: '#ff6b81' }

export function getActionMeta(action: string): ActionMeta {
  return META_MAP[action] || DEFAULT_META
}
