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
const addressData = {
	url: '/regions',
	method: 'get'
}
let provinceList = []
let cityList = []
let areaList = []
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
function getProvince(provinceId) {
	return new Promise((resolve) => {
		const params = {
			parentId: 1,
			pageSize: 100,
			pageNo: 1
		}
		let provinceName = {}
		http.wxRequest({ ...addressData, params }).then((res) => {
			if (res.success) {
				provinceList = res.data
				provinceList.forEach((province) => {
					if (province.id === provinceId) {
						console.log(province)
						provinceName = province
					}
				})
				resolve(provinceName)
			}
		})
	})
}
function getCity(provinceId, cityId) {
	return new Promise((resolve) => {
		const params = {
			parentId: provinceId,
			pageSize: 100,
			pageNo: 1
		}
		let cityName = {}
		http.wxRequest({ ...addressData, params }).then((res) => {
			if (res.success) {
				cityList = res.data
				cityList.forEach((city) => {
					if (city.id === cityId) {
						console.log(city)
						cityName = city
					}
				})
				resolve(cityName)
			}
		})
	})
}
function getArea(cityId, areaId) {
	return new Promise((resolve) => {
		const params = {
			parentId: cityId,
			pageSize: 100,
			pageNo: 1
		}
		let areaName = {}
		http.wxRequest({ ...addressData, params }).then((res) => {
			if (res.success) {
				areaList = res.data
				areaList.forEach((area) => {
					if (area.id === areaId) {
						console.log(area)
						areaName = area
					}
				})
				resolve(areaName)
			}
		})
	})
}
module.exports = {
	checkToken,
	review,
	getProductList,
	getProductSorts,
	insuranceProduct,
	getProvince,
	getCity,
	getArea
}
