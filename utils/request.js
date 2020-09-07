import env from '../config/env.config'

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
			url: '/pages/product/index'
		})
	} else {
		if (res.data.success) {
			wx.hideNavigationBarLoading({
				success(){
				}
			})
		} else {
			wx.showToast({
				title: res.data.message
			})
		}
	}
}
function wxRequest({ url, method = 'get', params = {}, urlReplacements = [] }) {
	let header = {
		authorization:'eyJhbGciOiJIUzI1NiJ9.eyJUT0tFTl9VU0VSX0lEIjo5LCJpYXQiOjE1OTk0NDMzMzcsImp0aSI6IjU0ZjI3ZjhiLWZhM2QtNDIxMi05MjhjLTZjNmExZDExZWU4YiIsImV4cCI6MTU5OTQ1MDUzN30.HIyMBomK-UIVw9UghDvAJjf3MV5EaXRHQ25P7LEvkhE'
	}
	let reqUrl = env.env.VUE_APP_BASE_URL + url
	urlReplacements.forEach((replacement) => {
		reqUrl = reqUrl.replace(replacement.substr, replacement.replacement)
	})
	return new Promise((resolve, reject) => {
		if (['post', 'patch', 'put'].includes(method)) {
			wx.showNavigationBarLoading({
				success(){
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
				}
			})

		} else if (['get', 'delete'].includes(method)) {
			wx.showNavigationBarLoading({
				success(){
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
	})
}

module.exports.wxRequest = wxRequest
