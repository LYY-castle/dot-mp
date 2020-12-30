import tool from '../../utils/mixin.js'
import constantCfg from '../../config/constant'
import env from '../../config/env.config'
import http from '../../utils/request.js'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		empty: '/static/img/empty.png',
		indicatorDots: false,
		vertical: false,
		autoplay: true,
		interval: 3000,
		duration: 500,
		activeImages: null,
		activeKey: 0,
		activeId: null,
		bottomLineShow: false,
		loadingShow: true,
		pageNo: 1,
		pageSize: 10,
		firstTypes: null,
		secondTypes: null,
		api: {
			// 获取二三级树
			getTree: {
				url: '/categories/tree',
				method: 'get'
			}
		}
	},
	onLoad: function () {
		Promise.resolve()
			.then(() => this.getTypes(0))
			.then(() => this.getSecondThirdType())
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
			this.getTypes()
		}
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
	// 产品种类切换
	firstChange(event) {
		const activeKey = event.detail
		this.setData({
			activeKey,
			bottomLineShow: false,
			loadingShow: true,
			secondTypes: null,
			activeImages: this.data.firstTypes[activeKey].imgUrl
		})
		Promise.resolve().then(() => this.getSecondThirdType())
	},
	// 获取产品列表 0 一级,其他是二级
	getTypes(val) {
		let params = {
			scope: 'all',
			enable: 1,
			sorts: 'sortNo,asc'
		}
		if (val === 0) {
			params.parentId = 0
		} else {
			params.parentId = this.data.firstTypes[this.data.activeKey].id
		}
		return new Promise((resolve) => {
			tool.getProductSorts(params).then((res) => {
				if (res.success) {
					res.data.forEach((option) => {
						if (option.imgUrl) {
							if (option.imgUrl.indexOf(';')) {
								option.imgUrl = option.imgUrl.split(';')
							} else {
								option.imgUrl = [option.imgUrl]
							}
						}
					})
					this.setData({
						firstTypes: res.data,
						activeKey: 0,
						activeImages: res.data[0].imgUrl ? res.data[0].imgUrl : null
					})
					resolve()
				}
			})
		})
	},
	getSecondThirdType() {
		http
			.wxRequest({
				...this.data.api.getTree,
				params: {
					idPath: this.data.firstTypes[this.data.activeKey].idPath
				}
			})
			.then((res) => {
				if (res.success) {
					this.setData({
						secondTypes: res.data[0].children,
						bottomLineShow: true,
						loadingShow: false
					})
				}
			})
	},
	// 四个按钮点击事件 self购买 share分享案例
	buttonClickEvent(e) {
		const option = e.currentTarget.dataset.option
		const event = e.currentTarget.dataset.event
		const pathParams = {
			productId: option.id
		}
		if (event === 'self') {
			wx.navigateTo({
				url: '../product-detail/product-detail',
				success: function (res) {
					// 通过eventChannel向被打开页面传送数据
					res.eventChannel.emit('acceptDataFromOpenerPage', {
						data: pathParams
					})
				}
			})
		}
		if (event === 'other') {
			const params = {
				params:
					env.env.VUE_APP_BASE_URL +
					'/product/product-detail/product-detail?productId=' +
					option.id,
				wechatAppId: env.env.appid
			}
			const header = {
				authorization: wx.getStorageSync('authorization')
			}
			wx.request({
				url: env.env.VUE_APP_BASE_URL + this.data.api.getQRcode.url,
				header,
				responseType: 'arrayBuffer',
				data: params,
				success: (res) => {
					let url = 'data:image/png;base64,' + wx.arrayBufferToBase64(res.data)
					this.setData({
						qrcodeContent: true,
						codeUrl: url,
						popProductName: option.name
					})
				}
			})
		}
		if (event === 'share') {
			wx.navigateTo({
				url: '../share-list/share-list',
				success: function (res) {
					// 通过eventChannel向被打开页面传送数据
					res.eventChannel.emit('acceptDataFromOpenerPage', {
						data: pathParams
					})
				}
			})
		}
	},
	//  获取产品列表
	getProductsList(params) {
		let productDetailObj = {}
		return new Promise((resolve) => {
			tool.getProductList(params).then(async (res) => {
				let products = []
				if (res.success) {
					let productDetailRes, item
					const dealQseProduct = async (item) => {
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
					resolve()
				}
			})
		})
	},
	// 根据三级分类跳转到商品列表页面
	goToProductsListPageById(e) {
		const option = e.currentTarget.dataset.option
		const activeFirstOption = this.data.firstTypes[this.data.activeKey]
		wx.navigateTo({
			url:
				'/pages_product/product-list/product-list?firstPath=' +
				activeFirstOption.idPath +
				'&thirdId=' +
				option.id +
				'&name=' +
				activeFirstOption.name
		})
	}
})
