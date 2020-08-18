//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    userInfoShow:true,
    phoneShow:false,
    phone:null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIusePhone:wx.canIUse('button.open-type.getPhoneNumber'),
  },
  getUserInfo() {
    const _this = this
    wx.authorize({
      scope: 'scope.userInfo',
      success () {
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        wx.getUserInfo({
          lang:'zh_CN',
          success:res=>{
            console.log('授权成功,获取用户基本信息',res)
            app.globalData.userInfo = res.userInfo
            _this.setData({
              userInfo: res.userInfo,
              userInfoShow:false,
              phoneShow:true
            })
          }
        })
      }
    })
  },
  getPhoneNumber (e) {
    app.globalData.phone = e.detail
    console.log('获取手机号码',e)
    this.setData({
      phoneShow:false
    })
    // wx.switchTab({
    //   url: '../product/index'
    // })
  },
  onLoad: function () {
    const that = this
    if (app.globalData.userInfo) {
      console.log(1)
      that.setData({
        userInfo: app.globalData.userInfo,
        userInfoShow:false
      })
    } else if (this.data.canIUse){
      console.log(2)
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        console.log('res',res)
        that.setData({
          userInfo: app.globalData.userInfo,
          userInfoShow:false
        })
      }
      if(this.data.canIusePhone){
        console.log(3)
        app.userInfoReadyCallback = res => {
          that.setData({
            phone: app.globalData.phone,
            phoneShow:false
          })
        }
      }
    } else {
      console.log(4)
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        lang:'zh_CN',
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: app.globalData.userInfo,
            userInfoShow:false
          })
        }
      })
    }
    console.log('app',app)
  },
})
