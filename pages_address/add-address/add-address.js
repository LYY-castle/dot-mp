import http from '../../utils/request'
import areaList from '../../utils/area'
import tool from '../../utils/mixin'
import AddressParse from '../../miniprogram_npm/address-parse/index'
import { isMobile } from '../../utils/validate'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		areaList,
		nbTitle: '',
		pathParams: {},
		textareaHeight: { minHeight: 50 },
		isDefault: false,
		name: '',
		mobile: '',
		address: '',
		addressArr: null,
		addressOption: null,
		addressInfoText: '',
		addressShow: false,
		buttonText: '',
		deleteButtonShow: false,
		addressId: null,
		region: [],
		api: {
			addAddress: {
				url: '/user-address',
				method: 'post'
			},
			updateAddress: {
				url: '/user-address',
				method: 'put'
			},
			getAddressDetail: {
				url: '/user-address/{id}',
				method: 'get'
			},
			deleteAddress: {
				url: '/user-address/{ids}',
				method: 'delete'
			}
		}
	},
	isDefaultToggle() {
		this.setData({
			isDefault: !this.data.isDefault
		})
	},
	// 地址识别
	distinguish() {
		const [result] = AddressParse.parse(this.data.addressInfoText, true)
		console.log(result)
		// if()
		this.setData({
			// region:
			name: result.name,
			mobile: result.mobile,
			address: result.details
		})
	},
	formSubmit(e) {
		const option = e.detail.value
		// // 新增
		const params = {
			provinceId: this.data.provinceId,
			cityId: this.data.cityId,
			districtId: this.data.areaId,
			name: option.name,
			mobile: option.mobile,
			address: option.address,
			userId: wx.getStorageSync('userId'),
			isDefault: option.isDefault ? 1 : 0
		}
		console.log(params)
		if (option.name) {
			if (option.mobile) {
				if (isMobile(option.mobile)) {
					if (this.data.provinceId) {
						if (option.address) {
							if (this.data.addressId) {
								// 编辑
								params.id = this.data.addressId
								http
									.wxRequest({ ...this.data.api.updateAddress, params })
									.then((res) => {
										if (res.success) {
											wx.showToast({
												title: '编辑成功',
												success() {
													setTimeout(function () {
														wx.navigateBack({
															delta: 1
														})
													}, 1000)
												}
											})
										}
									})
							} else {
								// 新增
								http
									.wxRequest({ ...this.data.api.addAddress, params })
									.then((res) => {
										if (res.success) {
											wx.showToast({
												title: '新增成功',
												success() {
													setTimeout(function () {
														wx.navigateBack({
															delta: 1
														})
													}, 1000)
												}
											})
										}
									})
							}
						} else {
							wx.showToast({
								title: '详细地址不能为空',
								icon: 'none'
							})
						}
					} else {
						wx.showToast({
							title: '请选择省市区',
							icon: 'none'
						})
					}
				} else {
					wx.showToast({
						title: '手机号格式错误',
						icon: 'none'
					})
				}
			} else {
				wx.showToast({
					title: '手机号不能为空',
					icon: 'none'
				})
			}
		} else {
			wx.showToast({
				title: '姓名不能为空',
				icon: 'none'
			})
		}
	},
	selectAddress() {
		this.setData({
			addressShow: true
		})
	},
	bindRegionChange(e) {
		console.log(e)
		let address = e.detail.value
		this.setData({
			region: address,
			addressArr: address[0] + '/' + address[1] + '/' + address[2]
			// addressOption: {

			// province: address[0].name,
			// city: address[1].name,
			// county: address[2].name
			// }
		})
		// let addressStr = ''
		// for (let i = 0; i < address.length; i++) {
		// 	if (i < 2) {
		// 		addressStr += address[i].name + '/'
		// 	} else {
		// 		addressStr += address[i].name
		// 	}
		// }
		// this.setData({
		// 	addressShow: false,
		// 	address: addressStr
		// })
	},
	cancel() {
		this.setData({
			addressShow: false
		})
	},
	deleteAddress() {
		const _this = this
		console.log(_this.data.addressId)
		wx.showModal({
			title: '确定删除？',
			success(res) {
				if (res.confirm) {
					http
						.wxRequest({
							..._this.data.api.deleteAddress,
							urlReplacements: [
								{ substr: '{ids}', replacement: _this.data.addressId }
							]
						})
						.then((res) => {
							if (res.success) {
								wx.showToast({
									title: '删除成功',
									success() {
										setTimeout(function () {
											wx.navigateBack({
												delta: 1
											})
										}, 1000)
									}
								})
							}
						})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	getAddressDetail() {
		http
			.wxRequest({
				...this.data.api.getAddressDetail,
				urlReplacements: [{ substr: '{id}', replacement: this.data.addressId }]
			})
			.then((res) => {
				if (res.success) {
					const option = res.data
					let province, city, area
					const dealData = async () => {
						province = await tool.getProvince(option.provinceId).then((p) => {
							return p.name
						})
						city = await tool
							.getCity(option.provinceId, option.cityId)
							.then((c) => {
								return c.name
							})
						area = await tool
							.getArea(option.cityId, option.districtId)
							.then((a) => {
								return a.name
							})
					}
					Promise.resolve()
						.then(() => dealData())
						.then(() => {
							this.setData({
								name: option.name,
								mobile: option.mobile,
								address: option.address,
								provinceId: option.provinceId,
								cityId: option.cityId,
								areaId: option.districtId,
								isDefault: option.isDefault === 1,
								addressById: province + '/' + city + '/' + area
							})
						})
				}
			})
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const _this = this
		if (options.src) {
			_this.setData({
				addressId: options.src,
				nbTitle: '编辑收货地址',
				deleteButtonShow: true
			})
			_this.getAddressDetail()
		} else {
			_this.setData({
				nbTitle: '新增收货地址'
			})
		}
	}
})
