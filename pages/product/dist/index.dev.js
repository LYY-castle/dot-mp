"use strict";

var _request = _interopRequireDefault(require("../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../utils/mixin.js"));

var _qsebao = _interopRequireDefault(require("../../utils/qsebao.js"));

var _constant = _interopRequireDefault(require("../../config/constant"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var app = getApp();
Page({
  data: {
    loading: false,
    finished: false,
    empty: '/static/img/empty.png',
    ProductAll: '/static/img/product-all.png',
    productList: [],
    productSorts: [],
    sortsImages: ['/static/img/product-01.png', '/static/img/product-02.png', '/static/img/product-03.png', '/static/img/product-04.png'],
    pageNo: 1,
    api: {
      getProductList: {
        url: '/products',
        method: 'get'
      },
      getProductTypes: {
        url: '/product-categories',
        method: 'get'
      },
      upload: {
        url: 'https://dot-dev.hkjindian.com:18700/system/minio/dot',
        method: 'post'
      }
    }
  },
  // 搜索栏聚焦事件
  focus: function focus() {
    var that = this;
    wx.navigateTo({
      url: './search/search'
    });
  },
  // 获取特惠产品的列表
  getProductList: function getProductList() {
    var _this2 = this;

    var that = this.data;
    return new Promise(function (resolve) {
      var params = {
        isHot: 0,
        pageNo: that.pageNo,
        pageSize: 10,
        status: 0
      };

      _mixin["default"].getProductList(params).then(function (res) {
        var productDetailObj = {};
        var products = [];
        res.data.forEach(function (item) {
          if (_constant["default"].productCode.qsebao.includes(item.code)) {
            var insuranceCode = item.code;

            _qsebao["default"].getProductDetail({
              insuranceCode: insuranceCode
            }).then(function (productDetailRes) {
              productDetailObj = productDetailRes.data.productDetail; // 因为轻松保接口中 type 与原有商品类型 type 冲突.

              productDetailObj.insurance_type = productDetailObj.type;
              delete productDetailObj.type;
              products.push(Object.assign({}, item, productDetailRes.data.productDetail));
            });
          } else {
            products.push(item);
          }
        });

        if (that.pageNo === 1) {
          that.productList = products;
        } else {
          that.productList = that.productList.concat(products);
        }

        that.productList.forEach(function (item) {
          if (item.image !== null && item.image.indexOf(';') !== -1) {
            item.image = item.image.split(';')[0];
          }
        });

        _this2.setData({
          productList: that.productList
        });
      });

      resolve();
    });
  },
  // 获取商品分类列表
  getProductSorts: function getProductSorts() {
    var _this3 = this;

    return new Promise(function (resolve) {
      var params = {
        parentId: 0,
        pageSize: 100,
        isEnable: 1
      };

      _mixin["default"].getProductSorts(params).then(function (res) {
        if (res.success) {
          _this3.setData({
            productSorts: res.data
          });

          resolve();
        }
      });
    });
  },
  gotoProductList: function gotoProductList(event) {
    var sortId = event.currentTarget.dataset.item ? event.currentTarget.dataset.item.id : 'all';
    wx.navigateTo({
      url: './product-list/product-list?sortId=' + sortId
    });
  },
  gotoDetail: function gotoDetail(e) {
    console.log(e);
    var option = e.currentTarget.dataset.option;
    var pathParams = {
      productId: option.id
    };
    wx.navigateTo({
      url: './product-detail/product-detail',
      success: function success(res) {
        // 通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: pathParams
        });
      }
    });
  },
  onLoad: function onLoad() {
    var _this4 = this;

    Promise.resolve().then(function () {
      return _mixin["default"].checkToken();
    }).then(function () {
      return _this4.getProductSorts();
    }).then(function () {
      return _this4.getProductList();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  uploadAvatar: function uploadAvatar() {
    var _this = this.data;
    wx.chooseImage({
      success: function success(res) {
        var params = res.tempFilePaths[0];

        _request["default"].wxRequest(_objectSpread({}, _this.api.upload, {
          params: params
        })).then(function (res) {
          if (res.success) {
            console.log(res);
          }
        });
      }
    });
  },
  onReachBottom: function onReachBottom() {
    console.log('上拉');
  },
  onPageScroll: function onPageScroll() {
    // 页面滚动时执行
    console.log('滚动');
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {
    return {
      title: '转发特惠商品',
      query: 'code=FQAC'
    };
    wx.updateShareMenu({
      withShareTicket: true
    });
  }
});