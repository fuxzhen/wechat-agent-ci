// pages/index/index.js
Page({
  data: {
    profile: null,
    todayRecommendation: null,
    loading: true
  },

  onLoad() {
    this.loadData();
  },

  async loadData() {
    this.setData({ loading: true });

    try {
      // 获取用户配置
      const profileRes = await wx.cloud.callFunction({
        name: 'baziFashion',
        data: { action: 'getProfile' }
      });

      if (profileRes.result.success && profileRes.result.data) {
        this.setData({ profile: profileRes.result.data });

        // 如果有生日，获取今日穿搭
        if (profileRes.result.data.birth) {
          const birth = profileRes.result.data.birth;
          const analyzeRes = await wx.cloud.callFunction({
            name: 'baziFashion',
            data: {
              action: 'analyze',
              data: {
                year: birth.year,
                month: birth.month,
                day: birth.day,
                hour: birth.hour || 8
              }
            }
          });

          if (analyzeRes.result.success) {
            this.setData({ todayRecommendation: analyzeRes.result.data });
          }
        }
      }
    } catch (err) {
      console.log('加载数据失败', err);
    }

    this.setData({ loading: false });
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  goToCloset() {
    wx.navigateTo({ url: '/pages/closet/closet' });
  },

  goToOutfit() {
    wx.navigateTo({ url: '/pages/outfit/outfit' });
  },

  async goToOnboarding() {
    if (this.data.profile && this.data.profile.birth) {
      // 有配置，直接生成穿搭
      wx.navigateTo({ url: '/pages/outfit/outfit' });
    } else {
      // 无配置，跳转设置
      wx.navigateTo({ url: '/pages/settings/settings' });
    }
  }
})