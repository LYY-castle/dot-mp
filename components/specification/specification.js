// pages_product/components/specification.js
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
			let goodsSpecificationIds = []
			let goodsSpecificationNameValue = []
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
				specificationResults: this.data.specificationResults
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
							activePrice: this.data.goods.isPromote
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
			} else {
				this.setData({
					activePic: this.data.goods.listPicUrl,
					activePrice: this.data.goods.isPromote
						? this.data.goods.promotePrice
						: this.data.goods.retailPrice,
					activeProductNumber: this.data.goods.goodsNumber,
					goodsSpecificationIds: '',
					goodsSpecificationNameValue: ''
				})
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
						retailPrice: this.data.goods.idPromote
							? this.data.goods.promotePrice
							: this.data.goods.retailPrice
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
