import http from './utils/request'
import env from './config/env.config'
App({
  data: {
    login: {
      url: '/auth/wx/login',
      method: 'post'
    }
  },
  onLaunch: function (options) {
    console.log('options', options)
    // 静默登录
    wx.login({
      success: res => {
        this.globalData.wechatCode = res.code
        console.log(res.code)
        const params = {
          wechatAppId:env.env.appid,
          wechatCode:res.code
        }
        http.wxRequest({...this.data.login,params}).then(res=>{
          if(res.success){
            wx.setStorageSync('openId',res.data.weixinOpenid)
            wx.setStorageSync('userId',res.data.id)
            wx.reLaunch({
              url: '/pages/index/index'
            })
          }else{
            console.log('请求失败',res)
          }
        })
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
