import tool from '../../utils/mixin'
import qseBaoUtil from '../../utils/qsebao'
import util from '../../utils/util'
import constantCfg from '../../config/constant'
import http from '../../utils/request'
const app = getApp()
Page({
	data: {
		nbTitle: '金小点',
		nbFrontColor: '#000000',
		nbBackgroundColor: '#FDC865',
		bottomLineShow: false,
		empty: '/static/img/empty.png',
		advice: '/static/img/advice.png',
		lookMore: '/static/img/lookMore.png',
		drinkBannar: '/static/img/drinkBannar.png',
		voice: '/static/img/voice.png',
		productList: null,
		productSorts: null,
		bannarShow: false,
		productSortsArr: [],
		loadingShow: false,
		indicatorDots: false,
		NumbersItem: 10,
		vertical: false,
		autoplay: true,
		interval: 5000,
		duration: 500,
		navHeight: '',
		searchMarginTop: 0, // 搜索框上边距
		searchWidth: 0, // 搜索框宽度
		searchHeight: 0, // 搜索框高度
		menuButtonInfo: wx.getMenuButtonBoundingClientRect(),
		groupActivity: [],
		sortsImages: [
			'/static/img/product-01.png',
			'/static/img/product-02.png',
			'/static/img/product-03.png',
			'/static/img/product-04.png'
		],
		titleImg: '/static/img/title.png',
		pageNo: 1,
		activities: [],
		api: {
			// 查询活动bannar
			getBannar: {
				url: '/campaigns',
				method: 'get'
			}
		}
	},

	onLoad() {},
	onShow() {
		if (this.data.pageNo === 1) {
			Promise.resolve()
				.then(() => this.getBannarList())
				.then(() => this.getProductSorts())
				.then(() => this.getProductList())
		}
		const { top, width, height, right } = this.data.menuButtonInfo
		wx.getSystemInfo({
			success: (res) => {
				const { statusBarHeight } = res
				const margin = top - statusBarHeight
				this.setData({
					navHeight: height + statusBarHeight + margin * 2,
					searchMarginTop: statusBarHeight + margin, // 状态栏 + 胶囊按钮边距
					searchHeight: height, // 与胶囊按钮同高
					searchWidth: right - width // 胶囊按钮右边坐标 - 胶囊按钮宽度 = 按钮左边可使用宽度
				})
			}
		})
		wx.removeStorageSync('fromBannarActivity') // 活动Id
		wx.removeStorageSync('shareId') // 分享人Id
		wx.removeStorageSync('teamId') // 团队Id
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
	getBannarList() {
		return new Promise((resolve) => {
			const params = {
				pageNo: 1,
				pageSize: 1000,
				isAdmin: 0
			}
			http.wxRequest({ ...this.data.api.getBannar, params }).then((res) => {
				if (res.success) {
					let groupActivity = []
					res.data.forEach((activity) => {
						if (activity.type === 1) {
							activity.goodsList.forEach((good) => {
								good.name = util.ellipsis(good.name, 25)
							})
							groupActivity.push(activity)
						}
						if (activity.type === 3) {
							this.setData({
								bannarShow: true
							})
						}
					})
					this.setData({
						activities: res.data,
						groupActivity
					})
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
				scope: 'all',
				enable: 1,
				isShowHome: 1,
				sorts: 'sortNo,asc'
			}
			tool.getProductSorts(params).then((res) => {
				if (res.success) {
					let currentData = res.data
					let num = currentData.length / 5
					if (num > 1) {
						this.setData({
							indicatorDots: true
						})
						for (let i = 0; i < num; i++) {
							this.data.productSortsArr[i] = []
							let arr = []
							for (let j = 5 * i; j < currentData.length; j++) {
								arr.push(currentData[j])
								if (arr.length === 5) {
									break
								}
							}
							this.data.productSortsArr[i] = arr
						}
					} else {
						this.data.productSortsArr[0] = []
						this.data.productSortsArr[0] = currentData
					}
					this.setData({
						productSortsArr: this.data.productSortsArr
					})
					resolve()
				}
			})
		})
	},
	gotoProductList(event) {
		const option = event.currentTarget.dataset.item
		wx.navigateTo({
			url:
				'/pages_product/product-list/product-list?firstPath=' +
				option.idPath +
				'&name=' +
				option.name
		})
	},
	gotoDetail(e) {
		const option = e.currentTarget.dataset.option
		wx.navigateTo({
			url: '/pages_product/product-detail/product-detail?src=' + option.id
		})
	},
	gotoDetailByGroup(e) {
		const option = e.currentTarget.dataset.option
		const activity = e.currentTarget.dataset.activity
		wx.navigateTo({
			url:
				'/pages_product/product-detail/product-detail?src=' +
				option.id +
				'&campaignId=' +
				activity.id
		})
	},
	goActivity(option) {
		const obj = option.currentTarget.dataset.item
		if (obj.type === 1) {
			wx.navigateTo({
				url: '/pages_product/team-perchase/team-perchase?campaignId=' + obj.id
			})
		}
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
		Promise.resolve()
			.then(() => this.getBannarList())
			.then(() => this.getProductSorts())
			.then(() => this.getProductList())
		wx.stopPullDownRefresh()
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
	bannarProductList(option) {
		const options = option.currentTarget.dataset.option
		const categoryIdPath = options.categoryIdPath.split('/')
		if (categoryIdPath.length === 3) {
			wx.navigateTo({
				url:
					'/pages_product/product-list/product-list?firstPath=' +
					'/' +
					categoryIdPath[0] +
					'/' +
					'&thirdId=' +
					categoryIdPath[2]
			})
		}
	}
})
