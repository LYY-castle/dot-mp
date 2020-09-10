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
		product: null,
		cartDotsNum: '',
		activeGoodsSpecificationId: null,
		goodsSpecificationIds: [],
		activeGoodsSpecificationNameValue: null,
		goodsSpecificationNameValue: [],
		goodsAttributeResults: null, // 属性
		goodsGalleries: null, // 轮播图
		specificationResults: null,
		specificationId: null,
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
						if (res.data.image) {
							res.data.image = res.data.image.split(';')
						} else {
							res.data.image = []
						}
						if (res.data.detail) {
							res.data.detail = res.data.detail.replace(
								/\<img/gi,
								'<img class="richImg"'
							)
						}
						this.setData({
							showContent: true,
							product: res.data.goods,
							goodsAttributeResults: res.data.goodsAttributeResults, // 属性
							goodsGalleries: res.data.goodsGalleries, // 轮播图
							specificationResults: res.data.specificationResults
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
	//
	onClickButton(e) {
		console.log(e)
		const option = e.currentTarget.dataset.option
		const params = {
			checked: 1,
			goodsId: this.data.product.id,
			goodsSpecificationIds: '2,3',
			goodsSpecificationNameValue: '大罐;加辣',
			number: 1,
			listPicUrl: this.data.product.listPicUrl,
			productId: this.data.productId,
			retailPrice: this.data.product.retailPrice,
			userId: wx.getStorageSync('userId')
		}
		if (this.data.specificationResults) {
			this.setData({
				perchaseShow: true
			})
		} else {
			if (option === 'cart') {
				http.wxRequest({ ...this.data.api.addCart, params }).then((res) => {
					if (res.success) {
						wx.showToast({
							title: '加入购物车成功',
							icon: 'none'
						})
						this.getCartDotsNum()
					}
				})
			} else if (option === 'perchase') {
				wx.navigateTo({
					url: '/pages_product/perchase/perchase'
				})
			}
		}
	},
	onClose() {
		this.setData({
			perchaseShow: false
		})
	},
	selectSpecification(e) {
		const option = e.currentTarget.dataset.option
		const parentIndex = e.currentTarget.dataset.parent
		const childIndex = e.currentTarget.dataset.child
		// option.activeGoodsSpecificationNameValue = item.goodsSpecificationValue
		// this.setData({
		// 	activeGoodsSpecificationId: option.specificationId,
		// 	activeGoodsSpecificationNameValue: item.goodsSpecificationValue
		// })
		// this.data.goodsSpecificationIds.push()
		// const index =
		// if(option.specificationId===this.data.specificationId){

		// }
		console.log(e)
	},
	addCartBy() {},
	perchaseBy() {},
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
