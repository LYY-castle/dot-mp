// shopping_money/my-golden-money/my-golden-money.js
import http from '../../utils/request.js'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		shoppingMoneyData: {},
		nbTitle: '我的金点',
		nbFrontColor: '#ffffff',
		nbBackgroundColor: '#C59E5D',
		numberMoney: 0,
		api: {
			getShoppingMoney: {
				url: '/withdrawals/statistics',
				method: 'get'
			}
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getShoppingMoney()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	getShoppingMoney() {
		const params = {
			userId: wx.getStorageSync('userId')
		}
		http
			.wxRequest({ ...this.data.api.getShoppingMoney, params })
			.then((res) => {
				if (res.success) {
					// 已经体现
					res.data.withdrawAmount = res.data.withdrawAmount
						? String(res.data.withdrawAmount).split('.')
						: ['0', '00']
					// 可提现
					res.data.canWithdrawAmount = res.data.canWithdrawAmount
						? String(res.data.canWithdrawAmount).split('.')
						: ['0', '00']
					// 提现审核中
					res.data.auditAmount = res.data.auditAmount
						? String(res.data.cannotWithdrawAmount).split('.')
						: ['0', '00']
					this.setData({
						shoppingMoneyData: res.data
					})
				}
			})
	},
	goWithdrawal() {
		const numberMoney = Number(
			this.data.shoppingMoneyData.canWithdrawAmount.join('.')
		)
		this.setData({
			numberMoney
		})
		if (numberMoney > 0) {
			wx.navigateTo({
				url: '/shopping_money/withdrawal-detail/withdrawal-detail'
			})
		}
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
