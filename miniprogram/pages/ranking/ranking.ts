import { request } from '../../utils/api'
import { formatScore } from '../../utils/rank'

interface DisplayRankUser {
  rank: number
  name: string
  avatar: string
  title: string
  scoreDisplay: string
  posClass: string
  isYou: boolean
}

Component({
  data: {
    ranking: [] as DisplayRankUser[],
    yourScore: '0',
    yourRank: 0,
  },
  lifetimes: {
    attached() {
      this.loadRanking()
    },
  },
  methods: {
    loadRanking() {
      var self = this as any
      request<any[]>({ url: '/stats/ranking' })
        .then(function(rawRanking: any[]) {
          var ranking = rawRanking.map(function(r: any, i: number) {
            return {
              rank: r.rank,
              name: r.isYou ? '你' : r.nickname,
              avatar: r.isYou ? '🌟' : r.avatar,
              title: r.title,
              scoreDisplay: formatScore(r.score),
              posClass: i < 3 ? 'pos-' + (i + 1) : 'pos-x',
              isYou: r.isYou,
            }
          })
          var you = null as any
          for (var i = 0; i < ranking.length; i++) {
            if (ranking[i].isYou) { you = ranking[i]; break }
          }
          self.setData({
            ranking: ranking,
            yourScore: you ? you.scoreDisplay : '0',
            yourRank: you ? you.rank : 0,
          })
        })
        .catch(function(err: any) { console.error('加载排行榜失败', err) })
    },
  },
})
