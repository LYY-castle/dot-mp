import http from '../../utils/request.js'

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
		activeGoodsSpecificationId: '',
		goodsSpecificationIds: null,
		activeGoodsSpecificationNameValue: '',
		goodsSpecificationNameValue: '',
		goods: null,
		products: null,
		goodsAttributeResults: null, // 属性
		goodsGalleries: null, // 轮播图
		specificationResults: null, // 规格
		specificationId: null,
		operateType: null,
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
			}
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const _this = this
		if (options.src) {
			this.setData({
				productId: options.src
			})
			_this.getProductDetail()
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
		// return {
		// 	title: this.data.product.name,
		// 	query: wx.getStorageSync('code'),
		// 	path:
		// 		'/pages_product/product-detail/product-detail?src=' +
		// 		this.data.productId,
		// 	imageUrl: this.data.product.image[0] || ''
		// }
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
						this.setData({
							showContent: true,
							goods: res.data.goods,
							products: res.data.products,
							goodsAttributeResults: res.data.goodsAttributeResults, // 属性
							goodsGalleries: res.data.goodsGalleries, // 轮播图
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
			this.addCartOrPerchase(option)
		}
	},
	addCartOrPerchase(event) {
		const params = {
			checked: 1,
			goodsId: this.data.goods.id,
			goodsSpecificationIds: this.data.goodsSpecificationIds.join,
			goodsSpecificationNameValue: this.data.goodsSpecificationNameValue.join,
			number: this.data.number,
			listPicUrl: this.data.goods.listPicUrl,
			productId: this.data.productId,
			retailPrice: this.data.goods.idPromote
				? this.data.goods.promotePrice
				: this.data.goods.retailPrice,
			userId: wx.getStorageSync('userId')
		}
		this.onClose()
		if (event === 'cart') {
			http.wxRequest({ ...this.data.api.addCart, params }).then((res) => {
				if (res.success) {
					wx.showToast({
						title: '加入购物车成功',
						icon: 'none',
						success() {
							setTimeout(() => {
								this.getCartDotsNum()
							}, 2000)
						}
					})
				}
			})
		} else if (event === 'perchase') {
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
	// 选中规格
	selectSpecification(e) {
		const option = e.currentTarget.dataset.option
		const parentIndex = e.currentTarget.dataset.parent
		const childIndex = e.currentTarget.dataset.child
		let goodsSpecificationIds = []
		let goodsSpecificationNameValue = []
		// 给选中的同类规格加一个active标志,其他同类去除active标志
		this.data.specificationResults[
			parentIndex
		].goodsSpecificationResults.forEach((item, index) => {
			if (index === childIndex) {
				if (item.activeGoodsSpecificationNameValue) {
					delete item.activeGoodsSpecificationNameValue
				} else {
					item.activeGoodsSpecificationNameValue =
						option.goodsSpecificationValue
				}
			} else {
				if (item.activeGoodsSpecificationNameValue) {
					delete item.activeGoodsSpecificationNameValue
				}
			}
		})
		this.setData({
			specificationResults: this.data.specificationResults
		})
		// 遍历得出当前选中的不同类的规格名
		this.data.specificationResults.map((option) => {
			option.goodsSpecificationResults.map((item) => {
				if (item.activeGoodsSpecificationNameValue) {
					goodsSpecificationNameValue.push(item.goodsSpecificationValue)
					goodsSpecificationIds.push(item.goodsSpecificationId)
				}
			})
		})
		// 当规格种类和选中的规格种类数量相同时确定一个产品
		if (
			goodsSpecificationNameValue.length ===
			this.data.specificationResults.length
		) {
			this.data.products.map((pro) => {
				if (pro.goodsSpecificationIds === goodsSpecificationIds.join('_')) {
					this.setData({
						activePic: pro.productUrl
							? pro.productUrl
							: this.data.goods.listPicUrl, // 产品图
						activeProductNumber: pro.productNumber, //库存
						activePrice: this.data.goods.isPromote
							? pro.promotePrice
							: pro.retailPrice
					})
				}
			})
			this.setData({
				goodsSpecificationIds: goodsSpecificationIds.join('_'),
				goodsSpecificationNameValue: goodsSpecificationNameValue.join(';')
			})
		} else {
			this.setData({
				activePic: this.data.goods.listPicUrl,
				activePrice: this.data.goods.isPromote
					? this.data.goods.promotePrice
					: this.data.goods.retailPrice,
				activeProductNumber: this.data.goods.goodsNumber,
				goodsSpecificationIds: '',
				goodsSpecificationNameValue: ''
			})
		}
	},
	// 数量修改
	changeNumber(e) {
		if (e.detail <= this.data.activeProductNumber) {
			this.setData({
				number: e.detail
			})
		} else {
			wx.showToast({
				title: '库存数量不足'
			})
		}
	},
	// 规格弹框确定按钮操作
	operate() {
		const flag = this.data.specificationResults.every((option) => {
			return option.goodsSpecificationResults.some((item) => {
				return item.activeGoodsSpecificationNameValue
			})
		})
		if (flag) {
			this.addCartOrPerchase(this.data.operateType)
		} else {
			wx.showToast({
				title: '请完善规格信息',
				icon: 'none'
			})
		}
	},
	// 获取购物车下单数
	getCartDotsNum() {
		const params = {
			userId: wx.getStorageSync('userId')
		}
		http.wxRequest({ ...this.data.api.getCart, params }).then((res) => {
			if (res.success) {
				this.setData({
					cartDotsNum: res.page.totalCount
				})
			}
		})
	}
})
