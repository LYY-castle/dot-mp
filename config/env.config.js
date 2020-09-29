let env = {}
// develop 开发版
if (__wxConfig.envVersion === 'develop') {
	env = {
		mode: 'dev',
		DEBUG: false,
		VCONSOLE: true,
		appid: 'wxd8233d62e992e916',
		appSecret: '7060d0a558597c51c47abc275adde454',
		VUE_APP_BASE_URL: 'https://dot-dev.hkjindian.com:18703',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		}
	}
}
// trial 体验版
if (__wxConfig.envVersion === 'trial') {
	env = {
		mode: 'dev',
		DEBUG: false,
		VCONSOLE: true,
		appid: 'wxd8233d62e992e916',
		appSecret: '7060d0a558597c51c47abc275adde454',
		VUE_APP_BASE_URL: 'https://dot-dev.hkjindian.com:18703',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		}
	}
}
// release 正式版
if (__wxConfig.envVersion === 'release') {
	env = {
		mode: 'prod',
		DEBUG: false,
		VCONSOLE: false,
		appid: 'wxd8233d62e992e916',
		appSecret: '7060d0a558597c51c47abc275adde454',
		VUE_APP_BASE_URL: 'http://dot.hkjindian.com:18900',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		}
	}
}

module.exports = {
	env
}
