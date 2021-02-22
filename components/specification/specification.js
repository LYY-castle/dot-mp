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
			value: 0
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
		disabledNameValue: [],
		productId: null,
		goodsSpecificationId: null
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
			if (!e.currentTarget.dataset.disabled) {
				let option = {
					parent: e.currentTarget.dataset.parent,
					child: e.currentTarget.dataset.child,
					goodsSpecificationId:
						e.currentTarget.dataset.option.goodsSpecificationId,
					goodsSpecificationValue:
						e.currentTarget.dataset.option.goodsSpecificationValue,
					goodsSpecificationPicUrl:
						e.currentTarget.dataset.option.goodsSpecificationPicUrl
				}
				let totalNum = 0 // 计算当前选中的总数量
				let currentPic = ''
				let currentPrice = this.data.activePrice
				let selStr = ''
				this.data.selectOption[option.parent] = option
				this.setData({
					selectOption: this.data.selectOption
				})
				// 如果规格选择成功确定一个产品
				if (
					this.data.selectOption.length ===
					this.data.specificationResults.length
				) {
					for (let i = 0; i < this.data.selectOption.length; i++) {
						if (i > 0) {
							selStr += ';' + this.data.selectOption[i].goodsSpecificationValue
						} else {
							selStr += this.data.selectOption[i].goodsSpecificationValue
						}
						this.data.specificationResults[i].goodsSpecificationResults.forEach(
							(res) => {
								res.active = false
								if (
									res.goodsSpecificationValue ===
									this.data.selectOption[i].goodsSpecificationValue
								) {
									res.active = true
								}
							}
						)
					}
					for (let j = 0; j < this.data.products.length; j++) {
						if (this.data.products[j].goodsSpecificationNameValue === selStr) {
							this.data.goodsSpecificationId = this.data.products[
								j
							].goodsSpecificationIds
							totalNum = this.data.products[j].productNumber
							currentPic = this.data.products[j].pictureUrl
							currentPrice = this.data.goods.isPromote
								? this.data.products[j].promotePrice
								: this.data.products[j].retailPrice
							this.data.productId = this.data.products[j].id
						}
					}
				} else {
					// 选择部分规格，未全选完成
					this.data.specificationResults[
						option.parent
					].goodsSpecificationResults.forEach((res) => {
						res.active = false
						if (
							res.goodsSpecificationValue ===
							this.data.selectOption[option.parent].goodsSpecificationValue
						) {
							res.active = true
						}
					})
					this.data.products.forEach((pro) => {
						if (
							pro.goodsSpecificationNameValue.indexOf(
								option.goodsSpecificationValue
							) !== -1 &&
							pro.productNumber > 0
						) {
							totalNum += pro.productNumber
						}
					})
				}
				this.setData({
					activeProductNumber: totalNum,
					activePic: currentPic ? currentPic : this.data.activePic,
					activePrice: currentPrice,
					specificationResults: this.data.specificationResults,
					goodsSpecificationNameValue: selStr,
					productId: this.data.productId,
					goodsSpecificationIds: this.data.goodsSpecificationId
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
			let flag = false
			if (
				this.data.selectOption.length ===
					this.data.specificationResults.length &&
				this.data.productId
			) {
				flag = true
			}
			if (flag) {
				if (this.data.activeProductNumber > 0) {
					const obj = {
						params: {
							activePic: this.data.activePic,
							goodsSpecificationIds: this.data.goodsSpecificationIds,
							goodsSpecificationNameValue: this.data
								.goodsSpecificationNameValue,
							number: this.data.number,
							productId: this.data.productId,
							retailPrice: this.data.activePrice
						},
						operateType: this.data.operateType
					}
					this.triggerEvent('operate', obj)
				} else {
					wx.showToast({
						title: '暂时无货',
						icon: 'none'
					})
				}
			} else {
				wx.showToast({
					title: '请完善规格信息',
					icon: 'none'
				})
			}
		}
	}
})
