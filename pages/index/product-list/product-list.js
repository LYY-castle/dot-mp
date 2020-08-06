// pages/product/product-list/product-list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
active:0,
share:0,
allProduct: false,
      open: false,
      loading: false,
      finished: true,
      pageNo: 1,
      pageSize: 5,
      activeKey: constantCfg.productType.defaultProductTypeIdx,
      activeProduct: 4,
      constantCfg,
      activeGood: null,
      goodTypes: [],
      pageTitle: '产品列表',
      popProductName: '',
      showProducts: false,
      renderQRCodeUrl: null,
      productList: [],
      productTypes: [],
      productTypeVals: [],
      status: ['primary', 'success', 'danger', 'warning'],
      api: {
        checkToken: {
          url: '/system/check-token',
          method: 'get',
        },
        getProductsList: {
          url: '/products',
          method: 'get',
        },
        getProductTypes: {
          url: '/product-categories',
          method: 'get',
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
  fistGetAllProductList(){
    console.log('查看')
  }
})
