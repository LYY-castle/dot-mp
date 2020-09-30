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
		province: null,
		city: null,
		district: null,
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
		if (result.province && result.city && result.area) {
			this.setData({
				region: [result.province, result.city, result.area],
				addressStr: result.province + '/' + result.city + '/' + result.area,
				province: Number(result.code.substring(0, 2) + '0000'),
				city: Number(result.code.substring(0, 4) + '00'),
				district: result.code,
				name: result.name,
				mobile: result.mobile,
				address: result.details
			})
		} else {
			wx.showToast({
				title: '省市区信息不完整',
				icon: 'none'
			})
		}
	},
	formSubmit(e) {
		const option = e.detail.value
		// // 新增
		const params = {
			province: Number(this.data.province),
			city: Number(this.data.city),
			district: Number(this.data.district),
			name: option.name,
			mobile: option.mobile,
			address: option.address,
			userId: wx.getStorageSync('userId'),
			isDefault: option.isDefault ? 1 : 0
		}
		if (option.name) {
			if (option.mobile) {
				if (isMobile(option.mobile)) {
					if (this.data.province && this.data.city && this.data.district) {
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
												duration: 2000,
												success() {
													wx.navigateBack({
														delta: 1
													})
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
												duration: 2000,
												success() {
													wx.navigateBack({
														delta: 1
													})
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
		const address = e.detail.value
		const code = e.detail.code
		this.setData({
			region: address,
			addressStr: address[0] + '/' + address[1] + '/' + address[2],
			province: code[0],
			city: code[1],
			district: code[2]
		})
	},
	cancel() {
		this.setData({
			addressShow: false
		})
	},
	deleteAddress() {
		const _this = this
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
									duration: 2000,
									success() {
										wx.navigateBack({
											delta: 1
										})
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
					this.setData({
						name: option.name,
						mobile: option.mobile,
						address: option.address,
						province: option.province,
						city: option.city,
						district: option.district,
						isDefault: option.isDefault === 1,
						addressStr:
							option.provinceName +
							'/' +
							option.cityName +
							'/' +
							option.districtName,
						region: [option.provinceName, option.cityName, option.districtName]
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
	},
	// 下拉
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	}
})
