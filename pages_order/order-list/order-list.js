import http from '../../utils/request.js'
import tool from '../../utils/mixin.js'
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
				name: '已发货',
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
			}
		},
		statusMap: {
			100: {
				text: '待付款'
			},
			101: {
				text: '已取消'
			},
			102: {
				text: '已取消'
			},
			200: {
				text: '待发货'
			},
			300: {
				text: '已发货'
			},
			301: {
				text: '已收货'
			},
			302: {
				text: '已收货'
			},
			400: {
				text: '已完成'
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
				createBy: wx.getStorageSync('userId')
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
						createBy: wx.getStorageSync('userId')
					}
				})
			} else {
				this.setData({
					params: {
						pageNo,
						pageSize: this.data.pageSize,
						createBy: wx.getStorageSync('userId'),
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
					createBy: wx.getStorageSync('userId')
				}
			})
		} else {
			this.setData({
				params: {
					pageNo: 1,
					pageSize: this.data.pageSize,
					createBy: wx.getStorageSync('userId'),
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
						})
						console.log(res.data)
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
	}
})
