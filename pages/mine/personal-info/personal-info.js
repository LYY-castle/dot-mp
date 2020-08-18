// pages/mine/personal-info/personal-info.js
import http from '../../../utils/request.js' //相对路径
import constantCfg from '../../../config/constant'
import areaList from '../../../utils/area.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    areaList,
    selectBox: false,
      // patternPhone: regexMap.mobile,
      // patternIdNo: regexMap.idNo,
      city: [],
      addressShow: false,
      // fileList: [avatar],
      fields: [],
      userInfo: {},
      // 图片剪切所需参数
      headImg: '',
      // 剪切图片上传
      // crap: false,
      // uploadImage: {},
      // previews: {},
      // option: {
      //   img: '',
      //   outputSize: 1, // 剪切后的图片质量（0.1-1）
      //   full: false, // 输出原图比例截图 props名full
      //   outputType: 'png',
      //   autoCropWidth: '150px',
      //   autoCropHeight: '150px',
      //   canScale: true,
      //   canMove: true,
      //   original: false,
      //   canMoveBox: false,
      //   autoCrop: true,
      //   fixedBox: true
      // },
      // fileName: '', // 本机文件地址
      // downImg: '#',
      // uploadImgRelaPath: '', // 上传后的图片的地址（不带服务器域名）

      api: {
        getUserInfo: {
          url: '/users/{id}',
          method: 'get'
        },
        modifyUserInfo: {
          url: '/users',
          method: 'patch'
        },
        uploadUserAvatar: {
          url: '/users',
          method: 'patch'
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
    this.getUserInfo()
    // let {
    //   avatar
    // } = option

    // if (avatar) {
    //   this.setData({
    //     src: avatar
    //   })
    // }
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
    http.wxRequest({ ...this.data.api.getUserInfo, urlReplacements: [{ substr: '{id}', replacement: id }] }).then(res => {
      if (res.success) {
        if (res.data.idNo === null) {
          res.data.idNo = ''
        }

        if (res.data.phone === null) {
          res.data.phone = ''
        }
        this.setData({
          userInfo: res.data,
          cityString:res.data.province + '/' + res.data.city
        })
        if (res.data.headImage) {
          const params = {
            bucketName: constantCfg.minio.bucketName,
            fileName: res.data.headImage
          }
          // this.review(params).then(result => {
          //   if (result.success) {
          //     this.userInfo.avatar = result.data
          //     this.fetched = false
          //     this.$nextTick(() => {
          //       this.fetched = true
          //     })
          //   }
          // })
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

})
