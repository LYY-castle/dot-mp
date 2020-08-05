//index.js
//获取应用实例
const http = require('../../utils/request.js') //相对路径
const app = getApp()

Page({
  data: {
    loading: false,
    finished: false,
    empty:'/static/img/empty.png',
    ProductAll: '/static/img/product-all.png',
    productList:[],
    api: {
      getProductTypes: {
        url: '/product-categories',
        method: 'get'
      }
    }
  },
  // 搜索栏聚焦事件
  focus: function () {
    const that = this
    console.log('聚焦')
    wx.navigateTo({
      url: '../product/share-list/share-list'
    })
  },
  // 获取特惠产品的列表
  getProductList: function () {
    let params = {
      isHot: 0,
      pageNo: 1,
      pageSize: 5,
      status: 0
    }
    http.request({
      ...that.data.api.getProductTypes,
      params
    })
  },
  onLoad: function () {
    // this.getProductList()
    wx.redirectTo({
      url: '../mine/login/login'
    })
    console.log('onload')
  }
})