import md5 from '../miniprogram_npm/js-md5/index'
import env from '../config/env.config'
import constantCfg from '../config/constant'
import http from './request'
function getSign({ params = {} }) {
	return md5(`${env.env.qsebao.apiKey}${JSON.stringify(params)}`)
}

function getProducts() {
	const { url, method, action } = constantCfg.qsebao.api.getProducts
	const params = {
		agentID: env.env.qsebao.agentID,
		action
	}
	const sign = getSign({
		params
	})
	return new Promise((resolve) => {
		http.wxRequest({
			url: `${env.env.qsebao.baseURL}${url}?sign=${sign}`,
			method,
			params
		})
		resolve()
	})
}

function getProductDetail({ insuranceCode }) {
	const { url, method, action } = constantCfg.qsebao.api.getProductDetail

	const params = {
		agentID: env.env.qsebao.agentID,
		action,
		insuranceCode
	}
	const sign = getSign({
		params
	})
	const questParams = {
		url: env.env.qsebao.baseURL + url + '?sign=' + sign,
		method
	}
	return http.wxRequest({
		...questParams,
		params
	})
}
module.exports = {
	getSign,
	getProducts,
	getProductDetail
}
