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
		addressShow: false,
		addressListData: [],
		vertical: false,
		autoplay: false,
		interval: 2000,
		duration: 500,
		options: null,
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
		addPerson: '/static/img/add-person.png',
		pageNo: 1,
		activeAddressItem: null,
		// 京东平台在指定地址下是否有库存
		jdSku: null,
		authorization: false, // 授权获取用户手机号，生成购物金账号
		isGroupPurchase: 0,
		campaignProductPriceRules: null,
		teams: null,
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
			},
			getAddressList: {
				url: '/user-address',
				method: 'get'
			},
			hasProduct: {
				url: '/jd-goods/inventory',
				method: 'post'
			},
			// 获取活动商品下的正在拼团的列表
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
		const _this = this
		if (options) {
			_this.setData({
				options: options
			})
		}
	},
	onShow: function () {
		const _this = this
		wx.removeStorageSync('perchaseByCart')
		wx.removeStorageSync('addAddress')
		wx.removeStorageSync('activeProductNumber')
		wx.removeStorageSync('remark')
		_this.getMyAddressList()
		_this.getCartDotsNum()
		if (_this.data.options.src) {
			this.setData({
				productId: _this.data.options.src
			})
			Promise.resolve()
				.then(() => _this.getProductDetail())
				.then(() => _this.getAllTeams())
		} else {
			const eventChannel = this.getOpenerEventChannel()
			eventChannel.on('acceptDataFromOpenerPage', function (res) {
				_this.setData({
					pathParams: res.data,
					productId: res.data.productId
				})
				Promise.resolve()
					.then(() => _this.getProductDetail())
					.then(() => _this.getAllTeams())
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
	// 获取当前用户的收货地址
	getMyAddressList() {
		const params = {
			userId: wx.getStorageSync('userId'),
			pageSize: 100,
			pageNo: 1
		}
		const activeAddressId = wx.getStorageSync('activeAddressId')
		http.wxRequest({ ...this.data.api.getAddressList, params }).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					res.data.forEach((item) => {
						item.bigName = item.name.substring(0, 1)
					})
					if (params.pageNo === 1) {
						this.setData({
							addressListData: res.data
						})
					} else {
						this.setData({
							addressListData: this.data.res.data.concat(res.data)
						})
					}
					if (activeAddressId) {
						res.data.forEach((item) => {
							if (item.id === activeAddressId) {
								item.address = util.ellipsis(item.address, 3)
								this.setData({
									activeAddressItem: item
								})
							}
						})
					} else {
						let addressItem = res.data[0]
						addressItem.address = util.ellipsis(addressItem.address, 3)
						this.setData({
							activeAddressItem: addressItem
						})
					}
				}
			}
		})
	},
	// 判断当前地址下是否有货
	isHasProduct(val) {
		const params = {
			provinceName: this.data.activeAddressItem
				? this.data.activeAddressItem.provinceName
				: '广东省',
			cityName: this.data.activeAddressItem
				? this.data.activeAddressItem.cityName
				: '深圳市',
			districtName: this.data.activeAddressItem
				? this.data.activeAddressItem.districtName
				: '南山区',
			address: this.data.activeAddressItem
				? this.data.activeAddressItem.address
				: 0,
			goodsInventoryNumModels: [{ num: 1, skuId: val.goodsSn }]
		}
		http.wxRequest({ ...this.data.api.hasProduct, params }).then((res) => {
			if (res.success) {
				this.setData({
					jdSku: res.data[0]
				})
			}
		})
	},
	openAddressPop() {
		if (this.data.addressListData.length > 0) {
			this.setData({
				addressShow: true
			})
		} else {
			wx.showToast({
				title: '收货地址列表为空',
				icon: 'none',
				duration: 2000,
				success() {
					wx.navigateTo({
						url: '/pages_address/add-address/add-address'
					})
				}
			})
		}
	},
	selectAddressItem() {
		this.setData({
			addressShow: false
		})
		this.getMyAddressList()
		this.getProductDetail()
	},
	// 参与团购的用户需要开通购物金账号
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				if (!res.data) {
					this.setData({
						authorization: true
					})
				}
			}
		})
	},
	getphonenumber(e) {
		console.log(e)
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
						if (res.data.isGroupPurchase) {
							this.getShoppingMoney()
						}
						if (res.data.goods.platformType === 2) {
							this.isHasProduct(res.data.goods)
						}
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
							campaignProductPriceRules: res.data.campaignProductPriceRules,
							isGroupPurchase: res.data.isGroupPurchase,
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
	getAllTeams() {
		return new Promise((resolve) => {
			const params = {
				isClustering: 0,
				goodsId: this.data.goods.id
			}
			http.wxRequest({ ...this.data.api.getTeamDetail, params }).then((res) => {
				if (res.success) {
					this.setData({
						teams: res.data
					})
					resolve()
				}
			})
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
		} else if (event === 'perchase' || event === 'group_perchase') {
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
