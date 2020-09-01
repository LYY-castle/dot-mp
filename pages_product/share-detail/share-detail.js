import http from '../../utils/request.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageTitle: '转发模板',
    api: {
      getShareDetail: {
        url: '/product-share-cases/{id}',
        method: 'get',
      },
    },
    shareInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getShareDetail(options.shareId)
  },
  // 获取案例详情
  getShareDetail(id) {
    http.wxRequest({
      ...this.data.api.getShareDetail,
      urlReplacements: [{ substr: '{id}', replacement: id }],
    }).then((res) => {
      if (res.success) {
        if (res.data.shareImg !== null && res.data.shareImg.indexOf(';') !== -1) {
          res.data.shareImg = res.data.shareImg.split(';')
        } else {
          if (res.data.shareImg !== '') {
            res.data.shareImg = [res.data.shareImg]
          } else {
            res.data.shareImg = []
          }
        }
        this.setData({
          shareInfo:res.data
        })
      }
    })
  },
  preview(e){
    console.log(e)
    const option = e.currentTarget.dataset.option
    wx.previewImage({
      current: option, // 当前显示图片的http链接
      urls: this.data.shareInfo.shareImg // 需要预览的图片http链接列表
    })
  },
  copyAndDownload(){
    const _this= this
    wx.setClipboardData({
      data:_this.data.shareInfo.shareDoc,
      success(res){
        wx.showToast({
          title: '文本复制成功'
        })
        if(_this.data.shareInfo.shareImg.length>0){
          for(let i=0;i<_this.data.shareInfo.shareImg.length;i++){
            wx.downloadFile({
              url: _this.data.shareInfo.shareImg[i], //仅为示例，并非真实的资源
              success (res) {
                // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
                if (res.statusCode === 200) {
                  wx.saveImageToPhotosAlbum({
                    filePath:res.tempFilePath,
                    success(res){
                      if(i===_this.data.shareInfo.shareImg.length){
                        wx.showToast({
                          title: '图片下载完成'
                        })
                      }
                    },
                    fail(res){
                      console.log('下载失败',res)
                    }
                  })
                }
              }
            })
          }
        }
      }
    })

  }
})
