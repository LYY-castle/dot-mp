import http from '../../utils/request'
import util from '../../utils/util'
import tool from '../../utils/mixin'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		pageNo: 1,
		pageSize: 100,
		loadingShow: true,
		bottomLineShow: false,
		deleteButtonShow: false,
		manage: '编辑',
		activeChecked: false,
		shoppingCartList: null, // 购物车所有产品
		shoppingCartListEffective: null,
		result: [],
		totalPrice: 0,
		disabledCount: null, // 失效宝贝数量
		hasSaleOutCount: null, // 已售空宝贝数量
		all: false,
		perchaseShow: false,
		number: 1,
		activePic: null, // 默认展示的规格图
		activeProductNumber: null, //默认展示库存
		activePrice: null, // 默认展示价格
		goodsSpecificationIds: null,
		goodsSpecificationNameValue: '',
		goods: null,
		products: null,
		specificationResults: null, // 规格
		productId: null,
		cartId: null,
		cartCount: 0,
		activeAddressItem: null,
		jdSku: null,
		addressListData: [],
		addressShow: false,
		searchIsHasProductArr: [],
		api: {
			// 查询产品详情.
			getProductById: {
				url: '/goods/detail/{id}',
				method: 'get'
			},
			getCart: {
				url: '/shop-carts',
				method: 'get'
			},
			addCart: {
				url: '/shop-carts',
				method: 'post'
			},
			delete: {
				url: '/shop-carts/{ids}',
				method: 'delete'
			},
			updateCart: {
				url: '/shop-carts',
				method: 'put'
			},
			// 加入购物车前查询是否可继续添加
			beforeCart: {
				url: '/configs',
				method: 'get'
			},
			batch: {
				url: '/shop-carts/batch',
				method: 'put'
			},
			// 结算上限
			config: {
				url: '/configs/code/{code}',
				method: 'get'
			},
			getAddressList: {
				url: '/user-address',
				method: 'get'
			},
			hasProduct: {
				url: '/jd-goods/inventory',
				method: 'post'
			}
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		wx.removeStorageSync('addAddress')
		wx.removeStorageSync('remark')
		this.getMyAddressList()
		this.getShoppingOrderList()
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (!this.data.bottomLineShow && !this.data.loadingShow) {
			this.setData({
				pageNo: this.data.pageNo + 1,
				loadingShow: true
			})
			this.getShoppingOrderList()
		}
	},
	getShoppingOrderList() {
		const searchIsHasProductArr = []
		const params = {
			pageNo: this.data.pageNo,
			pageSize: this.data.pageSize,
			userId: wx.getStorageSync('userId')
		}
		http.wxRequest({ ...this.data.api.getCart, params }).then(async (res) => {
			if (res.success) {
				let resultArr = [],
					disabledCount = 0,
					shoppingCartListEffective = []

				res.data.forEach((item) => {
					item.goods.name = util.ellipsis(item.goods.name, 30)
					if (!item.goods.isOnSale) {
						disabledCount += 1
					} else {
						shoppingCartListEffective.push(item)
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
					if (item.checked && item.goods.isOnSale) {
						resultArr.push(String(item.id))
					}
				})
				shoppingCartListEffective.forEach((item) => {
					if (item.goods.platformType === 2) {
						searchIsHasProductArr.push(item)
						this.setData({
							searchIsHasProductArr
						})
					}
				})
				this.setData({
					cartCount: res.page.totalCount,
					shoppingCartListEffective,
					disabledCount,
					result: resultArr,
					all: resultArr.length === shoppingCartListEffective.length
				})

				if (params.pageNo === 1) {
					this.setData({
						loadingShow: false,
						shoppingCartList: res.data
					})
				} else {
					this.setData({
						loadingShow: false,
						shoppingCartList: this.data.shoppingCartList.concat(res.data)
					})
				}
				if (res.page.totalPage === params.pageNo) {
					this.setData({
						bottomLineShow: true
					})
				}

				this.getTotalPrice(resultArr, this.data.shoppingCartListEffective)
				if (this.data.searchIsHasProductArr.length > 0) {
					this.isHasProduct()
				}
			}
		})
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
						item.address = util.ellipsis(item.address, 5)
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
								this.setData({
									activeAddressItem: item
								})
							}
						})
					} else {
						this.setData({
							activeAddressItem: res.data[0]
						})
					}
				}
			}
		})
	},
	// 判断当前地址下是否有货
	isHasProduct() {
		let goodsInventoryNumModels = []
		this.data.searchIsHasProductArr.forEach((arr) => {
			goodsInventoryNumModels.push({
				num: arr.number,
				skuId: arr.goods.platformGoodsId
			})
		})
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
			goodsInventoryNumModels
		}
		return new Promise((resovle) => {
			http.wxRequest({ ...this.data.api.hasProduct, params }).then((res) => {
				if (res.success) {
					res.data.forEach((result) => {
						this.data.shoppingCartListEffective.forEach((eff) => {
							if (eff.goods.platformGoodsId === String(result.skuId)) {
								eff.goods.isPlaceAnOrder = result.isPlaceAnOrder
							}
						})
					})
					this.setData({
						shoppingCartListEffective: this.data.shoppingCartListEffective
					})
					resovle()
				}
			})
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
		this.getShoppingOrderList()
	},
	onChange(event) {
		const detail = event.detail
		this.setData({
			result: detail,
			all: detail.length === this.data.shoppingCartListEffective.length
		})
		const idArr = this.data.shoppingCartListEffective.map((item) => {
			return String(item.id)
		})
		if (!this.data.deleteButtonShow) {
			this.getTotalPrice(this.data.result, this.data.shoppingCartListEffective)
		}
	},
	itemChange(e) {
		if (!this.data.deleteButtonShow) {
			const option = e.currentTarget.dataset.option
			const params = {
				id: option.id,
				productId: option.product.id,
				checked: option.checked === 1 ? 0 : 1
			}
			http.wxRequest({ ...this.data.api.updateCart, params }).then((res) => {
				if (res.success) {
					this.getShoppingOrderList()
				}
			})
		}
	},
	selectAll() {
		this.setData({
			all: !this.data.all
		})
		if (this.data.all) {
			let resultArr = []
			this.data.shoppingCartListEffective.map((item) => {
				resultArr.push(String(item.id))
			})
			this.setData({
				result: resultArr
			})
		} else {
			this.setData({
				result: []
			})
		}
		if (!this.data.deleteButtonShow) {
			let shopCarts = []
			this.data.shoppingCartListEffective.map((item) => {
				const obj = {
					checked: this.data.all ? 1 : 0,
					id: Number(item.id)
				}
				shopCarts.push(obj)
			})
			http
				.wxRequest({ ...this.data.api.batch, params: shopCarts })
				.then((res) => {
					if (res.success) {
						this.getShoppingOrderList()
					}
				})
		}
	},
	addCount(event) {
		const option = event.currentTarget.dataset.option,
			params = {
				id: option.id,
				productId: option.product.id,
				number: event.detail
			}
		http.wxRequest({ ...this.data.api.updateCart, params }).then((res) => {
			if (res.success) {
				this.getShoppingOrderList()
			}
		})
	},
	getTotalPrice(arr1, arr2) {
		let sumPrice = 0
		for (let i = 0; i < arr1.length; i++) {
			for (let j = 0; j < arr2.length; j++) {
				if (Number(arr1[i]) === arr2[j].id) {
					if (arr2[j].goods.isPromote) {
						sumPrice += arr2[j].product.promotePrice * arr2[j].number
					} else {
						sumPrice += arr2[j].product.retailPrice * arr2[j].number
					}
				}
			}
		}
		this.setData({
			totalPrice: sumPrice * 100
		})
	},
	// 结算
	onClickButton() {
		http
			.wxRequest({
				...this.data.api.config,
				urlReplacements: [
					{ substr: '{code}', replacement: 'max_perchase_goods_count' }
				]
			})
			.then((res) => {
				if (this.data.result.length < Number(res.data.val)) {
					const flagArr = []
					this.data.shoppingCartListEffective.forEach((shop) => {
						this.data.result.forEach((result) => {
							if (Number(result) === shop.id) {
								flagArr.push(shop)
							}
						})
					})
					const flag = flagArr.some((item) => {
						return item.goods.platformType !== 2
							? item.product.productNumber === 0
							: item.goods.isPlaceAnOrder === 0
					})

					if (!flag) {
						wx.setStorageSync('perchaseByCart', true)
						wx.navigateTo({
							url: '/pages_product/perchase/perchase'
						})
					} else {
						wx.showToast({
							title: '请移除已售空商品',
							icon: 'none'
						})
					}
				} else {
					wx.showToast({
						title: '商品数量超出结算上限',
						icon: 'none'
					})
				}
			})
	},
	manage() {
		this.setData({
			manage: this.data.manage === '编辑' ? '完成' : '编辑',
			deleteButtonShow: !this.data.deleteButtonShow
		})
		if (!this.data.deleteButtonShow) {
			this.getShoppingOrderList()
		}
	},
	deleteCarts() {
		const _this = this
		if (_this.data.result.length > 0) {
			const ids = _this.data.result.join(',')
			wx.showModal({
				title: '确认要删除这' + _this.data.result.length + '种商品吗？',
				success(res) {
					if (res.confirm) {
						http
							.wxRequest({
								..._this.data.api.delete,
								urlReplacements: [{ substr: '{ids}', replacement: ids }]
							})
							.then((res) => {
								if (res.success) {
									_this.getShoppingOrderList()
								}
							})
					} else if (res.cancel) {
					}
				}
			})
		} else {
			wx.showToast({
				title: '请选择要删除的商品',
				icon: 'none'
			})
		}
	},
	// 规格重置
	operate(e) {
		const data = e.detail.params
		const params = {
			id: this.data.cartId,
			checked: this.data.activeChecked,
			goodsId: this.data.goods.id,
			goodsSpecificationIds: data
				? data.goodsSpecificationIds
				: this.data.goodsSpecificationIds,
			goodsSpecificationNameValue: data
				? data.goodsSpecificationNameValue
				: this.data.goodsSpecificationNameValue,
			number: data ? data.number : this.data.number,
			listPicUrl: this.data.goods.listPicUrl,
			productId: data ? data.productId : this.data.productId,
			retailPrice: data
				? data.retailPrice
				: this.data.goods.idPromote
				? this.data.goods.promotePrice
				: this.data.goods.retailPrice,
			userId: wx.getStorageSync('userId')
		}
		http.wxRequest({ ...this.data.api.updateCart, params }).then((res) => {
			if (res.success) {
				this.setData({
					perchaseShow: false
				})
				this.getShoppingOrderList()
			}
		})
	},
	gotoGoodDetail(e) {
		const option = e.currentTarget.dataset.option
		const pathParams = {
			productId: option.goods.id
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
	deleteItem(item, list) {
		list.splice(list.indexOf(item), 1)
	},
	selectGuige(e) {
		const option = e.currentTarget.dataset.option
		this.setData({
			specArray: option.goodsSpecificationNameValue.indexOf(';')
				? option.goodsSpecificationNameValue.split(';')
				: [option.goodsSpecificationNameValue]
		})
		http
			.wxRequest({
				...this.data.api.getProductById,
				urlReplacements: [{ substr: '{id}', replacement: option.goods.id }]
			})
			.then((res) => {
				if (res.success) {
					this.data.specArray.forEach((name) => {
						res.data.specificationResults.forEach((speci) => {
							speci.goodsSpecificationResults.forEach((speciItem) => {
								if (name === speciItem.goodsSpecificationValue) {
									speciItem.active = true
								}
							})
						})
						res.data.products.forEach((pro) => {
							if (pro.goodsSpecificationNameValue.indexOf(name) !== -1) {
								if (pro.productNumber === 0) {
									const arr = pro.goodsSpecificationNameValue.split(';')
									this.deleteItem(name, arr)
									for (let i = 0; i < arr.length; i++) {
										res.data.specificationResults.forEach((speci) => {
											speci.goodsSpecificationResults.forEach((speciItem) => {
												if (arr.includes(speciItem.goodsSpecificationValue)) {
													speciItem.disabled = true
												}
											})
										})
									}
								}
							}
						})
					})
					this.setData({
						activeChecked: option.checked,
						productId: option.product.id,
						cartId: option.id,
						perchaseShow: true,
						goods: res.data.goods,
						products: res.data.products,
						specificationResults: res.data.specificationResults,
						goodsSpecificationNameValue: option.goodsSpecificationNameValue,
						activePic: option.listPicUrl,
						activePrice:
							option.goods.isPromote &&
							tool.isInDurationTime(
								option.goods.promoteStart,
								option.goods.promoteEnd
							)
								? option.product.promotePrice
								: option.product.retailPrice,
						activeProductNumber: option.product.productNumber,
						number: option.number
					})
				} else {
					this.setData({
						showContent: false
					})
				}
			})
	},
	removeDisabledGoods() {
		const _this = this
		wx.showModal({
			title: '确认清空失效宝贝？',
			success(res) {
				if (res.confirm) {
					let ids = []
					_this.data.shoppingCartList.map((shop) => {
						if (!shop.goods.isOnSale) {
							ids.push(shop.id)
						}
					})

					if (ids.length > 1) {
						ids = ids.join(',')
					} else {
						ids = ids[0]
					}

					http
						.wxRequest({
							..._this.data.api.delete,
							urlReplacements: [{ substr: '{ids}', replacement: ids }]
						})
						.then((res) => {
							if (res.success) {
								wx.showToast({
									title: '失效宝贝已清空',
									icon: 'none',
									success() {
										_this.getShoppingOrderList()
									}
								})
							}
						})
				} else if (res.cancel) {
				}
			}
		})
	},
	goHome() {
		wx.switchTab({
			url: '/pages/index/index'
		})
	}
})
