interface Question {
  q: string
  options: { text: string; score: number }[]
}

interface ResultType {
  min: number
  title: string
  icon: string
  desc: string
  color: string
}

const QUESTIONS: Question[] = [
  {
    q: '她说"我有点饿了"，你会？',
    options: [
      { text: '立刻点外卖送到她手上', score: 5 },
      { text: '问她想吃什么，一起点', score: 3 },
      { text: '说"我也是，各吃各的吧"', score: 1 },
    ],
  },
  {
    q: '她发了朋友圈自拍，你会？',
    options: [
      { text: '秒赞+评论"好好看！"', score: 5 },
      { text: '点个赞就好', score: 3 },
      { text: '刷过去，看不看缘分', score: 1 },
    ],
  },
  {
    q: '她半夜说"睡不着"，你会？',
    options: [
      { text: '立刻打电话陪她聊到睡着', score: 5 },
      { text: '发几条安慰消息', score: 3 },
      { text: '回一句"数羊试试"', score: 1 },
    ],
  },
  {
    q: '她说想要一个限量款包包，你会？',
    options: [
      { text: '不管多贵，买！', score: 5 },
      { text: '看看价格再说', score: 3 },
      { text: '建议她自己买', score: 1 },
    ],
  },
  {
    q: '她和别的男生聊天很开心，你会？',
    options: [
      { text: '没关系，她开心就好', score: 5 },
      { text: '有点酸，但不说', score: 3 },
      { text: '直接问清楚', score: 1 },
    ],
  },
  {
    q: '她已读不回你的消息，你会？',
    options: [
      { text: '再发几条嘘寒问暖', score: 5 },
      { text: '等等看，也许她忙', score: 3 },
      { text: '不回就算了', score: 1 },
    ],
  },
  {
    q: '约会时她迟到了40分钟，你会？',
    options: [
      { text: '没事没事，等多久都愿意', score: 5 },
      { text: '稍微抱怨一下', score: 3 },
      { text: '等15分钟就走了', score: 1 },
    ],
  },
  {
    q: '她让你帮她追别人，你会？',
    options: [
      { text: '忍痛帮忙，她幸福就好', score: 5 },
      { text: '找借口拒绝', score: 3 },
      { text: '直接表白', score: 1 },
    ],
  },
  {
    q: '她生日你会准备什么？',
    options: [
      { text: '精心策划惊喜+贵重礼物', score: 5 },
      { text: '送个礼物发个红包', score: 3 },
      { text: '发条祝福就行', score: 1 },
    ],
  },
  {
    q: '她说"你是个好人"，你会？',
    options: [
      { text: '开心！至少她认可我', score: 5 },
      { text: '感觉被发好人卡了', score: 3 },
      { text: '潇洒转身，下一个', score: 1 },
    ],
  },
]

const RESULTS: ResultType[] = [
  { min: 0,  title: '理性之神', icon: '🧊', desc: '你非常理性冷静，绝不会为任何人迷失自我。', color: '#3b82f6' },
  { min: 15, title: '微微心动', icon: '💭', desc: '你偶尔会心软，但还保持着底线。你知道什么时候该停下来，属于理性派。', color: '#8b5cf6' },
  { min: 25, title: '甘系暖心', icon: '☀️', desc: '你是标准的暖男/暖女型。对喜欢的人无微不至，但有时需要多爱自己一点。', color: '#f59e0b' },
  { min: 35, title: '资深付出者', icon: '👑', desc: '你已经深陷其中。为了喜欢的人可以付出一切，只希望对方能看你一眼。', color: '#ef4444' },
  { min: 45, title: '真心至尊', icon: '🛐', desc: '你的字典里没有“放弃”二字，感动天感动地，就是感动不了TA。', color: '#dc2626' },
]

function getResult(score: number): ResultType {
  let result = RESULTS[0]
  for (let i = RESULTS.length - 1; i >= 0; i--) {
    if (score >= RESULTS[i].min) {
      result = RESULTS[i]
      break
    }
  }
  return result
}

Component({
  data: {
    state: 'start' as 'start' | 'playing' | 'result',
    questions: QUESTIONS,
    currentIndex: 0,
    currentQ: QUESTIONS[0],
    totalScore: 0,
    result: RESULTS[0],
    progress: 0,
    totalQuestions: QUESTIONS.length,
  },
  methods: {
    startQuiz() {
      this.setData({
        state: 'playing',
        currentIndex: 0,
        currentQ: QUESTIONS[0],
        totalScore: 0,
        progress: 0,
      })
    },

    pickOption(e: any) {
      var score = Number(e.currentTarget.dataset.score)
      var nextIndex = this.data.currentIndex + 1
      var newTotal = this.data.totalScore + score

      if (nextIndex >= QUESTIONS.length) {
        var result = getResult(newTotal)
        this.setData({
          state: 'result',
          totalScore: newTotal,
          result: result,
          progress: 100,
        })
      } else {
        this.setData({
          currentIndex: nextIndex,
          currentQ: QUESTIONS[nextIndex],
          totalScore: newTotal,
          progress: Math.round((nextIndex / QUESTIONS.length) * 100),
        })
      }
    },

    shareResult() {
      var r = this.data.result
      wx.setClipboardData({
        data: r.icon + ' 我的真心测试结果：' + r.title + '\n' + r.desc + '\n快来测测你是什么类型！',
        success: function() {
          wx.showToast({ title: '已复制，去分享吧', icon: 'none' })
        },
      })
    },

    retry() {
      this.startQuiz()
    },

    goBack() {
      wx.navigateBack()
    },
  },
})
