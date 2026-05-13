const BASE_URL = 'https://wx.we29.cn'

function getToken(): string {
  return wx.getStorageSync('auth_token') || ''
}

export function setToken(token: string): void {
  wx.setStorageSync('auth_token', token)
}

export function isLoggedIn(): boolean {
  return !!getToken()
}

export function request<T = any>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
}): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as T)
        } else {
          console.error(`[API] ${options.method || 'GET'} ${options.url} → ${res.statusCode}`, res.data)
          reject(new Error((res.data && res.data.message) || '请求失败'))
        }
      },
      fail: (err: any) => {
        console.error(`[API] 网络错误 ${options.url}`, err)
        reject(err)
      },
    })
  })
}

export function getUserInfo(): { nickname?: string; avatarUrl?: string } {
  return wx.getStorageSync('user_info') || {}
}

export function updateProfile(data: { nickname?: string; avatarUrl?: string }): Promise<any> {
  return request<any>({
    url: '/auth/profile',
    method: 'PUT',
    data,
  }).then((user) => {
    wx.setStorageSync('user_info', user)
    return user
  })
}

export function login(): Promise<void> {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('wx.login 未获取到 code'))
          return
        }
        request<{ token: string; user: any }>({
          url: '/auth/login',
          method: 'POST',
          data: { code: loginRes.code },
        })
          .then((data) => {
            setToken(data.token)
            if (data.user) {
              wx.setStorageSync('user_info', data.user)
            }
            resolve()
          })
          .catch(reject)
      },
      fail: reject,
    })
  })
}
