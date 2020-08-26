"use strict";

var _request = _interopRequireDefault(require("../../../utils/request.js"));

var _mixin = _interopRequireDefault(require("../../../utils/mixin.js"));

var _util = _interopRequireDefault(require("../../../utils/util.js"));

var _qsebao = _interopRequireDefault(require("../../../utils/qsebao.js"));

var _constant = _interopRequireDefault(require("../../../config/constant"));

var _crypto = _interopRequireDefault(require("../../../utils/crypto"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// pages/product/product-list/product-list.js
//相对路径
//相对路径
Page({
  /**
   * 页面的初始数据
   */
  data: {
    empty: '/static/img/empty.png',
    activeKey: 0,
    share: 0,
    allProduct: false,
    open: false,
    loading: false,
    finished: true,
    pageNo: 1,
    pageSize: 10,
    activeProduct: 4,
    activeGood: 11,
    goodTypes: [],
    pageTitle: '产品列表',
    popProductName: '',
    showProducts: false,
    renderQRCodeUrl: null,
    productList: [],
    productTypes: [],
    productTypeVals: [],
    status: ['primary', 'success', 'danger', 'warning'],
    api: {
      checkToken: {
        url: '/system/check-token',
        method: 'get'
      },
      getProductsList: {
        url: '/products',
        method: 'get'
      },
      getProductTypes: {
        url: '/product-categories',
        method: 'get'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad() {
    var _this = this;

    Promise.resolve().then(function () {
      return _this.getProductTypes(0);
    }).then(function () {
      return _this.routerParams();
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
  // 产品种类切换
  onChange: function onChange(event) {
    var _this2 = this;

    var activeKey = event.detail;
    this.setData({
      activeKey: activeKey,
      open: false
    });

    if (activeKey !== 0) {
      var activeId = this.data.productTypes[activeKey - 1].id;
      Promise.resolve().then(function () {
        return _this2.getProductTypes(activeId);
      }).then(function () {
        return _this2.getProductsListById();
      });
    } else {
      this.getAllProductList();
    } // this.allProduct = false
    // this.open = false
    // this.pageNo = 1
    // this.goodTypes = []
    // this.productList = []
    // Promise.resolve()
    //   .then(() => this.getProductTypes(id))
    //   .then(() => this.getProductsList())

  },
  // 商品种类切换
  goodChange: function goodChange(event) {
    var id = event.type === 'click' ? event.detail.name : event.currentTarget.dataset.id;
    this.setData({
      activeGood: id,
      open: false,
      pageNo: 1,
      productList: []
    });
    this.getProductsListById();
  },
  // 获取产品列表 0 一级,其他是二级
  getProductTypes: function getProductTypes(val) {
    var _this3 = this;

    var params = {
      parentId: val,
      pageSize: 100
    };

    if (val === 0) {
      params.isEnable = 1;
    }

    return new Promise(function (resolve) {
      _mixin["default"].getProductSorts(params).then(function (res) {
        if (res.success) {
          if (val === 0) {
            _this3.setData({
              productTypes: res.data,
              activeGood: null
            });
          } else {
            _this3.setData({
              goodTypes: res.data,
              activeGood: res.data.length > 0 ? res.data[0].id : 0
            });
          }

          resolve();
        }
      });
    });
  },
  // 判断路由参数
  routerParams: function routerParams() {
    var _this4 = this;

    return new Promise(function (resolve) {
      var pageUrl = _util["default"].getCurrentPageUrl();

      var sortId = pageUrl.options.sortId; // 从首页进入列表页

      if (sortId !== 'all') {
        (function () {
          var key = Number(sortId);

          for (var i = 0; i < _this4.data.productTypes.length; i++) {
            if (_this4.data.productTypes[i].id === key) {
              _this4.setData({
                activeKey: i + 1,
                activeGood: key
              });

              Promise.resolve().then(function () {
                return _this4.getProductTypes(key);
              }).then(function () {
                return _this4.getProductsListById();
              });
            }
          }
        })();
      } else {
        console.log(sortId === 'all');

        _this4.getAllProductList();

        _this4.setData({
          activeKey: 0
        });
      }

      resolve();
    });
  },
  // 四个按钮点击事件 self自己买  other客户买 look查看详情 share分享案例
  buttonClickEvent: function buttonClickEvent(e) {
    var option = e.currentTarget.dataset.option;
    var event = e.currentTarget.dataset.event;
    var pathParams = {
      productId: option.id
    };

    if (event === 'self') {
      wx.navigateTo({
        url: '../product-detail/product-detail',
        success: function success(res) {
          // 通过eventChannel向被打开页面传送数据
          res.eventChannel.emit('acceptDataFromOpenerPage', {
            data: pathParams
          });
        }
      });
    } // switch (event) {
    //   case 'self':
    //     console.log('self')
    //     break;
    //   case 'other':
    //     console.log('other')
    //     break;
    //   case 'look':
    //     console.log('look')
    //     break;
    //   case 'share':
    //     console.log('share')
    //     break;
    //   default:
    //     break;
    // }

  },
  // 查看详情
  // lookDetail(product) {
  //   const params = JSON.parse(new Crypto().decrypt({ enctyptedStr: this.$route.query.params }))
  //   if (constantCfg.productCode.qsebao.includes(product.code)) {
  //     this.renderQRCodeUrl =
  //       product.link +
  //       '&cparams1=' +
  //       new Crypto().encrypt({
  //         plainStr: this.code,
  //       }) +
  //       '&share=' +
  //       this.$route.query.share +
  //       '&_=' +
  //       new Date().getTime()
  //     if (this.allProduct) {
  //       this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeProduct=all'
  //     }
  //     window.location.href = this.renderQRCodeUrl
  //   } else {
  //     let encryptParam = {
  //       userId: params.userId,
  //       parentId: params.parentId,
  //       productId: product.id,
  //     }
  //     let query = {
  //       params: new Crypto().encrypt({
  //         plainStr: JSON.stringify(encryptParam),
  //       }),
  //       share: this.$route.query.share,
  //       _: new Date().getTime(),
  //     }
  //     if (this.allProduct) {
  //       query.activeProduct = 'all'
  //     } else {
  //       query.activeKey = this.$route.query.activeKey
  //       query.activeGood = this.$route.query.activeGood
  //     }
  //     if (constantCfg.productCode.iccooCard === product.code) {
  //       this.switchRouter({
  //         path: '/card-detail',
  //         query,
  //       })
  //     } else {
  //       this.switchRouter({
  //         path: '/product-detail',
  //         query,
  //       })
  //     }
  //   }
  // },
  // 自己买
  buyBySelf: function buyBySelf(event) {
    var key = this.activeKey;
    var target = event;
    console.log(event); // if (constantCfg.productCode.qsebao.includes(product.code)) {
    //   this.renderQRCodeUrl =
    //     product.link +
    //     '&cparams1=' +
    //     new Crypto().encrypt({
    //       plainStr: this.code,
    //     }) +
    //     '&share=0' +
    //     '&activeKey=' +
    //     key +
    //     '&activeGood=' +
    //     this.activeGood +
    //     '&_=' +
    //     new Date().getTime()
    //   window.location.href = this.renderQRCodeUrl
    // } else {
    //   let encryptParam = {
    //     userId: this.userId,
    //     parentId: this.parentId,
    //     productId: product.id,
    //   }
    //   let query = {}
    //   if (this.allProduct) {
    //     query = {
    //       params: new Crypto().encrypt({
    //         plainStr: JSON.stringify(encryptParam),
    //       }),
    //       share: this.$route.query.share,
    //       activeProduct: 'all',
    //       _: new Date().getTime(),
    //     }
    //   } else {
    //     query = {
    //       params: new Crypto().encrypt({
    //         plainStr: JSON.stringify(encryptParam),
    //       }),
    //       share: this.$route.query.share,
    //       activeKey: key,
    //       activeGood: this.activeGood,
    //       _: new Date().getTime(),
    //     }
    //   }
    //   console.log(query)
    //   if (constantCfg.productCode.iccooCard === product.code) {
    //     this.switchRouter({
    //       path: '/card-detail',
    //       query,
    //     })
    //   } else {
    //     this.switchRouter({
    //       path: '/product-detail',
    //       query,
    //     })
    //   }
    // }
  },
  // 进入分享列表页面
  // shareProduct(product) {
  //   const key = this.activeKey
  //   let query = {}
  //   let encryptParam = {
  //     userId: this.userId,
  //     parentId: this.parentId,
  //     productId: product.id,
  //   }
  //   if (this.allProduct) {
  //     query = {
  //       params: new Crypto().encrypt({
  //         plainStr: JSON.stringify(encryptParam),
  //       }),
  //       share: this.$route.query.share,
  //       activeProduct: 'all',
  //       productId: product.id,
  //       _: new Date().getTime(),
  //     }
  //   } else {
  //     query = {
  //       params: new Crypto().encrypt({
  //         plainStr: JSON.stringify(encryptParam),
  //       }),
  //       share: this.$route.query.share,
  //       activeKey: key,
  //       activeGood: this.activeGood,
  //       productId: product.id,
  //       _: new Date().getTime(),
  //     }
  //   }
  //   this.switchRouter({
  //     path: '/share-list',
  //     query,
  //   })
  // },
  // 客户买
  renderQRCode: function renderQRCode(event) {
    var _this5 = this;

    var target = event.currentTarget.dataset.item;
    var key = this.activeKey;
    this.popProductName = target.name;

    if (_constant["default"].productCode.qsebao.includes(target.code)) {
      this.renderQRCodeUrl = target.link + '&cparams1=' + new _crypto["default"]().encrypt({
        plainStr: this.code
      }) + '&share=1' + '&activeKey=' + key + '&activeGood=' + this.activeGood + '&_=' + new Date().getTime();

      if (this.allProduct) {
        this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeProduct=all';
      }
    } else {
      var encryptParam = {
        userId: this.userId,
        parentId: this.parentId,
        productId: target.id
      };

      if (_constant["default"].productCode.iccooCard === target.code) {
        this.renderQRCodeUrl = window.location.origin + '/card-detail' + '?params=' + new _crypto["default"]().encrypt({
          plainStr: JSON.stringify(encryptParam)
        }) + '&share=1' + '&_=' + new Date().getTime();
      } else {
        this.renderQRCodeUrl = window.location.origin + '/product-detail' + '?params=' + new _crypto["default"]().encrypt({
          plainStr: JSON.stringify(encryptParam)
        }) + '&share=1' + '&_=' + new Date().getTime();
      }

      if (this.allProduct) {
        this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeProduct=all';
      } else {
        this.renderQRCodeUrl = this.renderQRCodeUrl + '&activeKey=' + key + '&activeGood=' + this.activeGood;
      }
    }

    this.$refs.qrContent.style.display = 'block';
    this.$nextTick(function () {
      _this5.qrcode(_this5.renderQRCodeUrl);
    });
  },
  removeQrcode: function removeQrcode() {
    this.$refs.qrContent.style.display = 'none';
    var f = document.getElementById('qrcode');
    var child1 = document.getElementsByTagName('img');
    var child2 = document.getElementsByTagName('canvas');
    f.removeChild(child1[0]);
    f.removeChild(child2[0]);
  },
  qrcode: function qrcode(url) {
    new QRCode('qrcode', {
      width: 200,
      // 设置宽度，单位像素
      height: 200,
      // 设置高度，单位像素
      text: url,
      // 设置二维码内容或跳转地址
      correctLevel: 3
    });
  },
  // copy() {
  //   let copyBtn = new Clipboard('.copyButton')
  //   copyBtn.on('success', (e) => {
  //     Toast('复制成功')
  //     e.clearSelection()
  //   })
  //   copyBtn.on('error', (e) => {
  //     Toast('复制失败')
  //     e.clearSelection()
  //   })
  // },
  getAllProductList: function getAllProductList() {
    var _this6 = this;

    return new Promise(function (resolve) {
      var params = {
        pageSize: _this6.data.pageSize,
        pageNo: _this6.data.pageNo,
        status: 0
      };

      _this6.getProductsList(params);

      resolve();
    });
  },
  getProductsListById: function getProductsListById() {
    var _this7 = this;

    return new Promise(function (resolve) {
      var params = {
        productCategoryId: _this7.data.activeGood,
        pageSize: _this7.data.pageSize,
        pageNo: _this7.data.pageNo,
        status: 0
      };

      _this7.getProductsList(params);

      resolve();
    });
  },
  //  获取产品列表
  getProductsList: function getProductsList(params) {
    var _this8 = this;

    var productDetailObj = {};
    return new Promise(function (resolve) {
      _mixin["default"].getProductList(params).then(function _callee(res) {
        var products, productDetailRes, item, dealQseProduct, i;
        return regeneratorRuntime.async(function _callee$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                products = [];

                if (!res.success) {
                  _context2.next = 16;
                  break;
                }

                dealQseProduct = function dealQseProduct(item) {
                  return regeneratorRuntime.async(function dealQseProduct$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (!_constant["default"].productCode.qsebao.includes(item.code)) {
                            _context.next = 10;
                            break;
                          }

                          _context.next = 3;
                          return regeneratorRuntime.awrap(_mixin["default"].insuranceProduct());

                        case 3:
                          productDetailRes = _context.sent;
                          productDetailObj = productDetailRes.data.productDetail; // 因为轻松保接口中 type 与原有商品类型 type 冲突.

                          productDetailObj.insurance_type = productDetailObj.type;
                          delete productDetailObj.type;
                          products.push(Object.assign({}, item, productDetailRes.data.productDetail));
                          _context.next = 11;
                          break;

                        case 10:
                          products.push(item);

                        case 11:
                        case "end":
                          return _context.stop();
                      }
                    }
                  });
                };

                i = 0;

              case 4:
                if (!(i < res.data.length)) {
                  _context2.next = 11;
                  break;
                }

                item = res.data[i];
                _context2.next = 8;
                return regeneratorRuntime.awrap(dealQseProduct(item));

              case 8:
                i++;
                _context2.next = 4;
                break;

              case 11:
                console.log(products.length);

                if (params.pageNo === 1) {
                  console.log(1);
                  _this8.data.productList = products;
                } else {
                  _this8.data.productList = _this8.data.productList.concat(products);
                }

                _this8.data.productList.forEach(function (item) {
                  if (item.image !== null && item.image.indexOf(';') !== -1) {
                    item.image = item.image.split(';')[0];
                  }
                });

                _this8.setData({
                  productList: _this8.data.productList
                });

                resolve();

              case 16:
              case "end":
                return _context2.stop();
            }
          }
        });
      });
    });
  },
  // onLoad() {
  //   this.pageNo++
  //   if (this.allProduct) {
  //     this.getAllProductList()
  //   } else {
  //     this.getProductsList()
  //   }
  // },
  openContent: function openContent() {
    this.setData({
      open: !this.data.open
    });
  },
  closeOverlay: function closeOverlay() {
    this.setData({
      open: false
    });
  }
});