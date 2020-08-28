// pages/mine/login/login.js
import http from '../../utils/request.js'
import Crypto from '../../utils/crypto'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    iconPhone: '/static/img/icon-phone.png',
    iconCode: '/static/img/icon-code.png',
    pwd: '/static/img/icon-pwd.png',
    disabledLogin: true,
    loginByCode: false,
    phone: '',
    validateCode: '',
    name: '',
    password: '',
    msg: '发送验证码',
    send: false,
    api: {
      sendCode: {
        url: '/users/send-validate-code',
        method: 'post'
      },
      login: {
        url: '/users/login',
        method: 'post'
      },
      getGroups: {
        url: '/usergroup-users',
        method: 'get'
      }
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(Crypto.encrypt())
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  clickButtonText() {
    console.log(this.data.loginByCode)
    this.setData({
      loginByCode:!this.data.loginByCode
    })
  },
  submit(e) {
    const plainStr = e.detail.value.password
    e.detail.value.password = Crypto.encrypt({
      plainStr
    })
    const params = {
      ...e.detail.value,
      loginType:this.data.loginByCode?1:0
    }
    http.wxRequest({
      ...this.data.api.login,
      params
    }).then(res=>{
      if(res.success){
        wx.setStorageSync('userId',res.data.id)
        wx.setStorageSync('parentId',res.data.parentId)
        wx.setStorageSync('code',res.data.code)
        wx.reLaunch({
          url: '../../pages/product/index'
        })
      }
    })
  }
})
