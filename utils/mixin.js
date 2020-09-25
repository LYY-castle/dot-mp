import http from './request'
import moment from './moment.min.js'
const checkParams = {
	url: '/system/check-token',
	method: 'get'
}
const reviewParams = {
	url: '/system/minio/{bucketName}/preview-url',
	method: 'get'
}
const productListParams = {
	url: '/goods',
	method: 'get'
}
const productTypeParams = {
	url: '/categories',
	method: 'get'
}
const qsbParams = {
	agentID: 1000000030,
	action: 'productDetail',
	insuranceCode: 'easy_guardian'
}
const qsbao = {
	url: 'https://qcapi.qsebao.com/query?sign=a09087363beb1141709faa35a02860ab',
	method: 'post'
}
function insuranceProduct() {
	return new Promise((resolve) => {
		wx.request({
			...qsbao,
			data: qsbParams,
			success(res) {
				resolve(res.data)
			}
		})
	})
}
// 获取产品的列表
function getProductList(params) {
	return http.wxRequest({
		...productListParams,
		params
	})
}
// 获取商品分类列表
function getProductSorts(params) {
	return http.wxRequest({ ...productTypeParams, params })
}
// 校验token是否过期
function checkToken() {
	return new Promise((resolve) => {
		http
			.wxRequest({
				...checkParams
			})
			.then((res) => {
				if (res.success) {
					resolve()
				}
			})
	})
}
// 判断当前时间是否在促销时间段内
function isInDurationTime(startTime, endTime) {
	const currentTime = moment()
	return (
		currentTime.isAfter(moment(startTime, 'YYYY-MM-DD HH:mm:ss')) &&
		currentTime.isBefore(moment(endTime, 'YYYY-MM-DD HH:mm:ss'))
	)
}

// 图片预览
function review({ bucketName, fileName }) {
	return http.wxRequest({
		...reviewParams,
		urlReplacements: [{ substr: '{bucketName}', replacement: bucketName }],
		params: {
			fileName
		}
	})
}
module.exports = {
	checkToken,
	review,
	getProductList,
	getProductSorts,
	insuranceProduct,
	isInDurationTime
}
