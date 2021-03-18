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
		wx.removeStorageSync('authorization')
		const login = {
			url: '/auth/wx/login',
			method: 'post'
		}
		wx.login({
			success: (res) => {
				const params = {
					wechatAppId: env.env.appid,
					wechatCode: res.code
				}
				wxRequest({ ...login, params }).then((res) => {
					if (res.success) {
						wx.setStorageSync('openId', res.data.weixinOpenid)
						wx.setStorageSync('userId', res.data.id)
						wx.reLaunch({
							url: wx.getStorageSync('homeUrl')
						})
					}
				})
			}
		})
	} else {
		if (res.header['Authorization']) {
			wx.setStorageSync('authorization', res.header.Authorization)
		}
		if (res.data.success) {
			// wx.hideLoading()
		} else {
			wx.showToast({
				title: res.data.message,
				icon: 'none'
			})
		}
	}
}

function wxRequest({ url, method = 'get', params = {}, urlReplacements = [] }) {
	let header = {}
	if (wx.getStorageSync('authorization')) {
		header = {
			authorization: wx.getStorageSync('authorization')
		}
	} else {
		header = {
			'content-type': 'application/json' // 默认值
		}
	}
	let reqUrl = env.env.VUE_APP_BASE_URL + url
	urlReplacements.forEach((replacement) => {
		reqUrl = reqUrl.replace(replacement.substr, replacement.replacement)
	})
	return new Promise((resolve, reject) => {
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
	})
}

module.exports.wxRequest = wxRequest
