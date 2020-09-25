// pages_product/components/specification.js
import tool from '../../utils/mixin.js'
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		perchaseShow: {
			type: Boolean,
			value: false
		},
		activePic: {
			type: String,
			value: null
		},
		activePrice: {
			type: Number,
			value: null
		},
		activeProductNumber: {
			type: Number,
			value: null
		},
		goodsSpecificationNameValue: {
			type: String,
			value: null
		},
		specificationResults: {
			type: null,
			value: null
		},
		number: {
			type: Number,
			value: 1
		},
		goods: {
			type: null,
			value: null
		},
		products: {
			type: null,
			value: null
		},
		operateType: {
			type: null,
			value: null
		},
		specArray: {
			type: Array,
			value: []
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		activeProduct: null
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		popClose() {
			this.setData({
				perchaseShow: false
			})
		},
		deleteItem(item, list) {
			list.splice(list.indexOf(item), 1)
		},
		onChangeSpec(event) {
			const { specArray } = this.data
			specArray[event.currentTarget.dataset.index] = event.detail
			this.setData({
				specArray
			})
			console.log()
			let activeTotalNumber = 0
			if (specArray.length > 0) {
				if (specArray.length === this.data.specificationResults.length) {
					this.data.products.forEach((pro) => {
						if (
							pro.goodsSpecificationNameValue.indexOf(
								specArray[event.currentTarget.dataset.index]
							) !== -1
						) {
							if (pro.productNumber === 0) {
								const arr = pro.goodsSpecificationNameValue.split(';')
								this.deleteItem(
									specArray[event.currentTarget.dataset.index],
									arr
								)
								console.log(arr)
								for (let i = 0; i < arr.length; i++) {
									this.data.specificationResults.forEach((speci) => {
										speci.goodsSpecificationResults.forEach((speciItem) => {
											if (arr.includes(speciItem.goodsSpecificationValue)) {
												speciItem.disabled = true
											}
										})
									})
								}
								console.log(
									'this.data.specificationResults',
									this.data.specificationResults
								)
							} else {
								const arr = pro.goodsSpecificationNameValue.split(';')
								this.deleteItem(
									specArray[event.currentTarget.dataset.index],
									arr
								)
								for (let i = 0; i < arr.length; i++) {
									this.data.specificationResults.forEach((speci) => {
										speci.goodsSpecificationResults.forEach((speciItem) => {
											if (arr[i] === speciItem.goodsSpecificationValue) {
												if (speciItem.disabled) {
													delete speciItem.disabled
												}
											}
										})
									})
								}
							}
							this.setData({
								specificationResults: this.data.specificationResults,
								activePic: pro.pictureUrl
									? pro.pictureUrl
									: this.data.goods.listPicUrl,
								activePrice: this.data.goods.isPromote
									? pro.promotePrice
									: pro.retailPrice,
								activeProductNumber: pro.productNumber,
								number: 1
							})
							console.log(this.data)
						}
					})
				} else {
					if (specArray.length === 1) {
						this.data.products.forEach((pro) => {
							if (
								pro.goodsSpecificationNameValue.indexOf(
									specArray[event.currentTarget.dataset.index]
								) !== -1
							) {
								if (pro.productNumber === 0) {
									const arr = pro.goodsSpecificationNameValue.split(';')
									this.deleteItem(
										specArray[event.currentTarget.dataset.index],
										arr
									)
									for (let i = 0; i < arr.length; i++) {
										this.data.specificationResults.forEach((speci) => {
											speci.goodsSpecificationResults.forEach((speciItem) => {
												if (arr[i] === speciItem.goodsSpecificationValue) {
													speciItem.disabled = true
												}
											})
										})
									}
								} else {
									const arr = pro.goodsSpecificationNameValue.split(';')
									this.deleteItem(
										specArray[event.currentTarget.dataset.index],
										arr
									)
									for (let i = 0; i < arr.length; i++) {
										this.data.specificationResults.forEach((speci) => {
											speci.goodsSpecificationResults.forEach((speciItem) => {
												if (arr[i] === speciItem.goodsSpecificationValue) {
													if (speciItem.disabled) {
														delete speciItem.disabled
													}
												}
											})
										})
									}
								}
								activeTotalNumber += pro.productNumber
							}
						})
					} else if (specArray.length > 1) {
						this.data.products.forEach((pro) => {
							if (
								pro.goodsSpecificationNameValue.indexOf(specArray.join(';')) !==
								-1
							) {
								activeTotalNumber += pro.productNumber
							}
						})
					}
					this.setData({
						specificationResults: this.data.specificationResults,
						activePic: this.data.goods.listPicUrl,
						activePrice: this.data.goods.isPromote
							? this.data.goods.promotePrice
							: this.data.goods.retailPrice,
						activeProductNumber: activeTotalNumber,
						number: 1
					})
					console.log(this.data)
				}
			}
		},
		// 数量修改
		changeNumber(e) {
			if (e.detail <= this.data.activeProductNumber) {
				wx.setStorageSync('activeProductNumber', e.detail)
				this.setData({
					number: e.detail
				})
			} else {
				this.setData({
					number: this.data.number
				})
				wx.showToast({
					title: '库存数量不足',
					icon: 'none'
				})
			}
		},
		_operate() {
			const nameArr = this.data.specificationResults.map((speci) => {
				return speci.specificationName
			})
			let numberFlag = false
			const flag = nameArr.every((name, i) => {
				if (!this.data.specArray[i]) {
					wx.showToast({
						title: '请选择' + name,
						icon: 'none'
					})
				}
				return this.data.specArray[i]
			})
			if (this.data.number <= this.data.activeProductNumber) {
				numberFlag = true
			} else {
				wx.showToast({
					title: '库存数量不足',
					icon: 'none'
				})
			}
			console.log(this.data.number, this.data.activeProductNumber)
			if (flag && numberFlag) {
				let nameValue = this.data.specArray.join(';')
				let activeProduct = null
				this.data.products.forEach((pro) => {
					if (pro.goodsSpecificationNameValue === nameValue) {
						activeProduct = pro
					}
				})
				const obj = {
					params: {
						activePic: this.data.activePic,
						goodsSpecificationIds: activeProduct.goodsSpecificationIds,
						goodsSpecificationNameValue:
							activeProduct.goodsSpecificationNameValue,
						number: this.data.number,
						productId: activeProduct.id,
						retailPrice:
							this.data.goods.isPromote &&
							tool.isInDurationTime(
								this.data.goods.promoteStart,
								this.data.goods.promoteEnd
							)
								? activeProduct.promotePrice
								: activeProduct.retailPrice
					},
					operateType: this.data.operateType
				}
				console.log(obj)
				this.triggerEvent('operate', obj)
			}
		}
	}
})
