import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
import util from '../../utils/util.js'
import constantCfg from '../../config/constant'
const moment = require('../../utils/moment.min.js')
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		bottomLineShow: false,
		loadingShow: true,
		orderStatus: 0,
		pay: '/static/img/pay.png',
		waitPay: '/static/img/wait-pay.png',
		empty: '/static/img/empty.png',
		iconSuccess: '/static/img/icon-success.png',
		iconFail: '/static/img/icon-fail.png',
		params: null,
		activeProductType: 0,
		pageSize: 10,
		pageNo: 1,
		orderList: null,
		productTypes: [
			{
				name: '全部',
				code: 0
			},
			{
				name: '待付款',
				code: '100'
			},
			{
				name: '待发货',
				code: '200'
			},
			{
				name: '待收货',
				code: '300'
			}
		],

		api: {
			getOrderList: {
				url: '/orders',
				method: 'get'
			},
			getPolicies: {
				url: '/policies',
				method: 'get'
			},
			getDotsList: {
				url: '/users',
				method: 'get'
			},
			getOrderById: {
				url: '/orders/{id}',
				method: 'get'
			},
			// 确认收货
			ensure: {
				url: '/orders',
				method: 'put'
			},
			// 删除订单
			delete: {
				url: '/orders/{id}',
				method: 'delete'
			}
		},
		statusMap: {
			100: {
				text: '待付款'
			},
			200: {
				text: '待发货'
			},
			300: {
				text: '待收货'
			},
			400: {
				text: '交易完成'
			},
			500: {
				text: '售后中'
			},
			600: {
				text: '交易关闭'
			}
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onShow: function (options) {
		this.setData({
			activeProductType: 0,
			orderStatus: 0,
			params: {
				pageNo: this.data.pageNo,
				pageSize: this.data.pageSize,
				userId: wx.getStorageSync('userId')
			}
		})
		Promise.resolve().then(() => this.getOrderList())
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (!this.data.bottomLineShow && !this.data.loadingShow) {
			const pageNo = this.data.pageNo + 1
			this.setData({
				pageNo,
				loadingShow: true
			})
			if (this.data.orderStatus === 0) {
				this.setData({
					params: {
						pageNo,
						pageSize: this.data.pageSize,
						userId: wx.getStorageSync('userId')
					}
				})
			} else {
				this.setData({
					params: {
						pageNo,
						pageSize: this.data.pageSize,
						userId: wx.getStorageSync('userId'),
						orderStatus: this.data.orderStatus
					}
				})
			}
			this.getOrderList()
		}
	},
	getOrderListByType(e) {
		this.setData({
			activeProductType: e.detail.name,
			orderStatus: e.detail.name,
			orderList: null,
			bottomLineShow: false,
			loadingShow: true,
			pageNo: 1
		})
		if (this.data.orderStatus === 0) {
			this.setData({
				params: {
					pageNo: 1,
					pageSize: this.data.pageSize,
					userId: wx.getStorageSync('userId')
				}
			})
		} else {
			this.setData({
				params: {
					pageNo: 1,
					pageSize: this.data.pageSize,
					userId: wx.getStorageSync('userId'),
					orderStatus: this.data.orderStatus
				}
			})
		}
		this.getOrderList()
	},
	getOrderList() {
		return new Promise((resolve) => {
			http
				.wxRequest({
					...this.data.api.getOrderList,
					params: this.data.params
				})
				.then((res) => {
					if (res.success) {
						res.data.forEach((item) => {
							item.totalNum = 0
							item.orderGoods.forEach((good) => {
								item.totalNum += good.number
							})
							if (item.orderGoods.length === 1) {
								item.orderGoods.forEach((good) => {
									good.name = util.ellipsis(good.goodsName, 30)
								})
							}
						})
						if (res.page.pageNo === 1) {
							this.setData({
								orderList: res.data,
								loadingShow: false
							})
						} else {
							this.setData({
								orderList: this.data.orderList.concat(res.data),
								loadingShow: false
							})
						}
						if (res.page.pageNo === res.page.totalPage) {
							this.setData({
								bottomLineShow: true
							})
						} else {
							this.setData({
								bottomLineShow: false
							})
						}
						resolve()
					}
				})
		})
	},
	orderDetail(val) {
		const orderId = val.currentTarget.dataset.option
		wx.navigateTo({
			url: '/pages_order/order-detail/order-detail?src=' + orderId
		})
	},
	// 确认收货
	ensureOrder(e) {
		const params = {
			id: e.currentTarget.dataset.option,
			orderStatus: 400
		}
		const _this = this
		wx.showModal({
			title: '确认收货？',
			success(res) {
				if (res.confirm) {
					http.wxRequest({ ..._this.data.api.ensure, params }).then((res) => {
						if (res.success) {
							_this.getOrderList()
						}
					})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	deleteOrder(e) {
		const id = e.currentTarget.dataset.option
		const _this = this
		wx.showModal({
			title: '删除订单？',
			content: '订单记录将不存在',
			success(res) {
				if (res.confirm) {
					http
						.wxRequest({
							..._this.data.api.delete,
							urlReplacements: [{ substr: '{id}', replacement: id }]
						})
						.then((res) => {
							if (res.success) {
								_this.getOrderList()
							}
						})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	}
})
