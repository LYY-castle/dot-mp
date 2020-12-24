import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import Dialog from '@vant/weapp/dialog/dialog'
import constantCfg from '../../config/constant'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		shoppingMoneyIcon: '/static/img/shopping-money.png',
		bg: '/static/img/bg.png',
		avatar: '/static/img/avatar.png',
		shoppingMoneyData: null,
		money: null, // 购物金
		userInfo: null,
		api: {
			getUserInfo: {
				url: '/users/{id}',
				method: 'get'
			},
			logout: {
				url: '/users/logout',
				method: 'get'
			},
			getShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'get'
			},
			deleteShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'delete'
			}
		},
		list: [
			{
				title: '个人资料',
				iconHref: '/static/img/mine-info.png',
				path: '/pages_mine/personal-info/personal-info'
			},
			{
				title: '我的订单',
				iconHref: '/static/img/order.png',
				path: '/pages_order/order-list/order-list'
			},
			{
				title: '我的地址',
				iconHref: '/static/img/address.png',
				path: '/pages_address/address-list/address-list'
			}
		]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.getUserInfo()
		this.getShoppingMoney()
	},
	// 获取用户的头像信息
	getUserInfo() {
		return new Promise((resolve) => {
			const id = wx.getStorageSync('userId')
			http
				.wxRequest({
					...this.data.api.getUserInfo,
					urlReplacements: [{ substr: '{id}', replacement: id }]
				})
				.then((res) => {
					if (res.success) {
						if (res.data.avatar.indexOf('https') === -1) {
							const viewParam = {
								bucketName: constantCfg.minio.bucketName,
								fileName: res.data.avatar
							}
							tool.review(viewParam).then((result) => {
								res.data.avatar = result.data
								this.setData({
									userInfo: res.data
								})
							})
						} else {
							this.setData({
								userInfo: res.data
							})
						}
						resolve()
					}
				})
		})
	},
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				if (res.data) {
					this.setData({
						shoppingMoneyData: res.data
					})
				} else {
					this.setData({
						shoppingMoneyData: null
					})
				}
			}
		})
	},
	addShopingMoney() {
		wx.navigateTo({
			url: '/pages_mine/add-shopping-money/add-shopping-money'
		})
	},
	deleteShopingMoney() {
		const _this = this
		Dialog.confirm({
			title: '确认解绑',
			message: '解绑后您将无法使用购物金购买商品',
			asyncClose: true
		})
			.then(() => {
				http
					.wxRequest({ ..._this.data.api.deleteShoppingMoney })
					.then((res) => {
						if (res.success) {
							wx.showToast({
								title: '解绑成功',
								icon: 'none',
								success() {
									wx.removeStorageSync('shopping_money')
									_this.getUserInfo()
									_this.getShoppingMoney()
									Dialog.close()
								}
							})
						}
					})
			})
			.catch(() => {
				Dialog.close()
			})
	},
	gotoPage(event) {
		const option = event.currentTarget.dataset.option
		wx.navigateTo({
			url: option.path
		})
	},
	handleContact(e) {
		console.log(e.detail)
	},
	gotoShoppingMoneyDetail() {
		if (this.data.shoppingMoneyData && !this.data.shoppingMoneyData.status) {
			wx.navigateTo({
				url: '/shopping_money/shopping-money-detail/shopping-money-detail'
			})
		}
	}
})
