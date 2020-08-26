"use strict";

var _request = _interopRequireDefault(require("../../../utils/request.js"));

var _area = _interopRequireDefault(require("../../../utils/area.js"));

var _util = _interopRequireDefault(require("../../../utils/util.js"));

var _qsebao = _interopRequireDefault(require("../../../utils/qsebao.js"));

var _constant = _interopRequireDefault(require("../../../config/constant"));

var _env = _interopRequireDefault(require("../../../config/env.config"));

var _crypto = _interopRequireDefault(require("../../../utils/crypto"));

var _index = _interopRequireDefault(require("../../../miniprogram_npm/address-parse/index"));

var _validate = require("../../../utils/validate");

var _mixin = _interopRequireDefault(require("../../../utils/mixin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Page({
  /**
   * 页面的初始数据
   */
  data: {
    areaList: _area["default"],
    cityShow: false,
    frontImage: null,
    backImage: null,
    uploadFrontImage: null,
    uploadBackImage: null,
    userInfo: {},
    city: [],
    openingCity: null,
    api: {
      getUserInfo: {
        url: '/user-bank-card-info',
        method: 'get'
      },
      addCard: {
        url: '/user-bank-card-info',
        method: 'put'
      },
      // 上传图片
      upload: {
        url: '/system/minio/{bucketName}',
        method: 'post'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    this.getMineBankCard();
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
  reviewFront: function reviewFront(front) {
    var _this2 = this;

    var frontParams = {
      bucketName: _constant["default"].minio.bucketName,
      fileName: front
    };

    _mixin["default"].review(frontParams).then(function (res) {
      if (res.success) {
        _this2.setData({
          frontImage: res.data
        });
      }
    });
  },
  reviewReverse: function reviewReverse(reverse) {
    var _this3 = this;

    var Params = {
      bucketName: _constant["default"].minio.bucketName,
      fileName: reverse
    };

    _mixin["default"].review(Params).then(function (res) {
      if (res.success) {
        _this3.setData({
          backImage: res.data
        });
      }
    });
  },
  getMineBankCard: function getMineBankCard() {
    var _this4 = this;

    _request["default"].wxRequest(_objectSpread({}, this.data.api.getUserInfo, {
      params: {
        userId: wx.getStorageSync('userId')
      }
    })).then(function (res) {
      if (res.success) {
        if (res.data.length > 0) {
          if (res.data[0].idCardFront && res.data[0].idCardReverse) {
            if (res.data[0].idCardFront.indexOf('https') === -1) {
              _this4.reviewFront(res.data[0].idCardFront);
            } else {
              _this4.setData({
                frontImage: res.data[0].idCardFront
              });
            }

            if (res.data[0].idCardReverse.indexOf('https') === -1) {
              _this4.reviewReverse(res.data[0].idCardReverse);
            } else {
              _this4.setData({
                backImage: res.data[0].idCardReverse
              });
            }
          }

          var mapData = {
            cardOwner: res.data[0].cardOwner,
            cardNo: res.data[0].cardNo,
            bankName: res.data[0].bankName,
            phone: res.data[0].phone,
            idNo: res.data[0].idNo
          };

          _this4.setData({
            userInfo: mapData,
            openingCity: res.data[0].openingCity,
            uploadFrontImage: res.data[0].idCardFront,
            uploadBackImage: res.data[0].idCardReverse
          });

          console.log(_this4.data);
        }
      }
    });
  },
  formSubmit: function formSubmit(e) {
    var option = e.detail.value;
    var params = {
      userId: wx.getStorageSync('userId'),
      cardOwner: option.cardOwner,
      cardNo: option.cardNo,
      bankName: option.bankName,
      phone: option.phone,
      idNo: option.idNo,
      openingCity: this.data.openingCity,
      idCardFront: this.data.uploadFrontImage,
      idCardReverse: this.data.uploadBackImage
    };

    if (option.cardOwner !== '') {
      if (option.cardNo !== '') {
        if ((0, _validate.isBankCard)(option.cardNo)) {
          if (option.bankName !== '') {
            if (this.data.openingCity !== null) {
              if (option.phone !== '') {
                if ((0, _validate.isMobile)(option.phone)) {
                  if (option.idNo !== '') {
                    if ((0, _validate.isIDNumber)(option.idNo)) {
                      if (this.data.uploadFrontImage) {
                        if (this.data.uploadBackImage) {
                          _request["default"].wxRequest(_objectSpread({}, this.data.api.addCard, {
                            params: params
                          })).then(function (res) {
                            if (res.success) {
                              wx.showToast({
                                title: '提交成功',
                                icon: 'none',
                                success: function success() {
                                  setTimeout(function () {
                                    wx.switchTab({
                                      url: '../mine'
                                    });
                                  }, 1000);
                                }
                              });
                            }
                          });
                        } else {
                          wx.showToast({
                            title: '请上传身份证反面照片',
                            icon: 'none'
                          });
                        }
                      } else {
                        wx.showToast({
                          title: '请上传身份证正面照片',
                          icon: 'none'
                        });
                      }
                    } else {
                      wx.showToast({
                        title: '身份证号格式错误',
                        icon: 'none'
                      });
                    }
                  } else {
                    wx.showToast({
                      title: '身份证号不能为空',
                      icon: 'none'
                    });
                  }
                } else {
                  wx.showToast({
                    title: '手机号格式错误',
                    icon: 'none'
                  });
                }
              } else {
                wx.showToast({
                  title: '手机号不能为空',
                  icon: 'none'
                });
              }
            } else {
              wx.showToast({
                title: '请选择开户城市',
                icon: 'none'
              });
            }
          } else {
            wx.showToast({
              title: '银行不能为空',
              icon: 'none'
            });
          }
        } else {
          wx.showToast({
            title: '账号格式错误',
            icon: 'none'
          });
        }
      } else {
        wx.showToast({
          title: '账号不能为空',
          icon: 'none'
        });
      }
    } else {
      wx.showToast({
        title: '户名不能为空',
        icon: 'none'
      });
    } // http.wxRequest({...this.data.api.addCard,params}).then(res=>{
    //   if(res.success){
    //     console.log(res.data)
    //   }
    // })

  },
  selectAddress: function selectAddress() {
    this.setData({
      cityShow: true
    });
  },
  confirm: function confirm(e) {
    var city = e.detail.values;
    this.setData({
      city: city,
      openingCity: city[0].name + city[1].name
    });
    this.setData({
      cityShow: false
    });
  },
  cancel: function cancel() {
    this.setData({
      cityShow: false
    });
  },
  // 上传身份证
  uploadIdNoImage: function uploadIdNoImage(e) {
    var option = e.currentTarget.dataset.image;
    var header = {
      'authorization': wx.getStorageSync('authorization')
    };

    var _this = this;

    wx.chooseImage({
      success: function success(res) {
        var tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: _env["default"].env.VUE_APP_BASE_URL + '/system/minio/' + _constant["default"].minio.bucketName,
          //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header: header,
          formData: {
            bucketName: _constant["default"].minio.bucketName,
            fileName: tempFilePaths[0]
          },
          success: function success(res) {
            var data = JSON.parse(res.data);

            if (data.success) {
              if (option === 'front') {
                console.log(data.data.presignedUrl);

                _this.setData({
                  frontImage: data.data.presignedUrl,
                  uploadFrontImage: data.data.fileName
                });
              } else if (option === 'back') {
                _this.setData({
                  backImage: data.data.presignedUrl,
                  uploadBackImage: data.data.fileName
                });
              }
            }
          }
        });
      }
    });
  }
});