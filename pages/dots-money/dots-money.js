// pages/dots-money/dots-money.js
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
    pay: '/static/img/pay.png',
    waitPay: '/static/img/wait-pay.png',
    empty: '/static/img/empty.png',
    iconSuccess: '/static/img/icon-success.png',
    iconFail: '/static/img/icon-fail.png',
    empty: '/static/img/empty.png',
    // 排序
    timeShow: false,
    canSearch:true,
    value1: 0,
    startDate: '2020-08-27',
    endDate: '2020-08-28',
    activeButtonIndex: 0,
    option1: [{
        text: '订单数量由高到低',
        value: 0
      },
      {
        text: '订单数量由低到高',
        value: 1
      },
      {
        text: '订单金额由高到低',
        value: 2
      },
      {
        text: '订单金额由低到高',
        value: 3
      },
      {
        text: '产品数量由高到低',
        value: 4
      },
      {
        text: '产品数量由低到高',
        value: 5
      }
    ],
    buttonGroup: [{
      text: '当天'
    }, {
      text: '本周'
    }, {
      text: '本月'
    }],
    selectMap: [{
        direction: 'desc',
        field: 'orderNum'
      },
      {
        direction: 'asc',
        field: 'orderNum'
      },
      {
        direction: 'desc',
        field: 'totalAmount'
      },
      {
        direction: 'asc',
        field: 'totalAmount'
      },
      {
        direction: 'desc',
        field: 'totalNum'
      },
      {
        direction: 'asc',
        field: 'totalNum'
      }
    ],
    direction: 'desc',
    field: 'orderNum',
    createAt: '自定义',
    defaultDate: [new Date().getTime(), new Date().getTime()],
    pageSize: 10,
    type: constantCfg.productType.defaultProductType,
    createAtStart: getStartTime(moment(new Date()).format(), 'day'),
    createAtEnd: getEndTime(moment(new Date()).format(), 'day'),
    pageNo: 1,
    active: 'mine', // 当前活跃业绩类型 tab
    activeProductType: constantCfg.productType.defaultProductType, // 当前默认商品类型
    myDataList: [],
    productTypes: [],
    api: {
      // 获取我的业绩
      getMyDataList: {
        url: '/orders/user-statistics',
        method: 'get'
      },
      // 获取我的业绩中的订单
      getMyOrderList: {
        url: '/orders',
        methods: 'get'
      },

      // 获取每个投保客户保单的详情
      getPolicies: {
        url: '/policies/applicant/policys',
        method: 'get'
      },
      // 获取旅游卡类型详情
      getTouristCardDetail: {
        url: '/orders',
        method: 'get'
      },

      // 获取渠道业绩
      getUserGroupList: {
        url: '/orders/channel-statistics',
        method: 'get'
      },
      // 获取小点点业绩
      getMyChildDataList: {
        url: '/orders/user-child-statistics',
        method: 'get'
      },
      // 获取渠道下级业绩
      getMyChannelDataList: {
        url: '/orders/channel-child-statistics',
        method: 'get'
      },
      // 获取当前用户的渠道数
      getGroups: {
        url: '/usergroup-users/usergroups',
        method: 'get'
      },
      // 获取我的团队
      getMyTeam: {
        url: '/users',
        method: 'get'
      }
    },
    createAtTypeMap: {
      1: 'week',
      2: 'month'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    Promise.resolve()
    .then(()=>this.getProductSorts())
    .then(()=>this.getMyAchievement())
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
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 获取产品分类
  getProductSorts() {
    const params = {
      parentId: 0,
      pageSize: 100,
      isEnable: 1,
    }
    tool.getProductSorts(params).then(res => {
      this.setData({
        productTypes: res.data
      })
    })
  },
  // 获取业绩
  getMyAchievement() {
    const params = {
      pageNo: this.data.pageNo,
      pageSize: 10,
      type: this.data.activeProductType,
      startTime: this.data.createAtStart,
      endTime: this.data.createAtEnd,
      createBy: wx.getStorageSync('userId')
    }
    if (this.data.active === 'mine') {
        // 我的业绩
      // 非保险类型
      const requestData1 = (param) => {
        return new Promise((resolve) => {
          http.wxRequest({
            ...this.data.api.getMyDataList,
            params: param
          }).then(res => {
            if (res.success) {
              if (param.status===0) {
                this.setData({
                  myDataList: res.data
                })
              }
              if(param.status===1){
                this.setData({
                  myDataList: this.data.myDataList.concat(res.data)
                })
              }
              resolve()
            }
          })
        })
      }
      // 保险类型
      const requestData2 = () => {
        return new Promise((resolve) => {
          http.wxRequest({
            ...this.data.api.getMyDataList,
            params
          }).then(res => {
            if (res.success) {
              this.linkStatus = true
              if (params.pageNo === 1) {
                this.setData({
                  myDataList: res.data
                })
              } else {
                this.setData({
                  myDataList: this.data.myDataList.concat(res.data)
                })
              }
              resolve()
            }
          })
        })
      }
      if (!constantCfg.productType.qsebao.includes(this.data.activeProductType)) {
        const params1 = {
          ...params,
          status: 0
        }
        const params2 = {
          ...params,
          status: 1
        }
        Promise.resolve()
          .then(() => requestData1(params1))
          .then(() => requestData1(params2))
      } else {
        requestData2()
      }
    } else if (this.data.active === 'dots') {
      const dotsParams = {
        ...params,
        field: this.data.field,
        direction: this.data.direction,
      }
      // 小点点业绩
      http.wxRequest({ ...this.data.api.getMyChildDataList, params:dotsParams }).then((res) => {
        if (res.success) {
          res.data.forEach((item) => {
            item.userPhone = item.userPhone.replace(item.userPhone.substring(3, 6), '***')
          })
          if (dotsParams.pageNo === 1) {
            this.setData({
              myDataList:res.data
            })
          } else {
            this.setData({
              myDataList:this.data.myDataList.concat(res.data)
            })
          }
        }
      })
    } else if (this.data.active === 'channel') {
      // 渠道业绩
      const channelParams = {
        ...params,
        field: this.data.field,
        direction: this.data.direction,
      }
      http.wxRequest({ ...this.data.api.getUserGroupList, params:channelParams }).then((res) => {
        if (res.success) {
          if (channelParams.pageNo === 1) {
            this.setData({
              myDataList:res.data
            })
          } else {
            this.setData({
              myDataList:this.data.myDataList.concat(res.data)
            })
          }
        }
      })
    } else if (this.data.active === 'team') {
      this.getMyTeam()
    }
  },
  // typeChange
  typeChange(event){
    this.setData({
      activeButtonIndex:0,
      timeShow: false,
      myDataList:[],
      active:event.detail.name,
      activeProductType:constantCfg.productType.defaultProductType
    })
    this.getMyAchievement()
  },
  // goodChange
  goodChange(event){
    this.setData({
      activeButtonIndex:0,
      timeShow: false,
      myDataList:[],
      activeProductType:event.detail.name
    })
    this.getMyAchievement()
  },
  selectChange(event){
    console.log(event)
    const index = event.detail
    this.setData({
      field:this.data.selectMap[index].field,
      direction:this.data.selectMap[index].direction
    })
    this.getMyAchievement()
  },
  getMyTeam() {
    const params = {
      parentId: wx.getStorageSync('userId'),
      pageNo: this.data.pageNo,
      pageSize: 20
    }
    return new Promise(resolve => {
      http.wxRequest({
        ...this.data.api.getMyTeam,
        params
      }).then(res => {
        if (res.success) {
          if (params.pageNo === 1) {
            this.setData({
              myDataList:res.data
            })
          } else {
            this.setData({
              myDataList:this.data.myDataList.concat(res.data)
            })
          }
          resolve()
        }
      })
    })
  },
  MyAchievementByTime(e) {
    const index = e.currentTarget.dataset.index
    this.setData({
      activeButtonIndex:index,
    })
    if (index === 0) {
      this.setData({
        timeShow: false,
        createAtStart: getStartTime(moment().format(), 'day'),
        createAtEnd: getEndTime(moment().format(), 'day'),
      })
      this.getMyAchievement()
    }
    if(index===1){
      this.setData({
        timeShow: false,
        createAtStart: getStartTime(moment().startOf('week').format(), 'day'),
        createAtEnd: getEndTime(moment().endOf('week').format(), 'day'),
      })
      this.getMyAchievement()
    }
    if(index===2){
      this.setData({
        timeShow: false,
        createAtStart: getStartTime(moment().startOf('month').format(), 'day'),
        createAtEnd: getEndTime(moment().endOf('month').format(), 'day'),
      })
      this.getMyAchievement()
    }
    if(index===3){
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
      this.getMyAchievement()
    }else{
      wx.showToast({
        title:'结束时间不能小于开始时间',
        icon:'none'
      })
    }

  },
  goToNextPage(e){
    console.log(e)
    const event = e.currentTarget.dataset.option
    const option = {
      ...event,
      direction:this.data.direction,
      field:this.data.field,
      createAtStart:this.data.createAtStart,
      createAtEnd:this.data.createAtEnd,
      active:this.data.active
    }
    wx.navigateTo({
      url: '/pages_dots_money/detail-page/detail-page',
      success: function(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', { data: option })
      }
    })
  }
})
