import http from './request'
const checkParams = {
  url: '/system/check-token',
  method: 'get'
}
const reviewParams = {
  url: '/system/minio/{bucketName}/preview-url',
  method: 'get'
}
const productListParams = {
  url: '/products',
  method: 'get'
}
const productTypeParams = {
  url: '/product-categories',
  method: 'get'
}
// 获取产品的列表
function getProductList(params) {
  return http.wxRequest({
      ...productListParams,
      params: params
    })
}
// 获取商品分类列表
function getProductSorts(params){
  return http.wxRequest({...productTypeParams,params})
}
// 校验token是否过期
function checkToken(){
  return new Promise(resolve=>{
    http.wxRequest({
      ...checkParams,
    }).then(res=>{
      if(res.success){
        resolve()
      }
    })
  })
}
// 图片预览
function review({bucketName, fileName}){
  return http.wxRequest({
      ...reviewParams,
      urlReplacements: [
        { substr: '{bucketName}', replacement: bucketName }
      ],
      params: {
        fileName
      }
  })
}

module.exports = {
  checkToken,
  review,
  getProductList,
  getProductSorts
}
