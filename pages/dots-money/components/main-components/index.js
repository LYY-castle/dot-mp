// pages/dots-money/components/main-components/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    myDataList:{
      type:Array,
      value:[]
    },
    active:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    pay: '/static/img/pay.png',
    waitPay: '/static/img/wait-pay.png',
    empty: '/static/img/empty.png',
    iconSuccess: '/static/img/icon-success.png',
    iconFail: '/static/img/icon-fail.png',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onTap(){
      console.log('跳转到下一个页面')
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    },
    hasData(){
      console.log(this.data)
      this.setData({
        myDataList:this.data.myDataList
      })
    }
  }
})
