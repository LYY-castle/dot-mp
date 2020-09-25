import http from '../../utils/request.js'
import util from '../../utils/util.js'
import Dialog from '@vant/weapp/dialog/dialog'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		orderInfo: {},
		orderId: null,
		productId: null,
		time: null,
		payment: null,
		dialogShow: false,
		statusMap: {
			100: {
				text: '待支付',
				color: 'rgba(249, 173, 8, 1)'
			},
			101: {
				text: '已取消',
				color: 'rgba(101, 101, 101, 1)'
			},
			102: {
				text: '已取消',
				color: 'rgba(101, 101, 101, 1)'
			},
			200: {
				text: '待发货',
				color: '#722ed1'
			},
			300: {
				text: '已发货',
				color: '#f5222d'
			},
			301: {
				text: '已收货',
				color: '#f5222d'
			},
			302: {
				text: '已收货',
				color: '#f5222d'
			},
			400: {
				text: '已完成',
				color: '#f5222d'
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
						let body = ''
						const time =
							new Date(res.data.createAt.replace(/-/g, '/')).getTime() +
							15 * 60 * 1000 -
							new Date().getTime()
						res.data.orderGoods.forEach((good) => {
							body += good.goodsName
						})
						body = util.ellipsis(body, 128)
						this.setData({
							time,
							payment: {
								id: res.data.id,
								openid: wx.getStorageSync('openId'),
								outTradeNo: res.data.orderNo,
								totalFee: res.data.actualPrice * 100, // 微信支付单位为分.
								body,
								tradeType: 'JSAPI'
							}
						})
					}
					this.setData({
						orderInfo: res.data
					})
				}
			})
	},
	timeFinish() {
		this.getOrderDetail()
	},
	goPay() {
		Dialog.confirm({
			title: '确认支付',
			message: '￥' + this.data.orderInfo.actualPrice
		})
			.then(() => {
				http
					.wxRequest({
						...this.data.api.payment,
						params: this.data.payment
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
								console.log(res)
							}
						})
					})
			})
			.catch(() => {
				this.setData({
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
						orderStatus: '101'
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
	copy() {
		wx.setClipboardData({
			data: this.data.orderInfo.orderNo,
			success(res) {
				wx.showToast({
					title: '复制成功'
				})
			}
		})
	}
})
