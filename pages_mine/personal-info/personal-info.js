import http from '../../utils/request.js'
import constantCfg from '../../config/constant'
import env from '../../config/env.config'
import areaList from '../../utils/area.js'
import tool from '../../utils/mixin.js'
import { isMobile, isIDNumber } from '../../utils/validate.js'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		empty: '/static/img/avatar.png',
		uploadAvatar: null,
		userInfo: {},
		region: [],
		// 图片剪切所需参数
		src: '',
		width: 200, //宽度
		height: 200, //高度
		max_width: 400,
		max_height: 400,
		disable_rotate: true, //是否禁用旋转
		disable_ratio: false, //锁定比例
		limit_move: true, //是否限制移动
		receiveAvatar: null,
		avatar: null,
		api: {
			getUserInfo: {
				url: '/users/{id}',
				method: 'get'
			},
			modifyUserInfo: {
				url: '/users',
				method: 'put'
			},
			uploadUserAvatar: {
				url: '/users',
				method: 'put'
			},
			// 上传图片
			upload: {
				url: '/system/minio/{bucketName}',
				method: 'post'
			}
		}
	},
	onLoad: function (options) {
		const event = options
		console.log(event)
		if (event.src) {
			this.setData({
				receiveAvatar: event.src
			})
		}
		this.getUserInfo()
	},
	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function (options) {
		const event = options
		console.log(event)
		if (event) {
			this.setData({
				receiveAvatar: event.src
			})
		}
		this.getUserInfo()
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function () {
		console.log('返回')
		wx.switchTab({
			url: '/pages/mine/mine'
		})
	},

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
	onShareAppMessage: function () {},
	getUserInfo() {
		const id = wx.getStorageSync('userId')
		const _this = this
		http
			.wxRequest({
				...this.data.api.getUserInfo,
				urlReplacements: [{ substr: '{id}', replacement: id }]
			})
			.then((res) => {
				if (res.success) {
					if (res.data.avatar) {
						if (res.data.mobile === null) {
							res.data.mobile = ''
						}
						if (this.data.receiveAvatar) {
							res.data.avatar = this.data.receiveAvatar
						} else {
							this.setData({
								receiveAvatar: res.data.avatar
							})
						}
						_this.setData({
							userInfo: res.data
						})
					} else {
						wx.navigateTo({
							url: '/pages_mine/login/login'
						})
					}
				}
			})
	},
	selectImage() {
		const _this = this
		wx.chooseImage({
			count: 1, //选择数量
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				//图片的临时路径
				wx.uploadFile({
					url:
						env.env.VUE_APP_BASE_URL +
						'/system/minio/' +
						constantCfg.minio.bucketName, //仅为示例，非真实的接口地址
					filePath: res.tempFilePaths[0],
					name: 'file',
					header,
					formData: {
						bucketName: constantCfg.minio.bucketName,
						fileName: res.tempFilePaths[0]
					},
					success(res) {
						const data = JSON.parse(res.data)
						console.log(data)
						// if (data.success) {
						// 	_this.setData({
						// 		avatar: data.data.presignedUrl,
						// 		uploadAvatar: data.data.fileName
						// 	})

						// 	// wx.navigateTo({
						// 	// 	url: './cropper/cropper?src=' + src
						// 	// })
						// }
					}
				})
			}
		})
	},

	updateUserInfo(e) {
		const option = e.detail.value
		console.log()
		const params = {
			id: wx.getStorageSync('userId'),
			nickname: option.nickname,
			mobile: option.mobile,
			avatar: option.avatar,
			weixinOpenid: wx.getStorageSync('openId'),
			avatar: this.data.receiveAvatar
		}
		console.log('修改用户信息', params)
		if (option.nickname !== '') {
			if (option.mobile !== '') {
				if (isMobile(option.mobile)) {
					http
						.wxRequest({
							...this.data.api.modifyUserInfo,
							params
						})
						.then((res) => {
							if (res.success) {
								wx.showToast({
									title: '提交成功',
									icon: 'none',
									success() {
										setTimeout(function () {
											wx.switchTab({
												url: '/pages/mine/mine'
											})
										}, 1000)
									}
								})
							}
						})
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
	}
})
