// shopping_money/shopping-money-detail/shopping-money-detail.js
Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		shopping: {
			use: 1000,
			jili: 500,
			nbTitle: '我的购物金',
			nbBackgroundColor: '#ffffff',
			nbFrontColor: '#000000',
			active: '1',
			listData: []
		}
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		const listData = [
			{ name: '帽子', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子2', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子3', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子4', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子5', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子6', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子7', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子8', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子8', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子8', time: '2020-12-30 12:30:47', money: '100' },
			{ name: '帽子8', time: '2020-12-30 12:30:47', money: '100' }
		]
		this.setData({
			listData,
			active: '1'
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {},

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
	onReachBottom: function () {
		console.log('触底了')
	},
	onChange(event) {
		this.setData({
			active: event.detail.name
		})
		console.log('切换', event.detail.name)
	}
})
