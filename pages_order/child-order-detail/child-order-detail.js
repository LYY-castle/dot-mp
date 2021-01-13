// pages_order/child-order-detail/child-order-detail.js
import http from '../../utils/request.js'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		active: 0,
		orderId: null,
		childData: null,
		popShow: false,
		orderInfo: {},
		steps: [],
		logisticsInfo: null,
		api: {
			// 获取京东子订单物流
			getJDChildOrder: {
				url: '/orders/{id}/child-orders',
				method: 'get'
			},
			// 获取物流进度
			getOrderExpress: {
				url: '/orders/{id}/order-express',
				method: 'get'
			}
		},
		// 订单状态
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
	onLoad: function (options) {
		if (options.src) {
			this.setData({
				orderId: options.src
			})
			this.getChildOrder()
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},
	getChildOrder() {
		http
			.wxRequest({
				...this.data.api.getJDChildOrder,
				urlReplacements: [{ substr: '{id}', replacement: this.data.orderId }]
			})
			.then((res) => {
				if (res.success) {
					this.setData({
						childData: res.data
					})
				}
			})
	},
	getOrderExpress(orderId) {
		http
			.wxRequest({
				...this.data.api.getOrderExpress,
				urlReplacements: [{ substr: '{id}', replacement: orderId }]
			})
			.then((res) => {
				if (res.success) {
					let express = []
					if (res.data) {
						res.data.traces = JSON.parse(res.data.traces)
						res.data.traces.forEach((tr) => {
							let obj = {
								text: tr.content,
								desc: tr.msgTime
							}
							express.push(obj)
						})

						this.setData({
							popShow: true,
							logisticsInfo: res.data,
							steps: express
						})
					} else {
						wx.showToast({
							title: '暂无物流信息',
							icon: 'none'
						})
					}
				}
			})
	},
	openPop(option) {
		const orderId = option.currentTarget.dataset.id
		this.getOrderExpress(orderId)
	},
	copy(e) {
		const text = e.currentTarget.dataset.text
		wx.setClipboardData({
			data: text,
			success(res) {
				wx.showToast({
					title: '复制成功'
				})
			}
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
		wx.stopPullDownRefresh()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
