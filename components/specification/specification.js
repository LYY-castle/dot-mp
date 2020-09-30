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
		selectNameValueArr: {
			type: Array,
			value: []
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		// selectNameValueArr: [],
		disabledNameValue: []
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
		// 选中规格
		selectSpecification(e) {
			const option = e.currentTarget.dataset.option
			const parentIndex = e.currentTarget.dataset.parent
			const childIndex = e.currentTarget.dataset.child
			this.data.selectNameValueArr[parentIndex] = option.goodsSpecificationValue
			let goodsSpecificationIds = []
			let goodsSpecificationNameValue = []
			let disabledNameValue = []
			let activeProductNumber = 0
			if (!option.disabled) {
				this.data.products.forEach((pro) => {
					if (
						pro.goodsSpecificationNameValue.indexOf(
							option.goodsSpecificationValue
						) !== -1
					) {
						activeProductNumber += pro.productNumber
					}
					this.data.selectNameValueArr.forEach((selectName) => {
						if (
							pro.goodsSpecificationNameValue.indexOf(selectName) !== -1 &&
							pro.productNumber === 0
						) {
							const disabledArr = pro.goodsSpecificationNameValue.split(';')
							disabledArr.forEach((disabledName) => {
								if (disabledName !== option.goodsSpecificationValue) {
									disabledNameValue.push(disabledName)
								}
							})
						}
					})
				})
				disabledNameValue = Array.from(new Set(disabledNameValue))

				this.setData({
					disabledNameValue: disabledNameValue,
					activeProductNumber
				})
				if (this.data.disabledNameValue.length > 0) {
					this.data.disabledNameValue.forEach((val) => {
						this.data.specificationResults.map((option) => {
							option.goodsSpecificationResults.map((item) => {
								if (item.goodsSpecificationValue === val) {
									item.disabled = true
								} else {
									if (item.disabled) {
										delete item.disabled
									}
								}
							})
						})
					})
				} else {
					this.data.specificationResults.map((option) => {
						option.goodsSpecificationResults.map((item) => {
							if (item.disabled) {
								delete item.disabled
							}
						})
					})
				}

				// 给选中的同类规格加一个active标志,其他同类去除active标志
				this.data.specificationResults[
					parentIndex
				].goodsSpecificationResults.forEach((item, index) => {
					if (index === childIndex) {
						if (item.activeGoodsSpecificationNameValue) {
							delete item.activeGoodsSpecificationNameValue
						} else {
							item.activeGoodsSpecificationNameValue =
								option.goodsSpecificationValue
						}
					} else {
						if (item.activeGoodsSpecificationNameValue) {
							delete item.activeGoodsSpecificationNameValue
						}
					}
				})
				this.setData({
					specificationResults: this.data.specificationResults,
					selectNameValueArr: this.data.selectNameValueArr
				})

				// 遍历得出当前选中的不同类的规格名
				this.data.specificationResults.map((option) => {
					option.goodsSpecificationResults.map((item) => {
						if (item.activeGoodsSpecificationNameValue) {
							goodsSpecificationNameValue.push(item.goodsSpecificationValue)
							goodsSpecificationIds.push(item.goodsSpecificationId)
						}
					})
				})
				// 当规格种类和选中的规格种类数量相同时确定一个产品
				if (
					goodsSpecificationNameValue.length ===
					this.data.specificationResults.length
				) {
					this.data.products.map((pro) => {
						if (pro.goodsSpecificationIds === goodsSpecificationIds.join('_')) {
							this.setData({
								activePic: pro.pictureUrl
									? pro.pictureUrl
									: this.data.goods.listPicUrl, // 产品图
								activeProductNumber: pro.productNumber, //库存
								activePrice:
									this.data.goods.isPromote &&
									tool.isInDurationTime(
										this.data.goods.promoteStart,
										this.data.goods.promoteEnd
									)
										? pro.promotePrice
										: pro.retailPrice,
								productId: pro.id
							})
						}
					})
					this.setData({
						goodsSpecificationIds: goodsSpecificationIds.join('_'),
						goodsSpecificationNameValue: goodsSpecificationNameValue.join(';')
					})
				}
			}
		},
		// 数量修改
		changeNumber(e) {
			if (e.detail <= this.data.activeProductNumber) {
				this.setData({
					number: e.detail
				})
				wx.setStorageSync('activeProductNumber', e.detail)
			} else {
				wx.showToast({
					title: '库存数量不足'
				})
			}
		},
		_operate() {
			const flag = this.data.specificationResults.every((option) => {
				return option.goodsSpecificationResults.some((item) => {
					return item.activeGoodsSpecificationNameValue
				})
			})
			if (flag) {
				const obj = {
					params: {
						activePic: this.data.activePic,
						goodsSpecificationIds: this.data.goodsSpecificationIds,
						goodsSpecificationNameValue: this.data.goodsSpecificationNameValue,
						number: this.data.number,
						productId: this.data.productId,
						retailPrice: this.data.activePrice
					},
					operateType: this.data.operateType
				}
				this.triggerEvent('operate', obj)
			} else {
				wx.showToast({
					title: '请完善规格信息',
					icon: 'none'
				})
			}
		}
	}
})
