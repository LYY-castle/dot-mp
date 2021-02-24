// pages_product/team-perchase/team-perchase.js
import tool from '../../utils/mixin'
import qseBaoUtil from '../../utils/qsebao'
import util from '../../utils/util'
import constantCfg from '../../config/constant'
import http from '../../utils/request'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		productList: [],
		bottomLineShow: false,
		loadingShow: false,
		pageNo: 1,
		api: {
			activityProduct: {
				url: '/campaign-products',
				method: 'get'
			},
			getShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'get'
			}
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.getProductList()
	},

	// 获取特惠产品的列表
	getProductList() {
		return new Promise((resolve) => {
			let params = {
				pageNo: this.data.pageNo,
				pageSize: 10,
				campaignId: wx.getStorageSync('fromBannarActivity')
			}
			http
				.wxRequest({ ...this.data.api.activityProduct, params })
				.then((res) => {
					let productDetailObj = {}
					let products = []
					res.data.forEach((item) => {
						item.name = util.ellipsis(item.name, 40)
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
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {
		this.setData({
			pageNo: 1
		})
		Promise.resolve().then(() => this.getProductList())
		wx.stopPullDownRefresh()
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
