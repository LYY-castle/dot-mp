import http from '../../utils/request.js'
import util from '../../utils/util.js'
import tool from '../../utils/mixin.js'
const moment = require('../../utils/moment.min.js')
import env from '../../config/env.config'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		indicatorDots: true,
		perchaseShow: false,
		addressShow: false,
		addressListData: [],
		vertical: false,
		autoplay: false,
		interval: 2000,
		duration: 500,
		options: null,
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
		shoppingMoneyData: null,
		rebateIcon: '/static/img/rebate.png',
		addPerson: '/static/img/add-person.png',
		defaultPerson: '/static/img/avatar.png',
		pageNo: 1,
		activeAddressItem: null,
		// 京东平台在指定地址下是否有库存
		jdSku: null,
		authorization: false, // 授权获取用户手机号，生成购物金账号
		isGroupPurchase: 0,
		campaignProductPriceRules: null,
		campaign: null,
		teams: null,
		teamsShow: false,
		activity: null,
		activityTime: null,
		timeData: {},
		shareId: null, // 开团发起人
		shareName: null,
		teamStatistics: null,
		currentShareCampaignTeam: null,
		teamPurchaseBtnText: '去开团',
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
			},
			// 加入购物车上限
			config: {
				url: '/configs/code/{code}',
				method: 'get'
			},
			getShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'get'
			},
			getAddressList: {
				url: '/user-address',
				method: 'get'
			},
			hasProduct: {
				url: '/jd-goods/inventory',
				method: 'post'
			},
			// 获取活动商品下的正在拼团的列表
			getTeamDetail: {
				url: '/campaign-teams/detail',
				method: 'get'
			},
			activityDetail: {
				url: '/campaigns/{id}',
				method: 'get'
			},
			updatePhone: {
				url: '/users/wx-phone',
				method: 'put'
			},
			getShareDetail: {
				url: '/users',
				method: 'get'
			},
			getTeamStatistics: {
				url: '/campaign-products/team-statistics',
				method: 'get'
			},
			getMessage: {
				url: '/wx-message/templates',
				method: 'get'
			}
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const _this = this
		_this.setData({
			userId: wx.getStorageSync('userId')
		})
		if (options) {
			_this.setData({
				options: options
			})
			if (this.data.options.campaignId) {
				_this.messagePop()
			}
		}
	},
	onShow: function () {
		const _this = this
		_this.setData({
			userId: wx.getStorageSync('userId')
		})
		wx.removeStorageSync('perchaseByCart')
		wx.removeStorageSync('addAddress')
		wx.removeStorageSync('activeProductNumber')
		wx.removeStorageSync('remark')
		_this.getMyAddressList()
		_this.getCartDotsNum()
		if (_this.data.options.src) {
			this.setData({
				productId: _this.data.options.src
			})
			if (this.data.options.campaignId) {
				this.setData({
					isGroupPurchase: 1,
					campaignId: this.data.options.campaignId
				})
				Promise.resolve()

					.then(() => _this.currentCampaignTeam())
					.then(() => _this.getProductDetail())
					.then(() => _this.getActivityDetail())
					.then(() => _this.getAllTeams())
					.then(() => _this.getTeamStatistics())
			} else {
				_this.getProductDetail()
			}
		}
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {
		let path =
			'/pages_product/product-detail/product-detail?src=' + this.data.productId
		if (this.data.campaignId) {
			path += '&campaignId=' + this.data.campaignId
		}
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		})
		return {
			withShareTicket: true,
			title: this.data.goods.name,
			path: path
		}
	},
	// 判断小程序使用者是否在当前分享人所属的拼团中
	currentCampaignTeam() {
		return new Promise((resolve) => {
			if (wx.getStorageSync('shareId')) {
				const params = {
					id: wx.getStorageSync('teamId'),
					campaignId: this.data.campaignId
				}
				const userId = wx.getStorageSync('userId')
				http
					.wxRequest({
						...this.data.api.getTeamDetail,
						params
					})
					.then((res) => {
						if (res.success) {
							if (res.data.length > 0) {
								let flag = false
								flag = res.data[0].users.some((user) => {
									return Number(userId) === Number(user.id)
								})
								console.log('flag', flag)
								if (res.data[0].isClustering) {
									wx.removeStorageSync('shareId')
									wx.removeStorageSync('teamId')
								}
								if (flag) {
									wx.removeStorageSync('shareId')
									wx.removeStorageSync('teamId')
								}
								this.getShareDetail()
								resolve()
							} else {
								resolve()
							}
						} else {
							resolve()
						}
					})
			} else {
				resolve()
			}
		})
	},
	getShareDetail() {
		return new Promise((resolve) => {
			if (wx.getStorageSync('shareId')) {
				const params = {
					id: wx.getStorageSync('shareId')
				}
				http
					.wxRequest({ ...this.data.api.getShareDetail, params })
					.then((res) => {
						if (res.success) {
							const shareName = res.data[0].nickname
								? res.data[0].nickname
								: '好友'
							this.setData({
								teamPurchaseBtnText: '加入' + shareName + '的团'
							})
							resolve()
						} else {
							resolve()
						}
					})
			} else {
				resolve()
			}
		})
	},
	// 获取当前用户的收货地址
	getMyAddressList() {
		const params = {
			userId: wx.getStorageSync('userId'),
			pageSize: 100,
			pageNo: 1
		}
		const activeAddressId = wx.getStorageSync('activeAddressId')
		http.wxRequest({ ...this.data.api.getAddressList, params }).then((res) => {
			if (res.success) {
				if (res.data.length > 0) {
					res.data.forEach((item) => {
						item.bigName = item.name.substring(0, 1)
					})
					if (params.pageNo === 1) {
						this.setData({
							addressListData: res.data
						})
					} else {
						this.setData({
							addressListData: this.data.res.data.concat(res.data)
						})
					}
					if (activeAddressId) {
						res.data.forEach((item) => {
							if (item.id === activeAddressId) {
								item.address = util.ellipsis(item.address, 3)
								this.setData({
									activeAddressItem: item
								})
							}
						})
					} else {
						let addressItem = res.data[0]
						addressItem.address = util.ellipsis(addressItem.address, 3)
						this.setData({
							activeAddressItem: addressItem
						})
					}
				}
			}
		})
	},
	// 判断当前地址下是否有货
	isHasProduct(val) {
		const params = {
			provinceName: this.data.activeAddressItem
				? this.data.activeAddressItem.provinceName
				: '广东省',
			cityName: this.data.activeAddressItem
				? this.data.activeAddressItem.cityName
				: '深圳市',
			districtName: this.data.activeAddressItem
				? this.data.activeAddressItem.districtName
				: '南山区',
			address: this.data.activeAddressItem
				? this.data.activeAddressItem.address
				: 0,
			goodsInventoryNumModels: [{ num: 1, skuId: val.goodsSn }]
		}
		http.wxRequest({ ...this.data.api.hasProduct, params }).then((res) => {
			if (res.success) {
				this.setData({
					jdSku: res.data[0]
				})
			}
		})
	},
	openAddressPop() {
		if (this.data.addressListData.length > 0) {
			this.setData({
				addressShow: true
			})
		} else {
			wx.showToast({
				title: '收货地址列表为空',
				icon: 'none',
				duration: 2000,
				success() {
					wx.navigateTo({
						url: '/pages_address/add-address/add-address'
					})
				}
			})
		}
	},
	selectAddressItem() {
		this.setData({
			addressShow: false
		})
		this.getMyAddressList()
		this.getProductDetail()
	},
	// 参与团购的用户需要开通购物金账号
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				if (!res.data) {
					this.setData({
						authorization: true
					})
				}
			}
		})
	},
	getphonenumber(e) {
		const _this = this
		if (e.detail.errMsg === 'getPhoneNumber:fail user deny') {
			// 拒绝授权
			wx.switchTab({
				url: '/pages/index/index'
			})
		} else {
			wx.login({
				success(res) {
					const params = {
						wechatCode: res.code,
						userInfoEncryptedData: e.detail.encryptedData,
						userInfoIv: e.detail.iv,
						wechatAppId: env.env.appid
					}
					http
						.wxRequest({ ..._this.data.api.updatePhone, params })
						.then((res) => {
							if (res.success) {
								wx.showToast({
									title: '授权成功'
								})
							} else {
								_this.setData({
									authorization: true
								})
							}
						})
				}
			})
		}
	},
	getProductDetail() {
		return new Promise((resolve) => {
			let params = {}
			if (this.data.campaignId) {
				params.campaignId = this.data.campaignId
			} else {
				params = {}
			}
			http
				.wxRequest({
					...this.data.api.getProductById,
					urlReplacements: [
						{ substr: '{id}', replacement: this.data.productId }
					],
					params
				})
				.then((res) => {
					if (res.success) {
						if (res.data.campaign) {
						}
						if (this.data.isGroupPurchase) {
							this.getShoppingMoney()
						}
						if (res.data.goods.platformType === 2) {
							this.isHasProduct(res.data.goods)
						}
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
						if (
							res.data.goods.isPromote &&
							tool.isInDurationTime(
								res.data.goods.promoteStart,
								res.data.goods.promoteEnd
							)
						) {
							res.data.goods.isPromote = true
						} else {
							res.data.goods.isPromote = false
						}
						this.setData({
							showContent: true,
							campaignProductPriceRules: res.data.campaignProductPriceRules,
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
						if (this.data.campaignId) {
							this.setData({
								showContent: true
							})
						} else {
							this.setData({
								showContent: false
							})
						}
					}
				})
		})
	},
	// 获取当前正在拼团的数据
	getAllTeams() {
		return new Promise((resolve) => {
			const params = {
				isClustering: 0,
				goodsId: this.data.goods.id,
				campaignId: this.data.campaignId
			}
			http.wxRequest({ ...this.data.api.getTeamDetail, params }).then((res) => {
				if (res.success) {
					res.data.map((team) => {
						const flag = team.users.every((user) => {
							return user.id !== this.data.userId
						})
						if (flag) {
							team.buttonShow = true
						}
					})
					this.setData({
						teams: res.data
					})
					resolve()
				}
			})
		})
	},
	// 总团队统计
	getTeamStatistics() {
		return new Promise((resolve) => {
			if (this.data.campaignId) {
				const params = {
					campaignId: this.data.campaignId,
					goodsId: this.data.goods.id
				}
				http
					.wxRequest({
						...this.data.api.getTeamStatistics,
						params
					})
					.then((res) => {
						if (res.success) {
							this.setData({
								teamStatistics: res.data
							})
							resolve()
						}
					})
			}
		})
	},
	lookAllTeam() {
		this.setData({
			teamsShow: true
		})
	},
	getActivityDetail(data) {
		return new Promise((resolve) => {
			http
				.wxRequest({
					...this.data.api.activityDetail,
					urlReplacements: [
						{
							substr: '{id}',
							replacement: this.data.campaignId
						}
					]
				})
				.then((res) => {
					if (res.success) {
						const currentTime = moment()
						const endTime = moment(res.data.endTime)
						if (tool.isInDurationTime(res.data.startTime, res.data.endTime)) {
							this.setData({
								activityTime: endTime - currentTime
							})
						} else {
							this.setData({
								activityTime: null
							})
						}
						resolve()
					}
				})
		})
	},
	timeChange(e) {
		this.setData({
			timeData: e.detail
		})
	},
	joinTeam(option) {
		const teamId = option.currentTarget.dataset.team.id
		wx.setStorageSync('teamId', teamId)
		this.onClickButton()
	},
	closeTeams() {
		this.setData({
			teamsShow: false
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
		console.log('点击加团呀')
		if (e) {
			const option = e.currentTarget.dataset.option
			this.setData({
				operateType: option
			})
		} else {
			this.setData({
				operateType: 'perchase'
			})
		}
		if (this.data.specificationResults.length > 0) {
			this.setData({
				perchaseShow: true
			})
		} else {
			this.addCartOrPerchase(this.data.operateType, undefined)
		}
	},
	addCartOrPerchase(event, data) {
		console.log(event)
		const _this = this
		const params = {
			checked: 1,
			goodsId: _this.data.goods.id,
			goodsSpecificationIds: data
				? data.goodsSpecificationIds
				: _this.data.goodsSpecificationIds,
			goodsSpecificationNameValue: data
				? data.goodsSpecificationNameValue
				: _this.data.goodsSpecificationNameValue,
			number: data ? data.number : _this.data.number,
			listPicUrl: data ? data.activePic : _this.data.goods.listPicUrl,
			productId: data ? data.productId : _this.data.products[0].id,
			retailPrice:
				this.data.specificationResults.length === 0
					? _this.data.goods.isPromote &&
					  tool.isInDurationTime(
							this.data.goods.promoteStart,
							this.data.goods.promoteEnd
					  )
						? _this.data.products[0].promotePrice
						: _this.data.products[0].retailPrice
					: data.retailPrice,
			userId: wx.getStorageSync('userId')
		}
		_this.onClose()
		if (event === 'cart') {
			http
				.wxRequest({
					..._this.data.api.config,
					urlReplacements: [
						{ substr: '{code}', replacement: 'max_cart_goods_count' }
					]
				})
				.then((res) => {
					if (_this.data.cartDotsNum < Number(res.data.val)) {
						http
							.wxRequest({ ..._this.data.api.addCart, params })
							.then((res) => {
								if (res.success) {
									wx.showToast({
										title: '加入购物车成功',
										icon: 'none',
										duration: 2000,
										success() {
											wx.removeStorageSync('activeProductNumber')
											_this.getCartDotsNum()
										}
									})
								}
							})
					} else {
						wx.showToast({
							title: '购物车已满，请先去清理购物车商品',
							icon: 'none'
						})
					}
				})
		} else if (event === 'perchase') {
			wx.setStorageSync('activeProductId', params.productId)
			if (this.data.campaignId) {
				wx.navigateTo({
					url:
						'/pages_product/perchase/perchase?campaignId=' +
						this.data.campaignId
				})
			} else {
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
	},
	// 下拉
	onPullDownRefresh() {
		Promise.resolve()
		// .then(() => this.getAllTeams())
		// .then(() => this.getTeamStatistics())
		wx.stopPullDownRefresh()
	},
	messagePop() {
		console.log('pop')
		return new Promise((resolve) => {
			const _this = this
			wx.getSetting({
				withSubscriptions: true,
				success(res) {
					console.log(res)
					let itemSettings =
						res.subscriptionsSetting[
							'5N4WaC8koz1kGaHnVxsrt15LZpXt7y_SQCwF1WFLc7s'
						]
					if (itemSettings === 'accept') {
						resolve()
					} else {
						_this.getMessages()
						resolve()
					}
				}
			})
		})
	},
	// 拉起小程序订阅消息
	getMessages() {
		return new Promise((resolve) => {
			wx.showModal({
				title: '成团提醒',
				content: '为方便您及时获取拼团成功信息，请授权小程序提醒',
				success: (res) => {
					if (res.confirm) {
						wx.requestSubscribeMessage({
							tmplIds: ['5N4WaC8koz1kGaHnVxsrt15LZpXt7y_SQCwF1WFLc7s'],
							complete(res) {
								console.log(res)
								resolve()
							}
						})
						resolve()
					} else if (res.cancel) {
						wx.showModal({
							title: '温馨提示',
							content: '拒绝后您将无法获取实时成团提醒',
							confirmText: '知道了',
							showCancel: false,
							success: function (res) {
								resolve()
							}
						})
					}
				}
			})
		})
	}
})
