import env from './env.config'
module.exports = {
	MAX_PAGE_SIZE: 1000,
	TOKEN_EXPIRE_TIMEOUT: 24 * 60 * 60 * 1000,
	crypto: {
		key: 'Wise2cDotWeb2020',
		iv: 'Wise2cDotWeb2020'
	},
	qsebao: {
		api: {
			getProducts: {
				url: '/query',
				method: 'post',
				action: 'productList'
			},
			getProductDetail: {
				url: '/query',
				method: 'post',
				action: 'productDetail'
			}
		}
	},
	// 加入购物车限制
	shoppingCartCode: '',
	// 结算限制
	perchaseCode: '',
	wechatPay: {
		authorizeUrlPrefix: 'https://open.weixin.qq.com/connect/oauth2/authorize',
		qs: {
			appid: env.env.appid,
			response_type: 'code',
			scope: 'snsapi_base',
			state: '',
			connect_redirect: '1'
		},
		authorizeUrlSuffix: '#wechat_redirect',
		payApiHost: '/api/wx/redirect/' + env.env.appid
	},
	productType: {
		qsebao: ['1'], // 轻松保.
		iccooCard: '2', // 中青文旅卡.
		defaultProductTypeIdx: 3, // 默认产品类型, vant-sidebar 中使用下标作为值.
		defaultProductType: '2', // 默认选中旅游类型.
		insureProductType: '1', // 保险类型.
		foodRedWineProductType: '4-7' // 食品/红酒类型.
	},
	productCode: {
		qsebao: ['easy_guardian'],
		iccooCard: 'tourist_card' // 中青文旅卡.
	},
	minio: {
		bucketName: 'dot',
		publicBucketName: 'static',
		maxSizeImag: 5 * 1024 * 1024
	}
}
