"use strict";

var _env = _interopRequireDefault(require("../../config/env.config"));

var _request = _interopRequireDefault(require("../../utils/request"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//获取应用实例
var app = getApp();
Page({
  data: {
    userInfo: {},
    userInfoShow: true,
    phoneShow: false,
    codeShow: false,
    phone: null,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIusePhone: wx.canIUse('button.open-type.getPhoneNumber'),
    api: {
      login: {
        url: '/users/wx-ma/login',
        method: 'post'
      }
    }
  },
  bindGetUserInfo: function bindGetUserInfo(e) {
    var _this = this;

    console.log(e);

    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail;

      _this.setData({
        userInfoShow: false,
        phoneShow: true
      });
    } // wx.authorize({
    //   scope: 'scope.userInfo',
    //   success () {
    //     wx.getUserInfo({
    //       lang:'zh_CN',
    //       success:res=>{
    //         console.log('授权成功,获取用户基本信息',res)
    //         app.globalData.userInfo = res
    //         _this.setData({
    //           userInfoShow:false,
    //           phoneShow:true
    //         })
    //       }
    //     })
    //   }
    // })

  },
  bindGetPhoneNumber: function bindGetPhoneNumber(e) {
    app.globalData.phone = e.detail;
    this.setData({
      phoneShow: false
    });
    this.login();
  },
  loginByCode: function loginByCode(e) {
    var _this2 = this;

    var _this = this;

    app.globalData.promoCode = 'FQAC';
    wx.login({
      success: function success(res) {
        app.globalData.wechatCode = res.code;
        wx.getUserInfo({
          lang: 'zh_CN',
          success: function success(res) {
            app.globalData.userInfo = res;

            _this2.login();
          }
        });
      }
    });
  },
  login: function login() {
    var _this3 = this;

    var params = {
      phoneEncryptedData: app.globalData.phone.encryptedData,
      phoneIv: app.globalData.phone.iv,
      promoCode: app.globalData.promoCode,
      userInfoEncryptedData: app.globalData.userInfo.encryptedData,
      userInfoIv: app.globalData.userInfo.iv,
      wechatAppId: _env["default"].env.appid,
      wechatCode: app.globalData.wechatCode
    };

    _request["default"].wxRequest(_objectSpread({}, this.data.api.login, {
      params: params
    })).then(function (res) {
      if (res.success) {
        wx.setStorageSync('userId', res.data.id);
        wx.setStorageSync('parentId', res.data.parentId);
        wx.setStorageSync('code', res.data.code);
        wx.setStorageSync('openId', res.data.openId);
        wx.switchTab({
          url: '../product/index'
        });
      } else {
        console.log(res.code);

        if (res.code === 403) {
          _this3.setData({
            codeShow: true
          });
        }
      }
    });
  },
  onLoad: function onLoad() {
    var _this = this;

    var code = wx.getStorageSync('code');

    if (code) {
      wx.switchTab({
        url: '../product/index'
      });
    } else {
      wx.getSetting({
        success: function success(res) {
          console.log('get', res.authSetting['scope.userInfo']);

          if (res.authSetting['scope.userInfo']) {
            _this.setData({
              userInfoShow: false,
              phoneShow: true
            });

            wx.getUserInfo({
              lang: 'zh_CN',
              success: function success(res) {
                console.log('用户信息', res);
                app.globalData.userInfo = res;
              }
            });
          } else {
            _this.setData({
              userInfoShow: true,
              phoneShow: false
            });
          }
        }
      });
    }
  }
});