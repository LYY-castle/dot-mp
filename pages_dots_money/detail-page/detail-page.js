import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import qseBaoUtil from '../../utils/qsebao.js'
import constantCfg from '../../config/constant'
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
    iconSuccess: '/static/img/icon-success.png',
    iconFail: '/static/img/icon-fail.png',
    empty: '/static/img/empty.png',
    constantCfg,
    bottomLineShow:false,
    pageTitle: '',
    dataList: [],
    pageParams: {},
    pageNo: 1,
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
    api: {
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
      // 获取我的团队
      getMyTeam: {
        url: '/users',
        method: 'get'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function (res) {
      _this.setData({
        pageParams: res.data
      })
      _this.getDetail()
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let title = ''
    const active = this.data.pageParams.active
    if(active==='mine'){
      title = '我的业绩'
    }else if(active==='dots'){
      title=this.data.pageParams.userName+'的业绩'
    }else if(active==='channel'){
      title=this.data.pageParams.channelName+'的业绩'
    }else if(active==='team'){
      title=this.data.pageParams.name+'的团队'
    }
    wx.setNavigationBarTitle({
      title
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log('触底函数')
    if(!this.data.bottomLineShow){
      this.setData({
        pageNo:this.data.pageNo+1
      })
      this.getDetail()
    }
  },
  getDetail() {
    let params = {
      pageSize: 10,
      pageNo: this.data.pageNo,
    }
    const active = this.data.pageParams.active
    let reqUrl = ''

    if (active !== 'team') {
      if (active === 'mine') {
        params.createBy = wx.getStorageSync('userId')
        if (constantCfg.productType.qsebao.includes(this.data.pageParams.type)) {
          // 获取每个保单的详情
          reqUrl = this.data.api.getPolicies
          params.applicantId = this.data.pageParams.applicantId
        } else {
          // 获取我的业绩订单
          reqUrl = this.data.api.getMyOrderList
          params.status = this.data.pageParams.status
        }
        params.type = this.data.pageParams.type
        params.createAtStart = this.data.pageParams.createAtStart
        params.createAtEnd = this.data.pageParams.createAtEnd
      } else {
        params.createBy = this.data.pageParams.userId
        params.type = this.data.pageParams.type
        params.field = this.data.pageParams.field
        params.direction = this.data.pageParams.direction
        params.startTime = this.data.pageParams.createAtStart
        params.endTime = this.data.pageParams.createAtEnd
        if (active === 'dots') {
          reqUrl = this.data.api.getMyChildDataList
        } else if (active === 'channel') {
          reqUrl = this.data.api.getMyChannelDataList
        }
      }
    } else {
      reqUrl = this.data.api.getMyTeam
      params.parentId = this.data.pageParams.id
    }
    http.wxRequest({
      ...reqUrl,
      params
    }).then(res => {
      if (res.success) {
        if (params.pageNo === 1) {
          this.setData({
            dataList: res.data
          })
        } else {
          this.setData({
            dataList: this.data.dataList.concat(res.data)
          })
        }
        if(params.pageNo===res.page.totalPage){
          this.setData({
            bottomLineShow:true
          })
        }
      }
    })
  },

  freshPage(e) {
    console.log('freshPage',e)
    const option = e.currentTarget.dataset.option
    let params = {
      pageSize: 10,
      pageNo: this.data.pageNo
    }
    const active = this.data.pageParams.active
    if (active === 'channel') {
      params.type = this.data.pageParams.type
      params.field = this.data.pageParams.field
      params.direction = this.data.pageParams.direction
      params.startTime = this.data.pageParams.createAtStart
      params.endTime = this.data.pageParams.createAtEnd
      params.createBy = option ? option.userId : this.data.pageParams.createBy
      http.wxRequest({
        ...this.data.api.getMyChannelDataList,
        params
      }).then(res => {
        if (res.success) {
          if (params.pageNo === 1) {
            this.setData({
              dataList: res.data
            })
          } else {
            this.setData({
              dataList: this.data.dataList.concat(res.data)
            })
          }
        }
      })
    }else{
      console.log('不处理')
      return
    }
  }
})
