// pages/mine/address/address-list/address-list.js
import http from '../../../../utils/request.js' //相对路径
import tool from '../../../../utils/mixin.js'
import util from '../../../../utils/util.js'
import qseBaoUtil from '../../../../utils/qsebao.js' //相对路径
import constantCfg from '../../../../config/constant'
import Crypto from '../../../../utils/crypto'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    nbTitle: '收货地址',
    list: [],
    pageNo: 1,
    disabledList: [],
    pathParams: null,
    editAddressId:null,
    api: {
      getAddressList: {
        url: '/user-addressees',
        method: 'get'
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function(res) {
      console.log(res)
      _this.setData({
        pathParams:res.data,
      })
    })
    this.getMyAddressList()
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
    console.log('到底了')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
   // 获取当前用户的收货地址
   getMyAddressList() {
    const params = {
      userId: wx.getStorageSync('userId'),
      pageSize: 10,
      pageNo: this.data.pageNo
    }
    http.wxRequest({ ...this.data.api.getAddressList, params }).then(res => {
      if (res.success) {
        if (res.data && res.data.length > 0) {
          res.data.forEach(element => {
            const addressStr = JSON.parse(element.address)
            element.tel = element.phone
            element.address = addressStr.province + addressStr.city + addressStr.county + addressStr.addressDetail
            element.isDefault = element.isDefault === 1
            element.bigName = element.name.substring(0,1)
          })
          if (params.pageNo === 1) {
            this.setData({
              list:res.data
            })
          } else {
            this.setData({
              list:this.data.list.concat(res.data)
            })
          }
        }
      }
    })
  },
  onEdit(event){
    const option = event.currentTarget.dataset.option
    const pathParams = {
      ...this.data.pathParams,
      addressId:option.id
    }
    wx.navigateTo({
      url: '../add-address/add-address',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
      }
    })
  },
  onAdd(){
    const pathParams = this.data.pathParams
    wx.navigateTo({
      url: '../add-address/add-address',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
      }
    })
  },
  selectAddress(e){
    console.log(this.data.pathParams)
    const pathParams = this.data.pathParams
    if(this.data.pathParams.fromPath==='perchase-add'||this.data.pathParams.fromPath==='perchase-edit'){
      let perchaseAddressList = wx.getStorageSync('perchaseAddressList')
      const option = e.currentTarget.dataset.option.id
      perchaseAddressList.push(option)
      perchaseAddressList = Array.from(new Set(perchaseAddressList))
      wx.setStorageSync('perchaseAddressList',perchaseAddressList)
      wx.navigateTo({
        url:'../../../product/perchase/perchase',
        success(res){
          res.eventChannel.emit('acceptDataFromOpenerPage', { data:  pathParams})
        }
      })
    }
    if(this.data.pathParams.fromPath==='mine'){
      console.log('mine')
    }
    if(this.data.pathParams.fromPath==='address'){
      console.log('address')
    }
  }
})
