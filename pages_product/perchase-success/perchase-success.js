// pages_product/perchase-success/perchase-success.js
import http from '../../utils/request.js'
import util from '../../utils/util'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		nbTitle: '支付',
		order: null,
		team: null,
		userId: null,
		loadingShow: true,
		addPerson: '/static/img/add-person.png',
		defaultPerson: '/static/img/avatar.png',
		payStatusMap: {
			0: {
				text: '支付失败'
			},
			1: {
				text: '支付成功'
			},
			2: {
				text: '退款中'
			},
			3: {
				text: '已退款'
			}
		},
		statusMap: {
			100: {
				text: '待付款'
			},
			200: {
				text: '待发货'
			},
			300: {
				text: '待收货'
			},
			400: {
				text: '交易完成'
			},
			500: {
				text: '售后中'
			},
			600: {
				text: '交易关闭'
			}
		},
		api: {
			getOrderById: {
				url: '/orders/{id}',
				method: 'get'
			},
			getTeamDetail: {
				url: '/campaign-teams/detail',
				method: 'get'
			}
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		wx.removeStorageSync('teamId')
		wx.removeStorageSync('shareId')
		this.setData({
			userId: wx.getStorageSync('userId')
		})
		if (options.src) {
			this.setData({
				orderId: options.src
			})
			Promise.resolve()
				.then(() => this.getOrderDetail())
				.then(() => this.getTeamDetail())
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},
	getOrderDetail() {
		return new Promise((resolve) => {
			setTimeout(() => {
				http
					.wxRequest({
						...this.data.api.getOrderById,
						urlReplacements: [
							{
								substr: '{id}',
								replacement: this.data.orderId
							}
						]
					})
					.then((res) => {
						this.setData({
							loadingShow: false
						})
						if (res.success) {
							this.setData({
								order: res.data
							})

							resolve()
						}
					})
			}, 3000)
		})
	},
	getTeamDetail() {
		return new Promise((resolve) => {
			if (this.data.order.campaignTeamId && this.data.order.campaignId) {
				const params = {
					id: this.data.order.campaignTeamId,
					campaignId: this.data.order.campaignId
				}
				http
					.wxRequest({
						...this.data.api.getTeamDetail,
						params
					})
					.then((res) => {
						if (res.success) {
							this.setData({
								team: res.data[0]
							})
							resolve()
						}
					})
			} else {
				resolve()
			}
		})
	},
	goOrderDetail() {
		wx.navigateTo({
			url: '/pages_order/order-detail/order-detail?src=' + this.data.orderId
		})
	},
	goHome() {
		wx.switchTab({
			url: '/pages/index/index'
		})
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

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
		Promise.resolve()
			.then(() => this.getOrderDetail())
			.then(() => this.getTeamDetail())
		wx.stopPullDownRefresh()
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},
	// 分享
	onShareAppMessage() {
		if (
			this.data.order.campaignId &&
			this.data.order.campaignTeamId &&
			!this.data.team.isClustering
		) {
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			})
			let shareId = wx.getStorageSync('userId')
			let goodsName = util.ellipsis(this.data.order.orderGoods[0].goodsName, 20)
			let path =
				'/pages_product/product-detail/product-detail?src=' +
				this.data.order.orderGoods[0].goodsId +
				'&shareId=' +
				shareId +
				'&campaignId=' +
				this.data.order.campaignId +
				'&campaignTeamId=' +
				this.data.order.campaignTeamId
			let num = this.data.team.clusteringUserNum - this.data.team.nowUserNum
			return {
				withShareTicket: true,
				title: '【仅剩' + num + '个名额】我正在拼' + goodsName + '快来加入吧！',
				path: path,
				imageUrl: this.data.order.orderGoods[0].listPicUrl
			}
		} else {
			wx.hideShareMenu({
				menus: ['shareAppMessage', 'shareTimeline']
			})
		}
	}
})
