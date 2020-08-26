"use strict";

var _request = _interopRequireDefault(require("../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../utils/mixin.js"));

var _dialog = _interopRequireDefault(require("../../miniprogram_npm/@vant/weapp/dialog/dialog"));

var _constant = _interopRequireDefault(require("../../config/constant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bg: '/static/img/bg.png',
    avatar: '/static/img/avatar.png',
    api: {
      getUserInfo: {
        url: '/users/{id}',
        method: 'get'
      },
      logout: {
        url: '/users/logout',
        method: 'get'
      }
    },
    list: [{
      title: '个人资料',
      iconHref: '/static/img/mine-info.png',
      path: './personal-info/personal-info'
    }, {
      title: '银行卡',
      iconHref: '/static/img/bank-card.png',
      path: './bank-card/bank-card'
    }, // {
    //   title: '修改密码',
    //   iconHref: '/static/img/modify-password.png',
    //   path:'./modify-password/modify-password'
    // },
    {
      title: '我的订单',
      iconHref: '/static/img/order.png',
      path: './order/order-list/order-list'
    }, {
      title: '我的地址',
      iconHref: '/static/img/address.png',
      path: './address/address-list/address-list'
    }]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    var _this = this;

    Promise.resolve().then(function () {
      return _mixin["default"].checkToken();
    }).then(function () {
      return _this.getUserInfo();
    });
  },

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
  // 获取用户的头像信息
  getUserInfo: function getUserInfo() {
    var _this2 = this;

    return new Promise(function (resolve) {
      var id = wx.getStorageSync('userId');

      _request["default"].wxRequest(_objectSpread({}, _this2.data.api.getUserInfo, {
        urlReplacements: [{
          substr: '{id}',
          replacement: id
        }]
      })).then(function (res) {
        if (res.success) {
          _this2.setData({
            userInfo: res.data
          });
        }
      }).then(function () {
        if (_this2.data.userInfo.headImage) {
          if (_this2.data.userInfo.headImage.indexOf('https') === -1) {
            var params = {
              bucketName: _constant["default"].minio.bucketName,
              fileName: _this2.data.userInfo.headImage
            };

            _mixin["default"].review(params).then(function (result) {
              if (result.success) {
                _this2.setData({
                  avatar: result.data
                });
              }
            });
          }
        }
      });

      resolve();
    });
  },
  gotoPage: function gotoPage(event) {
    var option = event.currentTarget.dataset.option;
    console.log(option);
    wx.navigateTo({
      url: option.path,
      success: function success(res) {
        if (option.title === '我的地址') {
          var pathParams = {
            fromPath: 'mine'
          };
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: pathParams
          });
        }
      }
    });
  },
  // 退出登录
  logout: function logout() {
    var _this3 = this;

    _dialog["default"].confirm({
      title: '确定退出？'
    }).then(function () {
      var params = {
        id: wx.getStorageSync('userId')
      };

      _request["default"].wxRequest(_objectSpread({}, _this3.data.api.logout, {
        params: params
      })).then(function (res) {
        if (res.success) {
          wx.clearStorageSync();
          wx.reLaunch({
            url: './login/login'
          });
        }
      });
    })["catch"](function () {// on cancel
    });
  }
});