// pages/closet/closet.js
Page({
  data: {
    items: [],
    filteredItems: [],
    categories: { top: 0, bottom: 0, outer: 0, shoes: 0 },
    activeTab: 'all',
    uploading: false,
    hasCloset: false
  },

  onLoad() {
    this.loadCloset();
  },

  onShow() {
    this.loadCloset();
  },

  async loadCloset() {
    wx.showLoading({ title: '加载中...' });

    try {
      const res = await wx.cloud.callFunction({
        name: 'closetManager',
        data: { action: 'getCloset' }
      });

      if (res.result.success) {
        const items = res.result.items || [];
        this.setData({
          items,
          filteredItems: items,
          categories: res.result.categories,
          hasCloset: items.length > 0
        });
      }
    } catch (err) {
      console.error('加载衣橱失败', err);
    }

    wx.hideLoading();
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.filterItems();
  },

  filterItems() {
    const { items, activeTab } = this.data;
    let filtered = items;
    if (activeTab !== 'all') {
      filtered = items.filter(item => item.category === activeTab);
    }
    this.setData({ filteredItems: filtered });
  },

  async chooseImage() {
    const that = this;
    const category = this.data.activeTab === 'all' ? 'top' : this.data.activeTab;

    const res = await wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera']
    });

    if (res.tempFilePaths) {
      this.uploadImage(res.tempFilePaths[0], category);
    }
  },

  async uploadImage(filePath, category) {
    this.setData({ uploading: true });
    wx.showLoading({ title: '上传中...' });

    try {
      // 上传到云存储
      const cloudPath = `closet/${Date.now()}-${Math.random()}.png`;
      await wx.cloud.uploadFile({
        cloudPath,
        filePath
      });

      const uploadResult = await wx.cloud.callFunction({
        name: 'closetManager',
        data: {
          action: 'uploadClothing',
          data: {
            category,
            imageUrl: cloudPath,
            color: '待识别',
            season: 'all',
            style: 'casual',
            tags: []
          }
        }
      });

      if (uploadResult.result.success) {
        wx.showToast({ title: '上传成功', icon: 'success' });
        this.loadCloset();
      } else {
        wx.showToast({ title: '上传失败', icon: 'none' });
      }
    } catch (err) {
      console.error('上传失败', err);
      wx.showToast({ title: '上传失败', icon: 'none' });
    }

    this.setData({ uploading: false });
    wx.hideLoading();
  },

  async deleteItem(e) {
    const itemId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这件服饰吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await wx.cloud.callFunction({
              name: 'closetManager',
              data: {
                action: 'deleteClothing',
                data: { itemId }
              }
            });
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadCloset();
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  }
})