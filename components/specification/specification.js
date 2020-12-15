// pages_product/components/specification.js
import tool from '../../utils/mixin.js'
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		// 规格弹框是否显示
		perchaseShow: {
			type: Boolean,
			value: false
		},
		// 当前展示的规格图片
		activePic: {
			type: String,
			value: null
		},
		// 当前展示的规格价格
		activePrice: {
			type: Number,
			value: null
		},
		// 当前选中的库存
		activeProductNumber: {
			type: Number,
			value: null
		},
		// 选中的规格字符串
		goodsSpecificationNameValue: {
			type: String,
			value: null
		},
		// 产品规格分类
		specificationResults: {
			type: null,
			value: null
		},
		// 选中的数量
		number: {
			type: Number,
			value: 1
		},
		// 商品
		goods: {
			type: null,
			value: null
		},
		// 产品
		products: {
			type: null,
			value: null
		},
		// 操作类型
		operateType: {
			type: null,
			value: null
		},
		// 已经选中的规格名
		selectNameValueArr: {
			type: Array,
			value: []
		}
		// se: {
		// 	type: Array,
		// 	value: []
		// }
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		selectOption: [],
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
			let option = {
				parent: e.currentTarget.dataset.parent,
				child: e.currentTarget.dataset.child,
				goodsSpecificationValue:
					e.currentTarget.dataset.option.goodsSpecificationValue,
				goodsSpecificationPicUrl:
					e.currentTarget.dataset.goodsSpecificationPicUrl,
				disabled: false
			}
			this.data.selectOption[option.parent] = option
			this.setData({
				se: this.data.selectOption
			})
			this.data.selectOption.forEach((se) => {})
			if (
				this.data.selectOption.length === this.data.specificationResults.length
			) {
				let selStr = ''
				for (let i = 0; i < this.data.selectOption.length; i++) {
					if (i > 0) {
						selStr += ';' + this.data.selectOption[i].goodsSpecificationValue
					} else {
						selStr += this.data.selectOption[i].goodsSpecificationValue
					}
				}
				for (let j = 0; j < this.data.products.length; j++) {
					if (this.data.products[j].goodsSpecificationNameValue === selStr) {
						this.data.activeProductNumber = this.data.products[j].productNumber
						this.data.activePic = this.data.products[j].pictureUrl
						this.data.activePrice = this.data.goods.isPromote
							? this.data.products[j].promotePrice
							: this.data.products[j].retailPrice
					}
				}
			} else {
				for (let i = 0; i < this.data.selectOption.length; i++) {
					for (let j = 0; j < this.data.products.length; j++) {
						if (this.data.products[j].productNumber === 0) {
							if (
								this.data.products[j].goodsSpecificationNameValue.indexOf(
									this.data.selectOption[i].na
								)
							) {
								for (
									let k = 0;
									k < this.data.specificationResults.length;
									k++
								) {
									if (i !== k) {
										this.data.specificationResults[
											k
										].goodsSpecificationResults.forEach((res) => {
											res.disabled = true
										})
									}
								}
							}
						}
						if (
							this.data.products[j].goodsSpecificationNameValue.indexOf(
								this.data.selectOption[i].na
							) !== -1
						) {
							this.data.activeProductNumber += this.data.products[
								j
							].productNumber
						}
					}
				}
			}
			this.setData({
				activeProductNumber: this.data.activeProductNumber,
				activePic: this.data.activePic,
				activePrice: this.data.activePrice
			})
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
