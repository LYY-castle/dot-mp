// pages/mine/login/login.js
import http from '../../utils/request.js'
import env from '../../config/env.config'
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // iconPhone: '/static/img/icon-phone.png',
    // iconCode: '/static/img/icon-code.png',
    // pwd: '/static/img/icon-pwd.png',
    // disabledLogin: true,
    // loginByCode: false,
    // phone: '',
    // validateCode: '',
    // name: '',
    // password: '',
    // msg: '发送验证码',
    // send: false,
    api: {
      login: {
        url:'/users/wx-ma/login',
        method:'post'

      }
    },
  },
  login(e) {
    // console.log(app)
    // const params = {
    //   wechatCode:app.globalData.wechatCode,
    //   userInfoEncryptedData:e.detail.encryptedData,
    //   userInfoIv:e.detail.iv,
    //   wechatAppId:env.env.appid,
    // }
    // wx.setStorageSync('parentId',res.data.parentId)
    // wx.setStorageSync('code',res.data.code)
    wx.setStorageSync('isLogin',1)
    wx.navigateBack({
      delta:1
    })
    // http.wxRequest({...this.data.api.login,params}).then(res=>{
    //   if(res.success){
    //     console.log(res)
    //   }
    // })

  }
})
