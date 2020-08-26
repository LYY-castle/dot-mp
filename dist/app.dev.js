"use strict";

var _request = _interopRequireDefault(require("./utils/request"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

//app.js
App({
  onLaunch: function onLaunch() {
    var _this = this;

    // 登录
    wx.login({
      success: function success(res) {
        console.log('login赋值');
        _this.globalData.wechatCode = res.code;
      }
    });
  },
  getLaunchOptionsSync: function getLaunchOptionsSync(option) {
    console.log(option);
  },
  globalData: {
    userInfo: null,
    phone: null,
    wechatCode: null,
    promoCode: null
  }
});