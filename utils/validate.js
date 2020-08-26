const regexMap = {
  email: /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/,
  mobile: /^1[0-9]{10}$/,
  strictMobile: /^1([38][0-9]|4[579]|5[0-3,5-9]|6[6]|7[0135678]|9[89])\d{8}$/,
  mobileWithComma: /^(1[0-9]{10})(,1[0-9]{10})*$/,
  phone: /^([0-9]{3,4}-)?[0-9]{7,8}$/,
  url: /^http[s]?:\/\/.*/,
  IDNumber: /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}[0-9Xx]$)/,
  chinese: /[\u4E00-\u9FA5\uFE30-\uFFA0]/,
  usernameOrEmail: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/,
  username: /^([a-zA-Z0-9])+$/,
  number: /^[0-9]+$/,
  wechatNo: /^[a-zA-Z]{1}[-_a-zA-Z0-9]{5,19}$/,
  bankCard: /^([1-9]{1})(\d{12}|\d{13}|\d{14}|\d{15}|\d{16}|\d{17}|\d{18})$/
}

/**
 * 邮箱
 * @param {*} s
 */
export function isEmail(s) {
  return regexMap.email.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile(s) {
  return regexMap.mobile.test(s)
}

/**
 * 严谨的手机号码
 * @param {*} s
 */
export function isStrictMobile(s) {
  return regexMap.strictMobile.test(s)
}

/**
 * 逗号分隔的手机号码
 * @param {*} s
 */
export function isMobileWithComma(s) {
  return regexMap.mobileWithComma.test(s)
}

/**
 * 电话号码
 * @param {*} s
 */
export function isPhone(s) {
  return regexMap.phone.test(s)
}

/**
 * URL地址
 * @param {*} s
 */
export function isURL(s) {
  return regexMap.url.test(s)
}

/**
 * 身份证号
 * @param {*} s
 */
export function isIDNumber(s) {
  return regexMap.IDNumber.test(s)
}

/**
 * 是否包含中文汉字
 * @param {*} s
 */
export function isChinese(s) {
  return regexMap.chinese.test(s)
}

/**
 * 是否用户名或邮箱地址
 * @param {*} s
 */
export function isUsernameOrEmail(s) {
  return regexMap.usernameOrEmail.test(s)
}

/**
 * 是否用户名
 * @param {*} s
 */
export function isUsername(s) {
  return regexMap.username.test(s)
}

/**
 * 纯数字
 * @param {*} s
 */
export function isNumber(s) {
  return regexMap.number.test(s)
}

/**
 * 是否微信号
 * @param {*} s
 */
export function isWechatNo(s) {
  return regexMap.wechatNo.test(s)
}
/**
 * 是否银行卡号
 * @param {*} s
 */
export function isBankCard(s) {
  return regexMap.bankCard.test(s)
}

export { regexMap }
