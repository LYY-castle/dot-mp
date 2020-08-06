// pages/product/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    historyListShow: true,
    loading: false,
    finished: false,
    pageNo: 1,
    pageTitle: '搜索',
    productList: [],
    historyList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  search(val) {
    this.setData({
      historyListShow:true
    })
    console.log(val)
    // if (val !== '') {
    //   let list = deepClone(this.historyList)
    //   list.unshift({
    //     value: val
    //   })
    //   const res = new Map()
    //   list = list.filter(list => !res.has(list.value) && res.set(list.value, 1))
    //   Vue.ls.set('historyList', JSON.stringify(list))
    // }
    // Toast.loading({
    //   message: '请稍后',
    //   forbidClick: true
    // })
    // this.pageNo = 1
    // this.productList = []
    // this.historyListShow = false
    // this.getProductList()
  },
  focus(){
    this.setData({
      historyListShow:false
    })
    console.log('focus')
  },
  cancel(){
    console.log('cancel')
  },
})
