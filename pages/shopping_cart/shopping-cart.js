// pages_shopping_cart/shopping-cart.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingShow:false,
    bottomLineShow:true,
    shoppingCartList:[],
    result:[],
    totalPrice:0,
    all:false
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getShoppingOrderList()
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
    console.log(123)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // if(!this.data.bottomLineShow&&!this.data.loadingShow){
    //   this.setData({
    //     pageNo:this.data.pageNo+1,
    //     loadingShow:true
    //   })
    //   this.getShoppingOrderList()
    // }
  },
  getShoppingOrderList(){
    const shoppingCartList = [
      {name:'商品1',price:10,count:1,checked:false,id:1},
      {name:'商品2',price:10,count:1,checked:false,id:2},
      {name:'商品3',price:10,count:1,checked:false,id:3},
      {name:'商品4',price:10,count:1,checked:false,id:4},
      {name:'商品5',price:10,count:1,checked:false,id:5},
      {name:'商品6',price:10,count:1,checked:false,id:6},
      {name:'商品7',price:10,count:1,checked:false,id:7},
      {name:'商品8',price:10,count:1,checked:false,id:8},
      {name:'商品9',price:10,count:1,checked:false,id:9},
      {name:'商品10',price:10,count:1,checked:false,id:10},
      {name:'商品11',price:10,count:1,checked:false,id:11},
      {name:'商品12',price:10,count:1,checked:false,id:12}
    ]
    const resultArr = shoppingCartList.map(item=>{
      return String(item.id)
    })
    this.setData({
      loadingShow:false,
      shoppingCartList,
      result:resultArr,
      all:true,
    })
    this.getTotalPrice(this.data.result,this.data.shoppingCartList)
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onChange(event) {
    this.setData({
      result: event.detail,
      all:event.detail.length===this.data.shoppingCartList.length
    })
    this.getTotalPrice(this.data.result,this.data.shoppingCartList)
  },

  selectAll(){
    const resultArr = this.data.shoppingCartList.map(item=>{
      return String(item.id)
    })
    this.setData({
      all:!this.data.all,
    })
    if(this.data.all){
      this.setData({
      result:resultArr
      })
    }else{
      this.setData({
        result:[]
      })
    }
    this.getTotalPrice(this.data.result,this.data.shoppingCartList)
  },
  addCount(event){
    const option = event.currentTarget.dataset.option
    this.data.shoppingCartList[option].count = event.detail
    this.setData({
      shoppingCartList:this.data.shoppingCartList
    })
    this.getTotalPrice(this.data.result,this.data.shoppingCartList)
  },
  getTotalPrice(arr1,arr2){
    let sumPrice = 0
    for (let i = 0; i < arr1.length; i++) {
      for (let j = 0; j < arr2.length; j++) {
        if(Number(arr1[i])===arr2[j].id){
          sumPrice += arr2[j].price*arr2[j].count
        }
      }
    }
    this.setData({
      totalPrice:sumPrice*100
    })
  },
   // 结算
   onClickButton(){
    wx.navigateTo({
      url:'/pages_product/perchase/perchase'
    })
  },
})
