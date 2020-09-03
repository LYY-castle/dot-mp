import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import constantCfg from '../../config/constant'
const moment = require('../../utils/moment.min.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    bottomLineShow: false,
    loadingShow: true,
    type:1,
    pay: '/static/img/pay.png',
    waitPay: '/static/img/wait-pay.png',
    empty: '/static/img/empty.png',
    iconSuccess: '/static/img/icon-success.png',
    iconFail: '/static/img/icon-fail.png',
    productTypes: [{
        name: '全部',
        code: 1
      },
      {
        name: '待付款',
        code: 2
      },
      {
        name: '待发货',
        code: 3
      },
      {
        name: '已发货',
        code: 4
      },
    ],
    activeProductType: 1,
    pageSize: 10,
    pageNo: 1,
    orderList: null,
    api: {
      getOrderList: {
        url: '/orders',
        methods: 'get'
      },
      getPolicies: {
        url: '/policies',
        method: 'get'
      },
      getDotsList: {
        url: '/users',
        methods: 'get'
      },
      getOrderById: {
        url: '/orders/{id}',
        method: 'get'
      }
    },
    insureStatusMap: {
      0: {
        text: '待支付',
        color: '#7232dd'
      },
      1: {
        text: '待生效',
        color: '#1989fa'
      },
      2: {
        text: '投保成功',
        color: '#07c160'
      },
      3: {
        text: '投保失败',
        color: '#ee0a24'
      }
    },
    statusMap: {
      0: {
        text: '待支付',
        color: 'rgba(249, 173, 8, 1)'
      },
      1: {
        text: '已支付',
        color: 'rgba(101, 101, 101, 1)'
      },
      2: {
        text: '已退款',
        color: '#722ed1'
      },
      3: {
        text: '已关闭',
        color: '#f5222d'
      }
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    Promise.resolve()
      .then(() => this.getOrderList())

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (!this.data.bottomLineShow) {
      this.setData({
        pageNo: this.data.pageNo + 1,
        loadingShow: true
      })
      this.getOrderList()
    }
  },
  getOrderListByType(e){
    console.log(e)
    this.setData({
      orderList:null,
      bottomLineShow:false,
      loadingShow:true,
      pageNo:1,
      type:e.detail.name
    })
    this.getOrderList()
  },
  getOrderList() {
    return new Promise(resolve => {
      const params = {
        type: this.data.type,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        createBy: 9
      }
      http.wxRequest({
        ...this.data.api.getOrderList,
        params
      }).then(res => {
        if (res.success) {
          if (res.data.length > 0) {
            res.data.forEach(item => {
              if (item.orderExtends.length > 0) {
                item.orderExtends.forEach(extend => {
                  if (extend.product.image) {
                    if (extend.product.image !== null && extend.product.image.indexOf(';') !== -1) {
                      extend.product.image = extend.product.image.split(';')[0]
                    }
                  }
                })
              }
              if (constantCfg.productType.qsebao.includes(item.type)) {
                http.wxRequest({
                  ...this.data.api.getOrderById,
                  urlReplacements: [{
                    substr: '{id}',
                    replacement: item.id
                  }]
                }).then(
                  result => {
                    if (result.success) {
                      item.policy = result.data.policy
                    }
                  }
                )
              }
            })
          }
          if (params.pageNo === 1) {
            this.setData({
              orderList: res.data,
              loadingShow: false
            })
          } else {
            this.setData({
              orderList: this.data.orderList.concat(res.data),
              loadingShow: false
            })
          }
          if (params.pageNo === res.page.totalPage) {
            this.setData({
              bottomLineShow: true
            })
          } else {
            this.setData({
              bottomLineShow: false
            })
          }
          resolve()
        }
      })
    })
  },
  orderDetail(val) {
    console.log(val)
    const pathParams = val.currentTarget.dataset.option
    wx.navigateTo({
      url: '../order-detail/order-detail',
      success: function (res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: pathParams
        })
      }
    })
  }
})
