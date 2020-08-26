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
      url: '/pages/index/index'
    })
    wx.clearStorageSync()
    wx.showToast({
      title: res.data.message,
      icon:'none'
    })
  } else {
    if (res.header['Authorization']) {
      wx.setStorageSync('authorization', res.header.Authorization)
    }
    if(res.data.success){
      wx.hideLoading()
    }else{
      wx.showToast({
        title: res.data.message
      })
    }

  }
}

function wxRequest({
  url,
  method = 'get',
  params = {},
  urlReplacements = []
}) {
  let header = {}
  wx.showLoading({
    title: '请稍后',
  })
  if (wx.getStorageSync('authorization')) {
    header = {
      'authorization': wx.getStorageSync('authorization')
    }
  } else {
      header = {
        'content-type': 'application/json' // 默认值
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
          getSuccess(res)
          resolve(res.data)
        },
        fail: function (res) {
          const httpParams = {
            url,
            params
          }
          console.log(httpParams)
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
          getSuccess(res)
          resolve(res.data)
        },
        fail: function (res) {
          console.log(header)
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
