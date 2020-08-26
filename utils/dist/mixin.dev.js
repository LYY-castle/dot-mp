"use strict";

var _request = _interopRequireDefault(require("./request"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var checkParams = {
  url: '/system/check-token',
  method: 'get'
};
var reviewParams = {
  url: '/system/minio/{bucketName}/preview-url',
  method: 'get'
};
var productListParams = {
  url: '/products',
  method: 'get'
};
var productTypeParams = {
  url: '/product-categories',
  method: 'get'
};
var qsbParams = {
  agentID: 1000000030,
  action: "productDetail",
  insuranceCode: "easy_guardian"
};
var qsbao = {
  url: 'https://qcapi.qsebao.com/query?sign=a09087363beb1141709faa35a02860ab',
  method: 'post'
};

function insuranceProduct() {
  return new Promise(function (resolve) {
    wx.request(_objectSpread({}, qsbao, {
      data: qsbParams,
      success: function success(res) {
        resolve(res.data);
      }
    }));
  });
} // 获取产品的列表


function getProductList(params) {
  return _request["default"].wxRequest(_objectSpread({}, productListParams, {
    params: params
  }));
} // 获取商品分类列表


function getProductSorts(params) {
  return _request["default"].wxRequest(_objectSpread({}, productTypeParams, {
    params: params
  }));
} // 校验token是否过期


function checkToken() {
  return new Promise(function (resolve) {
    _request["default"].wxRequest(_objectSpread({}, checkParams)).then(function (res) {
      if (res.success) {
        resolve();
      }
    });
  });
} // 图片预览


function review(_ref) {
  var bucketName = _ref.bucketName,
      fileName = _ref.fileName;
  return _request["default"].wxRequest(_objectSpread({}, reviewParams, {
    urlReplacements: [{
      substr: '{bucketName}',
      replacement: bucketName
    }],
    params: {
      fileName: fileName
    }
  }));
}

module.exports = {
  checkToken: checkToken,
  review: review,
  getProductList: getProductList,
  getProductSorts: getProductSorts,
  insuranceProduct: insuranceProduct
};