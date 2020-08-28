// pages/scatter-dots/scatter-dots.js
import http from '../../utils/request.js' //相对路径
import tool from '../../utils/mixin.js'
import constantCfg from '../../config/constant'
import env from '../../config/env.config'
import Crypto from '../../utils/crypto'
// const QR = require("../../utils/qrcode.min.js")
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bg: '/static/img/bg.png',
    allUrl: '',
    codeUrl:'',
    name: '',
    avatar: '/static/img/avatar.png',
    headImage: null,
    imagePath:'',
    api: {
      getUserInfo: {
        url: '/users/{id}',
        method: 'get'
      },
      getAccessToken:{
        url:'https://api.weixin.qq.com/cgi-bin/token',
        method:'get'
      },
      getQRcode:{
        url:'/wx-ma/generate/ma-code',
        method:'get'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options',options)
    // that.createQrCode(goods_url, "mycanvas", size.w, size.h)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },
  onShow: function () {
    const params = {
      params:'https://dot-dev.com',
      wechatAppId:env.env.appid
    }
    const header = {
      'authorization':wx.getStorageSync('authorization')
    }
    wx.request({
      url:env.env.VUE_APP_BASE_URL+this.data.api.getQRcode.url,
      header,
      responseType:'arrayBuffer',
      data:params,
      success:res=>{
        console.log(res)
        let url ='data:image/png;base64,'+wx.arrayBufferToBase64(res.data)
        this.setData({
          codeUrl:url
        })
      }
    })
    Promise.resolve()
      .then(() => tool.checkToken())
      .then(() => this.getUserInfo())
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
  // 获取用户的头像信息
  getUserInfo() {
    return new Promise(resolve => {
      const id = wx.getStorageSync('userId')
      http.wxRequest({
          ...this.data.api.getUserInfo,
          urlReplacements: [{
            substr: '{id}',
            replacement: id
          }]
        })
        .then(res => {
          if (res.success) {
            const registerPages = 'pages/mine/register/register'
            const query = Crypto.encrypt({
              plainStr: `promoCode=${wx.getStorageSync('code')}`
            })
            this.setData({
                name: res.data.name,
                headImage: res.data.headImage,
                allUrl:env.env.productionHost+registerPages+'?param='+query
            })
          }
        })
        .then(() => {
          if (this.data.headImage) {
            if(this.data.headImage.indexOf('https')===-1){
              const params = {
                bucketName: constantCfg.minio.bucketName,
                fileName: this.data.headImage
              }
              tool.review(params).then(result => {
                if (result.success) {
                  this.setData({
                      avatar: result.data
                  })
                }
              })
            }
          }
        })

        // 获取二维码操作
        // .then(()=>this.getAccessToken())
      resolve()
    })
  },
  getAccessToken(){
    const params = {
      secret:env.env.appSecret,
      appid:env.env.appid
    }
    http.wxRequest({...this.data.api.getAccessToken,params}).then(res=>{
      console.log(res)
    })
  }
})
