// shopping_money/shopping-money-detail/shopping-money-detail.js
import http from '../../utils/request'
const app = getApp()
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		shoppingMoneyData: {},
		total: 399,
		withdrawalMoney: 20,
		nbTitle: '我的购物金',
		nbFrontColor: '#ffffff',
		nbBackgroundColor: '#C59E5D',
		bottomShow: false,
		bottomLineShow: false,
		loadingShow: false,
		aboutGolden: false,
		aboutSilvery: false,
		recordText: '使用记录',
		operateType: 0,
		navHeight: '',
		searchMarginTop: 0, // 搜索框上边距
		searchWidth: 0, // 搜索框宽度
		searchHeight: 0, // 搜索框高度
		menuButtonInfo: wx.getMenuButtonBoundingClientRect(),
		recordList: [
			{ text: '使用记录', id: 0 },
			{ text: '充值记录', id: 1 },
			{ text: '提现记录', id: 2 },
			{ text: '手续费记录', id: 3 },
			// { text: '返点记录', id: 4 },
			{ text: '过期记录', id: 5 },
			{ text: '退款记录', id: 6 }
			// { text: '返佣记录', id: 7 },
			// { text: '扣点记录', id: 9 }
		],
		listData: [],
		pageSize: 15,
		pageNo: 1,
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

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				res.data.amount = String(res.data.amount).split('.')
				res.data.canWithdrawAmount = String(res.data.canWithdrawAmount).split(
					'.'
				)
				res.data.cannotWithdrawAmount = String(
					res.data.cannotWithdrawAmount
				).split('.')
				this.setData({
					shoppingMoneyData: res.data
				})
				this.getLogs()
			}
		})
	},
	showGoldenIntroduce() {
		this.setData({
			aboutGolden: true
		})
	},
	showSilveryIntroduce() {
		this.setData({
			aboutSilvery: true
		})
	},
	goBack() {
		wx.navigateBack({
			delte: 1
		})
	},
	getLogs() {
		const params = {
			operateType: this.data.operateType,
			shoppingAccountId: this.data.shoppingMoneyData.id,
			pageSize: this.data.pageSize,
			pageNo: this.data.pageNo
		}
		http.wxRequest({ ...this.data.api.getLogs, params }).then((res) => {
			if (res.success) {
				res.data.forEach((list) => {
					list.amount = Math.abs(list.amount)
				})
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
	handleBottomShow() {
		this.data.bottomShow = !this.data.bottomShow
		this.setData({
			bottomShow: this.data.bottomShow
		})
	},
	onClose() {
		this.setData({ bottomShow: false, aboutGolden: false, aboutSilvery: false })
	},
	goMygoldenOrMysilvery(e) {
		const type = e.currentTarget.dataset.type
		if (type === 'golden') {
			wx.navigateTo({
				url: '/pages_shopping_money/my-golden-money/my-golden-money'
			})
		} else if (type === 'silvery') {
			wx.navigateTo({
				url: '/pages_shopping_money/my-silvery-money/my-silvery-money'
			})
		}
	},
	selectList(e) {
		const option = e.currentTarget.dataset.option
		this.setData({
			recordText: option.text,
			operateType: option.id,
			pageNo: 1,
			bottomShow: false
		})
		this.getLogs()
		wx.pageScrollTo({
			scrollTop: 0
		})
	},
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
	}
})
