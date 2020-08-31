import http from '../../utils/request.js'
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
    onLoad: function (options) {
      const _this = this
      // const eventChannel = this.getOpenerEventChannel()
      // eventChannel.on('acceptDataFromOpenerPage', function(res) {
      //   _this.setData({
      //     pathParams:res.data,
      //   })
      //   if(_this.data.pathParams.fromPath==='perchase-add'){
      //     _this.orderAddressList()
      //   }else if(_this.data.pathParams.fromPath==='perchase-edit'){
      //     _this.orderAddressList()
      //   }else{

      //   }

      // })
      _this.orderAddressList()
      _this.getProduct()
      _this.calcTotalAmount()
    },
    /**
   * 生命周期函数--监听页面卸载
   */
        onUnload: function () {
          wx.removeStorageSync('perchaseAddressList')
          wx.removeStorageSync('activeAddressId')
          wx.navigateTo({
            url:'../product-detail/product-detail?src='+wx.getStorageSync('activeProductId')
          })
        },
        // 地址处理
        orderAddressList(){
          const _this = this
          const order = []
          http.wxRequest({ ..._this.data.api.getAddressList, params: { userId: wx.getStorageSync('userId') } }).then(res => {
            if (res.success) {
              if(res.data.length>0){
                const perchaseAddressList = wx.getStorageSync('perchaseAddressList')
                if(perchaseAddressList&&perchaseAddressList.length>0){
                  for(let i=0;i<perchaseAddressList.length;i++){
                    for(let j=0;j<res.data.length;j++){
                      if(perchaseAddressList[i]===res.data[j].id){
                        order.push(res.data[j])
                      }
                    }
                  }
                }else{
                  const arr = []
                  arr.push(res.data[0].id)
                  wx.setStorageSync('perchaseAddressList',arr)
                  order.push(res.data[0])
                }
                order.forEach(item=>{
                  const address = JSON.parse(item.address)
                  item.province=address.province
                  item.city=address.city
                  item.county=address.county
                  item.addressDetail=address.addressDetail
                  item.isDefault=item.isDefault===1
                  item.productNum = 1
                })

              }
              if(order.length>1){
                let arr = []
                let sumCount = 0
                order.forEach((element) => {
                  arr.push(element.productNum)
                })
                sumCount = arr.reduce((sum, number) => {
                  return sum + number
                })
                this.calcTotalAmount(sumCount)
              }
              _this.setData({
                order
              })
            }
          })
        },
        productNumChange(event){
         const option = event.currentTarget.dataset.item
         const optionValue = event.detail
         this.data.order[option].productNum = optionValue
         this.setData({
           order:this.data.order,
         })
         this.calcTotalAmount(optionValue)
          const arr = []
          // if (this.data.order.length > 0) {
          //   this.data.order.forEach((element) => {
          //     arr.push(element.productNum)
          //   })
          //   sumCount = arr.reduce((sum, number) => {
          //     return sum + number
          //   })
          // }
          // console.log(sumCount)
          console.log(this.data.order)
          // sumCount++
          // this.setData({
          //   totalNum:this.data.totalNum
          // })
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
          console.log(e)
          const addressId = e.currentTarget.dataset.option
          wx.setStorageSync('activeAddressId',addressId)
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
          console.log(e)
          const index = e.currentTarget.dataset.index
          Dialog.confirm({
            title: '确定删除',
          })
            .then(() => {
              const addAddressId = wx.getStorageSync('perchaseAddressList')
              addAddressId.splice(index,1)
              wx.setStorageSync('perchaseAddressList',addAddressId)
              this.data.order.splice(index,1)
              this.setData({
                order:this.data.order
              })
              console.log(this.data.order)
            })
        },
        onSubmit(){
          console.log(this.data.order)
          const orderExtends = []
          this.data.order.forEach(item=>{
            const address = JSON.parse(item.address)
            const option = {
              addresseeAddress: address.province+address.city+address.county+address.addressDetail,
              addresseeName: item.name,
              addresseePhone: item.phone,
              id: item.id,
              isDefault: item.isDefault?1:0,
              productId: this.data.product.id,
              productNum: item.productNum,
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
