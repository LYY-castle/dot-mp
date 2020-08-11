import http from './request'
const checkParams = {
  url: '/system/check-token',
  method: 'get'
}
const reviewParams = {
  url: '/system/minio/{bucketName}/preview-url',
  method: 'get'
}
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
  review
}
