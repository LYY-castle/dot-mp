// pages/mine/modify-password/modify-password.js
import http from '../../../utils/request.js'
import Crypto from '../../../utils/crypto'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newPassword: '',
    password: '',
    oriPassword: '',
    api: {
      modifyPsd: {
        url: '/users',
        method: 'put',
      },
    }
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
  modifyPsd() {
    let oldPsd = Crypto.encrypt({
      plainStr: this.oriPassword,
    })
    let newPsd = Crypto.encrypt({
      plainStr: this.password,
    })
    let params = {
      id: wx.getStorageSync('userId'),
      oriPassword: oldPsd,
      password: newPsd,
    }
    http.wxRequest({ ...this.data.api.modifyPsd, params }).then((res) => {
      if (res.success) {
        wx.showToast({
          title: '密码修改成功',
          duration: 1000
        })
      }
    })
  },
})
