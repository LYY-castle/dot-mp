// pages/mine/address/address-list/address-list.js
import http from '../../utils/request'
import tool from '../../utils/mixin'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		nbTitle: '收货地址',
		mainActiveIndex: 0,
		activeId: null,
		empty: '/static/img/empty.png',
		addressList: null,
		list: [],
		pageNo: 1,
		disabledList: [],
		pathParams: null,
		editAddressId: null,
		bottomLineShow: false,
		api: {
			getAddressList: {
				url: '/user-address',
				method: 'get'
			}
		}
	},
	// onLoad() {
	// 	this.setData({
	// 		pageNo: 1
	// 	})
	// 	this.getMyAddressList()
	// },
	onShow() {
		this.setData({
			pageNo: 1
		})
		this.getMyAddressList()
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		// wx.navigateBack({
		// 	delta: 1
		// })
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		if (!this.data.bottomLineShow) {
			this.setData({
				pageNo: this.data.pageNo + 1
			})
			this.getMyAddressList()
		}
	},
	// 获取当前用户的收货地址
	getMyAddressList() {
		const params = {
			userId: wx.getStorageSync('userId'),
			pageSize: 10,
			pageNo: this.data.pageNo
		}
		http.wxRequest({ ...this.data.api.getAddressList, params }).then((res) => {
			if (res.success) {
				res.data.forEach((item) => {
					item.bigName = item.name.substring(0, 1)
				})
				if (params.pageNo === 1) {
					this.setData({
						list: res.data
					})
				} else {
					this.setData({
						list: this.data.res.data.concat(res.data)
					})
				}
				if (res.data.length > 0) {
					if (params.pageNo === res.page.totalPage) {
						this.setData({
							bottomLineShow: true
						})
					}
				} else {
					this.setData({
						bottomLineShow: false
					})
				}
			}
		})
	},
	onEdit(event) {
		const option = event.currentTarget.dataset.option
		wx.navigateTo({
			url: '../add-address/add-address?src=' + option
		})
	},
	onAdd() {
		wx.navigateTo({
			url: '../add-address/add-address'
		})
	},
	selectAddress(e) {
		const option = e.currentTarget.dataset.option
		if (
			wx.getStorageSync('activeAddressId') ||
			wx.getStorageSync('addAddress')
		) {
			wx.setStorageSync('activeAddressId', option.id)
			wx.redirectTo({
				url: '/pages_product/perchase/perchase'
			})
		}
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	}
})
