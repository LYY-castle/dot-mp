import http from './utils/request'
import env from './config/env.config'
App({
	data: {
		login: {
			url: '/auth/wx/login',
			method: 'post'
		}
	},
	onLaunch: function (options) {
		// 静默登录
		wx.login({
			success: (res) => {
				this.globalData.wechatCode = res.code
				const params = {
					wechatAppId: env.env.appid,
					wechatCode: res.code
				}
				http.wxRequest({ ...this.data.login, params }).then((res) => {
					if (res.success) {
						wx.setStorageSync('openId', res.data.weixinOpenid)
						wx.setStorageSync('userId', res.data.id)
						let url = '/' + options.path
						if (options.query) {
							url += '?' + this.queryString(options.query)
						}
						wx.reLaunch({
							url
						})
					} else {
						console.log('请求失败', res)
					}
				})
			}
		})
		let menuButtonObject = wx.getMenuButtonBoundingClientRect()
		wx.getSystemInfo({
			success: (res) => {
				let statusBarHeight = res.statusBarHeight,
					navTop = menuButtonObject.top, //胶囊按钮与顶部的距离
					navHeight =
						statusBarHeight +
						menuButtonObject.height +
						(menuButtonObject.top - statusBarHeight) * 2 //导航高度
				this.globalData.navHeight = navHeight
				this.globalData.navTop = navTop
				this.globalData.windowHeight = res.windowHeight
			},
			fail(err) {
				console.log(err)
			}
		})
	},
	queryString(json) {
		if (!json) return ''
		return this.cleanArray(
			Object.keys(json).map((key) => {
				if (json[key] === undefined) return ''
				return encodeURIComponent(key) + '=' + encodeURIComponent(json[key])
			})
		).join('&')
	},
	cleanArray(actual) {
		const newArray = []
		for (let i = 0; i < actual.length; i++) {
			if (actual[i]) {
				newArray.push(actual[i])
			}
		}
		return newArray
	},
	getLaunchOptionsSync: function (option) {
		console.log(option, '111111')
	},

	globalData: {
		wechatCode: null,
		promoCode: null
	}
})
