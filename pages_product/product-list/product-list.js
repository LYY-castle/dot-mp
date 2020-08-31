import tool from '../../utils/mixin.js'
import util from '../../utils/util.js'
import constantCfg from '../../config/constant'
import env from '../../config/env.config'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    empty: '/static/img/empty.png',
    activeKey: 0,
    bottomLineShow:false,
    share: 0,
    allProduct: false,
    qrcodeContent:false,
    codeUrl:null,
    open: false,
    pageNo: 1,
    pageSize: 10,
    activeProduct: 4,
    activeGood: 11,
    goodTypes: [],
    pageTitle: '产品列表',
    popProductName: '',
    showProducts: false,
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
      getQRcode:{
        url:'/wx-ma/generate/ma-code',
        method:'get'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    Promise.resolve()
      .then(() => this.getProductTypes(0))
      .then(() => this.routerParams())
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log(456)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

    if(!this.data.bottomLineShow){
      const pageNo = this.data.pageNo+1
      this.setData({
        pageNo
      })
      this.routerParams()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 产品种类切换
  onChange(event) {
    const activeKey = event.detail
    this.setData({
      activeKey,
      open:false
    })
    if (activeKey !== 0) {
      const activeId = this.data.productTypes[activeKey - 1].id
      Promise.resolve()
        .then(() => this.getProductTypes(activeId))
        .then(() => this.getProductsListById())
    } else {
      this.getAllProductList()
    }
  },
  // 商品种类切换
  goodChange(event) {
    // 全部和其他产品类型点击事件区分
    let id = event.type === 'click' ? event.detail.name : event.currentTarget.dataset.id
    this.setData({
      activeGood: id,
      open: false,
      pageNo: 1,
      productList: []
    })
    this.getProductsListById()
  },
  // 获取产品列表 0 一级,其他是二级
  getProductTypes(val) {
    let params = {
      parentId: val,
      pageSize: 100,
    }
    if(val===0){
      params.isEnable=1
    }
    return new Promise((resolve) => {
      tool.getProductSorts(params).then((res) => {
        if (res.success) {
          if (val === 0) {
            this.setData({
              productTypes: res.data,
              activeGood: null
            })
          } else {
            this.setData({
              goodTypes: res.data,
              activeGood: res.data.length > 0 ? res.data[0].id : 0
            })
          }
          resolve()
        }
      })
    })
  },
  // 判断路由参数
  routerParams() {
    return new Promise((resolve) => {
      const pageUrl = util.getCurrentPageUrl()
      const sortId = pageUrl.options.sortId
      // 从首页进入列表页
      if (sortId !== 'all') {
        const key = Number(sortId)
        for (let i = 0; i < this.data.productTypes.length; i++) {
          if (this.data.productTypes[i].id === key) {
            this.setData({
              activeKey: i + 1,
              activeGood: key
            })
            Promise.resolve()
              .then(() => this.getProductTypes(key))
              .then(() => this.getProductsListById())
          }
        }
      } else {
        console.log(sortId === 'all')
        this.getAllProductList()
        this.setData({
          activeKey: 0
        })
      }
      resolve()
    })
  },
  // 四个按钮点击事件 self自己买  other客户买 look查看详情 share分享案例
  buttonClickEvent(e){
    const option = e.currentTarget.dataset.option
    const event = e.currentTarget.dataset.event
    const pathParams = {
      productId: option.id,
    }
    if(event==='self'){
      wx.navigateTo({
        url: '../product-detail/product-detail',
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
        }
      })
    }
    if(event==='other'){
      const params = {
        params:env.env.VUE_APP_BASE_URL+'/product/product-detail/product-detail?productId='+option.id,
        wechatAppId:env.env.appid
      }
      console.log(params)
      const header = {
        'authorization':wx.getStorageSync('authorization')
      }
      wx.request({
        url:env.env.VUE_APP_BASE_URL+this.data.api.getQRcode.url,
        header,
        responseType:'arrayBuffer',
        data:params,
        success:res=>{
          let url ='data:image/png;base64,'+wx.arrayBufferToBase64(res.data)
          this.setData({
            qrcodeContent:true,
            codeUrl:url,
            popProductName:option.name
          })
        }
      })
    }
    if(event==='share'){
      wx.navigateTo({
        url: '../share-list/share-list',
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
        }
      })
    }
  },
  removeQrcode() {
    this.setData({
      qrcodeContent:false
    })
  },
  getAllProductList() {
    return new Promise(resolve => {
      const params = {
        pageSize: this.data.pageSize,
        pageNo: this.data.pageNo,
        status: 0,
      }
      this.getProductsList(params)
      resolve()
    })
  },
  getProductsListById() {
    return new Promise(resolve => {
      const params = {
        productCategoryId: this.data.activeGood,
        pageSize: this.data.pageSize,
        pageNo: this.data.pageNo,
        status: 0,
      }
      this.getProductsList(params)
      resolve()
    })
  },
  //  获取产品列表
  getProductsList(params) {
  let productDetailObj= {}
    return new Promise((resolve) => {
      tool.getProductList(params).then(async (res) => {
        let products = []
        if (res.success) {
          if(params.pageNo===res.page.totalPage){
            this.setData({
              bottomLineShow:true
            })
          }
          let productDetailRes,item
          const dealQseProduct = async (item) => {
            if (constantCfg.productCode.qsebao.includes(item.code)) {
              productDetailRes = await tool.insuranceProduct()
              productDetailObj = productDetailRes.data.productDetail
                // 因为轻松保接口中 type 与原有商品类型 type 冲突.
                productDetailObj.insurance_type = productDetailObj.type
                delete productDetailObj.type
                products.push(Object.assign({}, item, productDetailRes.data.productDetail))
            } else {
              products.push(item)
            }
          }
          for (let i = 0; i < res.data.length; i++) {
            item = res.data[i]
            await dealQseProduct(item)
          }
          if (params.pageNo === 1) {
            this.data.productList = products
          } else {
            this.data.productList = this.data.productList.concat(products)
          }

          this.data.productList.forEach((item) => {
            if (item.image !== null && item.image.indexOf(';') !== -1) {
              item.image = item.image.split(';')[0]
            }
          })

          this.setData({
            productList: this.data.productList
          })
          resolve()
        }
      })
    })
  },
  openContent() {
    this.setData({
      open: !this.data.open
    })
  },
  closeOverlay() {
    this.setData({
      open: false
    })
  },
})
