import tool from '../../utils/mixin'
import util from '../../utils/util'
import constantCfg from '../../config/constant'
import http from '../../utils/request.js'
Page({
	data: {
		nbTitle: '',
		bottomLineShow: false,
		empty: '/static/img/empty.png',
		productCategoryId: null,
		productList: null,
		productSorts: null,
		loadingShow: true,
		pageNo: 1,
		firstPath: null,
		thirdId: null,
		thirdData: null,
		activeTab: null,
		api: {
			getTree: {
				url: '/categories/tree',
				method: 'get'
			}
		}
	},
	onLoad(options) {
		this.setData({
			firstPath: options.firstPath,
			nbTitle: options.name
		})
		if (options.thirdId) {
			this.setData({
				activeTab: Number(options.thirdId)
			})
		}
		Promise.resolve()
			.then(() => this.getProductSorts())
			.then(() => {
				if (this.data.thirdData) {
					if (!options.thirdId) {
						this.setData({
							activeTab: this.data.thirdData[0].id
						})
					}
					let params = {
						categoryId: this.data.activeTab,
						pageNo: 1,
						pageSize: 10,
						isOnSale: 1
					}
					this.getProductList(params)
				} else {
					this.setData({
						productList: [],
						loadingShow: false
					})
				}
			})
	},
	// 搜索栏聚焦事件
	focus() {
		wx.navigateTo({
			url: '/pages_product/search/search'
		})
	},
	onTabChange(e) {
		this.setData({
			activeTab: e.detail.name,
			thirdId: e.detail.name,
			pageNo: 1
		})
		let params = {
			categoryId: this.data.activeTab,
			pageNo: 1,
			pageSize: 10,
			isOnSale: 1
		}
		this.getProductList(params)
		wx.pageScrollTo({
			scrollTop: 0
		})
	},
	// 获取特惠产品的列表
	getProductList(params) {
		let productDetailObj = {}
		return new Promise((resolve) => {
			tool.getProductList(params).then(async (res) => {
				let products = []
				if (res.success) {
					let productDetailRes, item
					const dealQseProduct = async (item) => {
						item.name = util.ellipsis(item.name, 20)
						if (
							item.isPromote &&
							tool.isInDurationTime(item.promoteStart, item.promoteEnd)
						) {
							item.isPromote = true
						} else {
							item.isPromote = false
						}

						let labelArr = []
						if (item.keywords === '') {
							labelArr = []
						} else {
							if (item.keywords.indexOf(',') !== -1) {
								labelArr = item.keywords.split(',')
							} else {
								labelArr = [item.keywords]
							}
						}
						item.label = labelArr
						if (constantCfg.productCode.qsebao.includes(item.code)) {
							productDetailRes = await tool.insuranceProduct()
							productDetailObj = productDetailRes.data.productDetail
							// 因为轻松保接口中 type 与原有商品类型 type 冲突.
							productDetailObj.insurance_type = productDetailObj.type
							delete productDetailObj.type
							products.push(
								Object.assign({}, item, productDetailRes.data.productDetail)
							)
						} else {
							products.push(item)
						}
					}
					for (let i = 0; i < res.data.length; i++) {
						item = res.data[i]
						await dealQseProduct(item)
					}
					if (params.pageNo === 1) {
						this.setData({
							productList: products
						})
					} else {
						this.setData({
							productList: this.data.productList.concat(products)
						})
					}
					if (params.pageNo === res.page.totalPage) {
						this.setData({
							bottomLineShow: true,
							loadingShow: false
						})
					} else {
						this.setData({
							bottomLineShow: false,
							loadingShow: false
						})
					}
					resolve()
				}
			})
		})
	},
	// 获取分类列表
	getProductSorts() {
		return new Promise((resolve) => {
			const params = {
				idPath: this.data.firstPath,
				isAdmin: true,
				level: 3,
				enable: 1
			}
			http.wxRequest({ ...this.data.api.getTree, params }).then((res) => {
				if (res.success) {
					this.setData({
						thirdData: res.data
					})
					resolve()
				}
			})
		})
	},
	gotoDetail(e) {
		const option = e.currentTarget.dataset.option,
			pathParams = {
				productId: option.id
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

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (!this.data.bottomLineShow && !this.data.loadingShow) {
			this.setData({
				loadingShow: true,
				pageNo: this.data.pageNo + 1
			})
			this.getProductList({
				categoryId: this.data.activeTab,
				pageNo: this.data.pageNo,
				pageSize: 10,
				isOnSale: 1
			})
		}
	},
	// 下拉刷新
	onPullDownRefresh() {
		this.setData({
			pageNo: 1
		})
		this.getProductList({
			categoryId: this.data.activeTab,
			pageNo: this.data.pageNo,
			pageSize: 10,
			isOnSale: 1
		})
		wx.stopPullDownRefresh()
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		let path = ''
		if (this.data.thirdId) {
			path =
				'/pages_product/product-list/product-list?firstPath=' +
				this.data.firstPath +
				'&thirdId=' +
				this.data.thirdId +
				'&name=' +
				this.data.nbTitle
		} else {
			path =
				'/pages_product/product-list/product-list?firstPath=' +
				this.data.firstPath +
				'&name=' +
				this.data.nbTitle
		}
		return { path }
	}
})
