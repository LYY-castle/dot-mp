import http from '../../utils/request.js'
import areaList from '../../utils/area.js'
import env from '../../config/env.config'
import {isMobile,isBankCard,isIDNumber} from '../../utils/validate'
import tool from '../../utils/mixin'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    areaList,
    cityShow: false,
    frontImage: null,
    backImage: null,
    uploadFrontImage:null,
    uploadBackImage:null,
    userInfo: {},
    city: [],
    openingCity:null,
    api: {
      getUserInfo: {
        url: '/user-bank-card-info',
        method: 'get'
      },
      addCard: {
        url: '/user-bank-card-info',
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
  onLoad: function (options) {
    this.getMineBankCard()
  },

  reviewFront(front) {
    const frontParams = {
      bucketName: constantCfg.minio.bucketName,
      fileName: front
    }
    tool.review(frontParams).then(res => {
      if (res.success) {
        this.setData({
          frontImage:res.data,
        })
      }
    })
  },
  reviewReverse(reverse) {
    const Params = {
      bucketName: constantCfg.minio.bucketName,
      fileName: reverse
    }
    tool.review(Params).then(res => {
      if (res.success) {
        this.setData({
          backImage:res.data
        })
      }
    })
  },
  getMineBankCard(){
    http.wxRequest({...this.data.api.getUserInfo,params:{userId:wx.getStorageSync('userId')}}).then(res=>{
      if(res.success){
        if(res.data.length>0){
          if (res.data[0].idCardFront && res.data[0].idCardReverse) {
            if(res.data[0].idCardFront.indexOf('https')===-1){
              this.reviewFront(res.data[0].idCardFront)
            }else{
              this.setData({
                frontImage:res.data[0].idCardFront
              })
            }
            if(res.data[0].idCardReverse.indexOf('https')===-1){
              this.reviewReverse(res.data[0].idCardReverse)
            }else{
              this.setData({
                backImage:res.data[0].idCardReverse
              })
            }
          }
          const mapData = {
            cardOwner:res.data[0].cardOwner,
            cardNo:res.data[0].cardNo,
            bankName:res.data[0].bankName,
            phone:res.data[0].phone,
            idNo:res.data[0].idNo,
          }
          this.setData({
            userInfo:mapData,
            openingCity:res.data[0].openingCity,
            uploadFrontImage:res.data[0].idCardFront,
            uploadBackImage:res.data[0].idCardReverse,
          })
          console.log(this.data)
        }
      }
    })
  },
  formSubmit(e){
    const option = e.detail.value
    let params = {
      userId: wx.getStorageSync('userId'),
      cardOwner: option.cardOwner,
      cardNo: option.cardNo,
      bankName: option.bankName,
      phone: option.phone,
      idNo: option.idNo,
      openingCity: this.data.openingCity,
      idCardFront: this.data.uploadFrontImage,
      idCardReverse: this.data.uploadBackImage
    }
    if(option.cardOwner!==''){
      if(option.cardNo!==''){
        if(isBankCard(option.cardNo)){
          if(option.bankName!==''){
            if(this.data.openingCity!==null){
              if(option.phone!==''){
                if(isMobile(option.phone)){
                  if(option.idNo!==''){
                    if(isIDNumber(option.idNo)){
                      if(this.data.uploadFrontImage){
                        if(this.data.uploadBackImage){
                          http.wxRequest({...this.data.api.addCard,params}).then(res=>{
                            if(res.success){
                              wx.showToast({
                                title:'提交成功',
                                icon:'none',
                                success(){
                                  setTimeout(function() {
                                    wx.switchTab({
                                      url:'../../pages/mine/mine',
                                    })
                                  }, 1000);
                                }
                              })
                            }
                          })
                        }else{
                          wx.showToast({
                            title:'请上传身份证反面照片',
                            icon:'none'
                          })
                        }
                      }else{
                        wx.showToast({
                          title:'请上传身份证正面照片',
                          icon:'none'
                        })
                      }
                    }else{
                      wx.showToast({
                        title:'身份证号格式错误',
                        icon:'none'
                      })
                    }
                  }else{
                    wx.showToast({
                      title:'身份证号不能为空',
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
                title:'请选择开户城市',
                icon:'none'
              })
            }
          }else{
            wx.showToast({
              title:'银行不能为空',
              icon:'none'
            })
          }
        }else{
          wx.showToast({
            title:'账号格式错误',
            icon:'none'
          })
        }
      }else{
        wx.showToast({
          title:'账号不能为空',
          icon:'none'
        })
      }
    }else{
      wx.showToast({
        title:'户名不能为空',
        icon:'none'
      })
    }
  },
  selectAddress(){
    this.setData({
      cityShow:true
    })
  },
  confirm(e){
    const city = e.detail.values
    this.setData({
      city,
      openingCity:city[0].name+city[1].name
    })
    this.setData({
      cityShow:false
    })
  },
  cancel(){
    this.setData({
      cityShow:false
    })
  },
  // 上传身份证
  uploadIdNoImage(e){
    const option = e.currentTarget.dataset.image
    const header = {
      'authorization': wx.getStorageSync('authorization')
    }
    const _this = this
    wx.chooseImage({
      success (res) {
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: env.env.VUE_APP_BASE_URL+'/system/minio/'+constantCfg.minio.bucketName, //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          header,
          formData: {
            bucketName: constantCfg.minio.bucketName,
            fileName: tempFilePaths[0]
          },
          success (res){
            const data = JSON.parse(res.data)
            if(data.success){
              if(option==='front'){
                console.log(data.data.presignedUrl)
                _this.setData({
                  frontImage:data.data.presignedUrl,
                  uploadFrontImage:data.data.fileName
                })
              }else if(option==='back'){
                _this.setData({
                  backImage:data.data.presignedUrl,
                  uploadBackImage:data.data.fileName
                })
              }
            }
          }
        })
      }
    })
  }
})
