import http from '../../utils/request.js'
import util from '../../utils/util.js'
import areaList from '../../utils/area.js'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    dialogShow: false,
      searchResult: [],
      addressShow: false,
      orderId: null,
      areaList,
      AddressInfo: {},
      activeOrderIdx: 0,
      userCode: null,
      productId: null,
      product: {},
      payment: {},
      totalPrice: 0,
      order: [],
      pathParams:{},
      totalNum:1,
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
      // 计算订单总价.
      calcTotalAmount: {
        url: '/orders/total-amount',
        method: 'get',
      },
      getAddressList: {
        url: '/user-addressees',
        method: 'get',
      },
        // 计算订单总价.
        calcTotalAmount: {
          url: '/orders/total-amount',
          method: 'get',
        },

    },
  },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      const _this = this
      _this.getProduct()
      _this.orderAddressList()
    },
    /**
   * 生命周期函数--监听页面卸载
   */
        onUnload: function () {
          wx.removeStorageSync('addressList')
          wx.removeStorageSync('activeAddressId')
          console.log(util.getCurrentPageUrl())
          wx.redirectTo({
            url:'../product-detail/product-detail?src='+wx.getStorageSync('activeProductId')
          })
        },
        // 地址处理
        orderAddressList(){
          const _this = this
          let orderAddress = []
          let arr = []
          let sumCount = 0
          const addressList = wx.getStorageSync('addressList')
          if(addressList){
            orderAddress = addressList
            orderAddress.forEach(item=>{
              const address = item.addressObject?JSON.parse(item.addressObject):JSON.parse(item.address)
              item.province=address.province
              item.city=address.city
              item.county=address.county
              item.addressDetail=address.addressDetail
              item.isDefault=item.isDefault===1
              item.productNum = item.productNum||1
              arr.push(item.productNum)
            })
            sumCount = arr.reduce((sum, number) => {
              return sum + number
            })
            console.log(sumCount)
            this.calcTotalAmount(sumCount)
            wx.setStorageSync('addressList',orderAddress)
            _this.setData({
              order:orderAddress
            })
          }else{
            http.wxRequest({ ..._this.data.api.getAddressList, params: { userId: wx.getStorageSync('userId') } }).then(res => {
              if (res.success) {
                orderAddress.push(res.data[0])
                orderAddress.forEach(item=>{
                  const address = JSON.parse(item.address)
                  item.province=address.province
                  item.city=address.city
                  item.county=address.county
                  item.addressDetail=address.addressDetail
                  item.isDefault=item.isDefault===1
                  item.productNum = item.productNum
                  arr.push(item.productNum)
                })
                sumCount = arr.reduce((sum, number) => {
                  return sum + number
                })
                this.calcTotalAmount(1)
                wx.setStorageSync('addressList',orderAddress)
                _this.setData({
                  order:orderAddress
                })
              }
            })
          }

        },
        productNumChange(event){
         const option = event.currentTarget.dataset.item
         const optionValue = event.detail
         this.data.order[option].productNum = optionValue
         this.setData({
           order:this.data.order,
         })
         wx.setStorageSync('addressList',this.data.order)
          let arr = []
          let sumCount = 0
          this.data.order.forEach((element) => {
            arr.push(element.productNum)
          })
          sumCount = arr.reduce((sum, number) => {
            return sum + number
          })
          this.calcTotalAmount(sumCount)
        },
        getProduct() {
          const productId = wx.getStorageSync('activeProductId')
          return new Promise((resolve) => {
              http.wxRequest({
                ...this.data.api.getProductById,
                urlReplacements: [{ substr: '{id}', replacement: productId }],
              }).then((res) => {
                if (res.success) {
                  if (res.data.image !== null && res.data.image.indexOf(';') !== -1) {
                    res.data.image = res.data.image.split(';')[0]
                  }
                  if(res.multiAddresses){
                    wx.setStorageSync('isMultiAddresses',true)
                  }
                  this.setData({
                    product:res.data
                  })
                  resolve()
                }
              })
          })
        },
        calcTotalAmount(productNum = 1) {
          const productId = wx.getStorageSync('activeProductId')
          const _this = this
          return new Promise(resolve=>{
            http.wxRequest({
              ..._this.data.api.calcTotalAmount,
              params: {
                productId,
                productNum,
              },
            }).then((res) => {
              if (res.success) {
                _this.setData({
                  totalPrice:res.data
                })
                resolve()
              }
            })
          })
        },

        editAddress(e){
          const addressOption = e.currentTarget.dataset.option
          wx.setStorageSync('activeAddressId',addressOption.id)
          // 编辑订单地址
          wx.navigateTo({
            url: '../../pages_address/address-list/address-list',
          })
        },
        addAddress(){
          // 新增订单地址
          wx.navigateTo({
            url: '../../pages_address/address-list/address-list',
          })
        },
        // 删除订单地址
        deleteOrder(e) {
          const index = e.currentTarget.dataset.index
          Dialog.confirm({
            title: '确定删除',
          })
            .then(() => {
              const addressList = wx.getStorageSync('addressList')
              addressList.splice(index,1)
              wx.setStorageSync('addressList',addressList)
              this.data.order.splice(index,1)
              this.setData({
                order:this.data.order
              })
              let arr = []
              let sumCount = 0
              this.data.order.forEach((element) => {
                arr.push(element.productNum)
              })
              sumCount = arr.reduce((sum, number) => {
                return sum + number
              })
              this.calcTotalAmount(sumCount)
            })
        },
        onSubmit(){
          const orderExtends = []
          this.data.order.forEach(item=>{
            const address = item.addressObject?JSON.parse(item.addressObject):JSON.parse(item.address)
            const option = {
              addresseeAddress: address.province+address.city+address.county+address.addressDetail,
              addresseeName: item.name,
              addresseePhone: item.phone,
              id: item.id,
              isDefault: item.isDefault?1:0,
              productId: this.data.product.id,
              productNum: item.productNum||1,
            }
            orderExtends.push(option)
          })
          const params = {
            amount: this.data.totalPrice,
            createBy: wx.getStorageSync('userId'),
            orderExtends,
            parentUserId: wx.setStorageSync('parentId'),
            type: this.data.product.category.parentId
          }
          http.wxRequest({...this.data.api.addOrder,params}).then(res=>{
            if(res.success){
              const payParams = {
                openid: wx.getStorageSync('openId'),
                outTradeNo:res.data.orderNo,
                totalFee:res.data.amount * 100,// 微信支付单位为分.
                body: this.data.product.name,
                tradeType:'JSAPI'
              }
              this.setData({
                payment:payParams
              })
              this.setData({
                dialogShow:true
              })

            }
          })
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
                    urlReplacements: [{ substr: '{outTradeNo}', replacement: outTradeNo }],
                  }).then((res) => {
                    if (res.success) {
                      wx.showToast({
                        title:'订单取消成功',
                        icon:'none'
                      })
                      this.setData({
                        dialogShow:false
                      })
                    }
                  })
            })
        },
        confirm(){
            http.wxRequest({...this.data.api.payment,params:this.data.payment}).then(result=>{
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
                success(res){
                  console.log(res)
                }
              })
            })
          }
})
