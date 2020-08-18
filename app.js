//app.js
import http from './utils/request'
App({
  onLaunch: function () {
    // 登录
    wx.login({
      success: res => {
        const loginParams = {
          url: '/users/login',
          method: 'post'
        }
        const params = {
          code:res.code
        }
        console.log(params)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        http.wxRequest({...loginParams,params}).then(result=>{
          console.log(result)
        })

      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            lang:'zh_CN',
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              console.log('globaldata',this.globalData)
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    phone:null
  }
})
