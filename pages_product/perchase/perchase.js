import http from '../../utils/request.js'
import util from '../../utils/util.js'
import Dialog from '@vant/weapp/dialog/dialog'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		money: null, // 购物金
		shoppingMoney: null, // 使用购物金的金额
		shoppingAccountId: null, // 购物金账户id
		selectMoney: false, //是否使用购物金
		actualPrice: null, // 使用优惠后实际需要支付的金额
		dialogShow: false,
		product: null,
		goods: null,
		dataList: null,
		payment: null,
		totalPrice: null,
		order: null,
		textareaHeight: { minHeight: 20 },
		pathParams: {},
		totalCount: null,
		remark: null,
		cartIds: null,
		cartPerchase: false,
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
			}
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (wx.getStorageSync('perchaseByCart')) {
			this.setData({
				cartPerchase: true
			})
			this.getListDataByCartIds()
		} else {
			this.getProduct()
		}
		this.getMyaddress()
		this.getShoppingMoney()
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
						const count = wx.getStorageSync('activeProductNumber')
							? wx.getStorageSync('activeProductNumber')
							: 1
						const totalPrice =
							res.data.goods.isPromote === 1
								? (Math.round(res.data.product.promotePrice * 100) * count) /
								  100
								: (Math.round(res.data.product.retailPrice * 100) * count) / 100
						this.setData({
							product: res.data.product,
							goods: res.data.goods,
							totalCount: count,
							totalPrice,
							actualPrice: totalPrice
						})
						resolve()
					}
				})
		})
	},
	calculation() {
		let totalCount = 0
		let totalPrice = 0
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
		this.setData({
			totalCount,
			totalPrice,
			actualPrice: totalPrice
		})
	},
	getListDataByCartIds() {
		http
			.wxRequest({
				...this.data.api.getProductByCart,
				params: {
					scope: 'all',
					checked: 1
				}
			})
			.then((res) => {
				if (res.success) {
					this.setData({
						dataList: res.data
					})
					this.calculation()
				}
			})
	},
	getMyaddress() {
		const params = {
			userId: wx.getStorageSync('userId')
		}
		http.wxRequest({ ...this.data.api.getMyAddress, params }).then((res) => {
			if (res.success) {
				if (wx.getStorageSync('activeAddressId')) {
					res.data.forEach((item) => {
						if (item.id === wx.getStorageSync('activeAddressId')) {
							this.setData({
								order: item
							})
						}
					})
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
			}
		})
	},
	// 选择添加地址
	selectAddress(e) {
		const option = e.currentTarget.dataset.option
		if (option) {
			console.log(option)
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
		if (this.data.order) {
			if (this.data.selectMoney) {
				if (this.data.shoppingMoney > 0) {
					const flag = this.checkMoney()
					if (flag) {
						this.addOrder()
					}
				} else {
					wx.showToast({
						title: '请填写需要使用的购物金数量',
						icon: 'none'
					})
				}
			} else {
				this.addOrder()
			}
		} else {
			wx.showToast({
				title: '请选择收货地址',
				icon: 'none'
			})
		}
	},
	// 封装生成订单函数
	addOrder() {
		let orderGoods = []
		if (this.data.cartPerchase) {
			this.data.dataList.forEach((list) => {
				const obj = {
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
					retailPrice: this.data.goods.isPromote
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
					if (this.data.cartPerchase) {
						this.data.dataList.forEach((list) => {
							body += list.goods.name
						})
						body = util.ellipsis(body, 128)
					} else {
						body = this.data.goods.name
					}
					this.setData({
						dialogShow: true,
						actualPrice: res.data.actualPrice,
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
				console.log('确认离开')
				wx.navigateTo({
					url:
						'/pages_order/order-detail/order-detail?src=' + this.data.payment.id
				})
			})
			.catch(() => {
				console.log('继续支付')
				this.setData({
					dialogShow: true
				})
			})
	},
	// 拉起微信支付
	confirm() {
		const _this = this
		http
			.wxRequest({
				..._this.data.api.payment,
				params: _this.data.payment
			})
			.then((result) => {
				console.log(result.data)
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
						wx.navigateTo({
							url:
								'/pages_order/order-detail/order-detail?src=' +
								_this.data.payment.id
						})
					}
				})
			})
	},
	// 获取购物金
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				if (res.data) {
					this.setData({
						shoppingAccountId: res.data.id,
						money: res.data.amount
					})
				} else {
					this.setData({
						money: null
					})
				}
			}
		})
	},
	selectMoneyChange() {
		this.setData({
			selectMoney: !this.data.selectMoney
		})
		if (this.data.selectMoney) {
			this.setData({})
		}
	},
	checkMoney() {
		// 判断购物金是否小于等于商品总价且小于等于可用余额
		if (this.data.shoppingMoney <= this.data.money) {
			if (this.data.shoppingMoney <= this.data.totalPrice) {
				return true
			} else {
				wx.showToast({
					title: '购物金超出商品总额',
					icon: 'none'
				})
				return false
			}
		} else {
			wx.showToast({
				title: '购物金余额不足',
				icon: 'none'
			})
			return false
		}
	},
	numberChange(e) {
		const count = e.detail
		const price = this.data.goods.isPromote
			? (Math.round(this.data.product.promotePrice * 100) * count) / 100
			: (Math.round(this.data.product.retailPrice * 100) * count) / 100
		this.setData({
			totalCount: count,
			totalPrice: price
		})
		if (this.data.selectMoney && this.data.shoppingMoney > 0) {
			this.setData({
				actualPrice: price - this.data.shoppingMoney
			})
		}
		wx.setStorageSync('activeProductNumber', count)
	},
	shoppingMoneyChange(e) {
		console.log(e)
		const money = Number(e.detail)
		const flag = this.checkMoney()
		if (flag) {
			const actualPrice = this.data.totalPrice - money
			this.setData({
				actualPrice
			})
		} else {
			this.setData({
				shoppingMoney: 0,
				actualPrice: this.data.totalPrice
			})
		}
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	}
})
