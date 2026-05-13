import { getRecords } from '../../utils/store'
import { ACHIEVEMENTS, getUnlockedAchievements } from '../../utils/achievements'

Component({
  data: {
    achievements: [] as { icon: string; title: string; desc: string; unlocked: boolean }[],
    unlockedCount: 0,
    totalCount: ACHIEVEMENTS.length,
  },
  lifetimes: {
    attached() {
      this.loadAchievements()
    },
  },
  methods: {
    loadAchievements() {
      var records = getRecords()
      var unlocked = getUnlockedAchievements(records)
      var unlockedIds: Record<string, boolean> = {}
      for (var i = 0; i < unlocked.length; i++) {
        unlockedIds[unlocked[i].id] = true
      }
      var achievements = ACHIEVEMENTS.map(function(a) {
        return {
          icon: a.icon,
          title: a.title,
          desc: a.desc,
          unlocked: !!unlockedIds[a.id],
        }
      })
      this.setData({
        achievements: achievements,
        unlockedCount: unlocked.length,
      })
    },
  },
})
