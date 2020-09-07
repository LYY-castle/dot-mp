import http from '../../utils/request.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots:true,
    perchaseShow:false,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    showContent: true,
    pageTitle: '',
    pathParams: null,
    productId: null,
    product: null,
    pricingRule: null,
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
    if(options.src){
      this.setData({
        productId:options.src
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
    if(wx.getStorageSync('addressList')){
      wx.removeStorageSync('addressList')
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title:this.data.product.name,
      query:wx.getStorageSync('code'),
      path:'/pages_product/product-detail/product-detail?src='+this.data.productId,
      imageUrl:this.data.product.image[0]||''
    }
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
        }else{
          this.setData({
            showContent:false,
          })
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
    wx.setStorageSync('activeProductId',this.data.productId)
    wx.navigateTo({
      url: '../perchase/perchase',
    })
  },
  //
  onClickButton(e){
    const isLogin = wx.getStorageSync('isLogin')===1
    if(isLogin){
      this.setData({
        perchaseShow:true
      })
      console.log('加入购物车还是购买',e)
    }else{
      wx.navigateTo({
        url:'/pages_mine/login/login'
      })
    }
  },
  onClose(){
    this.setData({
      perchaseShow:false
    })
  }
  // goBac
  // goBackShopCarts(){
  //   wx.switchTab({
  //     url:'/pages/shopping-cart/shopping-cart'
  //   })
  // }
})
