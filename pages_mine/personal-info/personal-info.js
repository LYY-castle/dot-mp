import http from '../../utils/request'
import tool from '../../utils/mixin'
import { isMobile, isIDNumber } from '../../utils/validate'
import constantCfg from '../../config/constant'
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		empty: '/static/img/avatar.png',
		userInfo: {},
		region: [],
		// 图片剪切所需参数
		src: '',
		resiveOption: null,
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
		if (event.src) {
			this.setData({
				resiveOption: event.src
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
						if (this.data.resiveOption) {
							console.log(1)
							this.setData({
								userInfo: res.data
							})
							const viewParam = {
								bucketName: constantCfg.minio.bucketName,
								fileName: this.data.resiveOption
							}
							tool.review(viewParam).then((result) => {
								this.setData({
									receiveAvatar: result.data
								})
							})
						} else {
							this.setData({
								userInfo: res.data
							})
							if (res.data.avatar.indexOf('https') === -1) {
								const viewParam = {
									bucketName: constantCfg.minio.bucketName,
									fileName: this.data.userInfo.avatar
								}
								tool.review(viewParam).then((result) => {
									this.setData({
										receiveAvatar: result.data
									})
								})
							} else {
								this.setData({
									receiveAvatar: res.data.avatar
								})
							}
						}
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
				const src = res.tempFilePaths[0]
				wx.navigateTo({
					url: './cropper/cropper?src=' + src
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
			weixinOpenid: wx.getStorageSync('openId'),
			avatar: this.data.resiveOption
		}
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
