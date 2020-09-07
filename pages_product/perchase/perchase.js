import http from '../../utils/request.js'
import util from '../../utils/util.js'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
    product: null,
    payment: null,
    totalPrice: 0,
    order: null,
    pathParams: {},
    totalNum: 1,
    api: {
      addOrder: {
        url: '/orders',
        method: 'post',
      },
      // 微信支付
      payment: {
        url: '/payment/wx/order',
        method: 'post',
      },
      // 关闭订单
      closeOrder: {
        url: '/payment/wx/order/{outTradeNo}',
        method: 'delete',
      },
      // 查询产品详情.
      getProductById: {
        url: '/products/{id}',
        method: 'get',
      },
    },
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getProduct()
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },
  getProduct() {
    const productId = 4
    return new Promise((resolve) => {
      http.wxRequest({
        ...this.data.api.getProductById,
        urlReplacements: [{
          substr: '{id}',
          replacement: productId
        }],
      }).then((res) => {
        if (res.success) {
          if (res.data.image !== null && res.data.image.indexOf(';') !== -1) {
            res.data.image = res.data.image.split(';')[0]
          }
          this.setData({
            product: res.data
          })
          resolve()
        }
      })
    })
  },
  // 选择添加地址
  addAddress() {
    const _this = this
    wx.chooseAddress({
      success(res) {
        console.log('地址',res)
        const option = {
          addresseeAddress: res.provinceName + res.cityName + res.countyName + res.detailInfo,
          addresseeName: res.userName,
          addresseePhone: res.telNumber
        }
        _this.setData({
          order: option
        })
      }
    })
  },
  // 生成订单
  onSubmit() {
    console.log(this.data.order)
    // const orderExtends = []
    // this.data.order.forEach(item => {
    //   const address = item.addressObject ? JSON.parse(item.addressObject) : JSON.parse(item.address)
    //   const option = {
    //     addresseeAddress: address.province + address.city + address.county + address.addressDetail,
    //     addresseeName: item.name,
    //     addresseePhone: item.phone,
    //     id: item.id,
    //     isDefault: item.isDefault ? 1 : 0,
    //     productId: this.data.product.id,
    //     productNum: item.productNum || 1,
    //   }
    //   orderExtends.push(option)
    // })
    // const params = {
    //   amount: this.data.totalPrice,
    //   createBy: wx.getStorageSync('userId'),
    //   orderExtends,
    //   parentUserId: wx.setStorageSync('parentId'),
    //   type: this.data.product.category.parentId
    // }
    // http.wxRequest({
    //   ...this.data.api.addOrder,
    //   params
    // }).then(res => {
    //   if (res.success) {
    //     const payParams = {
    //       openid: wx.getStorageSync('openId'),
    //       outTradeNo: res.data.orderNo,
    //       totalFee: res.data.amount * 100, // 微信支付单位为分.
    //       body: this.data.product.name,
    //       tradeType: 'JSAPI'
    //     }
    //     this.setData({
    //       payment: payParams
    //     })
    //     this.setData({
    //       dialogShow: true
    //     })

    //   }
    // })
  },
  // 取消支付
  cancle() {
    Dialog.confirm({
        title: '取消订单？'
      })
      .then(() => {
        let outTradeNo = this.data.payment.outTradeNo
        http.wxRequest({
          ...this.data.api.closeOrder,
          urlReplacements: [{
            substr: '{outTradeNo}',
            replacement: outTradeNo
          }],
        }).then((res) => {
          if (res.success) {
            wx.showToast({
              title: '订单取消成功',
              icon: 'none'
            })
            this.setData({
              dialogShow: false
            })
          }
        })
      })
  },
  // 拉起微信支付
  confirm() {
    http.wxRequest({
      ...this.data.api.payment,
      params: this.data.payment
    }).then(result => {
      console.log(result.data)
      const wechatParams = {
        appId: result.data.appId,
        timeStamp: result.data.timeStamp,
        nonceStr: result.data.nonceStr,
        package: result.data.packageValue,
        paySign: result.data.paySign,
        signType: result.data.signType,
      }
      console.log('拉起微信支付')
      console.log(wechatParams)
      wx.requestPayment({
        ...wechatParams,
        success(res) {
          console.log(res)
        }
      })
    })
  }
})
