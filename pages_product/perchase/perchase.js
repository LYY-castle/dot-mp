import http from '../../utils/request.js'
import util from '../../utils/util.js'
import tool from '../../utils/mixin.js'
import Dialog from '@vant/weapp/dialog/dialog'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		disabledBtn: false,
		remarkShow: false,
		money: null, // 购物金
		shoppingMoneyData: null,
		shoppingMoney: 0, // 使用购物金的金额
		shoppingAccountId: null, // 购物金账户id
		selectMoney: false, //是否使用购物金
		actualPrice: null, // 实际商品总价加上运费减去使用优惠后实际需要支付的金额
		dialogShow: false,
		product: null,
		goods: null,
		dataList: null,
		payment: null,
		totalPrice: null, // 商品总价
		order: null,
		textareaHeight: { minHeight: 30 },
		pathParams: {},
		totalCount: null,
		remark: null,
		newRemark: '',
		cartIds: null,
		cartPerchase: false,
		disabledShow: false,
		shippingFee: 0,
		orderId: null,
		isGroupPurchase: null,
		priceRules: null,
		teamObj: null, // 开团团队详情
		api: {
			addOrder: {
				url: '/orders',
				method: 'post'
			},
			// 微信支付
			payment: {
				url: '/payment/wx/order',
				method: 'post'
			},
			// 取消订单
			closeOrder: {
				url: '/orders',
				method: 'delete'
			},
			// 查询产品详情.
			getProductById: {
				url: '/products/detail/{id}',
				method: 'get'
			},
			getProductByCart: {
				url: '/shop-carts',
				method: 'get'
			},
			getMyAddress: {
				url: '/user-address',
				method: 'get'
			},
			getShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'get'
			},
			// 获取商品运费
			getFee: {
				url: '/goods/freight',
				method: 'post'
			},
			// 开团
			createTeam: {
				url: '/campaign-teams',
				method: 'post'
			},
			// 加入拼团
			joinTeam: {
				url: '/campaign-team-details/join',
				method: 'post'
			},
			hasProduct: {
				url: '/jd-goods/inventory',
				method: 'post'
			}
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onShow: function () {
		this.pageInit()
	},
	pageInit() {
		this.setData({
			disabledBtn: false,
			selectMoney: false,
			shoppingMoney: 0,
			remark: wx.getStorageSync('remark') ? wx.getStorageSync('remark') : null,
			newRemark: wx.getStorageSync('remark') ? wx.getStorageSync('remark') : ''
		})
		if (wx.getStorageSync('perchaseByCart')) {
			this.setData({
				cartPerchase: true
			})
			Promise.resolve()
				.then(() => this.getListDataByCartIds())
				.then(() => this.getMyaddress())
				.then(() => this.getGoodsFee())
		} else {
			Promise.resolve()
				.then(() => this.getProduct())
				.then(() => this.getMyaddress())
				.then(() => this.getGoodsFee())
		}
	},
	getProduct() {
		return new Promise((resolve) => {
			http
				.wxRequest({
					...this.data.api.getProductById,
					urlReplacements: [
						{
							substr: '{id}',
							replacement: wx.getStorageSync('activeProductId')
						}
					]
				})
				.then((res) => {
					if (res.success) {
						if (
							res.data.goods.isPromote &&
							tool.isInDurationTime(
								res.data.goods.promoteStart,
								res.data.goods.promoteEnd
							)
						) {
							res.data.goods.isPromote = true
						} else {
							res.data.goods.isPromote = false
						}
						let totalCount = wx.getStorageSync('activeProductNumber')
							? wx.getStorageSync('activeProductNumber')
							: 1
						let totalPrice = 0
						if (res.data.isGroupPurchase) {
							totalPrice =
								(Math.round(res.data.campaignProductPriceRules.price * 100) *
									totalCount) /
								100
						} else {
							totalPrice = res.data.goods.isPromote
								? (Math.round(res.data.product.promotePrice * 100) *
										totalCount) /
								  100
								: (Math.round(res.data.product.retailPrice * 100) *
										totalCount) /
								  100
						}
						this.setData({
							totalCount,
							totalPrice,
							actualPrice: totalPrice,
							product: res.data.product,
							goods: res.data.goods,
							isGroupPurchase: res.data.isGroupPurchase,
							priceRules: res.data.campaignProductPriceRules
						})
						console.log('设置')
						Promise.resolve()
							.then(() => this.getShoppingMoney())
							.then(() => this.calculation())
						resolve()
					} else {
						resolve()
					}
				})
		})
	},
	calculation() {
		return new Promise((resolve) => {
			let totalCount = 0
			let totalPrice = 0
			if (this.data.cartPerchase) {
				for (let i = 0; i < this.data.dataList.length; i++) {
					totalCount += this.data.dataList[i].number
					if (this.data.dataList[i].goods.isPromote) {
						totalPrice +=
							(Math.round(this.data.dataList[i].product.promotePrice * 100) *
								this.data.dataList[i].number) /
							100
					} else {
						totalPrice +=
							(Math.round(this.data.dataList[i].product.retailPrice * 100) *
								this.data.dataList[i].number) /
							100
					}
				}
			} else {
				totalCount = wx.getStorageSync('activeProductNumber')
					? wx.getStorageSync('activeProductNumber')
					: 1
				if (this.data.isGroupPurchase) {
					totalPrice =
						(Math.round(this.data.priceRules.price * 100) * totalCount) / 100
				} else {
					totalPrice = this.data.goods.isPromote
						? (Math.round(this.data.product.promotePrice * 100) * totalCount) /
						  100
						: (Math.round(this.data.product.retailPrice * 100) * totalCount) /
						  100
				}
			}
			totalPrice = Math.round(totalPrice * 100) / 100
			let actualPrice =
				(Math.round(totalPrice * 100) +
					Math.round(this.data.shippingFee * 100)) /
				100
			if (this.data.selectMoney) {
				const minMoney = Math.min(
					this.data.shoppingMoneyData.amount,
					actualPrice
				)
				this.setData({
					shoppingMoney: minMoney
				})
				actualPrice =
					(Math.round(actualPrice * 100) -
						Math.round(this.data.shoppingMoney * 100)) /
					100
			}
			this.setData({
				totalCount,
				actualPrice,
				totalPrice: totalPrice
			})
			resolve()
		})
	},
	numberChange(option) {
		const num = option.detail
		if (num > this.data.product.productNumber) {
			wx.showToast({
				title: '超出库存',
				icon: 'none'
			})
		} else {
			wx.setStorageSync('activeProductNumber', num)
			this.setData({
				totalCount: num
			})
		}
		if (this.data.goods.platformType !== 2) {
			this.calculation()
		} else {
			this.getGoodsFee()
		}
	},
	getListDataByCartIds() {
		return new Promise((resolve) => {
			http
				.wxRequest({
					...this.data.api.getProductByCart,
					params: {
						scope: 'all',
						checked: 1,
						excludeDisabled: 1
					}
				})
				.then((res) => {
					if (res.success) {
						let jdGoods = []
						res.data.forEach((item) => {
							if (item.goods.platformType === 2) {
								jdGoods.push({
									num: item.number,
									skuId: item.goods.platformGoodsId
								})
							}
							if (
								item.goods.isPromote &&
								tool.isInDurationTime(
									item.goods.promoteStart,
									item.goods.promoteEnd
								)
							) {
								item.goods.isPromote = true
							} else {
								item.goods.isPromote = false
							}
						})
						const flag = res.data.every((list) => {
							return (
								list.product.productNumber !== 0 && list.goods.isOnSale !== 0
							)
						})
						if (!flag) {
							this.setData({
								disabledShow: true
							})
						}
						this.setData({
							dataList: res.data,
							jdGoods: jdGoods
						})
						Promise.resolve()
							.then(() => this.getShoppingMoney())
							.then(() => this.calculation())
						resolve()
					} else {
						resolve()
					}
				})
		})
	},
	// isHasProduct() {
	// 	return new Promise((resovle) => {
	// 		// 查询京东商品是否有货
	// 		if (this.data.jdGoods.length > 0 && this.data.order) {
	// 			const params = {
	// 				provinceName: this.data.order.provinceName,
	// 				cityName: this.data.order.cityName,
	// 				districtName: this.data.order.districtName,
	// 				address: this.data.order.address,
	// 				goodsInventoryNumModels: jdGoods
	// 			}
	// 			http
	// 				.wxRequest({ ...this.data.api.hasProduct, params })
	// 				.then((res) => {
	// 					if(res.success){
	// 						this.setData({

	// 						})
	// 					}else{
	// 						resovle()
	// 					}
	// 				})
	// 		}
	// 	})
	// },
	getMyaddress() {
		return new Promise((resolve) => {
			const params = {
				userId: wx.getStorageSync('userId')
			}
			http.wxRequest({ ...this.data.api.getMyAddress, params }).then((res) => {
				if (res.success) {
					if (wx.getStorageSync('activeAddressId')) {
						if (res.data.length > 0) {
							const flag = res.data.some((add) => {
								return add.id === Number(wx.getStorageSync('activeAddressId'))
							})
							if (flag) {
								res.data.forEach((add) => {
									if (add.id === Number(wx.getStorageSync('activeAddressId'))) {
										this.setData({
											order: add
										})
									}
								})
							} else {
								this.setData({
									order: res.data[0]
								})
							}
						} else {
							this.setData({
								order: null
							})
						}
					} else {
						if (res.data.length > 0) {
							this.setData({
								order: res.data[0]
							})
						} else {
							this.setData({
								order: null
							})
						}
					}
					resolve()
				}
			})
		})
	},
	// 获取商品运费
	getGoodsFee() {
		return new Promise((resolve) => {
			if (this.data.order && this.data.order.provinceName) {
				let params = {
					provinceName: this.data.order.provinceName,
					cityName: this.data.order.cityName,
					districtName: this.data.order.districtName,
					address: this.data.order.address,
					goodsFreightModels: []
				}
				if (this.data.cartPerchase) {
					this.data.dataList.forEach((list) => {
						const obj = {
							platformGoodsId: list.goods.platformGoodsId,
							platformType: list.goods.platformType,
							goodsNum: list.number,
							goodsId: list.goods.id
						}
						params.goodsFreightModels.push(obj)
					})
					http
						.wxRequest({
							...this.data.api.getFee,
							params
						})
						.then((res) => {
							if (res.success) {
								this.setData({
									shippingFee: res.data
								})
								this.calculation()
								resolve()
							}
						})
				} else {
					params.goodsFreightModels[0] = {
						platformGoodsId: this.data.goods.platformGoodsId,
						platformType: this.data.goods.platformType,
						goodsId: this.data.goods.id,
						goodsNum: this.data.totalCount ? this.data.totalCount : 1
					}
					if (this.data.goods.platformType === 2) {
						http
							.wxRequest({
								...this.data.api.getFee,
								params
							})
							.then((res) => {
								if (res.success) {
									this.setData({
										shippingFee: res.data
									})
									Promise.resolve()
										.then(() => this.getShoppingMoney())
										.then(() => this.calculation())
									resolve()
								}
							})
					}
				}
			} else {
				resolve()
			}
		})
	},
	// 选择添加/切换地址
	selectAddress(e) {
		const option = e.currentTarget.dataset.option
		if (option) {
			wx.setStorageSync('activeAddressId', option.id)
		} else {
			wx.setStorageSync('addAddress', true)
		}
		wx.navigateTo({
			url: '/pages_address/address-list/address-list'
		})
	},
	// 生成订单
	onSubmit() {
		const _this = this
		if (_this.data.order) {
			// 用户有购物金账户
			if (_this.data.shoppingAccountId) {
				const flag = _this.checkMoney()
				if (flag) {
					// 购物余额大于0
					if (_this.data.shoppingMoneyData.amount > 0) {
						// 购物金余额大于0但是用户没有使用时
						if (!_this.data.shoppingMoney) {
							wx.showModal({
								title: '请确认',
								content: '确认不使用购物金？',
								cancelText: '不使用',
								confirmText: '使用',
								success(res) {
									if (res.confirm) {
										_this.setData({
											selectMoney: true
										})
										_this.calculation()
									} else {
										Promise.resolve()
											.then(() => _this.createTeam())
											.then(() => _this.addOrder())
									}
								}
							})
						} else {
							// 购物金余额大于0，用户使用，但是只使用一部分询问是否使用全部
							if (this.data.actualPrice > 0) {
								if (
									this.data.shoppingMoneyData.amount - this.data.shoppingMoney >
									0
								) {
									wx.showModal({
										title: '请确认',
										content: '确认不使用全部购物金抵消订单金额？',
										cancelText: '不使用',
										confirmText: '使用',
										success(res) {
											if (res.confirm) {
												_this.setData({
													selectMoney: true
												})
												_this.calculation()
											} else {
												_this.setData({
													disabledBtn: true
												})
												Promise.resolve()
													.then(() => _this.createTeam())
													.then(() => _this.addOrder())
											}
										}
									})
								} else {
									_this.setData({
										disabledBtn: true
									})
									Promise.resolve()
										.then(() => _this.createTeam())
										.then(() => _this.addOrder())
								}
							} else {
								_this.setData({
									disabledBtn: true
								})
								Promise.resolve()
									.then(() => _this.createTeam())
									.then(() => _this.addOrder())
							}
						}
					} else {
						_this.setData({
							disabledBtn: true
						})
						Promise.resolve()
							.then(() => _this.createTeam())
							.then(() => _this.addOrder())
					}
				}
			} else {
				_this.setData({
					disabledBtn: true
				})
				// 用户没有购物金账户
				Promise.resolve()
					.then(() => _this.createTeam())
					.then(() => _this.addOrder())
			}
		} else {
			wx.showToast({
				title: '请选择收货地址',
				icon: 'none'
			})
		}
	},
	// 开团
	createTeam() {
		return new Promise((resolve) => {
			const activityId = wx.getStorageSync('fromBannarActivity')
			const teamId = wx.getStorageSync('teamId')
			if (this.data.isGroupPurchase) {
				// 如果是开团
				if (!teamId) {
					let params = {
						goodsId: this.data.goods.id,
						productId: this.data.product.id,
						campaignId: activityId,
						clusteringUserNum: 3
					}
					http
						.wxRequest({ ...this.data.api.createTeam, params })
						.then((res) => {
							if (res.success) {
								this.setData({
									teamObj: res.data
								})
								resolve()
							}
						})
				} else {
					resolve()
				}
			} else {
				resolve()
			}
		})
	},
	// 封装生成订单函数
	addOrder() {
		return new Promise((resolve) => {
			const activityId = wx.getStorageSync('fromBannarActivity')
			const teamId = wx.getStorageSync('teamId')
			let orderGoods = []
			// 封装入参
			if (this.data.cartPerchase) {
				this.data.dataList.forEach((list) => {
					const obj = {
						platformGoodsId: list.goods.platformGoodsId,
						platformType: list.goods.platformType,
						goodsId: list.goods.id,
						goodsName: list.goods.name,
						goodsSpecificationIds: list.goodsSpecificationIds,
						goodsSpecificationNameValue: list.goodsSpecificationNameValue,
						listPicUrl: list.listPicUrl,
						productId: list.product.id,
						number: list.number,
						retailPrice: list.goods.isPromote
							? list.product.promotePrice
							: list.product.retailPrice
					}
					orderGoods.push(obj)
				})
			} else {
				orderGoods = [
					{
						platformGoodsId: this.data.goods.platformGoodsId,
						platformType: this.data.goods.platformType,
						goodsId: this.data.goods.id,
						goodsName: this.data.goods.name,
						goodsSpecificationIds: this.data.product.goodsSpecificationIds,
						goodsSpecificationNameValue: this.data.product
							.goodsSpecificationNameValue,
						listPicUrl: this.data.product.pictureUrl
							? this.data.product.pictureUrl
							: this.data.goods.listPicUrl,
						productId: this.data.product.id,
						number: this.data.totalCount,
						retailPrice: this.data.isGroupPurchase
							? this.data.priceRules.price
							: this.data.goods.isPromote
							? this.data.product.promotePrice
							: this.data.product.retailPrice
					}
				]
			}
			let params = {
				isFromShopCat: this.data.cartPerchase ? 1 : 0,
				address: this.data.order.address,
				province: this.data.order.province,
				city: this.data.order.city,
				district: this.data.order.district,
				mobile: this.data.order.mobile,
				name: this.data.order.name,
				remark: this.data.remark,
				createBy: wx.getStorageSync('userId'),
				goodsPrice: this.data.totalPrice,
				orderGoods
			}
			if (activityId && teamId) {
				params.campaignId = activityId
				params.campaignTeamId = teamId
			}
			if (this.data.teamObj) {
				params.campaignTeamId = this.data.teamObj.id
				params.campaignId = this.data.teamObj.campaignId
			}

			if (this.data.selectMoney) {
				params.shoppingAccountId = this.data.shoppingAccountId
				params.shoppingMoney = Number(this.data.shoppingMoney)
			}
			http
				.wxRequest({
					...this.data.api.addOrder,
					params
				})
				.then((res) => {
					if (res.success) {
						let body = ''
						let actualPrice = 0
						if (this.data.cartPerchase) {
							this.data.dataList.forEach((list) => {
								body += list.goods.name
							})
							res.data.forEach((pri) => {
								actualPrice += pri.actualPrice * 100
							})
							actualPrice = actualPrice / 100
						} else {
							body = this.data.goods.name
							actualPrice = res.data[0].actualPrice
						}
						body = util.ellipsis(body, 29)
						this.setData({
							actualPrice: actualPrice,
							orderId: res.data[0].id,
							payment: {
								openid: wx.getStorageSync('openId'),
								outTradeNo: res.data[0].mainOrderNo,
								totalFee: actualPrice * 100, // 微信支付单位为分.
								body,
								tradeType: 'JSAPI'
							}
						})
						if (this.data.payment.totalFee === 0) {
							wx.reLaunch({
								url:
									'/pages_product/perchase-success/perchase-success?src=' +
									this.data.orderId
							})
						} else {
							this.setData({
								dialogShow: true
							})
						}
						resolve()
					} else {
						resolve()
						this.pageInit()
					}
				})
		})
	},
	// 取消支付
	cancle() {
		this.setData({
			dialogShow: false
		})
		Dialog.confirm({
			title: '确认离开？',
			message: '您的订单在15分钟内未支付将被取消，请尽快完成支付。',
			confirmButtonText: '确认离开'
		})
			.then(() => {
				wx.navigateTo({
					url: '/pages_order/order-list/order-list'
				})
			})
			.catch(() => {
				this.setData({
					dialogShow: true
				})
			})
	},
	// 拉起微信支付
	confirm() {
		const _this = this
		if (_this.data.payment.totalFee > 0) {
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
							wx.reLaunch({
								url:
									'/pages_product/perchase-success/perchase-success?src=' +
									_this.data.orderId
							})
						},
						fail(res) {
							wx.reLaunch({
								url:
									'/pages_product/perchase-success/perchase-success?src=' +
									_this.data.orderId
							})
						}
					})
				})
		}
	},
	// 获取购物金
	getShoppingMoney() {
		return new Promise((resolve) => {
			http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
				if (res.success) {
					if (res.data) {
						const minMoney = Math.min(res.data.amount, this.data.actualPrice)
						this.setData({
							shoppingAccountId: res.data.id,
							shoppingMoneyData: res.data,
							selectMoney: true,
							shoppingMoney: minMoney
						})
					} else {
						this.setData({
							shoppingMoneyData: null
						})
					}
					resolve()
				} else {
					resolve()
				}
			})
		})
	},
	selectMoneyChange() {
		const selectMoney = !this.data.selectMoney
		this.setData({
			selectMoney: !this.data.selectMoney
		})
		if (!selectMoney) {
			this.setData({
				shoppingMoney: 0
			})
		}
		this.calculation()
	},
	checkMoney() {
		// 判断购物金是否小于等于商品总价且小于等于可用余额
		if (this.data.shoppingMoney <= this.data.shoppingMoneyData.amount) {
			if (
				this.data.shoppingMoney >
				this.data.totalPrice + this.data.shippingFee
			) {
				wx.showToast({
					title: '购物金超出待付总额',
					icon: 'none'
				})
				return false
			} else {
				return true
			}
		} else {
			wx.showToast({
				title: '购物金余额不足',
				icon: 'none'
			})
			return false
		}
	},
	shoppingMoneyChange(e) {
		const money = Number(e.detail)
		const flag = this.checkMoney()
		if (flag) {
			const actualPrice = this.data.totalPrice + this.data.shippingFee - money
			this.setData({
				actualPrice
			})
		} else {
			this.setData({
				shoppingMoney: 0,
				actualPrice: this.data.totalPrice + this.data.shippingFee
			})
		}
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	goBackShoppingCart() {
		wx.navigateBack({
			delta: 1
		})
	},
	closeRemark() {
		this.setData({
			remarkShow: false
		})
	},
	remarkChange() {
		this.setData({
			remarkShow: true
		})
	},
	remarkSure() {
		if (this.data.remark) {
			wx.setStorageSync('remark', this.data.remark)
		} else {
			wx.removeStorageSync('remark')
		}
		this.setData({
			newRemark: this.data.remark ? this.data.remark : ''
		})
		this.closeRemark()
	}
})
