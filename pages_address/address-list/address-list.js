// pages/mine/address/address-list/address-list.js
import http from '../../utils/request.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		nbTitle: '收货地址',
		list: [],
		pageNo: 1,
		disabledList: [],
		pathParams: null,
		editAddressId: null,
		api: {
			getAddressList: {
				url: '/user-addressees',
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
		this.getMyAddressList()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		const fromPath = wx.getStorageSync('fromPath')
		if (fromPath === 'mine') {
			wx.removeStorageSync('fromPath')
			wx.switchTab({
				url: '/pages/mine/mine'
			})
		} else {
			wx.navigateTo({
				url: '/pages_product/perchase/perchase'
			})
		}
	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		console.log('到底了')
	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {},
	// 获取当前用户的收货地址
	getMyAddressList() {
		const params = {
			userId: wx.getStorageSync('userId'),
			pageSize: 10,
			pageNo: this.data.pageNo
		}
		http.wxRequest({ ...this.data.api.getAddressList, params }).then((res) => {
			if (res.success) {
				if (res.data && res.data.length > 0) {
					res.data.forEach((element) => {
						const addressStr = JSON.parse(element.address)
						element.addressObject = element.address
						element.tel = element.phone
						element.address =
							addressStr.province +
							addressStr.city +
							addressStr.county +
							addressStr.addressDetail
						element.isDefault = element.isDefault === 1
						element.bigName = element.name.substring(0, 1)
					})
					if (params.pageNo === 1) {
						this.setData({
							list: res.data
						})
					} else {
						this.setData({
							list: this.data.list.concat(res.data)
						})
					}
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
		console.log(e)
		const fromPath = wx.getStorageSync('fromPath')
		if (fromPath === 'mine') {
			console.log('mine')
		} else {
			const option = e.currentTarget.dataset.option
			let addressList = wx.getStorageSync('addressList')
			const activeAddressId = wx.getStorageSync('activeAddressId')
			if (activeAddressId) {
				wx.removeStorageSync('activeAddressId')
				addressList.forEach((address, index) => {
					console.log(address.id, option.id)
					if (address.id === activeAddressId) {
						addressList.splice(index, 1, option)
					}
				})
			} else {
				addressList.push(option)
			}
			addressList = Array.from(new Set(addressList))
			wx.setStorageSync('addressList', addressList)
			wx.navigateTo({
				url: '../../pages_product/perchase/perchase'
			})
		}
	}
})
