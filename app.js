import http from './utils/request'
App({
  data: {
    login: {
      url: '/users/wx-ma/login',
      method: 'post'
    }
  },
  onLaunch: function (options) {
    console.log('options', options)
    // 静默登录
    wx.login({
      success: res => {
        this.globalData.wechatCode = res.code
      }
    })
  },
  getLaunchOptionsSync: function (option) {
    console.log(option)
  },

  globalData: {
    wechatCode: null,
    promoCode: null
  }
})