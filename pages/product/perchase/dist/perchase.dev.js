"use strict";

var _request = _interopRequireDefault(require("../../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../../utils/mixin.js"));

var _util = _interopRequireDefault(require("../../../utils/util.js"));

var _qsebao = _interopRequireDefault(require("../../../utils/qsebao.js"));

var _constant = _interopRequireDefault(require("../../../config/constant"));

var _crypto = _interopRequireDefault(require("../../../utils/crypto"));

var _area = _interopRequireDefault(require("../../../utils/area.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// const computedBehavior = require("miniprogram-computed");
Page({
  // computedBehavior:[computedBehavior],

  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
    searchResult: [],
    addressShow: false,
    orderId: null,
    areaList: _area["default"],
    AddressInfo: {},
    activeOrderIdx: 0,
    userCode: null,
    productId: null,
    product: {},
    payment: {},
    totalPrice: 0,
    order: [],
    pathParams: {},
    totalNum: 1,
    api: _defineProperty({
      addOrder: {
        url: '/orders',
        method: 'post'
      },
      // 微信支付
      payment: {
        url: '/payment/wx/order',
        method: 'post'
      },
      // 关闭订单
      closeOrder: {
        url: '/payment/wx/order/{outTradeNo}',
        method: 'delete'
      },
      // 查询产品详情.
      getProductById: {
        url: '/products/{id}',
        method: 'get'
      },
      // 计算订单总价.
      calcTotalAmount: {
        url: '/orders/total-amount',
        method: 'get'
      },
      getAddressList: {
        url: '/user-addressees',
        method: 'get'
      }
    }, "calcTotalAmount", {
      url: '/orders/total-amount',
      method: 'get'
    })
  },
  // computed:{
  //   totalCount() {
  //     let arr = []
  //     let sumCount = 1
  //     if (this.data.order.length > 0) {
  //       this.data.order.forEach((element) => {
  //         arr.push(element.productNum)
  //       })
  //       sumCount = arr.reduce((sum, number) => {
  //         return sum + number
  //       })
  //     }
  //     console.log('总数量',sumCount)
  //     return sumCount
  //   },
  // },
  // methods:{

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var _this = this;

    var eventChannel = this.getOpenerEventChannel();
    eventChannel.on('acceptDataFromOpenerPage', function (res) {
      _this.setData({
        pathParams: res.data
      });
    });

    if (_this.data.pathParams.fromPath === 'perchase-add') {
      _this.orderAddressList();
    } else if (_this.data.pathParams.fromPath === 'perchase-edit') {
      _this.orderAddressList();
    } else {
      _this.getAddressInfo();
    }

    _this.getProduct();

    _this.calcTotalAmount();
  },
  // 地址处理
  getAddressInfo: function getAddressInfo() {
    var _this = this;

    _request["default"].wxRequest(_objectSpread({}, _this.data.api.getAddressList, {
      params: {
        userId: wx.getStorageSync('userId')
      }
    })).then(function (res) {
      if (res.success) {
        var addressListIds = [];
        var addressList = [];

        if (res.data.length > 0) {
          addressListIds.push(res.data[0].id);
          addressList.push(res.data[0]);
        }

        addressList.forEach(function (item) {
          var address = JSON.parse(item.address);
          item.province = address.province;
          item.city = address.city;
          item.county = address.county;
          item.addressDetail = address.addressDetail;
          item.isDefault = item.isDefault === 1;
          item.productNum = 1;
        });

        _this.setData({
          order: addressList
        });

        wx.setStorageSync('perchaseAddressList', addressListIds);
      }
    });
  },
  orderAddressList: function orderAddressList() {
    var _this = this;

    var perchaseAddressList = wx.getStorageSync('perchaseAddressList');
    var order = [];

    _request["default"].wxRequest(_objectSpread({}, _this.data.api.getAddressList, {
      params: {
        userId: wx.getStorageSync('userId')
      }
    })).then(function (res) {
      if (res.success) {
        if (res.data.length > 0) {
          for (var i = 0; i < perchaseAddressList.length; i++) {
            for (var j = 0; j < res.data.length; j++) {
              if (perchaseAddressList[i] === res.data[j].id) {
                order.push(res.data[j]);
              }
            }
          }
        }

        var arrNum = [];
        order.forEach(function (item) {
          var address = JSON.parse(item.address);
          item.province = address.province;
          item.city = address.city;
          item.county = address.county;
          item.addressDetail = address.addressDetail;
          item.isDefault = item.isDefault === 1;
          item.productNum = 1;
        });

        _this.setData({
          order: order
        });
      }
    });
  },
  productNumChange: function productNumChange(event) {
    // const sumCount = []
    var arr = []; // if (this.data.order.length > 0) {
    //   this.data.order.forEach((element) => {
    //     arr.push(element.productNum)
    //   })
    //   sumCount = arr.reduce((sum, number) => {
    //     return sum + number
    //   })
    // }
    // console.log(sumCount)

    console.log(this.data.order);
    var option = event.currentTarget.dataset.item; // sumCount++
    // this.setData({
    //   totalNum:this.data.totalNum
    // })

    console.log(option);
  },
  getProduct: function getProduct() {
    var _this2 = this;

    return new Promise(function (resolve) {
      _request["default"].wxRequest(_objectSpread({}, _this2.data.api.getProductById, {
        urlReplacements: [{
          substr: '{id}',
          replacement: _this2.data.pathParams.productId
        }]
      })).then(function (res) {
        if (res.success) {
          if (res.data.image !== null && res.data.image.indexOf(';') !== -1) {
            res.data.image = res.data.image.split(';')[0];
          }

          console.log(res.data);

          _this2.setData({
            product: res.data
          });

          resolve();
        }
      });
    });
  },
  calcTotalAmount: function calcTotalAmount() {
    var productNum = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

    var _this = this;

    return new Promise(function (resolve) {
      _request["default"].wxRequest(_objectSpread({}, _this.data.api.calcTotalAmount, {
        params: {
          productId: _this.data.pathParams.productId,
          productNum: productNum
        }
      })).then(function (res) {
        if (res.success) {
          _this.setData({
            totalPrice: res.data
          });

          resolve();
        }
      });
    });
  },
  editAddress: function editAddress() {
    var pathParams = {
      productId: this.data.pathParams.productId,
      fromPath: 'perchase-edit'
    }; // 编辑订单地址

    wx.navigateTo({
      url: '../../mine/address/address-list/address-list',
      success: function success(res) {
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: pathParams
        });
      }
    });
  },
  addAddress: function addAddress() {
    var pathParams = {
      productId: this.data.pathParams.productId,
      fromPath: 'perchase-add'
    }; // 新增订单地址

    wx.navigateTo({
      url: '../../mine/address/address-list/address-list',
      success: function success(res) {
        res.eventChannel.emit('acceptDataFromOpenerPage', {
          data: pathParams
        });
      }
    });
  },
  onSubmit: function onSubmit() {
    this.setData({
      dialogShow: true
    });
  },
  confirm: function confirm() {
    var _this3 = this;

    var address = {
      areaCode: "140105",
      addressDetail: "sbachsabc",
      city: "太原市",
      county: "小店区",
      province: "山西省"
    };
    var params = {
      amount: 278,
      createBy: 9,
      orderExtends: [{
        address: JSON.stringify(address),
        addresseeAddress: "山西省太原市小店区sbachsabc",
        addresseeName: "123",
        addresseePhone: "13366908908",
        id: 41,
        isDefault: 1,
        name: "123",
        phone: "13366908908",
        productId: 5,
        productNum: 1,
        userId: 9,
        zipCode: null
      }],
      parentUserId: 1,
      type: "4"
    };

    _request["default"].wxRequest(_objectSpread({}, this.data.api.addOrder, {
      params: params
    })).then(function (res) {
      console.log(res);
      var payParams = {
        openid: wx.getStorageSync('openId'),
        outTradeNo: res.data.orderNo,
        totalFee: res.data.amount * 100,
        // 微信支付单位为分.
        body: _this3.data.product.name,
        tradeType: 'JSAPI'
      };

      _request["default"].wxRequest(_objectSpread({}, _this3.data.api.payment, {
        params: payParams
      })).then(function (result) {
        console.log(result.data);
        var wechatParams = {
          appId: result.data.appId,
          timeStamp: result.data.timeStamp,
          nonceStr: result.data.nonceStr,
          "package": result.data.packageValue,
          paySign: result.data.paySign,
          signType: result.data.signType
        };
        console.log('拉起微信支付');
        console.log(wechatParams);
        wx.requestPayment(_objectSpread({}, wechatParams, {
          success: function success(res) {
            console.log(res);
          }
        }));
      });
    });
  } // }

});