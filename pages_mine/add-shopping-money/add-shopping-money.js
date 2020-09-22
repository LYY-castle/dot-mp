import http from '../../utils/request'
import tool from '../../utils/mixin'
import { isMobile, isIDNumber } from '../../utils/validate'
import constantCfg from '../../config/constant'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		nbTitle: '绑定购物金账号',
		api: {
			addShoppingMoney: {
				url: '/user-shopping-accounts',
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
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},
	addShoppingMoney(val) {
		console.log(val)
		const option = val.detail.value
		if (option.accountNo) {
			if (option.accountPassword) {
				const params = {
					accountNo: option.accountNo,
					accountPassword: option.accountPassword
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
					title: '密码不能为空',
					icon: 'none'
				})
			}
		} else {
			wx.showToast({
				title: '账号不能为空',
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
