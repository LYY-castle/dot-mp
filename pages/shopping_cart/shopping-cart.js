// pages_shopping_cart/shopping-cart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin:null,
    loadingShow:false,
    bottomLineShow:false,
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const isLogin = wx.getStorageSync('isLogin')===1
    this.setData({
      isLogin
    })
    console.log(this.data.isLogin)
    if(isLogin){
      console.log('购物车列表')
    }
  },
  goLogin(){
    wx.navigateTo({
      url:'/pages_mine/login/login'
    })
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
    if(!this.data.bottomLineShow&&!this.data.loadingShow){
      this.setData({
        pageNo:this.data.pageNo+1,
        loadingShow:true
      })
      this.getShoppingOrderList()
    }
  },
  getShoppingOrderList(){

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
