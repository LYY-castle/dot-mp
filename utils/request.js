import env from '../config/env.config'
/**
 * 请求头
 */



/**
 * function: 封装网络请求
 * @url URL地址
 * @params 请求参数
 * @method 请求方式：GET/POST
 * @onSuccess 成功回调
 * @onFailed  失败回调
 */
function getSuccess(res) {
  if (res.statusCode === 401) {
    wx.reLaunch({
      url: '/pages/mine/login/login'
    })
    wx.clearStorageSync()
    wx.showToast({
      title: res.data.message
    })
  } else {
    if (res.header['Authorization']) {
      wx.setStorageSync('authorization', res.header.Authorization)
    }
  }
}

function wxRequest({
  url,
  method = 'get',
  params = {},
  urlReplacements = []
}) {
  wx.showToast({
    title: '请稍后...',
    icon: 'loading'
  })
  let header = {}
  if (wx.getStorageSync('authorization')) {
    header = {
      'authorization': wx.getStorageSync('authorization')
    }
  } else {
    if(method==='get'){
      header = {
        'content-type': 'application/json' // 默认值
      }
    }
  }
  let reqUrl = env.env.VUE_APP_BASE_URL + url
  urlReplacements.forEach(replacement => {
    reqUrl = reqUrl.replace(replacement.substr, replacement.replacement)
  })
  return new Promise((resolve, reject) => {
    if (['post', 'patch', 'put'].includes(method)) {
      wx.request({
        url: reqUrl,
        data: params,
        method,
        header,
        success: function (res) {
          wx.hideToast()
          getSuccess(res)
          resolve(res.data)
        },
        fail: function (res) {
          console.log(url, params, method)
          reject(res)
        }
      })
    } else if (['get', 'delete'].includes(method)) {
      wx.request({
        url: reqUrl,
        data: params,
        method,
        header,
        success: function (res) {
          wx.hideToast()
          getSuccess(res)
          resolve(res.data)
        },
        fail: function (res) {
          console.log(hearder)
          console.log(url)
          console.log(params)
          reject(res)
        }
      })
    }
  })

}
// // 1.通过module.exports方式提供给外部调用
module.exports.wxRequest = wxRequest
