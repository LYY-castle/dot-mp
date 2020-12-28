import http from '../../utils/request.js'
import util from '../../utils/util.js'
import tool from '../../utils/mixin.js'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		indicatorDots: true,
		perchaseShow: false,
		vertical: false,
		autoplay: false,
		interval: 2000,
		duration: 500,
		showContent: true,
		pageTitle: '',
		pathParams: null,
		productId: null,
		cartDotsNum: '',
		number: 1,
		activePic: null, // 默认展示的规格图
		activeProductNumber: null, //默认展示库存
		activePrice: null, // 默认展示价格
		goodsSpecificationIds: null,
		goodsSpecificationNameValue: '',
		goods: null,
		products: null,
		specificationResults: null, // 规格
		goodsAttributeResults: null, // 属性
		goodsGalleries: null, // 轮播图
		specificationId: null,
		operateType: null,
		shoppingMoneyData: null,
		rebateIcon: '/static/img/rebate.png',
		api: {
			// 查询产品详情.
			getProductById: {
				url: '/goods/detail/{id}',
				method: 'get'
			},
			addCart: {
				url: '/shop-carts',
				method: 'post'
			},
			getCart: {
				url: '/shop-carts',
				method: 'get'
			},
			// 加入购物车上限
			config: {
				url: '/configs/code/{code}',
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
		wx.removeStorageSync('perchaseByCart')
		wx.removeStorageSync('activeAddressId')
		wx.removeStorageSync('addAddress')
		wx.removeStorageSync('activeProductNumber')
		const _this = this
		if (options.src) {
			console.log('分享得到的连接', options)
			this.setData({
				productId: options.src
			})
			_this.getProductDetail()
			_this.getShoppingMoney()
			_this.getCartDotsNum()
		} else {
			const eventChannel = this.getOpenerEventChannel()
			eventChannel.on('acceptDataFromOpenerPage', function (res) {
				_this.setData({
					pathParams: res.data,
					productId: res.data.productId
				})
				_this.getProductDetail()
				_this.getCartDotsNum()
				_this.getShoppingMoney()
			})
		}
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
		if (wx.getStorageSync('addressList')) {
			wx.removeStorageSync('addressList')
		}
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		})
		return {
			withShareTicket: true,
			path:
				'/pages_product/product-detail/product-detail?src=' +
				this.data.productId +
				'&shareId=' +
				wx.getStorageSync('userId')
		}
	},

	getProductDetail() {
		return new Promise((resolve) => {
			http
				.wxRequest({
					...this.data.api.getProductById,
					urlReplacements: [
						{ substr: '{id}', replacement: this.data.productId }
					]
				})
				.then((res) => {
					if (res.success) {
						if (res.data.goods.goodsDetail) {
							res.data.goods.goodsDetail = res.data.goods.goodsDetail.replace(
								/\<img/gi,
								'<img class="richImg"'
							)
						}
						let imgArr = [res.data.goods.listPicUrl]
						res.data.goodsGalleries.forEach((img) => {
							imgArr.push(img.imgUrl)
						})
						res.data.goods.name = util.ellipsis(res.data.goods.name, 80)
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
						this.setData({
							showContent: true,
							goods: res.data.goods,
							products: res.data.products,
							goodsAttributeResults: res.data.goodsAttributeResults, // 属性
							goodsGalleries: imgArr, // 轮播图
							specificationResults: res.data.specificationResults,
							activePic: res.data.goods.listPicUrl,
							activePrice: res.data.goods.isPromote
								? res.data.goods.promotePrice
								: res.data.goods.retailPrice,
							activeProductNumber: res.data.goods.goodsNumber
						})
						resolve()
					} else {
						this.setData({
							showContent: false
						})
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
	buyCard() {
		wx.setStorageSync('activeProductId', this.data.productId)
		wx.navigateTo({
			url: '../perchase/perchase'
		})
	},
	// 弹框外按钮操作
	onClickButton(e) {
		const option = e.currentTarget.dataset.option
		this.setData({
			operateType: option
		})
		if (this.data.specificationResults.length > 0) {
			this.setData({
				perchaseShow: true
			})
		} else {
			this.addCartOrPerchase(option, undefined)
		}
	},
	addCartOrPerchase(event, data) {
		const _this = this
		const params = {
			checked: 1,
			goodsId: _this.data.goods.id,
			goodsSpecificationIds: data
				? data.goodsSpecificationIds
				: _this.data.goodsSpecificationIds,
			goodsSpecificationNameValue: data
				? data.goodsSpecificationNameValue
				: _this.data.goodsSpecificationNameValue,
			number: data ? data.number : _this.data.number,
			listPicUrl: data ? data.activePic : _this.data.goods.listPicUrl,
			productId: data ? data.productId : _this.data.products[0].id,
			retailPrice:
				this.data.specificationResults.length === 0
					? _this.data.goods.isPromote &&
					  tool.isInDurationTime(
							this.data.goods.promoteStart,
							this.data.goods.promoteEnd
					  )
						? _this.data.products[0].promotePrice
						: _this.data.products[0].retailPrice
					: data.retailPrice,
			userId: wx.getStorageSync('userId')
		}
		_this.onClose()
		if (event === 'cart') {
			http
				.wxRequest({
					..._this.data.api.config,
					urlReplacements: [
						{ substr: '{code}', replacement: 'max_cart_goods_count' }
					]
				})
				.then((res) => {
					if (_this.data.cartDotsNum < Number(res.data.val)) {
						http
							.wxRequest({ ..._this.data.api.addCart, params })
							.then((res) => {
								if (res.success) {
									wx.showToast({
										title: '加入购物车成功',
										icon: 'none',
										duration: 2000,
										success() {
											wx.removeStorageSync('activeProductNumber')
											_this.getCartDotsNum()
										}
									})
								}
							})
					} else {
						wx.showToast({
							title: '购物车已满，请先去清理购物车商品',
							icon: 'none'
						})
					}
				})
		} else if (event === 'perchase') {
			wx.setStorageSync('activeProductId', params.productId)
			wx.navigateTo({
				url: '/pages_product/perchase/perchase'
			})
		}
	},
	onClose() {
		this.setData({
			perchaseShow: false
		})
	},
	// 规格弹框确定按钮操作
	operate(e) {
		wx.setStorageSync('activeProductNumber', e.detail.params.number)
		this.addCartOrPerchase(e.detail.operateType, e.detail.params)
	},
	// 获取购物车下单数
	getCartDotsNum() {
		const params = {
			userId: wx.getStorageSync('userId')
		}
		http.wxRequest({ ...this.data.api.getCart, params }).then((res) => {
			if (res.success) {
				this.setData({
					cartDotsNum: res.page.totalCount > 0 ? res.page.totalCount : ''
				})
			}
		})
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	}
})
