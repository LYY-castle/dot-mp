//index.js
//获取应用实例
import http from '../../utils/request.js' //相对路径
import checkToken from '../../utils/mixin.js'
import qseBaoUtil from '../../utils/qsebao.js' //相对路径
import constantCfg from '../../config/constant'
const app = getApp()
Page({
  data: {
    loading: false,
    finished: false,
    empty: '/static/img/empty.png',
    ProductAll: '/static/img/product-all.png',
    productList: [],
    pageNo: 1,
    api: {
      getProductTypes: {
        url: '/products',
        method: 'get'
      }
    }
  },
  // 搜索栏聚焦事件
  focus() {
    const that = this
    console.log('聚焦')
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
      http.wxRequest({
        ...that.api.getProductTypes,
        params: params
      }).then(res => {
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
  gotoProductList() {
    wx.navigateTo({
      url: './product-list/product-list?share=0&activeProduct=all'
    })
  },
  onLoad() {
    Promise.resolve()
      .then(() => checkToken.checkToken())
      .then(() => this.getProductList())
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  scroll(e) {
    console.log(e)
  }
})
