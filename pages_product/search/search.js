import http from '../../utils/request'
import tool from '../../utils/mixin'
import util from '../../utils/util'
import constantCfg from '../../config/constant'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		empty: '/static/img/empty.png',
		bottomLineShow: false,
		historyListShow: true,
		loadingShow: true,
		pageNo: 1,
		searchValue: '',
		pageTitle: '搜索',
		productList: null,
		historyList: null,
		api: {
			getProductsList: {
				url: '/goods',
				method: 'get'
			}
		}
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		let list = []
		if (wx.getStorageSync('historyList')) {
			list = wx.getStorageSync('historyList')
		}
		this.setData({
			historyList: list
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
	change(e) {
		this.setData({
			searchValue: e.detail
		})
	},
	focus() {
		let list = []
		if (wx.getStorageSync('historyList')) {
			list = wx.getStorageSync('historyList')
		}
		this.setData({
			historyList: list,
			historyListShow: true
		})
	},
	search() {
		let list = []
		if (wx.getStorageSync('historyList')) {
			list = wx.getStorageSync('historyList')
		}
		if (this.data.searchValue !== '') {
			list.unshift(this.data.searchValue)
			const res = new Map()
			list = list.filter((option) => !res.has(option) && res.set(option, 1))
			wx.setStorageSync('historyList', list)
		}
		this.setData({
			historyListShow: false,
			historyList: list,
			pageNo: 1
		})
		this.getProductList()
	},
	selectList(event) {
		this.setData({
			searchValue: event.currentTarget.dataset.item
		})
		this.search()
	},
	clearHistoryList() {
		let self = this
		wx.showModal({
			title: '删除全部历史记录？',
			success(res) {
				if (res.confirm) {
					wx.removeStorageSync('historyList')
					self.setData({
						historyList: []
					})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	gotoDetail(e) {
		const option = e.currentTarget.dataset.option
		const pathParams = {
			productId: option.id
		}
		wx.navigateTo({
			url: '../product-detail/product-detail',
			success: function (res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('acceptDataFromOpenerPage', { data: pathParams })
			}
		})
	},
	// 获取产品的列表
	getProductList() {
		let productDetailObj = {}
		return new Promise((resolve) => {
			const params = {
				name: this.data.searchValue,
				pageSize: 10,
				pageNo: this.data.pageNo,
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
					resolve()
				}
			})
		})
	},
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	}
})
