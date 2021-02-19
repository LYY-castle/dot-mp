// components/address-list/addressList.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		addressShow: {
			type: Boolean,
			value: false
		},
		addressListData: {
			type: Array,
			value: []
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {},
	/**
	 * 组件的方法列表
	 */
	methods: {
		closeAddressPop() {
			this.setData({
				addressShow: false
			})
		},
		addAddress() {
			wx.navigateTo({
				url: '/pages_address/add-address/add-address'
			})
		},
		selectAddress(option) {
			console.log(option)
			const addressId = option.currentTarget.dataset.option.id
			wx.setStorageSync('activeAddressId', addressId)
			this.triggerEvent('selectAddressItem')
		}
	}
})
