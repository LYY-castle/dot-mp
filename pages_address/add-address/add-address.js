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
		addressOption: null,
		addressDetail: '',
		addressInfoText: '',
		addressShow: false,
		buttonText: '',
		deleteButtonShow: false,
		addressId: null,
		addressById: null,
		multiArray: [], // 三维数组数据
		multiIndex: [0, 0, 0], // 默认的下标,
		currnetCityQueryId: null,
		currnetAreaQueryId: null,
		provinceList: [],
		provinceArr: [],
		pCode: null,
		cityCode: null,
		adCode: null,
		cityList: [],
		cityArr: [],
		areaList: [],
		areaArr: [],
		provinceId: null,
		cityId: null,
		areaId: null,
		step: 0, // 默认显示请选择
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
			},
			getAddressData: {
				url: '/regions',
				method: 'get'
			},
			getCity: {
				url: '/regions/{id}',
				method: 'get'
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
		this.setData({
			name: result.name,
			mobile: result.mobile,
			address: result.province + '/' + result.city + '/' + result.area,
			addressDetail: result.details,
			addressOption: {
				province: result.province,
				city: result.city,
				county: result.area,
				addressInfoText: ''
			}
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
	confirm(e) {
		console.log(e)
		let address = e.detail.values
		this.setData({
			addressOption: {
				province: address[0].name,
				city: address[1].name,
				county: address[2].name
			}
		})
		let addressStr = ''
		for (let i = 0; i < address.length; i++) {
			if (i < 2) {
				addressStr += address[i].name + '/'
			} else {
				addressStr += address[i].name
			}
		}
		this.setData({
			addressShow: false,
			address: addressStr
		})
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

		this.getProvince()
	},
	columnchange(e) {
		// 滚动选择器 触发的事件
		// console.log(e)
		var column = e.detail.column // 当前改变的列
		var data = {
			multiIndex: JSON.parse(JSON.stringify(this.data.multiIndex)),
			multiArray: JSON.parse(JSON.stringify(this.data.multiArray))
		}
		data.multiIndex[column] = e.detail.value // 第几列改变了就是对应multiIndex的第几个，更新它
		switch (
			column // 处理不同的逻辑
		) {
			case 0: // 第一列更改 就是省级的更改
				var currnetCityQueryId = this.data.provinceList[e.detail.value].id
				if (e.detail.value !== 0) {
					// 判断当前的value值是不是真正的更新了
					if (this.data.provinceList[e.detail.value].id) {
						// 当前的市的查询id
						this.getCity(currnetCityQueryId) // 获取当前市的查询id下面的市级数据
					}
					this.setData({
						pCode: this.data.provinceList[e.detail.value].code, // 获取当前选择项的站点查询code
						cityCode: '',
						adCode: ''
					})
				} else {
					this.getProvince() // 重新调用获取省数据，以清空市和区的列表
					this.setData({
						multiArray: [this.data.provinceArr, [], []],
						pCode: this.data.provinceList[e.detail.value].code, // 获取当前选择项的站点查询code
						cityCode: '',
						adCode: ''
					})
				}
				data.multiIndex[1] = 0 // 将市默认选择第一个
				break

			case 1: // 市发生变化
				var currnetAreaQueryId = this.data.cityList[e.detail.value].id
				if (e.detail.value !== 0) {
					// 同样判断
					if (this.data.cityList[e.detail.value].id) {
						this.getArea(currnetAreaQueryId) // 获取区
					}
					this.setData({
						cityCode: this.data.cityList[e.detail.value].code, // 获取当前选择项的站点查询code
						adCode: ''
					})
				} else {
					this.getCity(this.data.currnetCityQueryId) // 使用当前省列表中获取到的市列表查询id重新调用，以更新（置空）区的列表
					this.setData({
						multiArray: [this.data.provinceArr, [], []],
						cityCode: this.data.cityList[e.detail.value].code, // 获取当前选择项的站点查询code
						adCode: ''
					})
				}
				data.multiIndex[2] = 0 // 门店默认为第一个
				break
			case 2:
				this.setData({
					adCode: this.data.areaList[e.detail.value].code // 获取当前选择项的站点查询code
				})
		}
		this.setData(data) // 更新数据
	},
	pickchange(e) {
		const multiIndex = e.detail.value
		this.setData({
			step: 1, // 有数据时显示当前已选择的省市区
			multiIndex, // 更新下标字段
			addressById:
				this.data.multiArray[0][multiIndex[0]] +
				'/' +
				this.data.multiArray[1][multiIndex[1]] +
				'/' +
				this.data.multiArray[2][multiIndex[2]],
			provinceId: this.data.provinceList[multiIndex[0]].id,
			cityId: this.data.cityList[multiIndex[1]].id,
			areaId: this.data.areaList[multiIndex[2]].id
		})
	},
	bindRegionChange(e) {
		console.log(e)
	},
	getProvince() {
		const that = this
		const params = {
			parentId: 1,
			pageSize: 100,
			pageNo: 1
		}
		http.wxRequest({ ...that.data.api.getAddressData, params }).then((res) => {
			if (res.success) {
				var data = res.data
				var provinceList = [...data] // 放在一个数组里面，在数组前边添加一个清空选项
				provinceList.unshift({
					id: '',
					code: '',
					name: '全部省份',
					parentId: '',
					type: ''
				})
				var provinceArr = data.map((item) => {
					return item.name
				}) // 获取数据里面的value值，就是只用数据的名称用于页面展示
				provinceArr.unshift('全部省份') // 在页面展示用的也需要添加一个清空项
				that.setData({
					multiArray: [provinceArr, ['全部市'], ['全部区']], // 更新三维数组 更新后长这样 [['全部省', '北京省',......],["全部市"],["全部区"]]
					provinceList, // 省级原始数据
					provinceArr, // 省级所有的名称用于页面展示
					pCode: provinceList[0].code // 用于查询收费站点的查询code，添加清空项后不需要该操作，都可
				})
				var defaultId = that.data.provinceList[0].id // 使用第一项当作参数获取市级数据，添加清空项后不需要该操作，都可
				if (defaultId) {
					that.setData({
						currnetCityQueryId: defaultId // 保存市的查询id，用于后边的查询市操作
					})
					that.getCity(defaultId) // 获取市级数据
				}
			}
		})
	},
	getCity(id) {
		this.setData({
			currnetCityQueryId: id // 保存当前选择的市级id
		})
		const that = this
		const params = {
			parentId: id,
			pageSize: 100,
			pageNo: 1
		}
		http.wxRequest({ ...that.data.api.getAddressData, params }).then((res) => {
			if (res.success) {
				var data = res.data
				var cityList = [...data]
				cityList.unshift({
					id: '',
					code: '',
					name: '全部市',
					parentId: '',
					type: ''
				})
				var cityArr = data.map((item) => {
					return item.name
				})
				cityArr.unshift('全部市')
				that.setData({
					multiArray: [that.data.provinceArr, cityArr, ['全部区']], // 更新三维数组 更新后长这样 [['全部省', '北京省',......],["全部市","北京市"],["全部区"]]
					cityList, // 保存下市级原始数据
					cityArr, // 市级所有的名称
					cityCode: cityList[0].code // 用于查询收费站点的查询code，添加清空项后不需要该操作，都可
				})
				var defaultId = that.data.cityList[0].id // 用第一个获取门店数据，添加清空项后不需要该操作，都可
				if (defaultId) {
					that.setData({
						currnetAreaQueryId: defaultId // 保存区的查询id，用于后边的查询区操作
					})
					that.getArea(defaultId) // 获取区数据
				}
			}
		})
	},
	getArea(id) {
		this.setData({
			currnetAreaQueryId: id // 更新当前选择的市级id
		})
		const that = this
		const params = {
			parentId: id,
			pageSize: 100,
			pageNo: 1
		}
		http.wxRequest({ ...that.data.api.getAddressData, params }).then((res) => {
			if (res.success) {
				var data = res.data
				var areaList = [...data]
				areaList.unshift({
					id: '',
					code: '',
					name: '全部区',
					parentId: '',
					type: ''
				})
				var areaArr = data.map((item) => {
					return item.name
				})
				areaArr.unshift('全部区')
				that.setData({
					multiArray: [that.data.provinceArr, that.data.cityArr, areaArr], // 重新赋值三级数组 此时的数组大概是这样 [['全部省', '北京省',......],["全部市","北京市"],["全部区","朝阳区","海淀区"......]]
					areaList, // 保存区原始数据
					areaArr, // 保存区名称
					adCode: areaList[0].code // 用于查询收费站点的查询code
				})
			}
		})
	}
})
