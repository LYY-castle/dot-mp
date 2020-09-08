// pages_address/components/address.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    areaList:{
      province_list:null,
      city_list:null,
      county_list:null
    },
    api:{
      getAddressData:{
				url:'/regions',
				method:'get'
			}
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获取省市区
    getProvinceData(){
      const params = {
        parentId:1,
        pageSize:1000,
        pageNo:1
      }
      http.wxRequest({...this.data.api.getAddressData,params}).then(res=>{
        if(res.success){
          res.data.map(item=>{
            const obj = Object.assign({},item.id,item.name)
            return obj
          })
          this.data.areaList.province_list = res.data
          this.setData({
            addressList:this.data.areaList
          })
        }
      })
    },
    getCityData(){
      const params = {
        parentId:2,
        pageSize:1000,
        pageNo:1
      }
      http.wxRequest({...this.data.api.getAddressData,params}).then(res=>{
        res.data.map(item=>{
          const obj = Object.assign({},item.id,item.name)
          return obj
        })
        this.data.areaList.city_list = res.data
        if(res.success){
          this.setData({
            addressList:this.data.areaList
          })
        }
      })
    },
    getCountryData(){
      const params = {
        parentId:3,
        pageSize:1000,
        pageNo:1
      }
      http.wxRequest({...this.data.api.getAddressData,params}).then(res=>{
        if(res.success){
          res.data.map(item=>{
            const obj = Object.assign({},item.id,item.name)
            return obj
          })
          this.data.areaList.county_list = res.data
        if(res.success){
          this.setData({
            addressList:this.data.areaList
          })
        }
        }
      })
    }
  }
})
