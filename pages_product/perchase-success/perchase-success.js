// pages_product/perchase-success/perchase-success.js
import http from '../../utils/request.js'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		nbTitle: '支付',
		order: null,
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
			}
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		if (options.src) {
			this.setData({
				orderId: options.src
			})
			this.getOrderDetail()
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},
	getOrderDetail() {
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
				if (res.success) {
					this.setData({
						order: res.data
					})
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
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
