// pages/settings/settings.js
Page({
  data: {
    name: '',
    birth: {
      year: null,
      month: null,
      day: null,
      hour: 8
    },
    years: [],
    months: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    days: [],
    hours: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23']
  },

  onLoad() {
    // 生成年份数组 (1950-2025)
    const years = [];
    for (let i = 2025; i >= 1950; i--) {
      years.push(String(i));
    }
    this.setData({ years });

    // 生成天数 (默认31)
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(String(i));
    }
    this.setData({ days });

    // 尝试加载已有配置
    this.loadExistingProfile();
  },

  async loadExistingProfile() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'baziFashion',
        data: { action: 'getProfile' }
      });
      
      if (res.result.success && res.result.data) {
        this.setData({
          name: res.result.data.name || '',
          birth: res.result.data.birth || { year: null, month: null, day: null, hour: 8 }
        });
      }
    } catch (err) {
      console.log('无历史配置');
    }
  },

  onYearChange(e) {
    this.setData({ 'birth.year': Number(this.data.years[e.detail.value]) });
  },

  onMonthChange(e) {
    this.setData({ 'birth.month': Number(this.data.months[e.detail.value]) });
  },

  onDayChange(e) {
    this.setData({ 'birth.day': Number(this.data.days[e.detail.value]) });
  },

  onHourChange(e) {
    this.setData({ 'birth.hour': Number(this.data.hours[e.detail.value]) });
  },

  async saveProfile() {
    const { birth, name } = this.data;
    
    if (!birth.year || !birth.month || !birth.day) {
      wx.showToast({ title: '请完善生日信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'baziFashion',
        data: {
          action: 'saveProfile',
          name,
          birth
        }
      });

      if (res.result.success) {
        wx.showToast({ title: '保存成功', icon: 'success' });
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      } else {
        wx.showToast({ title: '保存失败', icon: 'none' });
      }
    } catch (err) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }

    wx.hideLoading();
  }
})
