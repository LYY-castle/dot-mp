// shopping_money/my-silvery-money/my-silvery-money.js
import http from '../../utils/request'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		shoppingMoneyData: {},
		nbTitle: '我的银点',
		nbFrontColor: '#ffffff',
		nbBackgroundColor: '#C59E5D',
		listData: [],
		pageNo: 1,
		pageSize: 10,
		amountType: 1,
		operateType: 1,
		bottomLineShow: false,
		loadingShow: false,
		navHeight: '',
		searchMarginTop: 0, // 搜索框上边距
		searchWidth: 0, // 搜索框宽度
		searchHeight: 0, // 搜索框高度
		menuButtonInfo: wx.getMenuButtonBoundingClientRect(),
		api: {
			getShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'get'
			},
			// 获取购物金相关记录
			getLogs: {
				url: '/shopping-account-operate-logs',
				method: 'get'
			}
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const { top, width, height, right } = this.data.menuButtonInfo
		wx.getSystemInfo({
			success: (res) => {
				const { statusBarHeight } = res
				const margin = top - statusBarHeight
				this.setData({
					navHeight: height + statusBarHeight + margin * 2,
					searchMarginTop: statusBarHeight + margin, // 状态栏 + 胶囊按钮边距
					searchHeight: height, // 与胶囊按钮同高
					searchWidth: right - width // 胶囊按钮右边坐标 - 胶囊按钮宽度 = 按钮左边可使用宽度
				})
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.getShoppingMoney()
	},
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				res.data.cannotWithdrawAmount = String(
					res.data.cannotWithdrawAmount
				).split('.')
				res.data.cannotWithdrawUsedAmount = String(
					res.data.cannotWithdrawUsedAmount
				).split('.')
				this.setData({
					shoppingMoneyData: res.data
				})
				this.getLogs()
			}
		})
	},
	getLogs() {
		const params = {
			operateType: this.data.operateType,
			amountType: this.data.amountType,
			shoppingAccountId: this.data.shoppingMoneyData.id,
			pageSize: this.data.pageSize,
			pageNo: this.data.pageNo
		}
		http.wxRequest({ ...this.data.api.getLogs, params }).then((res) => {
			if (res.success) {
				if (params.pageNo === 1) {
					this.setData({
						listData: res.data,
						loadingShow: false
					})
				} else {
					this.setData({
						listData: this.data.listData.concat(res.data),
						loadingShow: false
					})
				}
				if (res.page.totalPage > 0 && params.pageNo === res.page.totalPage) {
					this.setData({
						bottomLineShow: true
					})
				} else {
					this.setData({
						bottomLineShow: false
					})
				}
			}
		})
	},
	goBack() {
		wx.navigateBack({
			delte: 1
		})
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
	onPullDownRefresh: function () {
		this.setData({
			pageNo: 1
		})
		this.getShoppingMoney()
		wx.stopPullDownRefresh()
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (
			this.data.listData.length > 0 &&
			!this.data.bottomLineShow &&
			!this.data.loadingShow
		) {
			this.setData({
				loadingShow: true,
				pageNo: this.data.pageNo + 1
			})
			this.getLogs()
		}
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
