"use strict";

var _request = _interopRequireDefault(require("../../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../../utils/mixin.js"));

var _util = _interopRequireDefault(require("../../../utils/util.js"));

var _qsebao = _interopRequireDefault(require("../../../utils/qsebao.js"));

var _constant = _interopRequireDefault(require("../../../config/constant"));

var _crypto = _interopRequireDefault(require("../../../utils/crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    showContent: false,
    pageTitle: '',
    pathParams: {},
    productId: null,
    product: {},
    pricingRule: {},
    api: {
      // 查询产品详情.
      getProductById: {
        url: '/products/{id}',
        method: 'get'
      },
      // 查询产品生效计价规则.
      getProductEnablePricingRuleById: {
        url: '/products/{productId}/product-pricing-rules/enable',
        method: 'get'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var _this = this;

    var eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (res) {
      console.log('跳转传递参数', res);

      _this.setData({
        pathParams: res.data,
        productId: res.data.productId
      });

      console.log(_this.data.productId);

      _this.getProductDetail();

      _this.getProductEnablePricingRule();
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
  getProductDetail: function getProductDetail() {
    var _this2 = this;

    return new Promise(function (resolve) {
      _request["default"].wxRequest(_objectSpread({}, _this2.data.api.getProductById, {
        urlReplacements: [{
          substr: '{id}',
          replacement: _this2.data.productId
        }]
      })).then(function (res) {
        if (res.success) {
          if (res.data.image) {
            res.data.image = res.data.image.split(';');
          } else {
            res.data.image = [];
          }

          if (res.data.detail) {
            res.data.detail = res.data.detail.replace(/\<img/gi, '<img class="richImg"');
          }

          _this2.setData({
            showContent: true,
            product: res.data
          });

          resolve();
        }
      });
    });
  },
  getProductEnablePricingRule: function getProductEnablePricingRule() {
    var _this3 = this;

    return new Promise(function (resolve) {
      _request["default"].wxRequest(_objectSpread({}, _this3.data.api.getProductEnablePricingRuleById, {
        urlReplacements: [{
          substr: '{productId}',
          replacement: _this3.data.productId
        }]
      })).then(function (res) {
        if (res.success) {
          _this3.setData({
            pricingRule: res.data
          });

          resolve();
        }
      });
    });
  },
  buyCard: function buyCard() {
    var option = this.data.pathParams;
    console.log(option);
    wx.navigateTo({
      url: '../perchase/perchase',
      success: function success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: option
        });
      }
    });
  }
});