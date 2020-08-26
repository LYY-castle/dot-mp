// pages/product/search/search.js
import http from '../../../utils/request.js' //相对路径
import qseBaoUtil from '../../../utils/qsebao.js' //相对路径
import constantCfg from '../../../config/constant'
// import deepClone from 'lodash.clonedeep'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    empty: '/static/img/empty.png',
    historyListShow: true,
    loading: false,
    finished: false,
    pageNo: 1,
    searchValue:'',
    pageTitle: '搜索',
    productList: [],
    historyList: [],
    api: {
      getProductsList: {
        url: '/products',
        method: 'get'
      }
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
    let list = []
    if(wx.getStorageSync('historyList')){
       list = wx.getStorageSync('historyList')
    }
    this.setData({
      historyList:list
    })
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
  change(e){
    this.setData({
      searchValue:e.detail
    })
  },
  focus(){
    let list = []
    if(wx.getStorageSync('historyList')){
       list = wx.getStorageSync('historyList')
    }
    this.setData({
      historyList:list,
      historyListShow:true
    })
  },
  search() {
    let list = []
      if(wx.getStorageSync('historyList')){
        list = wx.getStorageSync('historyList')
      }
    if (this.data.searchValue !== '') {
      list.unshift(this.data.searchValue)
      const res = new Map()
      list = list.filter(option => !res.has(option) && res.set(option, 1))
      wx.setStorageSync('historyList', list)
      this.setData({

      })
    }
    this.setData({
      historyListShow:false,
      historyList:list
    })
    this.getProductList()
  },
  selectList(event) {
    this.setData({
      searchValue:event.currentTarget.dataset.item
    })
    this.search()
  },
  clearHistoryList() {
    let self = this
    wx.showModal({
      title: '删除全部历史记录？',
      success (res) {
        if (res.confirm) {
          wx.removeStorageSync('historyList')
          self.setData({
            historyList:[]
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  gotoDetail(e){
    console.log(e)
    const option = e.currentTarget.dataset.option
    const pathParams = {
      productId: option.id
    }
    wx.navigateTo({
      url: '../product-detail/product-detail',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
      }
    })

  },
   // 获取产品的列表
   getProductList() {
    return new Promise(resolve => {
      const params = {
        name: this.data.searchValue,
        pageSize: 10,
        pageNo: this.data.pageNo,
        status: 0
      }
      http.wxRequest({
        ...this.data.api.getProductsList,
        params
      }).then(res => {
        let productDetailObj = {}
        let products = []
        res.data.forEach(item => {
          if (constantCfg.productCode.qsebao.includes(item.code)) {
            const insuranceCode = {
              insuranceCode:item.code
            }
            qseBaoUtil.getProductDetail(insuranceCode).then(result=>{
              console.log(result)
            })
            // .then(productDetailRes => {
            //   console.log('重疾险对象',productDetailRes)
            //   productDetailObj = productDetailRes.data.productDetail
            //   // 因为轻松保接口中 type 与原有商品类型 type 冲突.
            //   productDetailObj.insurance_type = productDetailObj.type
            //   delete productDetailObj.type
            //   products.push(Object.assign({}, item, productDetailRes.data.productDetail))
            // })
          } else {
            products.push(item)
          }
        })
        if (params.pageNo === 1) {
          this.data.productList = products
        } else {
          this.data.productList = this.data.productList.concat(products)
        }
        this.data.productList.forEach(item => {
          if (item.image !== null && item.image.indexOf(';') !== -1) {
            item.image = item.image.split(';')[0]
          }
        })
        this.setData({
          productList: this.data.productList
        })
      })
      resolve()
    })
  },
})
