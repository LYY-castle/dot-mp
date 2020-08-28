"use strict";

var _request = _interopRequireDefault(require("../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../utils/mixin.js"));

var _constant = _interopRequireDefault(require("../../config/constant"));

var _util = require("../../utils/util");

var _data;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var moment = require('../../utils/moment.min.js');

Page({
  /**
   * 页面的初始数据
   */
  data: (_data = {
    pay: '/static/img/pay.png',
    waitPay: '/static/img/wait-pay.png',
    empty: '/static/img/empty.png',
    iconSuccess: '/static/img/icon-success.png',
    iconFail: '/static/img/icon-fail.png'
  }, _defineProperty(_data, "empty", '/static/img/empty.png'), _defineProperty(_data, "timeShow", false), _defineProperty(_data, "canSearch", true), _defineProperty(_data, "value1", 0), _defineProperty(_data, "startDate", '2020-08-27'), _defineProperty(_data, "endDate", '2020-08-28'), _defineProperty(_data, "activeButtonIndex", 0), _defineProperty(_data, "option1", [{
    text: '订单数量由高到低',
    value: 0
  }, {
    text: '订单数量由低到高',
    value: 1
  }, {
    text: '订单金额由高到低',
    value: 2
  }, {
    text: '订单金额由低到高',
    value: 3
  }, {
    text: '产品数量由高到低',
    value: 4
  }, {
    text: '产品数量由低到高',
    value: 5
  }]), _defineProperty(_data, "buttonGroup", [{
    text: '当天'
  }, {
    text: '本周'
  }, {
    text: '本月'
  }]), _defineProperty(_data, "selectMap", [{
    direction: 'desc',
    field: 'orderNum'
  }, {
    direction: 'asc',
    field: 'orderNum'
  }, {
    direction: 'desc',
    field: 'totalAmount'
  }, {
    direction: 'asc',
    field: 'totalAmount'
  }, {
    direction: 'desc',
    field: 'totalNum'
  }, {
    direction: 'asc',
    field: 'totalNum'
  }]), _defineProperty(_data, "direction", 'desc'), _defineProperty(_data, "field", 'orderNum'), _defineProperty(_data, "createAt", '自定义'), _defineProperty(_data, "defaultDate", [new Date().getTime(), new Date().getTime()]), _defineProperty(_data, "pageSize", 10), _defineProperty(_data, "type", _constant["default"].productType.defaultProductType), _defineProperty(_data, "createAtStart", (0, _util.getStartTime)(moment(new Date()).format(), 'day')), _defineProperty(_data, "createAtEnd", (0, _util.getEndTime)(moment(new Date()).format(), 'day')), _defineProperty(_data, "pageNo", 1), _defineProperty(_data, "active", 'mine'), _defineProperty(_data, "activeProductType", _constant["default"].productType.defaultProductType), _defineProperty(_data, "myDataList", []), _defineProperty(_data, "productTypes", []), _defineProperty(_data, "api", {
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
  }), _defineProperty(_data, "createAtTypeMap", {
    1: 'week',
    2: 'month'
  }), _data),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad() {
    var _this = this;

    Promise.resolve().then(function () {
      return _this.getProductSorts();
    }).then(function () {
      return _this.getMyAchievement();
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},
  // 获取产品分类
  getProductSorts: function getProductSorts() {
    var _this2 = this;

    var params = {
      parentId: 0,
      pageSize: 100,
      isEnable: 1
    };

    _mixin["default"].getProductSorts(params).then(function (res) {
      _this2.setData({
        productTypes: res.data
      });
    });
  },
  // 获取业绩
  getMyAchievement: function getMyAchievement() {
    var _this3 = this;

    var params = {
      pageNo: this.data.pageNo,
      pageSize: 10,
      type: this.data.activeProductType,
      startTime: this.data.createAtStart,
      endTime: this.data.createAtEnd,
      createBy: wx.getStorageSync('userId')
    };

    if (this.data.active === 'mine') {
      // 我的业绩
      // 非保险类型
      var requestData1 = function requestData1(param) {
        return new Promise(function (resolve) {
          _request["default"].wxRequest(_objectSpread({}, _this3.data.api.getMyDataList, {
            params: param
          })).then(function (res) {
            if (res.success) {
              if (param.status === 0) {
                _this3.setData({
                  myDataList: res.data
                });
              }

              if (param.status === 1) {
                _this3.setData({
                  myDataList: _this3.data.myDataList.concat(res.data)
                });
              }

              resolve();
            }
          });
        });
      }; // 保险类型


      var requestData2 = function requestData2() {
        return new Promise(function (resolve) {
          _request["default"].wxRequest(_objectSpread({}, _this3.data.api.getMyDataList, {
            params: params
          })).then(function (res) {
            if (res.success) {
              _this3.linkStatus = true;

              if (params.pageNo === 1) {
                _this3.setData({
                  myDataList: res.data
                });
              } else {
                _this3.setData({
                  myDataList: _this3.data.myDataList.concat(res.data)
                });
              }

              resolve();
            }
          });
        });
      };

      if (!_constant["default"].productType.qsebao.includes(this.data.activeProductType)) {
        var params1 = _objectSpread({}, params, {
          status: 0
        });

        var params2 = _objectSpread({}, params, {
          status: 1
        });

        Promise.resolve().then(function () {
          return requestData1(params1);
        }).then(function () {
          return requestData1(params2);
        });
      } else {
        requestData2();
      }
    } else if (this.data.active === 'dots') {
      var dotsParams = _objectSpread({}, params, {
        field: this.data.field,
        direction: this.data.direction
      }); // 小点点业绩


      _request["default"].wxRequest(_objectSpread({}, this.data.api.getMyChildDataList, {
        params: dotsParams
      })).then(function (res) {
        if (res.success) {
          res.data.forEach(function (item) {
            item.userPhone = item.userPhone.replace(item.userPhone.substring(3, 6), '***');
          });

          if (dotsParams.pageNo === 1) {
            _this3.setData({
              myDataList: res.data
            });
          } else {
            _this3.setData({
              myDataList: _this3.data.myDataList.concat(res.data)
            });
          }
        }
      });
    } else if (this.data.active === 'channel') {
      // 渠道业绩
      var channelParams = _objectSpread({}, params, {
        field: this.data.field,
        direction: this.data.direction
      });

      _request["default"].wxRequest(_objectSpread({}, this.data.api.getUserGroupList, {
        params: channelParams
      })).then(function (res) {
        if (res.success) {
          if (channelParams.pageNo === 1) {
            _this3.setData({
              myDataList: res.data
            });
          } else {
            _this3.setData({
              myDataList: _this3.data.myDataList.concat(res.data)
            });
          }
        }
      });
    } else if (this.data.active === 'team') {
      this.getMyTeam();
    }
  },
  // typeChange
  typeChange: function typeChange(event) {
    this.setData({
      myDataList: [],
      active: event.detail.name,
      activeProductType: _constant["default"].productType.defaultProductType
    });
    this.getMyAchievement();
  },
  // goodChange
  goodChange: function goodChange(event) {
    this.setData({
      myDataList: [],
      activeProductType: event.detail.name
    });
    this.getMyAchievement();
  },
  formatDate: function formatDate(date) {
    return "".concat(date.getMonth() + 1, "/").concat(date.getDate());
  },
  selectChange: function selectChange(event) {
    console.log(event);
    var index = event.detail;
    this.setData({
      field: this.data.selectMap[index].field,
      direction: this.data.selectMap[index].direction
    });
    this.getMyAchievement();
  },
  getMyTeam: function getMyTeam() {
    var _this4 = this;

    var params = {
      parentId: wx.getStorageSync('userId'),
      pageNo: this.data.pageNo,
      pageSize: 20
    };
    return new Promise(function (resolve) {
      _request["default"].wxRequest(_objectSpread({}, _this4.data.api.getMyTeam, {
        params: params
      })).then(function (res) {
        if (res.success) {
          if (params.pageNo === 1) {
            _this4.setData({
              myDataList: res.data
            });
          } else {
            _this4.setData({
              myDataList: _this4.data.myDataList.concat(res.data)
            });
          }

          resolve();
        }
      });
    });
  },
  MyAchievementByTime: function MyAchievementByTime(e) {
    var index = e.currentTarget.dataset.index;
    this.setData({
      activeButtonIndex: index
    });

    if (index === 0) {
      this.setData({
        timeShow: false,
        createAtStart: (0, _util.getStartTime)(moment().format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment().format(), 'day'),
        createAt: '自定义'
      });
      this.getMyAchievement();
    }

    if (index === 1) {
      this.setData({
        timeShow: false,
        createAtStart: (0, _util.getStartTime)(moment().startOf('week').format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment().endOf('week').format(), 'day'),
        createAt: '自定义'
      });
      this.getMyAchievement();
    }

    if (index === 2) {
      this.setData({
        timeShow: false,
        createAtStart: (0, _util.getStartTime)(moment().startOf('month').format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment().endOf('month').format(), 'day'),
        createAt: '自定义'
      });
      this.getMyAchievement();
    }

    if (index === 3) {
      this.setData({
        timeShow: true
      });
    }
  },
  startTimeSelect: function startTimeSelect(e) {
    console.log('start', e);
    var option = (0, _util.getStartTime)(moment(e.detail.value).format(), 'day');
    this.setData({
      createAtStart: option
    });
  },
  endTimeSelect: function endTimeSelect(e) {
    var option = (0, _util.getEndTime)(moment(e.detail.value).format(), 'day');

    if (new Date(option).getTime() > new Date(this.data.createAtStart).getTime()) {
      this.setData({
        createAtEnd: option
      });
    } else {
      wx.showToast({
        title: '结束时间不能小于开始时间',
        icon: 'none'
      });
    }
  },
  searchByDiyTIme: function searchByDiyTIme() {
    if (new Date(this.data.createAtEnd).getTime() > new Date(this.data.createAtStart).getTime()) {
      this.getMyAchievement();
    } else {
      wx.showToast({
        title: '结束时间不能小于开始时间',
        icon: 'none'
      });
    }
  },
  goToNextPage: function goToNextPage(e) {
    console.log(e);
    var event = e.currentTarget.dataset.option;

    var option = _objectSpread({}, event, {
      direction: this.data.direction,
      field: this.data.field,
      createAtStart: this.data.createAtStart,
      createAtEnd: this.data.createAtEnd,
      active: this.data.active
    });

    console.log('option', option);
    wx.navigateTo({
      url: './detail-page/detail-page',
      success: function success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: option
        });
      }
    });
  }
});