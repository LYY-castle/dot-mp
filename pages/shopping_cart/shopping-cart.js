// pages_shopping_cart/shopping-cart.js
import http from '../../utils/request.js'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		loadingShow: false,
		bottomLineShow: true,
		shoppingCartList: [],
		result: [],
		totalPrice: 0,
		all: false,
		api: {
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
			}
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
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
				console.log(this.data.result)
				this.setData({
					loadingShow: false,
					shoppingCartList: res.data,
					result: resultArr,
					all: resultArr.length === res.data.length
				})
				this.getTotalPrice(resultArr, this.data.shoppingCartList)
			}
		})
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
	onChange(event) {
		console.log('触发组时间')
		console.log(event)
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
		console.log(optionId)
		this.getTotalPrice(this.data.result, this.data.shoppingCartList)
	},
	itemChange(e) {
		console.log('触发单个事件')
		const option = e.currentTarget.dataset.option
		const params = {
			id: option.id,
			checked: option.checked === 1 ? 0 : 1
		}
		console.log(params)
		http.wxRequest({ ...this.data.api.updateCart, params }).then((res) => {
			if (res.success) {
				this.getShoppingOrderList()
			}
		})
		console.log(e)
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
		this.getTotalPrice(this.data.result, this.data.shoppingCartList)
	},
	addCount(event) {
		const option = event.currentTarget.dataset.option
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
			console.log(sumPrice)
		}
		this.setData({
			totalPrice: sumPrice * 100
		})
	},
	// 结算
	onClickButton() {
		wx.navigateTo({
			url: '/pages_product/perchase/perchase'
		})
	}
})
