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
		bottomLineShow: true,
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
		const fromPath = wx.getStorageSync('fromPath')
		wx.navigateBack({
			delta: 1
		})
		// if (fromPath === 'mine') {
		// 	wx.removeStorageSync('fromPath')
		// 	wx.switchTab({
		// 		url: '/pages/mine/mine'
		// 	})
		// } else {
		// 	wx.navigateTo({
		// 		url: '/pages_product/perchase/perchase'
		// 	})
		// }
	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {
		console.log('到底了')
		if (!this.data.bottomLineShow) {
			this.setData({
				pageNo: this.data.pageNo + 1
			})
			this.getMyAddressList()
		}
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
				let num = 0
				if (res.data && res.data.length > 0) {
					let deatElement = async (element) => {
						element.province = await tool
							.getProvince(element.provinceId)
							.then((p) => {
								console.log(num)
								return p.name
							})
						element.city = await tool
							.getCity(element.provinceId, element.cityId)
							.then((c) => {
								console.log(num, c)
								return c.name
							})
						element.area = await tool
							.getArea(element.cityId, element.districtId)
							.then((a) => {
								console.log(num, a)
								return a.name
							})
						element.isDefault = element.isDefault === 1
						element.bigName = element.name.substring(0, 1)
					}
					const dealData = async () => {
						for (let i = 0; i < res.data.length; i++) {
							num++
							await deatElement(res.data[i])
						}
					}
					Promise.resolve()
						.then(() => dealData())
						.then(() => {
							if (params.pageNo === 1) {
								this.setData({
									list: res.data
								})
							} else {
								this.setData({
									list: this.data.list.concat(res.data)
								})
							}
							if (params.pageNo === res.page.totalPage) {
								this.setData({
									bottomLineShow: true
								})
							}
							console.log(this.data.list)
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
				url: '/pages_product/perchase/perchase'
			})
		}
	}
})
