import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
import constantCfg from '../../config/constant'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bg: '/static/img/bg.png',
    avatar: '/static/img/avatar.png',

    api: {
      getUserInfo: {
        url: '/users/{id}',
        method: 'get'
      },
      logout: {
        url: '/users/logout',
        method: 'get'
      }
    },
    list: [{
      title: '个人资料',
      iconHref: '/static/img/mine-info.png',
      path:'../../pages_mine/personal-info/personal-info'
    }, {
      title: '银行卡',
      iconHref: '/static/img/bank-card.png',
      path:'../../pages_mine/bank-card/bank-card'
    },
    {
      title: '我的订单',
      iconHref: '/static/img/order.png',
      path:'../../pages_order/order-list/order-list'
    }
  ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const isLogin = wx.getStorageSync('isLogin')
    if(isLogin===1){
      // Promise.resolve().then(()=>this.getUserInfo())
    }
  },
  // 获取用户的头像信息
  getUserInfo(){
    return new Promise(resolve=>{
      const id = wx.getStorageSync('userId')
      http.wxRequest({ ...this.data.api.getUserInfo, urlReplacements: [{ substr: '{id}', replacement: id}] })
        .then(res => {
          if (res.success) {
            this.setData({
              userInfo:res.data
            })
            resolve()
          }
        })
    })
  },
  gotoPage(event){
    const option = event.currentTarget.dataset.option
    const isLogin = wx.getStorageSync('isLogin')===1
    if(isLogin){
      wx.navigateTo({
        url: option.path,
        success(res){
          if(option.title === '我的地址'){
            wx.setStorageSync('fromPath','mine')
          }
        }
      })
    }else{
      wx.navigateTo({
        url:'/pages_mine/login/login'
      })
    }

  },

})
