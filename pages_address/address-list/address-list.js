// pages/mine/address/address-list/address-list.js
import http from '../../utils/request.js'

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
		step: 0, // 默认显示请选择
		api: {
			getAddressList: {
				url: '/user-address',
				method: 'get'
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
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			pageNo: 1
		})
		this.getMyAddressList()
		this.getProvince()
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
				console.log(res)
				if (res.data && res.data.length > 0) {
					res.data.forEach((element) => {
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
					if (params.pageNo === res.page.totalPage) {
						this.setData({
							bottomLineShow: true
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
		console.log('e====', e)
		this.setData({
			step: 1, // 有数据时显示当前已选择的省市区
			multiIndex: e.detail.value // 更新下标字段
		})
		console.log('multiArray===', this.data.multiArray)
		console.log('multiIndex===', this.data.multiIndex)
		console.log('province===', this.data.provinceList)
		console.log('city===', this.data.cityList)
		console.log('area===', this.data.areaList)
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
