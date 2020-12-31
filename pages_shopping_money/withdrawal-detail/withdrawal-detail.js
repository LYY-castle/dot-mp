// shopping_money/withdrawal_list/withdrawal-list.js
import { isMobile, isIDNumber, isBankCard } from '../../utils/validate'
import env from '../../config/env.config'
import constantCfg from '../../config/constant'
import http from '../../utils/request'
import utils from '../../utils/util'
import tool from '../../utils/mixin'
import bankInfo from '../../utils/bankInfo'
var list = []
const city = require('../../utils/city.js') //根据自己的文件目录选择路径
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		shoppingMoneyData: {},
		backImage: null,
		frontImage: null,
		idCardReverse: null,
		idCardFront: null,
		bankName: null,
		front: '/static/img/front.png',
		back: '/static/img/back.png',
		userInfo: {},
		addressStr: null,
		multiIndex: [0, 0],
		multiArray: city.multiArray, //引入city.js中定义的数组
		objectMultiArray: city.objectMultiArray,
		api: {
			withdrawals: {
				url: '/withdrawals',
				method: 'post'
			},
			getShoppingMoney: {
				url: '/user-shopping-accounts',
				method: 'get'
			},
			getLastData: {
				url: '/withdrawals/last',
				method: 'get'
			}
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.getShoppingMoney()
		this.getLastData()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},
	getShoppingMoney() {
		http.wxRequest({ ...this.data.api.getShoppingMoney }).then((res) => {
			if (res.success) {
				if (res.data) {
					this.setData({
						shoppingMoneyData: res.data
					})
				} else {
					this.setData({
						shoppingMoneyData: null
					})
				}
			}
		})
	},
	withdrawalAll() {
		this.data.userInfo.totalAmount = this.data.shoppingMoneyData.canWithdrawAmount
		this.setData({
			userInfo: this.data.userInfo
		})
	},
	getLastData() {
		http
			.wxRequest({
				...this.data.api.getLastData,
				params: { userId: wx.getStorageSync('userId') }
			})
			.then((res) => {
				if (res.success) {
					if (res.data) {
						this.data.userInfo.idCard = res.data.idCard
						this.data.userInfo.bankAccount = res.data.bankAccount
						this.data.userInfo.openingBank = res.data.openingBank
						this.data.userInfo.bankName = res.data.bankName
						this.data.userInfo.phone = res.data.phone
						this.data.userInfo.name = res.data.name
						this.data.addressStr = res.data.openingProvince
							? res.data.openingProvince + '/' + res.data.openingCity
							: null
						this.setData({
							idCardReverse: res.data.idCardReverse,
							idCardFront: res.data.idCardFront,
							userInfo: this.data.userInfo,
							addressStr: this.data.addressStr
						})
						const viewFrontParam = {
							bucketName: constantCfg.minio.bucketName,
							fileName: res.data.idCardFront
						}
						const viewBackParam = {
							bucketName: constantCfg.minio.bucketName,
							fileName: res.data.idCardReverse
						}
						tool.review(viewFrontParam).then((result) => {
							this.setData({
								frontImage: result.data
							})
						})
						tool.review(viewBackParam).then((result) => {
							this.setData({
								backImage: result.data
							})
						})
					}
					console.log(res.data)
				}
			})
	},
	// 自动识别银行名称
	bankAccountChange(e) {
		const _this = this
		wx.request({
			url:
				'https://ccdcapi.alipay.com/validateAndCacheCardInfo.json?_input_charset=utf-8&cardNo=' +
				e.detail.value +
				'&cardBinCheck=true',
			success: function (res) {
				console.log(res.data.bank)
				const bankData = bankInfo.bankcardList
				for (let i = 0; i < bankData.length; i++) {
					if (res.data.bank === bankData[i].bankCode) {
						_this.data.userInfo = { ..._this.data.userInfo }
						_this.data.userInfo.bankName = bankData[i].bankName
						_this.setData({
							userInfo: _this.data.userInfo
						})
						break
					}
				}
				console.log(_this.data.userInfo)
			}
		})
	},
	getFrontImage() {
		const _this = this
		wx.chooseImage({
			count: 1, //选择数量
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				//图片的临时路径
				const src = res.tempFilePaths[0]
				_this.getImageUrl(src).then((file) => {
					_this.data.idCardFront = file.fileName
					_this.setData({
						frontImage: file.presignedUrl,
						idCardFront: _this.data.idCardFront
					})
				})
			}
		})
	},
	getBackImage() {
		const _this = this
		wx.chooseImage({
			count: 1, //选择数量
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				//图片的临时路径
				const src = res.tempFilePaths[0]
				_this.getImageUrl(src).then((file) => {
					_this.data.idCardReverse = file.fileName
					_this.setData({
						backImage: file.presignedUrl,
						idCardReverse: _this.data.idCardReverse
					})
				})
			}
		})
	},
	getImageUrl(src) {
		return new Promise((resolve) => {
			const header = {
				authorization: wx.getStorageSync('authorization')
			}
			wx.uploadFile({
				url:
					env.env.VUE_APP_BASE_URL +
					'/system/minio/' +
					constantCfg.minio.bucketName,
				filePath: src,
				name: 'file',
				header,
				formData: {
					bucketName: constantCfg.minio.bucketName,
					fileName: src
				},
				success(res) {
					const data = JSON.parse(res.data)
					if (data.success) {
						resolve(data.data)
					}
				}
			})
		})
	},
	withdrawal(e) {
		const option = e.detail.value
		const _this = this
		if (option.totalAmount) {
			if (
				Number(option.totalAmount) <=
				_this.data.shoppingMoneyData.canWithdrawAmount
			) {
				if (option.bankAccount) {
					if (isBankCard(option.bankAccount)) {
						if (this.data.addressStr) {
							if (option.name) {
								if (option.idCard) {
									if (isIDNumber(option.idCard)) {
										if (option.phone) {
											if (isMobile(option.phone)) {
												if (_this.data.frontImage && _this.data.backImage) {
													const fee = Number(
														(
															(option.totalAmount *
																100 *
																_this.data.shoppingMoneyData.company
																	.extractFeePercent) /
															10000
														).toFixed(2)
													)
													const params = {
														...option,
														userId: wx.getStorageSync('userId'),
														idCardFront: _this.data.idCardFront,
														idCardReverse: _this.data.idCardReverse,
														poundage: fee,
														openingProvince: this.data.addressStr.split('/')[0],
														openingCity: this.data.addressStr.split('/')[1]
													}
													wx.showModal({
														title: '提示',
														content:
															'本次提现需要扣除平台手续费' +
															_this.data.shoppingMoneyData.company
																.extractFeePercent +
															'%，去购物可免于手续费，请认真考虑哦。',
														cancelText: '继续提现',
														confirmText: '去购物',
														confirmColor: '#F9AE08',
														cancelColor: '#F9AE08',
														success(res) {
															if (res.confirm) {
																wx.switchTab({
																	url: '/pages/index/index'
																})
															} else if (res.cancel) {
																http
																	.wxRequest({
																		..._this.data.api.withdrawals,
																		params
																	})
																	.then((res) => {
																		if (res.success) {
																			wx.showToast({
																				title: '提交成功',
																				icon: 'none',
																				success() {
																					wx.navigateBack({
																						delta: 1
																					})
																				}
																			})
																		} else {
																			wx.showToast({
																				title: res.message,
																				icon: 'none'
																			})
																		}
																	})
															}
														}
													})
												} else {
													if (this.data.frontImage) {
														wx.showToast({
															title: '请上传身份证反面照片',
															icon: 'none'
														})
													}
													if (this.data.backImage) {
														wx.showToast({
															title: '请上传身份证正面照片',
															icon: 'none'
														})
													}
													if (!this.data.frontImage && !this.data.backImage) {
														wx.showToast({
															title: '请上传身份证正反面照片',
															icon: 'none'
														})
													}
												}
											} else {
												wx.showToast({
													title: '手机号格式错误',
													icon: 'none'
												})
											}
										} else {
											wx.showToast({
												title: '请输入手机号',
												icon: 'none'
											})
										}
									} else {
										wx.showToast({
											title: '身份证号格式错误',
											icon: 'none'
										})
									}
								} else {
									wx.showToast({
										title: '请输入身份证号',
										icon: 'none'
									})
								}
							} else {
								wx.showToast({
									title: '请输入持卡人姓名',
									icon: 'none'
								})
							}
						} else {
							wx.showToast({
								title: '请选择开户行',
								icon: none
							})
						}
					} else {
						wx.showToast({
							title: '银行卡号格式错误',
							icon: 'none'
						})
					}
				} else {
					wx.showToast({
						title: '请输入银行卡号',
						icon: 'none'
					})
				}
			} else {
				wx.showToast({
					title: '超出可提现金额',
					icon: 'none'
				})
			}
		} else {
			wx.showToast({
				title: '请输入提现金额',
				icon: 'none'
			})
		}
	},
	bindMultiPickerChange: function (e) {
		const str =
			this.data.multiArray[0][e.detail.value[0]] +
			'/' +
			this.data.multiArray[1][e.detail.value[1]]
		this.setData({
			multiIndex: [e.detail.value[0], e.detail.value[1]],
			addressStr: str
		})
	},
	bindMultiPickerColumnChange: function (e) {
		console.log('bindMultiPickerColumnChange=====', e)
		switch (e.detail.column) {
			case 0:
				list = []
				for (var i = 0; i < this.data.objectMultiArray.length; i++) {
					if (
						this.data.objectMultiArray[i].parid ==
						this.data.objectMultiArray[e.detail.value].regid
					) {
						list.push(this.data.objectMultiArray[i].regname)
					}
				}
				this.data.multiArray = [this.data.multiArray[0], list]
				this.data.multiIndex = [e.detail.value, 0]
				this.setData({
					multiArray: this.data.multiArray,
					multiIndex: this.data.multiIndex
				})
		}
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		this.getShoppingMoney()
		this.getLastData()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function () {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {}
})
