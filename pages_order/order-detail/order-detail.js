import http from '../../utils/request.js'
import util from '../../utils/util.js'
import Dialog from '@vant/weapp/dialog/dialog'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		active: 0,
		logisticsInfo: null,
		orderId: null,
		productId: null,
		time: null,
		timeData: null,
		payment: null,
		dialogShow: false,
		disabledBtn: false,
		popShow: false,
		orderInfo: {},
		steps: [],
		afterSale: '',
		afsStatus: null,
		jdAfsShow: false,
		packageDesc: 0,
		questionDesc: '',
		textareaHeight: { minHeight: 50 },
		team: null,
		addPerson: '/static/img/add-person.png',
		defaultPerson: '/static/img/avatar.png',
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
		},
		// 申请 20:审核 30:收货 40:处理 50:待用户确认 60:完成 70:取消
		afterSaleStatus: {
			10: {
				text: '申请中'
			},
			20: {
				text: '审核中'
			},
			30: {
				text: '收货'
			},
			40: {
				text: '处理中'
			},
			50: {
				text: '待用户确认'
			},
			60: {
				text: '完成'
			},
			70: {
				text: '取消'
			}
		},
		packageList: [
			{
				id: 0,
				text: '无包装'
			},
			{
				id: 10,
				text: '包装完整'
			},
			{
				id: 20,
				text: '包装破损'
			}
		],
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
			// 取消订单/未收到货申请售后
			cancelOrder: {
				url: '/orders',
				method: 'put'
			},
			// 获取物流进度
			getOrderExpress: {
				url: '/orders/{id}/order-express',
				method: 'get'
			},
			// 获取售后状态
			updateAfterSale: {
				url: '/after-sales',
				method: 'get'
			},
			// 确认完成售后
			ensureAfs: {
				url: '/after-sales',
				method: 'put'
			},
			// 京东平台确认收货后发起售后申请
			jdAfs: {
				url: '/after-sales/jd-apply',
				method: 'post'
			},
			getTeamDetail: {
				url: '/campaign-teams/detail',
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
		this.setData({
			disabledBtn: false
		})
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
							15 * 60 * 1000 -
							new Date().getTime()
						this.setData({
							time
						})
					}
					let afterSale = ''
					if (res.data.orderStatus === 200) {
						if (res.data.campaignId && res.data.campaignTeamId) {
							afterSale = '退团'
						} else {
							afterSale = '退货'
						}
					} else if (res.data.orderStatus === 300) {
						if (!res.data.campaignId && !res.data.campaignTeamId) {
							afterSale = '拒收/退货退款'
						}
					} else if (res.data.orderStatus === 400) {
						afterSale = '申请售后'
					}
					let body = ''
					res.data.orderGoods.forEach((good) => {
						body += good.goodsName
						good.name = util.ellipsis(good.goodsName, 30)
						good.total =
							(Math.round(good.retailPrice * 100) * good.number) / 100
					})
					body = util.ellipsis(body, 29)
					this.setData({
						afterSale,
						orderInfo: res.data,
						payment: {
							id: res.data.id,
							orderNo: res.data.orderNo,
							openid: wx.getStorageSync('openId'),
							outTradeNo: res.data.mainOrderNo,
							totalFee: res.data.actualPrice * 100, // 微信支付单位为分.
							body,
							tradeType: 'JSAPI'
						}
					})
					if (res.data.orderStatus === 500) {
						this.getAfterSaleStatus()
					}
					this.getTeamDetail()
				}
			})
	},
	getTeamDetail() {
		return new Promise((resolve) => {
			if (
				this.data.orderInfo.campaignTeamId &&
				this.data.orderInfo.campaignId
			) {
				if (this.data.orderInfo.orderStatus !== 600) {
					const params = {
						id: this.data.orderInfo.campaignTeamId,
						campaignId: this.data.orderInfo.campaignId
					}
					http
						.wxRequest({
							...this.data.api.getTeamDetail,
							params
						})
						.then((res) => {
							if (res.success) {
								if (res.data.length > 0) {
									this.setData({
										team: res.data[0]
									})
								} else {
									this.setData({
										team: null
									})
								}
								resolve()
							}
						})
				} else {
					this.setData({
						team: null
					})
					resolve()
				}
			} else {
				resolve()
			}
		})
	},
	onTimeChange(e) {
		if (e.detail.minutes > 0 || e.detail.seconds > 0) {
			this.setData({
				timeData: e.detail
			})
		}
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
		const productId = e.currentTarget.dataset.goodsId
		if (wx.getStorageSync('shareId')) {
			wx.removeStorageSync('shareId')
		}
		if (wx.getStorageSync('teamId')) {
			wx.removeStorageSync('teamId')
		}
		wx.navigateTo({
			url: '/pages_product/product-detail/product-detail?src=' + productId
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
	// 获取售后状态
	getAfterSaleStatus() {
		const params = {
			scope: 'all',
			orderId: this.data.orderInfo.id
		}
		http
			.wxRequest({
				...this.data.api.updateAfterSale,
				params
			})
			.then((res) => {
				if (res.success) {
					if (res.data.length > 0) {
						this.setData({
							afsStatus: res.data[0].afsStatus
						})
					}
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
					if (res.data) {
						res.data.traces = res.data.traces ? JSON.parse(res.data.traces) : []
						if (res.data.traces.length > 0) {
							res.data.traces.forEach((tr) => {
								let obj = {
									text: tr.content,
									desc: tr.msgTime
								}
								express.push(obj)
							})
						}
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
	existTeamFun() {},
	// 未发货申请售后/已发货申请售后
	handleContact(option) {
		this.setData({
			disabledBtn: true
		})
		const _this = this
		const object = option.currentTarget.dataset.option
		if (object.campaignId && object.campaignTeamId) {
			Dialog.confirm({
				title: '确认退团？'
			}).then(() => {
				http
					.wxRequest({
						..._this.data.api.cancelOrder,
						params: {
							id: _this.data.orderInfo.id,
							orderStatus: '600',
							refundDesc: '退出团购，系统退款'
						}
					})
					.then((res) => {
						if (res.success) {
							wx.showToast({
								title: '退团成功'
							})
						}
						_this.getOrderDetail()
					})
			})
		} else {
			if (object) {
				http
					.wxRequest({
						..._this.data.api.cancelOrder,
						params: {
							id: object.id,
							orderStatus: '500'
						}
					})
					.then((res) => {
						if (res.success) {
							_this.getOrderDetail()
						}
					})
			}
		}
	},
	// 京东平台收到货之后申请售后
	jdAfs() {
		this.setData({
			jdAfsShow: true
		})
	},
	closejdAfs() {
		this.setData({
			jdAfsShow: false
		})
	},
	onPackageChange(option) {
		const obj = Number(option.detail)
		this.setData({
			packageDesc: obj
		})
	},
	// 京东平台收到货之后申请售后
	applyByJd(val) {
		const params = {
			orderId: this.data.orderInfo.id,
			packageDesc: this.data.packageDesc,
			questionDesc: val.detail.value.questionDesc
		}
		http.wxRequest({ ...this.data.api.jdAfs, params }).then((res) => {
			if (res.success) {
				this.setData({
					jdAfsShow: false
				})
				this.getOrderDetail()
			}
		})
	},
	ensureAfsByJd() {
		const params = {
			orderId: this.data.orderInfo.id,
			packageDesc: this.data.packageDesc,
			questionDesc: this.data.questionDesc
		}
		http.wxRequest({ ...this.data.api.jdAfs, params }).then((res) => {
			if (res.success) {
				http
					.wxRequest({
						...this.data.api.cancelOrder,
						params: {
							id: this.data.orderInfo.id,
							orderStatus: '500'
						}
					})
					.then((res) => {
						if (res.success) {
							this.getOrderDetail()
						}
					})
			}
		})
	},
	openPop() {
		if (this.data.orderInfo.hasChildOrder) {
			wx.navigateTo({
				url:
					'/pages_order/child-order-detail/child-order-detail?src=' +
					this.data.orderId
			})
		} else {
			this.getOrderExpress()
		}
	},
	// 确认完成售后
	finishAfs() {
		const params = {
			orderId: this.data.orderInfo.id,
			afsStatus: 60
		}
		http.wxRequest({ ...this.data.api.ensureAfs, params }).then((res) => {
			if (res.success) {
				this.getOrderDetail()
			}
		})
	},
	// 取消售后
	cancelAfs() {
		const params = {
			orderId: this.data.orderInfo.id,
			afsStatus: 70
		}
		http.wxRequest({ ...this.data.api.ensureAfs, params }).then((res) => {
			if (res.success) {
				this.getOrderDetail()
			}
		})
	},
	closePop() {
		this.setData({
			popShow: false
		})
	},
	// 分享
	onShareAppMessage() {
		if (
			this.data.orderInfo.campaignId &&
			this.data.orderInfo.campaignTeamId &&
			!this.data.team.isClustering
		) {
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			})
			let shareId = wx.getStorageSync('userId')
			let goodsName = util.ellipsis(
				this.data.orderInfo.orderGoods[0].goodsName,
				20
			)
			let path =
				'/pages_product/product-detail/product-detail?src=' +
				this.data.orderInfo.orderGoods[0].goodsId +
				'&shareId=' +
				shareId +
				'&campaignId=' +
				this.data.orderInfo.campaignId +
				'&campaignTeamId=' +
				this.data.orderInfo.campaignTeamId
			let num = this.data.team.clusteringUserNum - this.data.team.nowUserNum
			return {
				withShareTicket: true,
				title: '【仅剩' + num + '个名额】我正在拼' + goodsName + '快来加入吧！',
				path: path,
				imageUrl: this.data.orderInfo.orderGoods[0].listPicUrl
			}
		} else {
			wx.hideShareMenu({
				menus: ['shareAppMessage', 'shareTimeline']
			})
		}
	}
})
