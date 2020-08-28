// pages/mine/address/add-address/add-address.js
import http from 'utils/request.js'
import areaList from '/utils/area.js'
import AddressParse from '/miniprogram_npm/address-parse/index'
import {isMobile} from '/utils/validate'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    areaList,
    nbTitle:'',
    pathParams:{},
    textareaHeight:{minHeight:50},
    isDefault:false,
    name:'',
    phone:'',
    address:'',
    addressOption:null,
    addressDetail:'',
    addressInfoText:'',
    addressShow:false,
    buttonText:'',
    deleteButtonShow:false,
    addressId:null,
    api: {
      addAddress: {
        url: '/user-addressees',
        method: 'post'
      },
      updateAddress: {
        url: '/user-addressees',
        method: 'put'
      },
      getAddressDetail: {
        url: '/user-addressees/{id}',
        method: 'get'
      },
      deleteAddress: {
        url: '/user-addressees/{ids}',
        method: 'delete'
      }
    }
  },
  isDefaultToggle(){
    this.setData({
      isDefault:!this.data.isDefault
    })
  },
  // 地址识别
  distinguish() {
    const [result] = AddressParse.parse(this.data.addressInfoText, true)
    console.log(result)
    this.setData({
      name:result.name,
      phone:result.mobile,
      address:result.province+'/'+result.city+'/'+result.area,
      addressDetail:result.details,
      addressOption:{
        province:result.province,
        city:result.city,
        county:result.area,
        addressInfoText:''
      }
    })
  },
  formSubmit(e){
    console.log(e)
    const option = e.detail.value
    if(option.name){
      if(option.phone){
        if(isMobile(option.phone)){
          if(option.address){
            if(option.addressDetail){
              const addressOption = {
                addressDetail:option.addressDetail,
                city:this.data.addressOption.city,
                county:this.data.addressOption.county,
                province:this.data.addressOption.province
              }
              let params = {
                userId:wx.getStorageSync('userId'),
                address:JSON.stringify(addressOption),
                isDefault:this.data.isDefault?1:0,
                phone:option.phone,
                name:option.name
              }
              if(this.data.addressId){
                // 编辑
                params.id = this.data.addressId
                http.wxRequest({...this.data.api.updateAddress,params}).then(res=>{
                  if(res.success){
                    wx.showToast({
                      title:'编辑成功',
                      success(){
                        setTimeout(function() {
                          wx.navigateTo({
                            url:'../address-list/address-list',
                            success(res){
                              res.eventChannel.emit('acceptDataFromOpenerPage', { data: _this.data.pathParams })
                            }
                          })
                        }, 1000)
                      }
                    })
                  }
                })
              }else{
                // 新增
                http.wxRequest({...this.data.api.addAddress,params}).then(res=>{
                  if(res.success){
                    wx.showToast({
                      title:'新增成功',
                      success(){
                        setTimeout(function() {
                          wx.navigateTo({
                            url:'../address-list/address-list',
                            success(res){
                              res.eventChannel.emit('acceptDataFromOpenerPage', { data: _this.data.pathParams })
                            }
                          })
                        }, 1000)
                      }
                    })
                  }
                })

              }
            }else{
              wx.showToast({
                title:'详细地址不能为空',
                icon:'none'
              })
            }
          }else{
            wx.showToast({
              title:'请选择地区',
              icon:'none'
            })
          }
        }else{
          wx.showToast({
            title:'手机号格式错误',
            icon:'none'
          })
        }
      }else{
        wx.showToast({
          title:'手机号不能为空',
          icon:'none'
        })
      }
    }else{
      wx.showToast({
        title:'姓名不能为空',
        icon:'none'
      })
    }
  },
  selectAddress(){
    this.setData({
      addressShow:true
    })
  },
  confirm(e){
    let address = e.detail.values
    this.setData({
      addressOption:{
        province:address[0].name,
        city:address[1].name,
        county:address[2].name
      }
    })
    let addressStr=''
    for(let i=0;i<address.length;i++){
      if(i<2){
        addressStr += address[i].name+'/'
      }else{
        addressStr += address[i].name
      }
    }
    this.setData({
      addressShow:false,
      address:addressStr
    })
  },
  cancel(){
    this.setData({
      addressShow:false
    })
  },
  deleteAddress(){
    const _this = this
    console.log(_this.data.addressId)
    wx.showModal({
      title: '确定删除？',
      success (res) {
        if (res.confirm) {
          http.wxRequest({..._this.data.api.deleteAddress,urlReplacements: [{ substr: '{ids}', replacement: _this.data.addressId }]}).then(res=>{
            if(res.success){
              wx.showToast({
                title:'删除成功',
                success(){
                  setTimeout(function() {
                    wx.navigateTo({
                      url:'../address-list/address-list',
                      success(res){
                        res.eventChannel.emit('acceptDataFromOpenerPage', { data: _this.data.pathParams })
                      }
                    })
                  }, 1000);
                }
              })
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  getAddressDetail(){
    http.wxRequest({...this.data.api.getAddressDetail,urlReplacements: [{ substr: '{id}', replacement: this.data.addressId }]}).then(res=>{
      if(res.success){
        const address = JSON.parse(res.data.address)
        this.setData({
          name:res.data.name,
          phone:res.data.phone,
          address:address.province+'/'+address.city+'/'+address.county,
          addressDetail:address.addressDetail,
          addressOption:address,
          isDefault:res.data.isDefault===1
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function(res) {
      _this.setData({
        pathParams:res.data
      })
      if(res.data.fromPath==='perchase-add'||res.data.fromPath==='mine'){
        _this.setData({
          nbTitle:'新增收货地址',
        })
      }else if(res.data.fromPath==='perchase-edit'||res.data.fromPath==='mine'){
        _this.setData({
          addressId:res.data.addressId,
          nbTitle:'编辑收货地址',
          deleteButtonShow:true,
        })
        _this.getAddressDetail()
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.reLaunch({
      url: '../address-list/address-list'
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
