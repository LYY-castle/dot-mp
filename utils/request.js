import env from '../config/env.config'
/**
 * 请求头
 */
let header = {
  'content-type': 'application/x-www-form-urlencoded',
  'Authorization': "Bearer " + wx.getStorageSync("token"),
  'os': 'android',
  'version': '1.0.0',
  'device_token': 'ebc9f523e570ef14',
}
/**
 * function: 封装网络请求
 * @url URL地址
 * @params 请求参数
 * @method 请求方式：GET/POST
 * @onSuccess 成功回调
 * @onFailed  失败回调
 */
function request({
  url,
  method = 'get',
  params = {},
  urlReplacements = [],
  header,
}) {
  let reqUrl = env.env.VUE_APP_BASE_URL + url
  urlReplacements.forEach(replacement => {
    reqUrl = reqUrl.replace(replacement.substr, replacement.replacement)
  })
  if (['post', 'patch', 'put'].includes(method)) {
    return wx.request({
      url: reqUrl,
      data: params,
      method,
      success: function (res) {
        console.log('请求成功', res)
      },
      fail: function (res) {
        console.log('请求失败', res)
      }
    })
  } else if (['get', 'delete'].includes(method)) {
    return wx.request({
      url: reqUrl,
      params,
      method,
      success: function (res) {
        console.log('请求成功', res)
      },
      fail: function (res) {
        console.log('请求失败', res)
      }
    })
  }
}

// 1.通过module.exports方式提供给外部调用
module.exports = {
  request: request
}