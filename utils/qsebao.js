import md5 from '../miniprogram_npm/js-md5/index'
import env from '../config/env.config'
import constantCfg from '../config/constant'
import http from './request'
function getSign({
  params = {}
}) {
  return md5(`${env.env.qsebao.apiKey}${JSON.stringify(params)}`)
}
function getProducts() {
  const {
    url,
    method,
    action
  } = constantCfg.qsebao.api.getProducts

  const params = {
    agentID: env.env.qsebao.agentID,
    action
  }

  const sign = getSign({
    params
  })

  return wxRequest({
    url: `${env.env.qsebao.baseURL}${url}?sign=${sign}`,
    method,
    params
  })
}
function getProductDetail({
  insuranceCode
}) {
  const {
    url,
    method,
    action
  } = constantCfg.qsebao.api.getProductDetail

  const params = {
    agentID: env.env.qsebao.agentID,
    action,
    insuranceCode
  }
  const sign = getSign({
    params
  })
  return new Promise(resolve=>{
    console.log(`${env.env.qsebao.baseURL}${url}?sign=${sign}`,
    params)
    http.wxRequest({
      url: `${env.env.qsebao.baseURL}${url}?sign=${sign}`,
      method,
      params
    })
    resolve()
  })
}
module.exports.getProductDetail = getProductDetail
