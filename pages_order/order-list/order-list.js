import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import constantCfg from '../../config/constant'
import { getEndTime,getStartTime } from '../../utils/util'
const moment = require('../../utils/moment.min.js')

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bottomLineShow:false,
    pay: '/static/img/pay.png',
    waitPay: '/static/img/wait-pay.png',
    empty: '/static/img/empty.png',
    iconSuccess: '/static/img/icon-success.png',
    iconFail: '/static/img/icon-fail.png',
    empty: '/static/img/empty.png',
    activeColor:'',
    activeButtonIndex:0,
    orderNum: [],
      productTypes: [],
      activeProductType: constantCfg.productType.defaultProductType,
      timeShow: false,
        createAt: '自定义',
        pageSize: 10,
        pageNo: 1,
        type: constantCfg.productType.defaultProductType,
        createAtStart: getStartTime(moment(new Date()).format(), 'day'),
        createAtEnd: getEndTime(moment(new Date()).format(), 'day'),
      orderList: [],
      buttonGroup: [{
        text: '当天'
      }, {
        text: '本周'
      }, {
        text: '本月'
      }],
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
    .then(()=>this.getProductSorts())
    .then(()=>this.getOrderList())

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
      this.getOrderList()
    }
  },
  // 获取产品分类
  getProductSorts() {
    const params = {
      parentId: 0,
      pageSize: 100,
      isEnable:1,
    }
    tool.getProductSorts(params).then(res => {
      const mapOPtion = res.data.map(item=>{
        return {
          name:item.name,
          code:item.code
        }
      })
      this.setData({
        productTypes: mapOPtion
      })
    })
  },
  getOrderListProductType(event) {
    this.setData({
      timeShow: false,
      type:event.detail.name
    })
    Promise.resolve()
      .then(() => this.resteParams())
      .then(() => this.getOrderList())
  },
  resteParams() {
    return new Promise(resolve => {
      this.setData({
        activeButtonIndex:0,
        defaultDate:[new Date(), new Date()],
        pageSize:10,
        pageNo:1,
        createAtStart:getStartTime(moment(new Date()).format(), 'day'),
        createAtEnd:getEndTime(moment(new Date()).format(), 'day')
      })
      resolve()
    })
  },
  MyAchievementByTime(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeButtonIndex:index,
    })
    if (index === 0) {
      this.setData({
        createAtStart: getStartTime(moment().format(), 'day'),
        createAtEnd: getEndTime(moment().format(), 'day'),
        timeShow: false
      })
      this.getOrderList()
    } else if(index===1){
      this.setData({
        createAtStart: getStartTime(moment().startOf('week').format(), 'day'),
        createAtEnd: getEndTime(moment().endOf('week').format(), 'day'),
        timeShow: false
      })
      this.getOrderList()
    }else if(index===2){
      this.setData({
        createAtStart: getStartTime(moment().startOf('month').format(), 'day'),
        createAtEnd: getEndTime(moment().endOf('month').format(), 'day'),
        timeShow: false
      })
      this.getOrderList()
    }else if(index===3){
      this.setData({
        timeShow: true
      })
    }
  },
  startTimeSelect(e){
    console.log('start',e)
    const option = getStartTime(moment(e.detail.value).format(), 'day')
    this.setData({
      createAtStart:option
    })
  },
  endTimeSelect(e){
    const option = getEndTime(moment(e.detail.value).format(), 'day')
    const endTime = new Date(option.replace(/\-/g, "/")).getTime()
    const startTime = new Date(this.data.createAtStart.replace(/\-/g, "/")).getTime()
    console.log(option)
    console.log(endTime)
    console.log(startTime)
    if(endTime>startTime){
      this.setData({
        createAtEnd:option
      })
    }else{
      wx.showToast({
        title:'结束时间不能小于开始时间',
        icon:'none'
      })
    }
  },
  searchByDiyTime(){
    const endTime = new Date(this.data.createAtEnd.replace(/\-/g, "/")).getTime()
    const startTime = new Date(this.data.createAtStart.replace(/\-/g, "/")).getTime()
    if(endTime>startTime){
      this.getOrderList()
    }else{
      wx.showToast({
        title:'结束时间不能小于开始时间',
        icon:'none'
      })
    }

  },
  getOrderList() {
    return new Promise(resolve => {
      const params = {
        type: this.data.type,
        createAtStart: this.data.createAtStart,
        createAtEnd: this.data.createAtEnd,
        pageNo: this.data.pageNo,
        pageSize: this.data.pageSize,
        createBy: wx.getStorageSync('userId')
      }
      http.wxRequest({ ...this.data.api.getOrderList, params }).then(res => {
        if (res.success) {
          if(res.data.length>0){
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
                http.wxRequest({ ...this.data.api.getOrderById, urlReplacements: [{ substr: '{id}', replacement: item.id }] }).then(
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
              orderList:res.data
            })
          } else {
            this.setData({
              orderList:this.data.orderList.concat(res.data)
            })
          }
          console.log(params.pageNo,res.page.totalPage)
          if(params.pageNo===res.page.totalPage){
            this.setData({
              bottomLineShow:true
            })
          }else{
            this.setData({
              bottomLineShow:false
            })
          }
          resolve()
        }
      })
    })
  },
  orderDetail(val){
    console.log(val)
    const pathParams = val.currentTarget.dataset.option
    wx.navigateTo({
      url: '../order-detail/order-detail',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
      }
    })
  }
})
