// pages/mine/login/login.js
import http from '../../utils/request.js'
import env from '../../config/env.config'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    api: {
      login: {
        url:'/users/wx',
        method:'put'
      }
    }
  },
  login(e) {
    const _this = this
    wx.login({
      success(res){
        const params = {
          wechatCode:res.code,
          userInfoEncryptedData:e.detail.encryptedData,
          userInfoIv:e.detail.iv,
          wechatAppId:env.env.appid,
        }
        http.wxRequest({..._this.data.api.login,params}).then(res=>{
          if(res.success){
            wx.setStorageSync('isLogin',1)
            wx.navigateBack({
              delta:1
            })
          }
        })
      }
    })
  }
})
