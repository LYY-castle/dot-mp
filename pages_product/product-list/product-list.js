import tool from '../../utils/mixin.js'
import util from '../../utils/util.js'
import constantCfg from '../../config/constant'

Page({
	data: {
		nbTitle: '',
		bottomLineShow: false,
		empty: '/static/img/empty.png',
		productCategoryId: null,
		productList: null,
		productSorts: null,
		loadingShow: true,
		sortsImages: [
			'/static/img/product-01.png',
			'/static/img/product-02.png',
			'/static/img/product-03.png',
			'/static/img/product-04.png'
		],
		pageNo: 1
	},
	onLoad(options) {
		this.setData({
			productCategoryId: options.id,
			nbTitle: options.name
		})
		this.getProductList()
	},
	// 搜索栏聚焦事件
	focus() {
		wx.navigateTo({
			url: '/pages_product/search/search'
		})
	},
	// 获取特惠产品的列表
	getProductList() {
		let productDetailObj = {}
		return new Promise((resolve) => {
			let params = {
				categoryId: this.data.productCategoryId,
				pageNo: this.data.pageNo,
				pageSize: 10,
				isOnSale: 1
			}
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
	// 获取商品分类列表
	getProductSorts() {
		return new Promise((resolve) => {
			const params = {
				parentId: 0,
				pageSize: 100,
				isEnable: 1
			}
			tool.getProductSorts(params).then((res) => {
				if (res.success) {
					this.setData({
						productSorts: res.data
					})
					resolve()
				}
			})
		})
	},
	gotoDetail(e) {
		const option = e.currentTarget.dataset.option
		const pathParams = {
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
			this.getProductList()
		}
	},
	// 下拉刷新
	onPullDownRefresh() {
		this.setData({
			pageNo: 1
		})
		this.getProductList()
		wx.stopPullDownRefresh()
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
