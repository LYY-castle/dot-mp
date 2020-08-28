// pages/product/product-detail/product-detail.js
import http from '../../../utils/request.js' //相对路径
import tool from '../../../utils/mixin.js'
import util from '../../../utils/util.js'
import qseBaoUtil from '../../../utils/qsebao.js' //相对路径
import constantCfg from '../../../config/constant'
import Crypto from '../../../utils/crypto'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots:true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    showContent: false,
      pageTitle: '',
      pathParams: {},
      productId: null,
      product: {},
      pricingRule: {},
    api:{
      // 查询产品详情.
    getProductById: {
      url: '/products/{id}',
      method: 'get',
    },
    // 查询产品生效计价规则.
    getProductEnablePricingRuleById: {
      url: '/products/{productId}/product-pricing-rules/enable',
      method: 'get',
    }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    if(options.productId){
      this.setData({
        productId:options.productId
      })
      _this.getProductDetail()
      _this.getProductEnablePricingRule()

    }else{
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('acceptDataFromOpenerPage', function(res) {
      _this.setData({
        pathParams:res.data,
        productId:res.data.productId
      })
      _this.getProductDetail()
      _this.getProductEnablePricingRule()
    })
    }

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

  getProductDetail(){
    return new Promise((resolve)=>{
      http.wxRequest({
        ...this.data.api.getProductById,
        urlReplacements: [{ substr: '{id}', replacement: this.data.productId }]
      }).then(res=>{
        if(res.success){
          if (res.data.image) {
            res.data.image = res.data.image.split(';')
          } else {
            res.data.image = []
          }
          if(res.data.detail){
            res.data.detail = res.data.detail.replace(/\<img/gi, '<img class="richImg"')
          }
          this.setData({
            showContent:true,
            product:res.data
          })
          resolve()
        }
      })
    })
  },
  getProductEnablePricingRule() {
    return new Promise((resolve)=>{
      http.wxRequest({
        ...this.data.api.getProductEnablePricingRuleById,
        urlReplacements: [{ substr: '{productId}', replacement: this.data.productId }],
      }).then((res) => {
        if (res.success) {
          this.setData({
            pricingRule:res.data
          })
          resolve()
        }
      })
    })
  },
  buyCard(){
    const option = this.data.pathParams
    console.log(option)
    wx.navigateTo({
      url: '../perchase/perchase',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: option })
      }
    })
  },
})
