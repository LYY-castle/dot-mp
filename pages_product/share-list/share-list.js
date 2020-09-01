import http from '../../utils/request.js'
import utils from '../../utils/util.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pageTitle: '分享案例',
    api: {
      getShareList: {
        url: '/product-share-cases',
        method: 'get',
      },
    },
    productId:null,
    shareList: [],
    pageSize: 10,
    pageNo: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    const _this = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function(res) {
      _this.setData({
        productId:res.data.productId
      })
      _this.getShareList(res.data.productId)
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  // 获取案例列表
  getShareList(id) {
    const params = {
      productId: id,
      pageSize: this.data.pageSize,
      pageNo: this.data.pageNo,
    }
    http.wxRequest({
      ...this.data.api.getShareList,
      params,
    }).then((res) => {
      if (res.success) {
        res.data.forEach((item) => {
          item.shareDoc = utils.ellipsis(item.shareDoc,60)
          if (item.shareImg !== null && item.shareImg.indexOf(';') !== -1) {
            item.shareImg = item.shareImg.split(';')[0]
          }
        })
        if (params.pageNo === 1) {
          this.setData({
            shareList:res.data
          })
        } else {
          this.setData({
            shareList:this.data.shareList.concat(res.data)
          })
        }
      }
    })
  },
  share(e){
    const option = e.currentTarget.dataset.item
    wx.navigateTo({
      url:'../share-detail/share-detail?shareId='+option
    })
  }
})
