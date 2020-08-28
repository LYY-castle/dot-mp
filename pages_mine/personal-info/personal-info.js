import http from '../../utils/request.js'
import constantCfg from '../../config/constant'
import env from '../../config/env.config'
import areaList from '../../utils/area.js'
import tool from '../../utils/mixin.js'
import { isMobile, isIDNumber } from '../../utils/validate.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
      empty:'/static/img/avatar.png',
      areaList,
      selectBox: false,
      city: [],
      addressShow: false,
      fields: [],
      avatar:null,
      uploadAvatar:null,
      userInfo: {},
      // 图片剪切所需参数
      src:'',
    width: 200,//宽度
    height: 200,//高度
    max_width: 400,
    max_height: 400,
    disable_rotate:true,//是否禁用旋转
    disable_ratio: false,//锁定比例
    limit_move: true,//是否限制移动
      api: {
        getUserInfo: {
          url: '/users/{id}',
          method: 'get'
        },
        modifyUserInfo: {
          url: '/users',
          method: 'put'
        },
        uploadUserAvatar: {
          url: '/users',
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
    const event = options
    console.log(event)
    if(event.src){
      this.setData({
        avatar:event.src
      })
    }
    this.getUserInfo()
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
    console.log('返回')
    wx.reLaunch({
      url: '../mine'
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

  },
  getUserInfo() {
    const id = wx.getStorageSync('userId')
    const _this = this
    http.wxRequest({ ...this.data.api.getUserInfo, urlReplacements: [{ substr: '{id}', replacement: id }] }).then(res => {
      if (res.success) {
        if (res.data.idNo === null) {
          res.data.idNo = ''
        }
        if (res.data.phone === null) {
          res.data.phone = ''
        }
        _this.setData({
          userInfo: res.data,
          uploadAvatar:res.data.headImage,
          cityString:res.data.province + '/' + res.data.city
        })
        if(_this.data.avatar){
          const header = {
            'authorization': wx.getStorageSync('authorization')
          }
          wx.uploadFile({
            url: env.env.VUE_APP_BASE_URL+'/system/minio/'+constantCfg.minio.bucketName, //仅为示例，非真实的接口地址
            filePath: _this.data.avatar,
            name: 'file',
            header,
            formData: {
              bucketName: constantCfg.minio.bucketName,
              fileName: _this.data.avatar
            },
            success (res){
              const data = JSON.parse(res.data)
              if(data.success){
                _this.setData({
                  avatar:data.data.presignedUrl,
                  uploadAvatar:data.data.fileName
                })
              }
            }
          })
        }else{
          if (res.data.headImage) {
            if(_this.data.userInfo.headImage.indexOf('https')===-1){
              const params = {
                bucketName: constantCfg.minio.bucketName,
                fileName: res.data.headImage
              }
              tool.review(params).then(result => {
                if (result.success) {
                  _this.setData({
                    avatar:result.data
                })
                }
              })
            }

          }
        }
      }
    })
  },
  selectAddress(){
    this.setData({
      addressShow:true
    })
  },
  confirm(val) {
    const city = val.detail.values
    console.log(val)
    this.setData({
      addressShow:false,
      city,
      cityString:city[0].name + '/' + city[1].name
    })
    this.addressShow = false
  },
  cancel() {
    this.setData({
      addressShow:false
    })
  },
  upload() {
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        const src = res.tempFilePaths[0]
        wx.redirectTo({
          url: './upload/upload?src=' + src
        })
      }
    })
  },
  selectImage(){
    const _this = this
    wx.chooseImage({
      count: 1,//选择数量
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        //图片的临时路径
        const src = res.tempFilePaths[0]
        wx.navigateTo({
          url:'./cropper/cropper?src='+src
        })
      }
    })
  },
  updateUserInfo(e){
    const option = e.detail.value
    const params = {
      id:wx.getStorageSync('userId'),
      idNo:option.idNo,
      name:option.name,
      phone:option.phone,
      province:this.data.city.length>0?this.data.city[0].name:this.data.userInfo.province,
      city:this.data.city.length>0?this.data.city[1].name:this.data.userInfo.city,
      headImage:this.data.uploadAvatar
    }
    console.log(params)
    if(option.name!==''){
      if(option.phone!==''){
        if(isMobile(option.phone)){
          if(option.idNo!==''){
            if(isIDNumber(option.idNo)){
              http.wxRequest({
                ...this.data.api.modifyUserInfo,
                params
              }).then(res=>{
                if(res.success){
                  wx.showToast({
                    title:'提交成功',
                    icon:'none',
                    success(){
                      setTimeout(function() {
                        wx.switchTab({
                          url:'../../pages/mine',
                        })
                      }, 1000);
                    }
                  })
                }
              })
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
        title:'姓名不能为空',
        icon:'none'
      })
    }
  }
})
