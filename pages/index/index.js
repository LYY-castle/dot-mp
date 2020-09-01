//index.js
import env from '../../config/env.config'
import http from '../../utils/request'
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    userInfoShow:true,
    phoneShow:false,
    codeShow:false,
    phone:null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIusePhone:wx.canIUse('button.open-type.getPhoneNumber'),
    api:{
      login:{
        url:'/users/wx-ma/login',
        method:'post'
      }
    },
  },
  bindGetUserInfo(e) {
    const _this = this
    console.log(e)
    if(e.detail.userInfo){
      app.globalData.userInfo = e.detail
      _this.setData({
        userInfoShow:false,
        phoneShow:true
      })
    }
  },
  bindGetPhoneNumber (e) {
      app.globalData.phone = e.detail
        this.setData({
          phoneShow:false,
        })
        this.login()
  },
  loginByCode(e){
    const _this = this
    app.globalData.promoCode = 'FQAC'
    wx.login({
      success: res => {
        app.globalData.wechatCode = res.code
        wx.getUserInfo({
          lang:'zh_CN',
          success:res=>{
            app.globalData.userInfo = res
            this.login()
          }
        })
      }
    })
  },
  login(){
    const params = {
      phoneEncryptedData:app.globalData.phone.encryptedData,
      phoneIv:app.globalData.phone.iv,
      promoCode:app.globalData.promoCode,
      userInfoEncryptedData:app.globalData.userInfo.encryptedData,
      userInfoIv:app.globalData.userInfo.iv,
      wechatAppId:env.env.appid,
      wechatCode:app.globalData.wechatCode,
    }
    http.wxRequest({...this.data.api.login,params}).then(res=>{
      if(res.success){
        wx.setStorageSync('userId',res.data.id)
        wx.setStorageSync('parentId',res.data.parentId)
        wx.setStorageSync('code',res.data.code)
        wx.setStorageSync('openId',res.data.openId)
        wx.switchTab({
          url: '../product/index'
        })
      }else{
        console.log(res.code)
        if(res.code===403){
          this.setData({
            codeShow:true
          })
        }
      }
    })
  },
  onLoad: function (options) {
    console.log('启动页面的参数',options)
    const _this = this
    const code = wx.getStorageSync('code')
    if(code){
      wx.switchTab({
        url: '../product/index'
      })
    }else{
      wx.getSetting({
        success (res) {
          if(res.authSetting['scope.userInfo']){
            _this.setData({
              userInfoShow:false,
              phoneShow:true
            })
            wx.getUserInfo({
              lang:'zh_CN',
              success:res=>{
                console.log('用户信息',res)
                app.globalData.userInfo = res
              }
            })
          }else{
            _this.setData({
              userInfoShow:true,
              phoneShow:false
            })
          }
        }
      })
    }
  }
})
