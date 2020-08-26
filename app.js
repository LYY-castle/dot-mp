//app.js
import http from './utils/request'
App({
  onLaunch: function () {

      // 登录
    wx.login({
      success: res => {
        console.log('login赋值')
        this.globalData.wechatCode = res.code
      }
    })

  },
  getLaunchOptionsSync:function(option){
    console.log(option)
  },

  globalData: {
    userInfo: null,
    phone:null,
    wechatCode:null,
    promoCode:null
  }
})
