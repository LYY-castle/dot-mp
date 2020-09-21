import http from '../../utils/request.js'
import util from '../../utils/util.js'
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
		wx.removeStorageSync('perchaseByCart')
		wx.removeStorageSync('activeAddressId')
		wx.removeStorageSync('addAddress')
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
						let imgArr = [res.data.goods.listPicUrl]
						res.data.goodsGalleries.forEach((img) => {
							imgArr.push(img.imgUrl)
						})
						res.data.goods.name = util.ellipsis(res.data.goods.name, 80)
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
	addCartOrPerchase(event, data) {
		console.log(data)
		const _this = this
		const params = {
			checked: 1,
			goodsId: this.data.goods.id,
			goodsSpecificationIds: data
				? data.goodsSpecificationIds
				: this.data.goodsSpecificationIds,
			goodsSpecificationNameValue: data
				? data.goodsSpecificationNameValue
				: this.data.goodsSpecificationNameValue,
			number: data ? data.number : this.data.number,
			listPicUrl: data ? data.activePic : this.data.goods.listPicUrl,
			productId: data ? data.productId : this.data.products[0].id,
			retailPrice: data
				? data.retailPrice
				: this.data.goods.idPromote
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
								_this.getCartDotsNum()
							}, 2000)
						}
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
	}
})
