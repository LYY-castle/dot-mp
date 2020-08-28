import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
import constantCfg from '../../config/constant'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bg: '../../static/img/bg.png',
    avatar: '../../static/img/avatar.png',

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
      iconHref: '../../static/img/mine-info.png',
      path:'../../pages_mine/personal-info/personal-info'
    }, {
      title: '银行卡',
      iconHref: '../../static/img/bank-card.png',
      path:'../../pages_mine/bank-card/bank-card'
    },
    // {
    //   title: '修改密码',
    //   iconHref: '../../static/img/modify-password.png',
    //   path:'../../pages_mine/modify-password/modify-password'
    // },
    {
      title: '我的订单',
      iconHref: '../../static/img/order.png',
      path:'../../pages_order/order-list/order-list'
    }, {
      title: '我的地址',
      iconHref: '../../static/img/address.png',
      path:'../../pages_address/address-list/address-list'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    Promise.resolve().then(()=>tool.checkToken()).then(()=>this.getUserInfo())
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
  getUserInfo(){
    return new Promise(resolve=>{
      const id = wx.getStorageSync('userId')
      http.wxRequest({ ...this.data.api.getUserInfo, urlReplacements: [{ substr: '{id}', replacement: id}] })
        .then(res => {
          if (res.success) {
            this.setData({
              userInfo:res.data
            })
          }
        })
        .then(() => {
          if (this.data.userInfo.headImage) {
            if(this.data.userInfo.headImage.indexOf('https')===-1){
              const params = {
                bucketName: constantCfg.minio.bucketName,
                fileName: this.data.userInfo.headImage
              }
              tool.review(params).then(result => {
                if (result.success) {
                  this.setData({
                    avatar:result.data
                  })
                }
              })
            }
          }
        })
        resolve()
    })
  },
  gotoPage(event){
    const option = event.currentTarget.dataset.option
    wx.navigateTo({
      url: option.path,
      success(res){
        if(option.title === '我的地址'){
          const pathParams = {
            fromPath: 'mine'
          }
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
        }
      }
    })
  },
  // 退出登录
  logout() {
    Dialog.confirm({
      title: '确定退出？'
    })
      .then(() => {
        let params = {
          id: wx.getStorageSync('userId')
        }
        http.wxRequest({ ...this.data.api.logout, params }).then(res => {
          if (res.success) {
            wx.clearStorageSync()
            wx.reLaunch({
              url: './login/login'
            })
          }
        })
      })
      .catch(() => {
        // on cancel
      })
  },
})
