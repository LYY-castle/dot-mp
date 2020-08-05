// pages/dots-money/dots-money.js
import {
  getEndTime,
  getStartTime
} from '../../utils/util'
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
    // 排序
    timeShow: false,
    minDate: new Date(1970, 0, 1),
    maxDate: new Date(),
    value1: 0,
    buttonIndex: 0,
    activeStatus: 0, // 0待支付1已支付
    activeItem: null, // 当前活跃的点击对象
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
    defaultParam: {
      direction: 'desc',
      field: 'orderNum',
      createAt: '自定义',
      defaultDate: [new Date(), new Date()],
      createAtStart: getStartTime(moment(new Date()).format(), 'day'),
      createAtEnd: getEndTime(moment(new Date()).format(), 'day'),
      pageNo: 1,
      pageSize: 10,
      // type: constantCfg.productType.defaultProductType
    },
    pageNo: 1,
    pageList: [],
    dotList: [],
    dotListById: [],
    offsetTop: 46,
    pageTitle: '点点财',
    active: 'mine', // 当前活跃tab
    // activeProductType: constantCfg.productType.defaultProductType, // 当前默认商品
    activeName: '',
    activeUserId: null,
    myDataList: [], // 我的业绩
    myDotsDataList: [], // 小点点业绩
    myChannelsDataList: [], // 渠道业绩
    childList: [], // 每个投保对象下的保单/购卡人下面的卡详情
    myPoliciesLoading: false,
    myPoliciesFinished: true,
    policiesPageSize: 5,
    policiesPageNo: 1,
    loading: false,
    finished: false,
    loadingShow: false,
    customerName: '',
    linkStatus: 'true',
    productTypes: [],
    shareParams: {
      
    },
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
      // 获取产品类型
      getProductTypes: {
        url: '/system/dicts/{dictCode}/items/enable',
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
  onLoad: function (options) {
    const pages = getCurrentPages()
    this.setData({
      shareParams:{
        title: '',
        desc: '',
        imgUrl: '',
        link: pages[pages.length - 1].route
      }
    })
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

  }
})