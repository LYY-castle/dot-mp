// pages/mine/mine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg:'/static/img/bg.png',
    avatar:'/static/img/avatar.png',
    list: [{
      title: '个人资料',
      iconHref: '/static/img/mine-info.png'
    }, {
      title: '银行卡',
      iconHref: '/static/img/bank-card.png'
    }, {
      title: '修改密码',
      iconHref: '/static/img/modify-password.png'
    }, {
      title: '我的订单',
      iconHref: '/static/img/order.png'
    }, {
      title: '我的地址',
      iconHref: '/static/img/address.png'
    }]
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
  MyAchievementByTime(val) {
    this.buttonIndex = val
    if (val === 3) {
      this.timeShow = true
    } else {
      if (val === 0) {
        this.defaultParam.createAtStart = getStartTime(moment().format(), 'day')
        this.defaultParam.createAtEnd = getEndTime(moment().format(), 'day')
      } else {
        this.defaultParam.createAtStart = getStartTime(
          moment()
            .startOf(this.createAtTypeMap[val])
            .format(),
          'day'
        )
        this.defaultParam.createAtEnd = getEndTime(
          moment()
            .endOf(this.createAtTypeMap[val])
            .format(),
          'day'
        )
      }
      this.defaultParam.createAt = '自定义'
      this.defaultParam.defaultDate = [new Date(), new Date()]
      this.getMyAchievement(this.defaultParam)
    }
  },
  getProductTypes() {
    request({
      ...this.api.getProductTypes,
      urlReplacements: [{ substr: '{dictCode}', replacement: 'product_type' }]
    }).then(res => {
      if (res.success) {
        this.productTypes = res.data
      }
    })
  },
  // 去详情页
  goToNextPage(param) {
    if (this.active === 'mine') {
      if (param.totalAmount > 0) {
        if (constantCfg.productType.qsebao.includes(this.activeProductType)) {
          // 获取每个保单的详情
          this.defaultParam.applicantId = param.applicantId
        } else {
          // 获取我的业绩订单
          this.defaultParam.createBy = this.userId
          this.defaultParam.status = param.orderStatus
        }
      } else {
        Toast('暂无数据')
        return
      }
    } else if (this.active === 'team') {
      if (param.hasChildren === 1) {
        this.defaultParam.parentId = param.id
      } else {
        return
      }
    }
    if (param.userName || param.channelName || param.name) {
      this.defaultParam.parentName = param.userName || param.channelName || param.name
    }
    this.defaultParam.createBy = param.userId
    this.defaultParam.type = this.activeProductType
    this.defaultParam.activeProductType = this.activeProductType
    this.defaultParam.active = this.active
    this.defaultParam.buttonIndex = this.buttonIndex

    localStorage.setItem('dotsMoneyParams', JSON.stringify(this.defaultParam))

    this.switchRouter({
      path: '/detail-page'
    })
  },
  // 获取业绩
  getMyAchievement() {
    if (this.active === 'mine') {
      // 我的业绩
      let params1 = {
        pageNo: this.pageNo,
        pageSize: 10,
        type: this.activeProductType,
        startTime: this.defaultParam.createAtStart,
        endTime: this.defaultParam.createAtEnd,
        createBy: this.userId
      }
      let params2 = {
        pageNo: this.pageNo,
        pageSize: 10,
        type: this.activeProductType,
        startTime: this.defaultParam.createAtStart,
        endTime: this.defaultParam.createAtEnd,
        createBy: this.userId
      }
      const requestData = () => {
        return new Promise(resolve => {
          request({ ...this.api.getMyDataList, params: params1 }).then(res => {
            if (res.success) {
              this.myDataList = res.data
              resolve()
            } else {
              Toast(res.message)
            }
          })
        })
      }
      const requestData2 = () => {
        return new Promise(resolve => {
          request({ ...this.api.getMyDataList, params: params2 }).then(res => {
            if (res.success) {
              this.myDataList = this.myDataList.concat(res.data)
              resolve()
            } else {
              Toast(res.message)
            }
          })
        })
      }
      const requestData3 = () => {
        return new Promise(resolve => {
          request({ ...this.api.getMyDataList, params: params2 }).then(res => {
            if (res.success) {
              this.linkStatus = true
              if (params2.pageNo === res.page.totalPage || res.page.totalPage === 0) {
                this.finished = true
              }
              if (params2.pageNo === 1) {
                this.myDataList = res.data
              } else {
                this.myDataList = this.myDataList.concat(res.data)
              }
              this.loading = false
              this.loadingShow = false
              resolve()
            } else {
              Toast(res.message)
            }
          })
        })
      }
      if (!constantCfg.productType.qsebao.includes(this.activeProductType)) {
        params1.status = 0
        params2.status = 1
        this.myDataList = []
        this.finished = false
        this.loading = false
        this.loadingShow = false
        Promise.resolve()
          .then(() => requestData())
          .then(() => requestData2())
      } else {
        Promise.resolve().then(() => requestData3())
      }
    } else if (this.active === 'dots') {
      // 小点点业绩
      let params = {
        pageNo: this.pageNo,
        pageSize: 10,
        type: this.activeProductType,
        createBy: this.userId,
        startTime: this.defaultParam.createAtStart,
        endTime: this.defaultParam.createAtEnd,
        field: this.defaultParam.field,
        direction: this.defaultParam.direction
      }
      request({ ...this.api.getMyChildDataList, params }).then(res => {
        if (res.success) {
          this.dotList = res.data
          this.customerName = '小点点'
          this.linkStatus = false
          res.data.forEach(item => {
            item.userPhone = item.userPhone.replace(item.userPhone.substring(3, 6), '***')
          })
          if (params.pageNo === res.page.totalPage || res.page.totalPage === 0) {
            this.finished = true
          }
          if (params.pageNo === 1) {
            this.myDataList = res.data
          } else {
            this.myDataList = this.myDataList.concat(res.data)
          }
          this.loading = false
          this.loadingShow = false
        } else {
          Toast(res.message)
        }
      })
    } else if (this.active === 'channel') {
      // 渠道业绩
      const params = {
        pageNo: this.pageNo,
        pageSize: 10,
        type: this.activeProductType,
        startTime: this.defaultParam.createAtStart,
        endTime: this.defaultParam.createAtEnd,
        field: this.defaultParam.field,
        direction: this.defaultParam.direction
      }
      request({ ...this.api.getUserGroupList, params }).then(res => {
        if (res.success) {
          this.customerName = '渠道名'
          this.linkStatus = false
          if (params.pageNo === res.page.totalPage || res.page.totalPage === 0) {
            this.finished = true
          }
          if (params.pageNo === 1) {
            this.myDataList = res.data
          } else {
            this.myDataList = this.myDataList.concat(res.data)
          }
          this.loading = false
          this.loadingShow = false
        } else {
          Toast(res.message)
        }
      })
    } else if (this.active === 'team') {
      this.getMyTeam()
    }
  },
  resetDeclares() {
    return new Promise(resolve => {
      this.myDataList = []
      this.myDotsDataList = []
      this.myChannelsDataList = []
      this.topDataList = []
      this.childList = []
      this.dotList = []
      this.dotListById = []
      this.pageList = []
      this.activeUserId = null
      this.activeName = ''
      this.finished = false
      this.loading = false
      this.loadingShow = true
      this.myPoliciesLoading = false
      this.myPoliciesFinished = false
      this.pageNo = 1
      this.policiesPageNo = 1
      this.defaultParam.pageNo = 1
      this.timeShow = false
      this.value1 = 0
      this.option1 = [
        { text: '订单数量由高到低', value: 0 },
        { text: '订单数量由低到高', value: 1 },
        { text: '订单金额由高到低', value: 2 },
        { text: '订单金额由低到高', value: 3 },
        { text: '产品数量由高到低', value: 4 },
        { text: '产品数量由低到高', value: 5 }
      ]
      this.defaultParam = {
        direction: 'desc',
        field: 'orderNum',
        createAt: '自定义',
        defaultDate: [new Date(), new Date()],
        createAtStart: getStartTime(moment(new Date()).format(), 'day'),
        createAtEnd: getEndTime(moment(new Date()).format(), 'day')
      }
      this.buttonIndex = 0
      this.activeItem = null
      resolve()
    })
  },
  getMyTeam() {
    const params = {
      parentId: this.userId,
      pageNo: this.pageNo,
      pageSize: 20
    }
    return new Promise(resolve => {
      request({
        ...this.api.getMyTeam,
        params
      }).then(res => {
        if (res.success) {
          this.dotList = res.data
          this.linkStatus = false
          if (params.pageNo === res.page.totalPage || res.page.totalPage === 0) {
            this.finished = true
          }
          if (params.pageNo === 1) {
            this.myDataList = res.data
          } else {
            this.myDataList = this.myDataList.concat(res.data)
          }
          this.loading = false
          this.loadingShow = false
          resolve()
        } else {
          Toast(res.message)
        }
      })
    })
  },
  // tab切换操作
  tabChange() {
    if (this.activeProductType === constantCfg.productType.defaultProductType) {
      Promise.resolve()
        .then(() => this.resetDeclares())
        .then(() => this.getUserGroupIds())
        .then(() => this.getMyAchievement())
    } else {
      this.activeProductType = constantCfg.productType.defaultProductType
      Promise.resolve().then(() => this.resetDeclares())
    }
  },
  // 商品类型切换操作
  changeProductType() {
    Promise.resolve()
      .then(() => this.resetDeclares())
      .then(() => this.getUserGroupIds())
      .then(() => this.getMyAchievement())
  },
  getUserGroupIds() {
    const params = {
      userId: this.userId
    }
    return new Promise(resolve => {
      request({ ...this.api.getGroups, params }).then(res => {
        if (res.success) {
          store.dispatch('setGroupIds', res.data).then(() => {
            resolve()
          })
        }
      })
    })
  },

  onLoad() {
    this.pageNo++
    this.getMyAchievement()
  },
  onConfirmTime(date) {
    this.timeShow = false
    const [start, end] = date
    this.defaultParam.createAtStart = getStartTime(moment(start).format(), 'day')
    this.defaultParam.createAtEnd = getEndTime(moment(end).format(), 'day')
    this.defaultParam.createAt = `${this.formatDate(start)} - ${this.formatDate(end)}`
    this.defaultParam.defaultDate = [moment(start).toDate(), moment(end).toDate()]
    this.getMyAchievement(this.getmyDataListParams)
  },
  formatDate(date) {
    return `${date.getMonth() + 1}/${date.getDate()}`
  },
  selectChange(val) {
    this.defaultParam.direction = this.selectMap[val].direction
    this.defaultParam.field = this.selectMap[val].field
    this.getMyAchievement()
  }
})
