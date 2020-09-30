import tool from '../../utils/mixin'
import qseBaoUtil from '../../utils/qsebao'
import util from '../../utils/util'
import constantCfg from '../../config/constant'

Page({
	data: {
		bottomLineShow: false,
		empty: '/static/img/empty.png',
		productList: null,
		productSorts: null,
		loadingShow: false,
		sortsImages: [
			'/static/img/product-01.png',
			'/static/img/product-02.png',
			'/static/img/product-03.png',
			'/static/img/product-04.png'
		],
		pageNo: 1
	},
	onShow() {
		Promise.resolve()
			.then(() => this.getProductSorts())
			.then(() => this.getProductList())
	},
	test() {
		this.getProductSorts()
	},
	scrollToTop() {
		wx.pageScrollTo({
			scrollTop: 0,
			duration: 300
		})
	},
	// 搜索栏聚焦事件
	focus() {
		wx.navigateTo({
			url: '/pages_product/search/search'
		})
	},
	// 获取特惠产品的列表
	getProductList() {
		return new Promise((resolve) => {
			let params = {
				isHot: 1,
				pageNo: this.data.pageNo,
				pageSize: 10,
				isOnSale: 1
			}
			tool.getProductList(params).then((res) => {
				let productDetailObj = {}
				let products = []
				res.data.forEach((item) => {
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
					if (item.label === '') {
						labelArr = []
					} else {
						if (item.label.indexOf(',')) {
							labelArr = item.label.split(',')
						} else {
							labelArr = [item.label]
						}
					}
					item.label = labelArr
					if (constantCfg.productCode.qsebao.includes(item.code)) {
						const insuranceCode = item.code
						qseBaoUtil
							.getProductDetail({
								insuranceCode
							})
							.then((productDetailRes) => {
								productDetailObj = productDetailRes.data.productDetail
								// 因为轻松保接口中 type 与原有商品类型 type 冲突.
								productDetailObj.insurance_type = productDetailObj.type
								delete productDetailObj.type

								products.push(
									Object.assign({}, item, productDetailRes.data.productDetail)
								)
							})
					} else {
						products.push(item)
					}
				})
				if (params.pageNo === 1) {
					this.setData({
						productList: products,
						loadingShow: false
					})
				} else {
					this.setData({
						productList: this.data.productList.concat(products),
						loadingShow: false
					})
				}
				if (params.pageNo === res.page.totalPage) {
					this.setData({
						bottomLineShow: true
					})
				} else {
					this.setData({
						bottomLineShow: false
					})
				}
			})
			resolve()
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
	gotoProductList(event) {
		const sortId = event.currentTarget.dataset.item.id
		wx.setStorageSync('activeSortId', sortId)
		wx.switchTab({
			url: '/pages/product/index'
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
