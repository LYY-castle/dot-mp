import http from '../../utils/request.js'
import util from '../../utils/util.js'
import Dialog from '@vant/weapp/dialog/dialog'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		orderInfo: {},
		logisticsInfo: null,
		orderId: null,
		productId: null,
		time: null,
		timeData: null,
		payment: null,
		dialogShow: false,
		popShow: false,
		steps: [],
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
		},

		api: {
			getOrderById: {
				url: '/orders/{id}',
				method: 'get'
			},
			// 微信支付
			payment: {
				url: '/payment/wx/order',
				method: 'post'
			},
			// 取消订单
			cancelOrder: {
				url: '/orders',
				method: 'put'
			},
			getOrderExpress: {
				url: '/orders/{id}/order-express',
				method: 'get'
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
			this.getOrderDetail()
		}
	},
	onPullDownRefresh: function () {
		this.getOrderDetail()
		wx.stopPullDownRefresh()
	},
	getOrderDetail() {
		http
			.wxRequest({
				...this.data.api.getOrderById,
				urlReplacements: [
					{
						substr: '{id}',
						replacement: this.data.orderId
					}
				]
			})
			.then((res) => {
				if (res.success) {
					if (res.data.orderStatus === 100) {
						let time =
							new Date(res.data.createAt.replace(/-/g, '/')).getTime() +
							16 * 60 * 1000 -
							new Date().getTime()
						this.setData({
							time
						})
					}
					let body = ''
					res.data.orderGoods.forEach((good) => {
						body += good.goodsName
						good.name = util.ellipsis(good.goodsName, 30)
					})
					body = util.ellipsis(body, 29)
					this.setData({
						orderInfo: res.data,
						payment: {
							id: res.data.id,
							openid: wx.getStorageSync('openId'),
							outTradeNo: res.data.orderNo,
							totalFee: res.data.actualPrice * 100, // 微信支付单位为分.
							body,
							tradeType: 'JSAPI'
						}
					})
					if (res.data.orderStatus >= 300 && res.data.orderStatus !== 600) {
						this.getOrderExpress()
					}
				}
			})
	},
	onTimeChange(e) {
		this.setData({
			timeData: e.detail
		})
	},
	timeFinish() {
		this.getOrderDetail()
	},
	goPay() {
		const _this = this
		Dialog.confirm({
			title: '确认支付',
			message: '￥' + _this.data.orderInfo.actualPrice
		})
			.then(() => {
				http
					.wxRequest({
						..._this.data.api.payment,
						params: _this.data.payment
					})
					.then((result) => {
						const wechatParams = {
							appId: result.data.appId,
							timeStamp: result.data.timeStamp,
							nonceStr: result.data.nonceStr,
							package: result.data.packageValue,
							paySign: result.data.paySign,
							signType: result.data.signType
						}
						wx.requestPayment({
							...wechatParams,
							success(res) {
								_this.getOrderDetail()
							}
						})
					})
			})
			.catch(() => {
				_this.setData({
					dialogShow: true
				})
			})
	},
	confirm() {
		this.setData({
			dialogShow: false
		})
	},
	cancelPay() {
		Dialog.confirm({
			title: '确认取消？'
		}).then(() => {
			http
				.wxRequest({
					...this.data.api.cancelOrder,
					params: {
						id: this.data.orderInfo.id,
						orderStatus: '600'
					}
				})
				.then((res) => {
					if (res.success) {
						wx.showToast({
							title: '取消成功',
							success() {
								wx.navigateBack({
									delta: 1
								})
							}
						})
					}
				})
		})
	},
	gotoDetail(e) {
		const pathParams = {
			productId: e.currentTarget.dataset.goodsId
		}
		wx.navigateTo({
			url: '/pages_product/product-detail/product-detail',
			success: function (res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptDataFromOpenerPage', {
					data: pathParams
				})
			}
		})
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
	getOrderExpress() {
		http
			.wxRequest({
				...this.data.api.getOrderExpress,
				urlReplacements: [
					{ substr: '{id}', replacement: this.data.orderInfo.id }
				]
			})
			.then((res) => {
				if (res.success) {
					let express = []
					res.data.traces = JSON.parse(res.data.traces)
					if (res.data.traces) {
						res.data.traces.forEach((tr) => {
							let obj = {
								text: tr.content,
								desc: tr.msgTime
							}
							express.push(obj)
						})
					}
					this.setData({
						logisticsInfo: res.data,
						steps: express
					})
				}
			})
	},
	openPop() {
		if (this.data.steps.length > 0) {
			this.setData({
				popShow: true
			})
		} else {
			wx.showToast({
				title: '暂无物流信息',
				icon: 'none'
			})
		}
	},
	closePop() {
		this.setData({
			popShow: false
		})
	}
})
