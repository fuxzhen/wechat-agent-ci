// pages/outfit/outfit.js
Page({
  data: {
    outfits: [],
    loading: false,
    occasion: '日常',
    profile: null,
    hasCloset: false,
    occasions: ['日常', '工作', '约会', '聚会', '运动'],
    currentSeason: 'spring'
  },

  onLoad() {
    this.loadProfile();
    this.checkCloset();
  },

  async checkCloset() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'closetManager',
        data: { action: 'getCloset' }
      });
      
      const hasCloset = res.result.success && res.result.items && res.result.items.length >= 2;
      this.setData({ hasCloset });
      
      if (!hasCloset) {
        wx.showModal({
          title: '提示',
          content: '衣橱服饰不足，请先上传至少上衣和下装',
          showCancel: false
        });
      }
    } catch (err) {
      this.setData({ hasCloset: false });
    }
  },

  async loadProfile() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'baziFashion',
        data: { action: 'getProfile' }
      });
      
      if (res.result.success && res.result.data && res.result.data.birth) {
        this.setData({ profile: res.result.data });
      }
    } catch (err) {
      console.log('未设置八字', err);
    }
  },

  async selectOccasion(e) {
    const occasion = e.currentTarget.dataset.occasion;
    this.setData({ occasion });
  },

  async generateOutfit() {
    if (!this.data.hasCloset) {
      wx.showToast({ title: '请先完善衣橱', icon: 'none' });
      return;
    }

    this.setData({ loading: true, outfits: [] });
    wx.showLoading({ title: '智能搭配中...' });

    try {
      // 获取用户的八字喜神
      let baziElement = null;
      if (this.data.profile && this.data.profile.birth) {
        try {
          const baziRes = await wx.cloud.callFunction({
            name: 'baziFashion',
            data: {
              action: 'analyze',
              data: this.data.profile.birth
            }
          });
          if (baziRes.result.success) {
            baziElement = baziRes.result.data.recommendation.lucky_element;
          }
        } catch (e) {
          console.log('八字分析失败', e);
        }
      }

      // 生成穿搭
      const res = await wx.cloud.callFunction({
        name: 'closetManager',
        data: {
          action: 'generateOutfit',
          data: {
            occasion: this.data.occasion,
            baziElement
          }
        }
      });

      if (res.result.success) {
        this.setData({
          outfits: res.result.outfits,
          currentSeason: res.result.meta.season
        });
      } else {
        wx.showToast({ title: res.result.error, icon: 'none' });
      }
    } catch (err) {
      console.error('生成穿搭失败', err);
      wx.showToast({ title: '生成失败', icon: 'none' });
    }

    this.setData({ loading: false });
    wx.hideLoading();
  },

  async saveOutfit(e) {
    const index = e.currentTarget.dataset.index;
    const outfit = this.data.outfits[index];
    
    wx.showToast({ title: '已保存', icon: 'success' });
  },

  goToCloset() {
    wx.navigateTo({ url: '/pages/closet/closet' });
  }
})