//index.js
//获取应用实例
import http from '../../utils/request.js' //相对路径
import tool from '../../utils/mixin.js'
import qseBaoUtil from '../../utils/qsebao.js' //相对路径
import constantCfg from '../../config/constant'
const app = getApp()
Page({
  data: {
    multiIndex: [0, 0, 0],
    empty: '/static/img/empty.png',
    ProductAll: '/static/img/product-all.png',
    productList: [],
    productSorts:[],
    sortsImages:['/static/img/product-01.png','/static/img/product-02.png','/static/img/product-03.png','/static/img/product-04.png'],
    pageNo: 1,
    api: {
      getProductList: {
        url: '/products',
        method: 'get'
      },
      getProductTypes: {
        url: '/product-categories',
        method: 'get'
      },
      upload: {
          url: 'https://dot-dev.hkjindian.com:18700/system/minio/dot',
          method: 'post'
      }
    }
  },
  // 搜索栏聚焦事件
  focus() {
    const that = this
    wx.navigateTo({
      url: './search/search'
    })

  },
  // 获取特惠产品的列表
  getProductList() {
    const that = this.data
    return new Promise(resolve => {
      let params = {
        isHot: 0,
        pageNo: that.pageNo,
        pageSize: 10,
        status: 0
      }
      tool.getProductList(params).then(res => {
        let productDetailObj = {}
        let products = []
        res.data.forEach(item => {
          if (constantCfg.productCode.qsebao.includes(item.code)) {
            const insuranceCode = item.code
            qseBaoUtil.getProductDetail({
              insuranceCode
            }).then(productDetailRes => {
              productDetailObj = productDetailRes.data.productDetail
              // 因为轻松保接口中 type 与原有商品类型 type 冲突.
              productDetailObj.insurance_type = productDetailObj.type
              delete productDetailObj.type

              products.push(Object.assign({}, item, productDetailRes.data.productDetail))
            })
          } else {
            products.push(item)
          }
        })
        if (that.pageNo === 1) {
          that.productList = products
        } else {
          that.productList = that.productList.concat(products)
        }
        that.productList.forEach(item => {
          if (item.image !== null && item.image.indexOf(';') !== -1) {
            item.image = item.image.split(';')[0]
          }
        })
        this.setData({
          productList: that.productList
        })
      })
      resolve()
    })
  },
  // 获取商品分类列表
  getProductSorts(){
    return new Promise(resolve=>{
      const params = {
        parentId: 0,
        pageSize: 100,
        isEnable:1,
      }
      tool.getProductSorts(params).then(res=>{
       if(res.success){
        this.setData({
          productSorts: res.data
        })
        resolve()
       }
      })
    })
  },
  gotoProductList(event) {
    const sortId = event.currentTarget.dataset.item?event.currentTarget.dataset.item.id:'all'
    wx.navigateTo({
      url: './product-list/product-list?sortId='+sortId
    })
  },
  gotoDetail(e){
    console.log(e)
    const option = e.currentTarget.dataset.option
    const pathParams = {
      productId: option.id
    }
    wx.navigateTo({
      url: './product-detail/product-detail',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
      }
    })

  },
  onLoad() {
    Promise.resolve()
      .then(() => tool.checkToken())
      .then(() => this.getProductSorts())
      .then(() => this.getProductList())
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  uploadAvatar(){
    const _this = this.data
    wx.chooseImage({
      success(res){
        const params = res.tempFilePaths[0]
        http.wxRequest({
          ..._this.api.upload,
          params
        }).then(res=>{
          if(res.success){
            console.log(res)
          }
        })
      }
    })
  },
  onReachBottom: function () {
    console.log('上拉')
  },
  onPageScroll: function() {
    // 页面滚动时执行
    console.log('滚动')
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title:'转发特惠商品',
      query:'code=FQAC'
    }
    wx.updateShareMenu({
      withShareTicket: true
    })
  },
})
