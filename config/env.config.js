let env = {}
// develop 开发版
if (__wxConfig.envVersion === 'develop') {
	env = {
		mode: 'dev',
		DEBUG: false,
		VCONSOLE: true,
		appid: 'wx2f985fa52b9af7fa',
		appSecret:'7060d0a558597c51c47abc275adde454',
		VUE_APP_BASE_URL: 'https://dot-dev.hkjindian.com:18700',
		LINK_URL: 'https://dot-dev.hkjindian.com/register',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		},
		productionHost: 'https://dot-dev.hkjindian.com/'
	}
}
// trial 体验版
if (__wxConfig.envVersion === 'trial') {
	env = {
		mode: 'dev',
		DEBUG: false,
		VCONSOLE: true,
		appid: 'wx2f985fa52b9af7fa',
		appSecret:'7060d0a558597c51c47abc275adde454',
		VUE_APP_BASE_URL: 'https://dot-dev.hkjindian.com:18700',
		LINK_URL: 'https://dot-dev.hkjindian.com/register',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		},
		productionHost: 'https://dot-dev.hkjindian.com/'
	}
}
// release 正式版
if (__wxConfig.envVersion === 'release') {
	env = {
		mode: 'prod',
		DEBUG: false,
		VCONSOLE: false,
		appid: 'wx2f985fa52b9af7fa',
		appSecret:'7060d0a558597c51c47abc275adde454',
		VUE_APP_BASE_URL: 'http://dot.hkjindian.com',
		LINK_URL: 'http://dot.hkjindian.com/register',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		},
		productionHost: 'http://dot.hkjindian.com'
	}
}
module.exports = {
	env
}
