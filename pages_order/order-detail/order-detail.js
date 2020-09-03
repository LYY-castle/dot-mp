import http from '../../utils/request.js'
import utils from '../../utils/util.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    orderInfo: {},
    orderId: null,
    productId: null,
    insureStatusMap: {
      0: {
        text: '待支付',
        color: '#7232dd'
      },
      1: {
        text: '待生效',
        color: '#1989fa'
      },
      2: {
        text: '投保成功',
        color: '#07c160'
      },
      3: {
        text: '投保失败',
        color: '#ee0a24'
      }
    },
    statusMap: {
      0: {
        text: '待支付',
        color: 'rgba(249, 173, 8, 1)'
      },
      1: {
        text: '已支付',
        color: 'rgba(101, 101, 101, 1)'
      },
      2: {
        text: '已退款',
        color: '#722ed1'
      },
      3: {
        text: '已关闭',
        color: '#f5222d'
      }
    },
    logisticsMap: {
      0: {
        text: '待发货',
        color: '#F6BD16'
      },
      1: {
        text: '已发货',
        color: '#E8684A'
      }
    },
    api: {
      getOrderById: {
        url: '/orders/{id}',
        method: 'get'
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const _this = this
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', function (res) {
      _this.setData({
        orderId: res.data
      })
      _this.getOrderDetail()
    })
  },
  getOrderDetail() {
    http.wxRequest({
      ...this.data.api.getOrderById,
      urlReplacements: [{
        substr: '{id}',
        replacement: this.data.orderId
      }]
    }).then(res => {
      if (res.success) {
        res.data.orderExtends.forEach(extend => {
          extend.product.name = utils.ellipsis(extend.product.name, 10)
          if (extend.product.image) {
            if (extend.product.image !== null && extend.product.image.indexOf(';') !== -1) {
              extend.product.image = extend.product.image.split(';')[0]
            }
          }
        })
        this.setData({
          orderInfo: res.data
        })
      }
    })
  },
  copy() {
    wx.setClipboardData({
      data: this.data.orderInfo.orderNo,
      success(res) {
        wx.showToast({
          title: '复制成功'
        })
      }
    })
  }
})