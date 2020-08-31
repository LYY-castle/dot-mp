import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import util from '../../utils/util.js'
import qseBaoUtil from '../../utils/qsebao.js'
import constantCfg from '../../config/constant'
import Crypto from '../../utils/crypto'
import areaList from '../../utils/area.js'
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
      _this.getAddressInfo()
      _this.getProduct()
      _this.calcTotalAmount()



    },
        // 地址处理
        getAddressInfo() {
          const _this = this
          http.wxRequest({ ..._this.data.api.getAddressList, params: { userId: wx.getStorageSync('userId') } }).then(res => {
            if (res.success) {
              let addressListIds = []
              let addressList = []
              if(res.data.length>0){
                addressListIds.push(res.data[0].id)
                addressList.push(res.data[0])
              }
              addressList.forEach(item=>{
                const address = JSON.parse(item.address)
                item.province=address.province
                item.city=address.city
                item.county=address.county
                item.addressDetail=address.addressDetail
                item.isDefault=item.isDefault===1
                item.productNum = 1
              })
              _this.setData({
                order:addressList
              })
              wx.setStorageSync('perchaseAddressList',addressListIds)
            }
          })
        },
        orderAddressList(){
          const _this = this
          const perchaseAddressList = wx.getStorageSync('perchaseAddressList')
          const order = []
          http.wxRequest({ ..._this.data.api.getAddressList, params: { userId: wx.getStorageSync('userId') } }).then(res => {
            if (res.success) {
              if(res.data.length>0){
                for(let i=0;i<perchaseAddressList.length;i++){
                  for(let j=0;j<res.data.length;j++){
                    if(perchaseAddressList[i]===res.data[j].id){
                      order.push(res.data[j])
                    }
                  }
                }
              }
              const arrNum = []
              order.forEach(item=>{
                const address = JSON.parse(item.address)
                item.province=address.province
                item.city=address.city
                item.county=address.county
                item.addressDetail=address.addressDetail
                item.isDefault=item.isDefault===1
                item.productNum = 1
              })

              _this.setData({
                order
              })
            }
          })
        },
        productNumChange(event){
          // const sumCount = []
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
          const option = event.currentTarget.dataset.item
          // sumCount++
          // this.setData({
          //   totalNum:this.data.totalNum
          // })
          console.log(option)
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
          const _this = this
          return new Promise(resolve=>{
            http.wxRequest({
              ..._this.data.api.calcTotalAmount,
              params: {
                productId: _this.data.pathParams.productId,
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
        editAddress(){
          const pathParams = {
            productId:this.data.pathParams.productId
          }
          // 编辑订单地址
          wx.navigateTo({
            url: '../../pages_address/address-list/address-list',
            success(res){
              res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
            }
          })
        },
        addAddress(){
          // 新增订单地址
          wx.navigateTo({
            url: '../../pages_address/address-list/address-list',
          })
        },
        onSubmit(){
          this.setData({
            dialogShow:true
          })
        },
        confirm(){
          const address = {areaCode:"140105",addressDetail:"sbachsabc",city:"太原市",county:"小店区",province:"山西省"}
          const params = {
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
              zipCode: null}],
              parentUserId: 1,
              type: "4"
          }
          http.wxRequest({...this.data.api.addOrder,params}).then(res=>{
            console.log(res)
            const payParams = {
              openid: wx.getStorageSync('openId'),
              outTradeNo:res.data.orderNo,
              totalFee:res.data.amount * 100,// 微信支付单位为分.
              body: this.data.product.name,
              tradeType:'JSAPI'
            }
            http.wxRequest({...this.data.api.payment,params:payParams}).then(result=>{
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
          })
        }
  // }

})
