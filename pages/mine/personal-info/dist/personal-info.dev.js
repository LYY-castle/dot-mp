"use strict";

var _request = _interopRequireDefault(require("../../../utils/request.js"));

var _constant = _interopRequireDefault(require("../../../config/constant"));

var _env = _interopRequireDefault(require("../../../config/env.config"));

var _area = _interopRequireDefault(require("../../../utils/area.js"));

var _mixin = _interopRequireDefault(require("../../../utils/mixin.js"));

var _validate = require("../../../utils/validate.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Page({
  /**
   * 页面的初始数据
   */
  data: {
    empty: '/static/img/avatar.png',
    areaList: _area["default"],
    selectBox: false,
    city: [],
    addressShow: false,
    fields: [],
    avatar: null,
    uploadAvatar: null,
    userInfo: {},
    // 图片剪切所需参数
    src: '',
    width: 200,
    //宽度
    height: 200,
    //高度
    max_width: 400,
    max_height: 400,
    disable_rotate: true,
    //是否禁用旋转
    disable_ratio: false,
    //锁定比例
    limit_move: true,
    //是否限制移动
    api: {
      getUserInfo: {
        url: '/users/{id}',
        method: 'get'
      },
      modifyUserInfo: {
        url: '/users',
        method: 'put'
      },
      uploadUserAvatar: {
        url: '/users',
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
    var event = options;
    console.log(event);

    if (event.src) {
      this.setData({
        avatar: event.src
      });
    }

    this.getUserInfo();
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
  getUserInfo: function getUserInfo() {
    var id = wx.getStorageSync('userId');

    var _this = this;

    _request["default"].wxRequest(_objectSpread({}, this.data.api.getUserInfo, {
      urlReplacements: [{
        substr: '{id}',
        replacement: id
      }]
    })).then(function (res) {
      if (res.success) {
        if (res.data.idNo === null) {
          res.data.idNo = '';
        }

        if (res.data.phone === null) {
          res.data.phone = '';
        }

        _this.setData({
          userInfo: res.data,
          uploadAvatar: res.data.headImage,
          cityString: res.data.province + '/' + res.data.city
        });

        if (_this.data.avatar) {
          var header = {
            'authorization': wx.getStorageSync('authorization')
          };
          wx.uploadFile({
            url: _env["default"].env.VUE_APP_BASE_URL + '/system/minio/' + _constant["default"].minio.bucketName,
            //仅为示例，非真实的接口地址
            filePath: _this.data.avatar,
            name: 'file',
            header: header,
            formData: {
              bucketName: _constant["default"].minio.bucketName,
              fileName: _this.data.avatar
            },
            success: function success(res) {
              var data = JSON.parse(res.data);

              if (data.success) {
                _this.setData({
                  avatar: data.data.presignedUrl,
                  uploadAvatar: data.data.fileName
                });
              }
            }
          });
        } else {
          if (res.data.headImage) {
            if (_this.data.userInfo.headImage.indexOf('https') === -1) {
              var params = {
                bucketName: _constant["default"].minio.bucketName,
                fileName: res.data.headImage
              };

              _mixin["default"].review(params).then(function (result) {
                if (result.success) {
                  _this.setData({
                    avatar: result.data
                  });
                }
              });
            }
          }
        }
      }
    });
  },
  selectAddress: function selectAddress() {
    this.setData({
      addressShow: true
    });
  },
  confirm: function confirm(val) {
    var city = val.detail.values;
    console.log(val);
    this.setData({
      addressShow: false,
      city: city,
      cityString: city[0].name + '/' + city[1].name
    });
    this.addressShow = false;
  },
  cancel: function cancel() {
    this.setData({
      addressShow: false
    });
  },
  upload: function upload() {
    wx.chooseImage({
      count: 1,
      // 默认9
      sizeType: ['compressed'],
      // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
      // 可以指定来源是相册还是相机，默认二者都有
      success: function success(res) {
        var src = res.tempFilePaths[0];
        wx.redirectTo({
          url: './upload/upload?src=' + src
        });
      }
    });
  },
  selectImage: function selectImage() {
    var _this = this;

    wx.chooseImage({
      count: 1,
      //选择数量
      sizeType: ['original', 'compressed'],
      // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'],
      // 可以指定来源是相册还是相机，默认二者都有
      success: function success(res) {
        //图片的临时路径
        var src = res.tempFilePaths[0];
        wx.navigateTo({
          url: './cropper/cropper?src=' + src
        });
      }
    });
  },
  updateUserInfo: function updateUserInfo(e) {
    var option = e.detail.value;
    var params = {
      id: wx.getStorageSync('userId'),
      idNo: option.idNo,
      name: option.name,
      phone: option.phone,
      province: this.data.city.length > 0 ? this.data.city[0].name : this.data.userInfo.province,
      city: this.data.city.length > 0 ? this.data.city[1].name : this.data.userInfo.city,
      headImage: this.data.uploadAvatar
    };
    console.log(params);

    if (option.name !== '') {
      if (option.phone !== '') {
        if ((0, _validate.isMobile)(option.phone)) {
          if (option.idNo !== '') {
            if ((0, _validate.isIDNumber)(option.idNo)) {
              _request["default"].wxRequest(_objectSpread({}, this.data.api.modifyUserInfo, {
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
        title: '姓名不能为空',
        icon: 'none'
      });
    }
  }
});