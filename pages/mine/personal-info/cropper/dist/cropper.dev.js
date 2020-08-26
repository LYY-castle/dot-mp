"use strict";

//获取应用实例
var app = getApp();
Page({
  data: {
    src: '',
    width: 250,
    //宽度
    height: 300,
    //高度
    max_width: 400,
    max_height: 400,
    disable_rotate: true,
    //是否禁用旋转
    disable_ratio: false,
    //锁定比例
    limit_move: true //是否限制移动

  },
  onLoad: function onLoad(options) {
    this.cropper = this.selectComponent("#image-cropper");
    this.cropper.imgReset();
    this.setData({
      src: options.src
    });
  },
  cropperload: function cropperload(e) {
    console.log('cropper加载完成');
  },
  loadimage: function loadimage(e) {
    wx.hideLoading();
    console.log('图片');
    this.cropper.imgReset();
  },
  clickcut: function clickcut(e) {
    console.log(e.detail); //图片预览

    wx.previewImage({
      current: e.detail.url,
      // 当前显示图片的http链接
      urls: [e.detail.url] // 需要预览的图片http链接列表

    });
  },
  setWidth: function setWidth(e) {
    this.setData({
      width: e.detail.value < 10 ? 10 : e.detail.value
    });
    this.setData({
      cut_left: this.cropper.data.cut_left
    });
  },
  setHeight: function setHeight(e) {
    this.setData({
      height: e.detail.value < 10 ? 10 : e.detail.value
    });
    this.setData({
      cut_top: this.cropper.data.cut_top
    });
  },
  switchChangeDisableRatio: function switchChangeDisableRatio(e) {
    //设置宽度之后使剪裁框居中
    this.setData({
      disable_ratio: e.detail.value
    });
  },
  setCutTop: function setCutTop(e) {
    this.setData({
      cut_top: e.detail.value
    });
    this.setData({
      cut_top: this.cropper.data.cut_top
    });
  },
  setCutLeft: function setCutLeft(e) {
    this.setData({
      cut_left: e.detail.value
    });
    this.setData({
      cut_left: this.cropper.data.cut_left
    });
  },
  switchChangeDisableRotate: function switchChangeDisableRotate(e) {
    //开启旋转的同时不限制移动
    if (!e.detail.value) {
      this.setData({
        limit_move: false,
        disable_rotate: e.detail.value
      });
    } else {
      this.setData({
        disable_rotate: e.detail.value
      });
    }
  },
  switchChangeLimitMove: function switchChangeLimitMove(e) {
    //限制移动的同时锁定旋转
    if (e.detail.value) {
      this.setData({
        disable_rotate: true
      });
    }

    this.cropper.setLimitMove(e.detail.value);
  },
  switchChangeDisableWidth: function switchChangeDisableWidth(e) {
    this.setData({
      disable_width: e.detail.value
    });
  },
  switchChangeDisableHeight: function switchChangeDisableHeight(e) {
    this.setData({
      disable_height: e.detail.value
    });
  },
  submit: function submit() {
    this.cropper.getImg(function (obj) {
      console.log(obj);
      wx.navigateTo({
        url: '../personal-info?src=' + obj.url
      });
    });
  },
  rotate: function rotate() {
    //在用户旋转的基础上旋转90°
    this.cropper.setAngle(this.cropper.data.angle += 90);
  },
  top: function top() {
    var _this = this;

    this.data.top = setInterval(function () {
      _this.cropper.setTransform({
        y: -3
      });
    }, 1000 / 60);
  },
  bottom: function bottom() {
    var _this2 = this;

    this.data.bottom = setInterval(function () {
      _this2.cropper.setTransform({
        y: 3
      });
    }, 1000 / 60);
  },
  left: function left() {
    var _this3 = this;

    this.data.left = setInterval(function () {
      _this3.cropper.setTransform({
        x: -3
      });
    }, 1000 / 60);
  },
  right: function right() {
    var _this4 = this;

    this.data.right = setInterval(function () {
      _this4.cropper.setTransform({
        x: 3
      });
    }, 1000 / 60);
  },
  narrow: function narrow() {
    var _this5 = this;

    this.data.narrow = setInterval(function () {
      _this5.cropper.setTransform({
        scale: -0.02
      });
    }, 1000 / 60);
  },
  enlarge: function enlarge() {
    var _this6 = this;

    this.data.enlarge = setInterval(function () {
      _this6.cropper.setTransform({
        scale: 0.02
      });
    }, 1000 / 60);
  },
  end: function end(e) {
    clearInterval(this.data[e.currentTarget.dataset.type]);
  }
});