// pages/product/product-list/product-list.js
import constantCfg from '../../../config/constant'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    empty: '/static/img/empty.png',
    activeKey: 0,
    share: 0,
    allProduct: false,
    open: false,
    loading: false,
    finished: true,
    pageNo: 1,
    pageSize: 5,
    activeProduct: 4,
    activeGood: 11,
    goodTypes: [{
        id: 11,
        code: "4-11",
        parentId: 4,
        children: null,
        name: "坚果",
        idPath: "/4/11/",
        namePath: "/食品/坚果/"
      }, {
        id: 10,
        code: "4-10",
        parentId: 4,
        children: null,
        name: "面包",
        idPath: "/4/10/",
        namePath: "/食品/面包/",
      },
      {
        id: 9,
        code: "4-9",
        parentId: 4,
        children: null,
        name: "牛奶",
        idPath: "/4/9/",
        namePath: "/食品/牛奶/",
      }, {
        id: 7,
        code: "4-7",
        parentId: 4,
        children: null,
        name: "红酒",
        idPath: "/4/7/",
        namePath: "/食品/红酒/",
      }
    ],
    pageTitle: '产品列表',
    popProductName: '',
    showProducts: false,
    renderQRCodeUrl: null,
    productList: [{
        id: 2,
        productCategoryId: 6,
        productCategoryNamePath: "/旅游/旅游卡/",
        category: null,
        category: null,
        code: "tourist_card",
        commissionRules: null,
        createAt: null,
        createBy: null,
        description: "免费畅游多个著名景点",
        detail: null,
        effectiveTime: null,
        englishName: null,
        id: 2,
        image: "http://image.hkjindian.com/static/dot/img/p2.png",
        isDelete: 0,
        isHot: 1,
        isNew: 0,
        isPresell: 0,
        isWeekendDelivery: 0,
        label: null,
        maxPrice: 158,
        minPrice: 138,
        multiAddresses: 1,
        name: "中青文旅畅游卡",
        originalPrice: 198,
        presellDeliveryTime: null,
        price: null,
        priceScript: null,
        pricingMethod: 1,
        pricingRules: null,
        productCategoryId: 6,
        productCategoryNamePath: "/旅游/旅游卡/",
        properties: null,
        sortNo: 3,
        status: 0,
        totalNum: 9999999,
        unit: "张",
        updateAt: "2020-07-17 13:38:44",
        updateBy: 8
      },
      {
        category: null,
        code: null,
        commissionRules: null,
        createAt: "2020-07-21 17:13:35",
        createBy: 8,
        description: "😂😊🤣🤣❤😍🤦‍♀️🤦‍♂️🤷‍♀️💖🐱‍👤🤳",
        detail: null,
        effectiveTime: null,
        englishName: null,
        id: 26,
        image: "http://dot-dev.hkjindian.com:19000/static/dot/2020/07/22/1a058f8d1fb94a5493110fb53a1d6eb6.jpg",
        isDelete: 0,
        isHot: 0,
        isNew: 0,
        isPresell: 0,
        isWeekendDelivery: 0,
        label: null,
        maxPrice: 12,
        minPrice: 11,
        multiAddresses: 0,
        name: "测试产品",
        originalPrice: 33.33,
        presellDeliveryTime: null,
        price: null,
        priceScript: null,
        pricingMethod: 1,
        pricingRules: null,
        productCategoryId: 44,
        productCategoryNamePath: "/百货/塔罗牌/",
        properties: null,
        sortNo: 0,
        status: 0,
        totalNum: 0,
        unit: "个",
        updateAt: "2020-0"
      }
    ],
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


  // 产品种类切换
  // onChange(id) {
  //   this.allProduct = false
  //   this.open = false
  //   this.pageNo = 1
  //   this.goodTypes = []
  //   this.productList = []
  //   Promise.resolve()
  //     .then(() => this.getProductTypes(id))
  //     .then(() => this.getProductsList())
  // },
  // 商品种类切换
  goodChange(event) {
    const _this = this
    let id
    if (event.type === 'click') {
      id = event.detail.name
    } else if (event.type === 'tap') {
      id = event.currentTarget.dataset.id
    }
    _this.open = false
    _this.setData({
      activeGood: id,
      open: false,
      pageNo: 1,
      // productList: []
    })
    // _this.getProductsList()
  },
  closeOverlay(){
    const _this = this
    _this.open = false
    this.setData({
      open:false
    })
  },
  // 获取产品列表 0 一级,其他是二级
  // getProductTypes(val) {
  //   Toast.loading({
  //     message: '请稍后',
  //     forbidClick: true,
  //   })
  //   this.showProducts = true
  //   const params = {
  //     parentId: val,
  //     pageSize: 100,
  //   }
  //   return new Promise((resolve) => {
  //     request({
  //       ...this.api.getProductTypes,
  //       params,
  //     }).then((res) => {
  //       if (res.success) {
  //         this.showProducts = false
  //         if (val === 0) {
  //           this.productTypes = res.data
  //           this.activeGood = null
  //         } else {
  //           this.goodTypes = res.data
  //           if (this.goodTypes.length > 0) {
  //             this.activeGood = this.goodTypes.length > 0 ? this.goodTypes[0].id : 0
  //           }
  //         }
  //         wxShare(this.shareParams)
  //         Toast.clear()
  //         resolve()
  //       }
  //     })
  //   })
  // },
  // 判断路由参数
  // routerParams() {
  //   return new Promise((resolve) => {
  //     // 从详情页返回到列表页
  //     if (this.$route.query.activeKey) {
  //       const key = Number(this.$route.query.activeKey)
  //       this.activeKey = key
  //       for (let i = 0; i < this.productTypes.length; i++) {
  //         if (key === i + 1) {
  //           this.activeProduct = this.productTypes[i].id
  //         }
  //       }
  //     }
  //     // 从首页进入列表页
  //     if (this.$route.query.activeProduct) {
  //       if (this.$route.query.activeProduct !== 'all') {
  //         const key = Number(this.$route.query.activeProduct)
  //         for (let i = 0; i < this.productTypes.length; i++) {
  //           if (this.productTypes[i].id === key) {
  //             this.activeKey = i + 1
  //             this.activeProduct = key
  //           }
  //         }
  //       } else {
  //         this.activeKey = 0
  //       }
  //     }
  //     resolve()
  //   })
  // },
  // 查看详情
  // lookDetail(product) {
  //   const params = JSON.parse(new Crypto().decrypt({ enctyptedStr: this.$route.query.params }))
  //   if (constantCfg.productCode.qsebao.includes(product.code)) {
  //     this.renderQRCodeUrl =
  //       product.link +
  //       '&cparams1=' +
  //       new Crypto().encrypt({
  //         plainStr: this.code,
  //       }) +
  //       '&share=' +
  //       this.$route.query.share +
  //       '&_=' +
  //       new Date().getTime()
  //     if (this.allProduct) {
  //       this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeProduct=all'
  //     }
  //     window.location.href = this.renderQRCodeUrl
  //   } else {
  //     let encryptParam = {
  //       userId: params.userId,
  //       parentId: params.parentId,
  //       productId: product.id,
  //     }
  //     let query = {
  //       params: new Crypto().encrypt({
  //         plainStr: JSON.stringify(encryptParam),
  //       }),
  //       share: this.$route.query.share,
  //       _: new Date().getTime(),
  //     }
  //     if (this.allProduct) {
  //       query.activeProduct = 'all'
  //     } else {
  //       query.activeKey = this.$route.query.activeKey
  //       query.activeGood = this.$route.query.activeGood
  //     }
  //     if (constantCfg.productCode.iccooCard === product.code) {
  //       this.switchRouter({
  //         path: '/card-detail',
  //         query,
  //       })
  //     } else {
  //       this.switchRouter({
  //         path: '/product-detail',
  //         query,
  //       })
  //     }
  //   }
  // },
  // 自己买
  buyBySelf(event) {
    const key = this.activeKey
    const target = event
    console.log(event)
    // if (constantCfg.productCode.qsebao.includes(product.code)) {
    //   this.renderQRCodeUrl =
    //     product.link +
    //     '&cparams1=' +
    //     new Crypto().encrypt({
    //       plainStr: this.code,
    //     }) +
    //     '&share=0' +
    //     '&activeKey=' +
    //     key +
    //     '&activeGood=' +
    //     this.activeGood +
    //     '&_=' +
    //     new Date().getTime()
    //   window.location.href = this.renderQRCodeUrl
    // } else {
    //   let encryptParam = {
    //     userId: this.userId,
    //     parentId: this.parentId,
    //     productId: product.id,
    //   }
    //   let query = {}
    //   if (this.allProduct) {
    //     query = {
    //       params: new Crypto().encrypt({
    //         plainStr: JSON.stringify(encryptParam),
    //       }),
    //       share: this.$route.query.share,
    //       activeProduct: 'all',
    //       _: new Date().getTime(),
    //     }
    //   } else {
    //     query = {
    //       params: new Crypto().encrypt({
    //         plainStr: JSON.stringify(encryptParam),
    //       }),
    //       share: this.$route.query.share,
    //       activeKey: key,
    //       activeGood: this.activeGood,
    //       _: new Date().getTime(),
    //     }
    //   }
    //   console.log(query)
    //   if (constantCfg.productCode.iccooCard === product.code) {
    //     this.switchRouter({
    //       path: '/card-detail',
    //       query,
    //     })
    //   } else {
    //     this.switchRouter({
    //       path: '/product-detail',
    //       query,
    //     })
    //   }
    // }
  },
  // 进入分享列表页面
  // shareProduct(product) {
  //   const key = this.activeKey
  //   let query = {}
  //   let encryptParam = {
  //     userId: this.userId,
  //     parentId: this.parentId,
  //     productId: product.id,
  //   }
  //   if (this.allProduct) {
  //     query = {
  //       params: new Crypto().encrypt({
  //         plainStr: JSON.stringify(encryptParam),
  //       }),
  //       share: this.$route.query.share,
  //       activeProduct: 'all',
  //       productId: product.id,
  //       _: new Date().getTime(),
  //     }
  //   } else {
  //     query = {
  //       params: new Crypto().encrypt({
  //         plainStr: JSON.stringify(encryptParam),
  //       }),
  //       share: this.$route.query.share,
  //       activeKey: key,
  //       activeGood: this.activeGood,
  //       productId: product.id,
  //       _: new Date().getTime(),
  //     }
  //   }
  //   this.switchRouter({
  //     path: '/share-list',
  //     query,
  //   })
  // },
  // 客户买
  renderQRCode(event) {
    const target  = event.currentTarget.dataset.item
    const key = this.activeKey
    this.popProductName = target.name
    if (constantCfg.productCode.qsebao.includes(target.code)) {
      this.renderQRCodeUrl =
      target.link +
        '&cparams1=' +
        new Crypto().encrypt({
          plainStr: this.code,
        }) +
        '&share=1' +
        '&activeKey=' +
        key +
        '&activeGood=' +
        this.activeGood +
        '&_=' +
        new Date().getTime()
      if (this.allProduct) {
        this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeProduct=all'
      }
    } else {
      let encryptParam = {
        userId: this.userId,
        parentId: this.parentId,
        productId: target.id,
      }
      if (constantCfg.productCode.iccooCard === target.code) {
        this.renderQRCodeUrl =
          window.location.origin +
          '/card-detail' +
          '?params=' +
          new Crypto().encrypt({
            plainStr: JSON.stringify(encryptParam),
          }) +
          '&share=1' +
          '&_=' +
          new Date().getTime()
      } else {
        this.renderQRCodeUrl =
          window.location.origin +
          '/product-detail' +
          '?params=' +
          new Crypto().encrypt({
            plainStr: JSON.stringify(encryptParam),
          }) +
          '&share=1' +
          '&_=' +
          new Date().getTime()
      }
      if (this.allProduct) {
        this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeProduct=all'
      } else {
        this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeKey=' + key + '&activeGood=' + this.activeGood
      }
    }
    this.$refs.qrContent.style.display = 'block'
    this.$nextTick(() => {
      this.qrcode(this.renderQRCodeUrl)
    })
  },
  removeQrcode() {
    this.$refs.qrContent.style.display = 'none'
    var f = document.getElementById('qrcode')
    var child1 = document.getElementsByTagName('img')
    var child2 = document.getElementsByTagName('canvas')
    f.removeChild(child1[0])
    f.removeChild(child2[0])
  },
  qrcode(url) {
    new QRCode('qrcode', {
      width: 200, // 设置宽度，单位像素
      height: 200, // 设置高度，单位像素
      text: url, // 设置二维码内容或跳转地址
      correctLevel: 3,
    })
  },
  // copy() {
  //   let copyBtn = new Clipboard('.copyButton')
  //   copyBtn.on('success', (e) => {
  //     Toast('复制成功')
  //     e.clearSelection()
  //   })
  //   copyBtn.on('error', (e) => {
  //     Toast('复制失败')
  //     e.clearSelection()
  //   })
  // },
  // 首次进入或点击全部
  fistGetAllProductList() {
    this.allProduct = true
    // return new Promise((resolve) => {
    //   this.productList = []
    //   this.goodTypes = []
    //   this.pageNo = 1
    //   this.getAllProductList()
    //   resolve
    // })
  },
  // getAllProductList() {
  //   this.showProducts = true
  //   this.finished = false
  //   let productDetailObj = {}
  //   const params = {
  //     pageSize: this.pageSize,
  //     pageNo: this.pageNo,
  //     status: 0,
  //   }
  //   return new Promise((resolve) => {
  //     request({
  //       ...this.api.getProductsList,
  //       params, // status 上架状态: 0 上架, 1 下架.
  //     }).then(async (res) => {
  //       let products = []
  //       if (res.success) {
  //         let productDetailRes, item

  //         const dealQseProduct = async (item) => {
  //           if (constantCfg.productCode.qsebao.includes(item.code)) {
  //             productDetailRes = await qseBaoUtil.getProductDetail({ insuranceCode: item.code })

  //             productDetailObj = productDetailRes.data.productDetail

  //             // 因为轻松保接口中 type 与原有商品类型 type 冲突.
  //             productDetailObj.insurance_type = productDetailObj.type
  //             delete productDetailObj.type
  //             products.push(Object.assign({}, item, productDetailRes.data.productDetail))
  //           } else {
  //             products.push(item)
  //           }
  //         }

  //         for (let i = 0; i < res.data.length; i++) {
  //           item = res.data[i]

  //           await dealQseProduct(item)
  //         }

  //         if (this.pageNo === res.page.totalPage || res.page.totalPage === 0) {
  //           this.finished = true
  //         }
  //         if (this.pageNo === 1) {
  //           this.productList = products
  //         } else {
  //           products.forEach((product) => {
  //             this.productList.push(product)
  //           })
  //         }
  //         this.productList.forEach((item) => {
  //           if (item.image !== null && item.image.indexOf(';') !== -1) {
  //             item.image = item.image.split(';')[0]
  //           }
  //         })
  //         this.loading = false
  //         this.showProducts = false
  //         wxShare(this.shareParams)
  //         resolve()
  //       }
  //     })
  //   })
  // },
  // getProductsList() {
  //   this.showProducts = true
  //   this.finished = false
  //   const _this = this
  //   let productDetailObj = {}
  //   if (this.goodTypes.length > 0) {
  //     const params = {
  //       productCategoryId: this.activeGood,
  //       pageSize: this.pageSize,
  //       pageNo: this.pageNo,
  //       status: 0,
  //     }
  //     return new Promise((resolve) => {
  //       request({
  //         ...this.api.getProductsList,
  //         params, // status 上架状态: 0 上架, 1 下架.
  //       }).then((res) => {
  //         let products = []
  //         if (res.success) {
  //           res.data.forEach((item) => {
  //             if (constantCfg.productCode.qsebao.includes(item.code)) {
  //               qseBaoUtil.getProductDetail({ insuranceCode: item.code }).then((productDetailRes) => {
  //                 productDetailObj = productDetailRes.data.productDetail

  //                 // 因为轻松保接口中 type 与原有商品类型 type 冲突.
  //                 productDetailObj.insurance_type = productDetailObj.type
  //                 delete productDetailObj.type

  //                 products.push(Object.assign({}, item, productDetailRes.data.productDetail))
  //               })
  //             } else {
  //               products.push(item)
  //             }
  //           })
  //           if (this.pageNo === res.page.totalPage || res.page.totalPage === 0) {
  //             this.finished = true
  //           }
  //           if (this.pageNo === 1) {
  //             _this.productList = products
  //           } else {
  //             _this.productList = _this.productList.concat(products)
  //           }
  //           _this.productList.forEach((item) => {
  //             if (item.image !== null && item.image.indexOf(';') !== -1) {
  //               item.image = item.image.split(';')[0]
  //             }
  //           })
  //           this.loading = false
  //           this.showProducts = false
  //           resolve()
  //         }
  //       })
  //     })
  //   } else {
  //     this.showProducts = false
  //     this.activeGood = null
  //   }
  // },
  // onLoad() {
  //   this.pageNo++
  //   if (this.allProduct) {
  //     this.getAllProductList()
  //   } else {
  //     this.getProductsList()
  //   }
  // },
  // 用户登录的状态下调用来判断token是否过期
  // checkToken() {
  //   return new Promise((resolve) => {
  //     request({ ...this.api.checkToken }).then((res) => {
  //       if (res.success) {
  //         resolve()
  //       }
  //     })
  //   })
  // },
  openContent() {
    const _this = this
    _this.open = !this.open
    _this.setData({
      open: _this.open
    })
  },
})
