interface Challenge {
  id: string
  text: string
  bonus: number
}

const CHALLENGES: Challenge[] = [
  { id: 'c1',  text: '今天给TA发一句早安', bonus: 10 },
  { id: 'c2',  text: '给TA点一杯奶茶', bonus: 20 },
  { id: 'c3',  text: '夸TA今天很好看', bonus: 10 },
  { id: 'c4',  text: '主动问TA今天过得怎么样', bonus: 10 },
  { id: 'c5',  text: '给TA发一个小红包', bonus: 30 },
  { id: 'c6',  text: '帮TA做一件小事', bonus: 15 },
  { id: 'c7',  text: '给TA写一段暖心的话', bonus: 20 },
  { id: 'c8',  text: '记住TA说过的一件小事并提起', bonus: 25 },
  { id: 'c9',  text: '给TA推荐一首歌', bonus: 10 },
  { id: 'c10', text: '陪TA聊天超过30分钟', bonus: 20 },
  { id: 'c11', text: '给TA拍一张好看的照片', bonus: 15 },
  { id: 'c12', text: '带TA去吃一顿好的', bonus: 30 },
  { id: 'c13', text: '在TA难过时第一时间出现', bonus: 25 },
  { id: 'c14', text: '送TA一朵花（实体或emoji都算）', bonus: 15 },
  { id: 'c15', text: '给TA的朋友圈点赞+走心评论', bonus: 10 },
  { id: 'c16', text: '今天对TA说一句"辛苦了"', bonus: 10 },
  { id: 'c17', text: '主动为TA准备一份小惊喜', bonus: 30 },
  { id: 'c18', text: '把TA的头像设为手机壁纸（哪怕一天）', bonus: 20 },
  { id: 'c19', text: '给TA发一个搞笑表情包', bonus: 5 },
  { id: 'c20', text: '记录今天最想对TA说的一句话', bonus: 15 },
]

function getDayKey(): string {
  var d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
}

export function getTodayChallenge(): Challenge {
  var d = new Date()
  var start = new Date(d.getFullYear(), 0, 0).getTime()
  var dayOfYear = Math.floor((d.getTime() - start) / 86400000)
  return CHALLENGES[dayOfYear % CHALLENGES.length]
}

export function isChallengeCompleted(): boolean {
  var key = 'challenge_' + getDayKey()
  return !!wx.getStorageSync(key)
}

export function completeChallenge(): number {
  var key = 'challenge_' + getDayKey()
  var challenge = getTodayChallenge()
  wx.setStorageSync(key, true)
  return challenge.bonus
}

export function getChallengeStreak(): number {
  var streak = 0
  var d = new Date()
  for (var i = 0; i < 365; i++) {
    var key = 'challenge_' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    if (wx.getStorageSync(key)) {
      streak++
      d.setDate(d.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
