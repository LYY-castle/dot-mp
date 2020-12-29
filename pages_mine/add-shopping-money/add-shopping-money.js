import http from '../../utils/request'
import { isMobile } from '../../utils/validate'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		nbTitle: '绑定购物金账号',
		sendMsg: '发送验证码',
		send: false,
		phone: null,
		validateCode: null,
		api: {
			addShoppingMoney: {
				url: '/user-shopping-accounts/bind',
				method: 'post'
			},
			// 校验验证码
			// checkCode: {
			// 	url: '/users/duplicate/check',
			// 	method: 'get'
			// },
			sendCode: {
				url: '/user-shopping-accounts/send-validate-code',
				method: 'post'
			}
		}
	},
	onLoad: function (options) {
		if (wx.getStorageSync('shopping_money')) {
			this.setData({
				nbTitle: '切换购物金账号'
			})
		} else {
			this.setData({
				nbTitle: '绑定购物金账号'
			})
		}
	},
	// 获取手机验证码
	getCode() {
		if (!this.data.send) {
			this.validatorCode()
		}
	},
	validatorCode() {
		return new Promise((resolve) => {
			if (this.data.phone) {
				if (isMobile(this.data.phone)) {
					let params = {
						phone: this.data.phone
					}
					http.wxRequest({ ...this.data.api.sendCode, params }).then((res) => {
						if (res.success) {
							this.data.send = true
							this.setData({
								send: this.data.send
							})
							let time = 60000
							let timeText = '秒后重新获取'
							let timer = setInterval(() => {
								time -= 1000
								this.data.sendMsg = time / 1000 + timeText
								this.setData({
									sendMsg: this.data.sendMsg
								})
								if (time === 0) {
									clearInterval(timer)
									this.data.send = false
									this.data.sendMsg = '发送验证码'
									this.setData({
										send: this.data.send,
										sendMsg: this.data.sendMsg
									})
								}
							}, 1000)
							wx.showToast({
								title: '短信已发送',
								icon: 'none'
							})
							resolve(res)
						} else {
							wx.showToast({
								title: res.message,
								icon: 'none'
							})
						}
					})
				} else {
					wx.showToast({
						title: '手机号格式错误',
						icon: 'none'
					})
					resolve()
				}
			} else {
				wx.showToast({
					title: '手机号不能为空',
					icon: 'none'
				})
				resolve()
			}
		})
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},
	addShoppingMoney(val) {
		const option = val.detail.value
		if (option.phone) {
			if (isMobile(option.phone)) {
				if (option.validateCode) {
					const params = {
						phone: option.phone,
						validateCode: option.validateCode
					}
					http
						.wxRequest({ ...this.data.api.addShoppingMoney, params })
						.then((res) => {
							if (res.success) {
								wx.showToast({
									title: '绑定成功',
									success() {
										wx.navigateBack({
											delta: 1
										})
									}
								})
							}
						})
				} else {
					wx.showToast({
						title: '验证码不能为空',
						icon: 'none'
					})
				}
			} else {
				wx.showToast({
					title: '手机号格式错误',
					icon: 'none'
				})
			}
		} else {
			wx.showToast({
				title: '手机号不能为空',
				icon: 'none'
			})
		}
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {}
})
