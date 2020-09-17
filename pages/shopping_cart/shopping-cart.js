// pages_shopping_cart/shopping-cart.js
import http from '../../utils/request'
import util from '../../utils/util'
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
		shoppingCartList: null,
		result: [],
		totalPrice: 0,
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
			}
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		wx.removeStorageSync('activeAddressId')
		this.getShoppingOrderList()
	},
	goLogin() {
		wx.navigateTo({
			url: '/pages_mine/login/login'
		})
	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		console.log(123)
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
		const params = {
			pageNo: this.data.pageNo,
			pageSize: this.data.pageSize,
			userId: wx.getStorageSync('userId')
		}
		http.wxRequest({ ...this.data.api.getCart, params }).then((res) => {
			if (res.success) {
				const resultArr = []
				res.data.forEach((item) => {
					if (item.checked) {
						resultArr.push(String(item.id))
					}
				})
				this.setData({
					cartCount: res.page.totalCount
				})
				if (params.pageNo === 1) {
					this.setData({
						loadingShow: false,
						shoppingCartList: res.data,
						result: resultArr,
						all: resultArr.length === res.data.length
					})
				} else {
					this.setData({
						loadingShow: false,
						shoppingCartList: this.data.shoppingCartList.concat(res.data),
						result: resultArr,
						all: resultArr.length === res.data.length
					})
				}
				if (res.page.totalPage === params.pageNo) {
					this.setData({
						bottomLineShow: true
					})
				}
				this.getTotalPrice(resultArr, this.data.shoppingCartList)
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
	onChange(event) {
		const detail = event.detail
		this.setData({
			result: detail,
			all: detail.length === this.data.shoppingCartList.length
		})
		const idArr = this.data.shoppingCartList.map((item) => {
			return String(item.id)
		})
		const optionId = idArr.concat(detail).filter(function (v, i, arr) {
			return arr.indexOf(v) === arr.lastIndexOf(v)
		})
		if (!this.data.deleteButtonShow) {
			this.getTotalPrice(this.data.result, this.data.shoppingCartList)
		}
	},
	itemChange(e) {
		console.log(this.data.result)
		if (!this.data.deleteButtonShow) {
			const option = e.currentTarget.dataset.option
			const params = {
				id: option.id,
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
		const resultArr = this.data.shoppingCartList.map((item) => {
			return String(item.id)
		})
		this.setData({
			all: !this.data.all
		})
		if (this.data.all) {
			this.setData({
				result: resultArr
			})
		} else {
			this.setData({
				result: []
			})
		}
		if (!this.data.deleteButtonShow) {
			this.getTotalPrice(this.data.result, this.data.shoppingCartList)
		}
	},
	addCount(event) {
		console.log(event)
		const option = event.currentTarget.dataset.option
		const params = {
			id: option.id,
			number: event.detail
		}
		http.wxRequest({ ...this.data.api.updateCart, params }).then((res) => {
			if (res.success) {
				this.getShoppingOrderList()
			}
		})
	},
	getTotalPrice(arr1, arr2) {
		console.log('计算价格')
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
		wx.setStorageSync('perchaseByCart', true)
		wx.navigateTo({
			url: '/pages_product/perchase/perchase'
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
		if (this.data.result.length > 0) {
			const ids = this.data.result.join(',')
			console.log(ids)
			wx.showModal({
				title: '确认要删除这' + this.data.result.length + '种商品吗？',
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
						console.log('用户点击取消')
					}
				}
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
	getProductDetail(id) {
		return new Promise((resolve) => {})
	},
	gotoGoodDetail(e) {
		console.log()
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
	selectGuige(e) {
		const option = e.currentTarget.dataset.option
		let nameArr = []
		if (option.goodsSpecificationNameValue.indexOf(';') !== -1) {
			nameArr = option.goodsSpecificationNameValue.split(';')
		} else {
			nameArr.push(option.goodsSpecificationNameValue)
		}
		http
			.wxRequest({
				...this.data.api.getProductById,
				urlReplacements: [{ substr: '{id}', replacement: option.goods.id }]
			})
			.then((res) => {
				if (res.success) {
					nameArr.forEach((name) => {
						res.data.specificationResults.forEach((obj) => {
							obj.goodsSpecificationResults.forEach((item, index) => {
								console.log(name, item.goodsSpecificationValue)
								if (name === item.goodsSpecificationValue) {
									console.log(index)
									obj.goodsSpecificationResults[
										index
									].activeGoodsSpecificationNameValue =
										item.goodsSpecificationValue
								}
							})
						})
					})

					console.log(res.data)
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
						activePrice: option.goods.isPromote
							? option.goods.promotePrice
							: option.goods.retailPrice,
						activeProductNumber: option.product.productNumber,
						number: option.number
					})
				} else {
					this.setData({
						showContent: false
					})
				}
			})
	}
})
