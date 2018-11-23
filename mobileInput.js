/*!
* 1.该插件针对于手机端输入框点击后输入法唤起的适配
* 2.该插件依赖于jQuery
* 3.使用时必须设置inputId(输入框的ID)
* 使用样例:
* var mobileInput = $.mobileInput({inputId: "message"});
* $("#message").on('focus', function() {
* mobileInput.startCheck();
* }).on('blur', function() {
* mobileInput.end();
* });
* Licensed under the MIT license
*/
/*!
思路有问题
点击后
直接检测scroll和resize

判断是否需要唤起输入框->未唤起的情况下使用blur方法

一段时间内无反应说明未拉伸
进行拉伸

同样二次高度检测

*/
(function (window, $, undefined) {
   var path = [];

   var OS = (function (navigator, userAgent, platform, appVersion) {
     var detect = {}
     detect.webkit = userAgent.match(/WebKit\/([\d.]+)/) ? true : false
     detect.ipod = /iPod/i.test(platform) || userAgent.match(/(iPod).*OS\s([\d_]+)/) ? true : false
     detect.ipad = /iPad/i.test(navigator.userAgent) || userAgent.match(/(iPad).*OS\s([\d_]+)/) ? true : false
     detect.iphone = /iPhone/i.test(platform) || !detect.ipad && userAgent.match(/(iPhone\sOS)\s([\d_]+)/) ? true : false
     detect.mac = /Mac/i.test(platform)
     detect.ios = detect.ipod || detect.ipad || detect.iphone
     detect.safari = userAgent.match(/Safari/) && !detect.chrome ? true : false
     detect.mobileSafari = detect.ios && !!appVersion.match(/(?:Version\/)([\w\._]+)/)
     if (detect.ios) detect.iosVersion = parseFloat(appVersion.slice(appVersion.indexOf("Version/") + 8)) || -1
     return detect
   })(navigator, navigator.userAgent, navigator.platform, navigator.appVersion || navigator.userAgent);
   $("html").css({
     position: "absolute",
     top: 0,
     left: 0,
     width: "100%",
     height: "100%"
   });
   var width = $("html").width();
   var height = $("html").height();

   var scrollTop = function (top) {
     if (typeof top === "undefined") {
       return document.documentElement.scrollTop + document.body.scrollTop
     } else {
       $(window).scrollTop(top)
       return $(window).scrollTop()
     }
   }

   var adHeight = (function () {
     var adjustHeight = 0;
     var special = 0;
     if (OS.ios && OS.iosVersion <= 12) {
       adjustHeight = 40;
       if (screen.height == 812 && screen.width == 375) {
         console.log("苹果X");
       } else if (screen.height == 736 && screen.width == 414) {
         if (width > 365 && width < 385) {
           adjustHeight = 40;
           special = 288
         }
         if (width > 404 && width < 424) {
           adjustHeight = 40;
           special = 303
         }
       } else if (screen.height == 667 && screen.width == 375) {
         if (width > 365 && width < 385) {
           adjustHeight = 40;
           special = 288
         }
         if (width > 404 && width < 424) {
           adjustHeight = 40;
           special = 303
         }
       } else if (screen.height == 568 && screen.width == 320) {
         console.log("iPhone5");
       } else {
         console.log("iPhone4");
       }
     }
     console.log(adjustHeight,special);
     return {
       adjustHeight: adjustHeight,
       special: special
     }
   })();
   var STATUS = {
     currentStatus:[],
     blurClick:0,
     focusClick:1,
     onScroll:2,
     onResize:3,
     checking:4,
     checkSuccess:5,
     blurSuccess:6,
     blurFail:7,
     focusAfterInsert:8,
     changeStatus:function(num){
       if (this.blurFail == num) {
         this.currentStatus = []
       } else if (this.focusAfterInsert == num) {
         var index = this.currentStatus.indexOf(this.blurClick)
         if (index > -1) {
           this.currentStatus.splice(index,1);
         }
       } else if (this.blurSuccess == num) {
         this.currentStatus = []
       } else {
         this.currentStatus.push(num);
       }
       console.log('currentStatus:'+this.currentStatus)
     },
     has:function(num){
       if (this.currentStatus.length>0) {
         return  this.currentStatus.indexOf(num)>-1
       }
       return false;
     }
   }
   var inputCheck = {
     changeStatus: 1,
     changeCheckTimeout:null,
     init: function () {
       var m = this;
       $(window).on("scroll", function () {
         if (m.startCheckTimeout) {
           clearTimeout(m.startCheckTimeout);
         }
         m.startCheckTimeout = null;
         if (!STATUS.has(STATUS.blurClick)) {
           STATUS.changeStatus(STATUS.onScroll);
           m.changeCheck()
         }
       })
       $(window).on("resize", function () {
         if (m.startCheckTimeout) {
           clearTimeout(m.startCheckTimeout);
         }
         m.startCheckTimeout = null;
         if (!STATUS.has(STATUS.blurClick)) {
           STATUS.changeStatus(STATUS.onResize);
           m.changeCheck()
         }
       })
     },
     changeCheck:function(){
       var m = this;
       if (this.changeCheckTimeout) {
         clearTimeout(this.changeCheckTimeout);
       }
       this.changeCheckTimeout = setTimeout(function(){
         if (!STATUS.has(STATUS.checking)) {
           m.checkFun();
         }
       },200);
     },
     startCheck: function () {
       var m = this;
       STATUS.changeStatus(STATUS.focusClick);
       console.log("startCheckTime" + new Date().Format("hh:mm:ss"));
       $("body").height('auto');
       $("body").css("bottom", adHeight.adjustHeight);
       if (this.startCheckTimeout) {
         clearTimeout(this.startCheckTimeout);
       }
       if (!m.isWindowChange()) {
         this.startCheckTimeout = setTimeout(function(){
           m.options.blurInput(m.isDetectedError());
         },2000);
       }
     },
     isWindowChange:function(){
       var htmlHeight = $("html").height();
       var isresize = htmlHeight != height
       var isscroll = scrollTop() != 0;
       return  isresize || isscroll
     },
     isInReliableArea:function(){
       var htmlHeight = $("html").height();
       var isresize = htmlHeight !== height
       var scrollY = scrollTop();
       var isscroll = (scrollY != 0 && scrollY < height);
       return  isresize || isscroll
     },
     isDetectedError:function(){
       var m = this;
       return !(STATUS.has(STATUS.onScroll) || STATUS.has(STATUS.onResize));
     },
     isScorll: false,
     checkFun:function(){
       var m = this;
       m.isScorll = false;
       console.warn('checkFun start')
       $("body").height('auto');
       $("body").css("bottom", adHeight.adjustHeight);
       if (m.isWindowChange()) {  
         STATUS.changeStatus(STATUS.checking);
         if (m.isInReliableArea()) {
           m.success();
         } else {
           scrollTop(adHeight.special || 99999); 
           m.isScorll = true;
           if (OS.ios) {
             path[0] = 1
             m.checkIphone();
           } else {
             path[0] = 2
             m.checkNotIphone();
           }
         }
       } else {
         m.options.blurInput()
       }
     },
     success: function () {
       STATUS.changeStatus(STATUS.checkSuccess);
       this.savedHeight = $('html').height();
     },
     end: function () {
       var m = this;
       STATUS.changeStatus(STATUS.blurClick);
       setTimeout(function () {
         if (STATUS.has(STATUS.blurClick)) {
           if (m.checkTimeout) {
             clearTimeout(m.checkTimeout);
           }
           $("html").css({
             position: "absolute",
             top: "0px",
             left: "0px",
             width: "100%"
           });
           console.log('end');
           $("html,body").height('100%');
           $("body").css("bottom",0);
           STATUS.changeStatus(STATUS.blurSuccess);
         }else{
           STATUS.changeStatus(STATUS.blurFail);
         }
       }, 100);
     },
     checkIphone: function () {
       var m = this;
       if (m.checkTimeout) {
         clearTimeout(m.checkTimeout);
       }
       m.checkTimeout = setTimeout(function () {
         m.checkIphoneFun();
       }, 300)
     },
     checkNotIphone: function () {
       var m = this;
       if (m.checkTimeout) {
         clearTimeout(m.checkTimeout);
       }
       m.checkTimeout = setTimeout(function () {
         m.checkNotIphoneFun();
       }, 500);
     },
     samples: [],
     checkIphoneFun: function () {
       var m = this;
       if (m.isInReliableArea()) {
         m.success();
         return;
       }
       if (document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
         window.setTimeout(function () {
           document.activeElement.scrollIntoViewIfNeeded();
         }, 0);
       }
       if (m.checkTimeout) {
         clearTimeout(m.checkTimeout);
       }
       m.samples = [];
       m.getSample();
     },
     checkNotIphoneFun: function () {
       var m = this;
       if (scrollTop() < document.body.scrollHeight && document.documentElement.scrollTop != 0) {
         path[0] = 1
         this.checkIphone()
       } else if (!($("body").width() == 320)) { //iphone5例外
         if (document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
           window.setTimeout(function () {
             document.activeElement.scrollIntoViewIfNeeded();
           }, 0);
         }
         m.success();
       }
     },
     getSample: function () {
       var m = this;
       var scHeight = document.body.scrollHeight;
       var htmlHeight = $("html").height();
       var scrollY = scrollTop();
       m.samples.push({
         scHeight: scHeight,
         scrollY: scrollY,
         height: htmlHeight
       });
       m.changeHeight();
       if (m.isInReliableArea()) {
         m.success();
       }else if (m.samples.length == 1) {
         m.checkTimeout = setTimeout(function () {
           if ((scrollTop() < 100 && m.isScorll) || (scrollTop()==0 && document.body.scrollHeight == $("html").height())) {
             var keyboardHeight = scrollTop() || (height - window.innerHeight);
             var sheight = keyboardHeight || 99999;
             scrollTop(sheight)
           }
           m.getSample();
         }, 500);
       }
     },
     changeHeight: function () {
       var m = this;
       console.log(JSON.stringify(m.samples));
       if (m.samples.length == 1) {
         var w = m.checkHeight(m.samples[0])
         var a = w.a
         var b = w.b
         var c = w.c;
         var h = w.h;
         if (c < -100) {
           m.samples[0].type = 1;
         } else if (a < 10) {
           if (b > 0) {
             m.samples[0].type = 2;
             $("html").css({
               top: 0,
               width: "100%",
               height: h
             });
           } else {
             m.samples[0].type = 3;
             $("html").css({
               top: 0,
               width: "100%",
               height: (height)
             });
           }
         } else {
           m.samples[0].type = 4;
           $("html").css({
             top: 0,
             width: "100%",
             height: height
           });
           scrollTop(0);
         }
         path[1] = m.samples[0].type;
         return;
       } else if (m.samples.length >= 2) {
         var first = m.samples[0];
         var second = m.samples[1];
         path[2] = 3
         if (first.scrollY == second.scrollY && first.height == second.height && first.scHeight == second.scHeight) {
           path[2] = 0
           m.success();
           return;
         } else if (first.scrollY != second.scrollY) {
           var w = m.checkHeight(second);
           var b = w.b;
           var h = w.h;
           if (b > 0) {
             second.type = 2;
             $("html").css({
               top: 0,
               width: "100%",
               height: h
             });
           } else {
             $("html").css({
               top: 0,
               width: "100%",
               height: height
             })
           }
           path[2] = 1
           m.samples = [m.samples.pop()];
         } else if (first.height != second.height) {
           if (first.type == 3) {
             path[2] = 2
             $("html").css({
               top: 0,
               width: "100%",
               height: (second.height)
             });
           }
           m.success();
           return;
         } else {
           m.success();
           return;
         }
       }
     },
     checkHeight: function (sample) {
       var a = Math.abs(sample.scHeight - height);
       var b = sample.scrollY - height * 2;
       var c = sample.height - height;
       var d = sample.scHeight - sample.scrollY;
       var h = Math.min(d, height / 2);
       h = parseInt(Math.max(h, height / 2));
       return {
         a: a,
         b: b,
         c: c,
         h: h,
       }
     },
     focusAfterInsert: function () {
       var m = this;
       var continueInsert = (height != $("html").height() || scrollTop() != 0)
       if (continueInsert) {
         STATUS.changeStatus(STATUS.focusAfterInsert);
       }
       return continueInsert
     }
   }  
   var MOBILEINPUT = function (options) {
     this.defaults = {
         compantPk: "",
         codeKey: "",
         type: "",
       },
       this.options = $.extend({}, this.defaults, options);
   }
   MOBILEINPUT.prototype = inputCheck
   MOBILEINPUT.prototype.height = height
   MOBILEINPUT.prototype.scrollY = scrollTop
   $.mobileInput = function (options) {
     var mobileInput = new MOBILEINPUT(options);
     mobileInput.init();
     return mobileInput;
   }
 })(window, jQuery);
