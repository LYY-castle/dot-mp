const moment = require('moment.min.js')
const bankList = require('bankInfo.js')
const formatTime = (date) => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()

	return (
		[year, month, day].map(formatNumber).join('/') +
		' ' +
		[hour, minute, second].map(formatNumber).join(':')
	)
}
const formatNumber = (n) => {
	n = n.toString()
	return n[1] ? n : '0' + n
}
// 获取一个时间的开始时间戳.
function getStartTime(timeStr, type) {
	const typeArray = ['halfHour', 'hour', 'day', 'week', 'month', 'year']
	let startTime
	if (type && typeArray.includes(type)) {
		switch (type) {
			case 'halfHour':
				startTime = moment(timeStr, 'YYYY-MM-DD HH:mm')
				break
			case 'hour':
				startTime = moment(timeStr, 'YYYY-MM-DD HH')
				break
			case 'day':
				startTime = moment(timeStr, 'YYYY-MM-DD')
				break
			case 'week':
				startTime = moment(timeStr, 'YYYY WW')
				break
			case 'month':
				startTime = moment(timeStr, 'YYYY-MM')
				break
			case 'year':
				startTime = moment(timeStr, 'YYYY')
				break
		}
	} else {
		return new Error(`type 只支持[${typeArray}]`)
	}
	return startTime.format('YYYY-MM-DD HH:mm:ss')
}

// 获取一个时间的结束时间戳.
function getEndTime(timeStr, type) {
	const typeArray = ['halfHour', 'hour', 'day', 'week', 'month', 'year']
	let endTime
	if (type && typeArray.includes(type)) {
		switch (type) {
			case 'halfHour':
				endTime = moment(timeStr, 'YYYY-MM-DD HH:mm')
				break
			case 'hour':
				endTime = moment(timeStr, 'YYYY-MM-DD HH')
					.add(1, 'hours')
					.subtract(1, 'ms')
				break
			case 'day':
				endTime = moment(timeStr, 'YYYY-MM-DD').add(1, 'days').subtract(1, 'ms')
				break
			case 'week':
				endTime = moment(timeStr, 'YYYY WW').add(1, 'weeks').subtract(1, 'ms')
				break
			case 'month':
				endTime = moment(timeStr, 'YYYY-MM').add(1, 'months').subtract(1, 'ms')
				break
			case 'year':
				endTime = moment(timeStr, 'YYYY').add(1, 'years').subtract(1, 'ms')
				break
		}
	} else {
		return new Error(`type 只支持[${typeArray}]`)
	}
	return endTime.format('YYYY-MM-DD HH:mm:ss')
}
// 获取当前页面参数
function getCurrentPageUrl() {
	var pages = getCurrentPages()
	return pages[pages.length - 1]
}
function ellipsis(value, vlength = 25) {
	if (!value) {
		return ''
	}
	if (value.length > vlength) {
		return value.slice(0, vlength) + '...'
	}
	return value
}
// 根据银行卡号获取银行name
function getBankInfoByCardNo(cardNo) {
	console.log('cardNo===', cardNo)
	return new Promise((resolve) => {
		const bankData = bankList.default.bankcardList
		const len = bankData.length
		let bankcard = null
		let patterns = null
		let pattern = null
		let info = null
		for (let i = 0; i < len; i++) {
			bankcard = bankData[i]
			patterns = bankcard.patterns
			for (let j = 0, jLen = patterns.length; j < jLen; j++) {
				pattern = patterns[j]
				const reg = pattern.reg
				if (reg.test(cardNo)) {
					info = bankcard
				} else {
				}
				if (info) {
					break
				}
			}
			if (info) {
				resolve(info)
				break
			}
		}
	})
}
module.exports = {
	formatTime,
	getStartTime,
	getEndTime,
	getCurrentPageUrl,
	ellipsis,
	getBankInfoByCardNo
}
