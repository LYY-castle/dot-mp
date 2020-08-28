// pages/product/product-list/product-list.js
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
    empty: '/static/img/empty.png',
    activeKey: 0,
    share: 0,
    allProduct: false,
    open: false,
    loading: false,
    finished: true,
    pageNo: 1,
    pageSize: 10,
    activeProduct: 4,
    activeGood: 11,
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
    // this.allProduct = false
    // this.open = false
    // this.pageNo = 1
    // this.goodTypes = []
    // this.productList = []
    // Promise.resolve()
    //   .then(() => this.getProductTypes(id))
    //   .then(() => this.getProductsList())
  },
  // 商品种类切换
  goodChange(event) {
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
    if(event==='share'){
      wx.navigateTo({
        url: '../share-list/share-list',
        success: function(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
        }
      })
    }
    // switch (event) {
    //   case 'self':
    //     console.log('self')

    //     break;
    //   case 'other':
    //     console.log('other')
    //     break;
    //   case 'look':
    //     console.log('look')
    //     break;
    //   case 'share':
    //     console.log('share')
    //     break;
    //   default:
    //     break;
    // }
  },
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
    const target = event.currentTarget.dataset.item
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
          console.log(products.length)
          if (params.pageNo === 1) {
            console.log(1)
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
  // onLoad() {
  //   this.pageNo++
  //   if (this.allProduct) {
  //     this.getAllProductList()
  //   } else {
  //     this.getProductsList()
  //   }
  // },

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
