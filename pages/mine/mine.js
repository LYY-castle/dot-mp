import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
import constantCfg from '../../config/constant'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		bg: '/static/img/bg.png',
		avatar: '/static/img/avatar.png',
		userInfo: null,
		api: {
			getUserInfo: {
				url: '/users/{id}',
				method: 'get'
			},
			logout: {
				url: '/users/logout',
				method: 'get'
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
						console.log(res.data.avatar.indexOf('https') === -1)
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
	bindRegionChange(e) {
		console.log(e)
	},
	gotoPage(event) {
		const option = event.currentTarget.dataset.option
		wx.navigateTo({
			url: option.path
		})
	}
})
