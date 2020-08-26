"use strict";

var _request = _interopRequireDefault(require("../../../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../../../utils/mixin.js"));

var _constant = _interopRequireDefault(require("../../../../config/constant"));

var _util = require("../../../../utils/util");

var _data;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var moment = require('../../../../utils/moment.min.js');

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
  }, _defineProperty(_data, "empty", '/static/img/empty.png'), _defineProperty(_data, "activeColor", ''), _defineProperty(_data, "activeButtonIndex", 0), _defineProperty(_data, "orderNum", []), _defineProperty(_data, "minDate", new Date(1970, 0, 1).getTime()), _defineProperty(_data, "maxDate", new Date().getTime()), _defineProperty(_data, "productTypes", []), _defineProperty(_data, "activeProductType", _constant["default"].productType.defaultProductType), _defineProperty(_data, "timeShow", false), _defineProperty(_data, "buttonIndex", 0), _defineProperty(_data, "createAt", '自定义'), _defineProperty(_data, "defaultDate", [new Date(), new Date()]), _defineProperty(_data, "pageSize", 10), _defineProperty(_data, "pageNo", 1), _defineProperty(_data, "type", _constant["default"].productType.defaultProductType), _defineProperty(_data, "createAtStart", (0, _util.getStartTime)(moment(new Date()).format(), 'day')), _defineProperty(_data, "createAtEnd", (0, _util.getEndTime)(moment(new Date()).format(), 'day')), _defineProperty(_data, "orderList", []), _defineProperty(_data, "buttonGroup", [{
    text: '当天'
  }, {
    text: '本周'
  }, {
    text: '本月'
  }]), _defineProperty(_data, "api", {
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
  }), _defineProperty(_data, "insureStatusMap", {
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
  }), _defineProperty(_data, "statusMap", {
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
  }), _data),

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var _this = this;

    Promise.resolve().then(function () {
      return _this.getProductSorts();
    }).then(function () {
      return _this.getOrderList();
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
      console.log(res);
      var mapOPtion = res.data.map(function (item) {
        return {
          name: item.name,
          code: item.code
        };
      });

      _this2.setData({
        productTypes: mapOPtion
      });
    });
  },
  getOrderListProductType: function getOrderListProductType(event) {
    var _this3 = this;

    this.setData({
      type: event.detail.name
    });
    Promise.resolve().then(function () {
      return _this3.resteParams();
    }).then(function () {
      return _this3.getOrderList();
    });
  },
  resteParams: function resteParams() {
    var _this4 = this;

    return new Promise(function (resolve) {
      _this4.setData({
        buttonIndex: 0,
        createAt: '自定义',
        defaultDate: [new Date(), new Date()],
        pageSize: 10,
        pageNo: 1,
        createAtStart: (0, _util.getStartTime)(moment(new Date()).format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment(new Date()).format(), 'day')
      });

      resolve();
    });
  },
  MyAchievementByTime: function MyAchievementByTime(e) {
    var index = e.currentTarget.dataset.index;

    if (index === 0) {
      this.setData({
        activeButtonIndex: index,
        createAtStart: (0, _util.getStartTime)(moment().format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment().format(), 'day'),
        createAt: '自定义',
        defaultDate: [new Date().getTime(), new Date().getTime()]
      });
      this.getOrderList();
    } else if (index === 1) {
      this.setData({
        activeButtonIndex: index,
        createAtStart: (0, _util.getStartTime)(moment().startOf('week').format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment().endOf('week').format(), 'day'),
        createAt: '自定义',
        defaultDate: [new Date().getTime(), new Date().getTime()]
      });
      this.getOrderList();
    } else if (index === 2) {
      this.setData({
        activeButtonIndex: index,
        createAtStart: (0, _util.getStartTime)(moment().startOf('month').format(), 'day'),
        createAtEnd: (0, _util.getEndTime)(moment().endOf('month').format(), 'day'),
        createAt: '自定义',
        defaultDate: [new Date().getTime(), new Date().getTime()]
      });
      this.getOrderList();
    } else if (index === 3) {
      this.setData({
        activeButtonIndex: index,
        timeShow: true
      });
    }
  },
  onTimeClose: function onTimeClose() {
    this.setData({
      timeShow: false
    });
  },
  onConfirmTime: function onConfirmTime(date) {
    var start = date.detail[0];
    var end = date.detail[1];
    this.setData({
      timeShow: false,
      createAtStart: (0, _util.getStartTime)(moment(start).format(), 'day'),
      createAtEnd: (0, _util.getStartTime)(moment(end).format(), 'day'),
      createAt: "".concat(this.formatDate(start), " - ").concat(this.formatDate(end)),
      defaultDate: [moment(start).toDate().getTime(), moment(end).toDate().getTime()]
    });
    this.getOrderList();
  },
  formatDate: function formatDate(date) {
    return "".concat(date.getMonth() + 1, "/").concat(date.getDate());
  },
  getOrderList: function getOrderList() {
    var _this5 = this;

    return new Promise(function (resolve) {
      var params = {
        type: _this5.data.type,
        createAtStart: _this5.data.createAtStart,
        createAtEnd: _this5.data.createAtEnd,
        pageNo: _this5.data.pageNo,
        pageSize: _this5.data.pageSize,
        createBy: wx.getStorageSync('userId')
      };

      _request["default"].wxRequest(_objectSpread({}, _this5.data.api.getOrderList, {
        params: params
      })).then(function (res) {
        if (res.success) {
          if (res.data.length > 0) {
            res.data.orderList.forEach(function (item) {
              if (item.orderExtends.length > 0) {
                item.orderExtends.forEach(function (extend) {
                  if (extend.product.image) {
                    if (extend.product.image !== null && extend.product.image.indexOf(';') !== -1) {
                      extend.product.image = extend.product.image.split(';')[0];
                    }
                  }
                });
              }

              if (_constant["default"].productType.qsebao.includes(item.type)) {
                _request["default"].wxRequest(_objectSpread({}, _this5.data.api.getOrderById, {
                  urlReplacements: [{
                    substr: '{id}',
                    replacement: item.id
                  }]
                })).then(function (result) {
                  if (result.success) {
                    item.policy = result.data.policy;
                  }
                });
              }
            });

            if (params.pageNo === 1) {
              _this5.setData({
                orderList: res.data
              });
            } else {
              _this5.setData({
                orderList: _this5.data.orderList.concat(res.data)
              });
            }
          }

          resolve();
        }
      });
    });
  },
  orderDetail: function orderDetail(val) {
    console.log(val);
    var pathParams = val.currentTarget.dataset.option;
    wx.navigateTo({
      url: '../order-detail/order-detail',
      success: function success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: pathParams
        });
      }
    });
  }
});