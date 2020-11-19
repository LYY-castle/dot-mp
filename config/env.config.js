const envConf = {
	develop: {
		mode: 'dev',
		DEBUG: false,
		VCONSOLE: true,
		appid: 'wxd8233d62e992e916',
		VUE_APP_BASE_URL: 'https://dot-dev.hkjindian.com:18703',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		}
	},
	trial: {
		mode: 'dev',
		DEBUG: false,
		VCONSOLE: true,
		appid: 'wxd8233d62e992e916',
		VUE_APP_BASE_URL: 'https://dot-dev.hkjindian.com:18703',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		}
	},
	release: {
		mode: 'prod',
		DEBUG: false,
		VCONSOLE: false,
		appid: 'wxd8233d62e992e916',
		VUE_APP_BASE_URL: 'https://dot.hkjindian.com:18900',
		qsebao: {
			baseURL: 'https://qcapi.qsebao.com',
			apiKey: '1qjAllYQPTEsk46RbY0xc000018708',
			agentID: 1000000030
		}
	}
}

module.exports = {
	env: envConf[__wxConfig.envVersion]
}
