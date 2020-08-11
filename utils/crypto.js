import CryptoJS from '../miniprogram_npm/crypto-js/index'

import constantCfg from '../config/constant'

// eslint-disable-next-line no-unused-vars

  /**
   *
   * @param {*} param0
   */
  function encrypt({ plainStr }) {
    const encrypted = CryptoJS.AES.encrypt(plainStr, CryptoJS.enc.Utf8.parse(constantCfg.crypto.key), {
      iv: CryptoJS.enc.Utf8.parse(constantCfg.crypto.iv),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })

    return CryptoJS.enc.Hex.parse(encrypted.ciphertext.toString()).toString()
  }

  function decrypt({ enctyptedStr }) {
    const encryptedBase64Str = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(enctyptedStr))
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64Str, CryptoJS.enc.Utf8.parse(constantCfg.crypto.key), {
      iv: CryptoJS.enc.Utf8.parse(constantCfg.crypto.iv),
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    })

    return CryptoJS.enc.Utf8.stringify(decrypted).toString()
  }

  module.exports = {
    encrypt,
    decrypt
  }
