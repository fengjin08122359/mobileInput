(function(window, $, undefined) {
  var OS= (function(navigator, userAgent, platform, appVersion){
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
  var MOBILEINPUT = function(options) {
    this.defaults = {
        compantPk: "",
        codeKey: "",
        type: "",
        inputId: "message"
      },
      this.options = $.extend({}, this.defaults, options);
  }
  MOBILEINPUT.prototype = {
  width:0,
  height:0,
  checkInterval:null,
  onCheck:false,
  special: 0,
  adjustHeight:0,
    init: function() {
      $("html").css({
        position: "absolute",
        top: 0,
        left: 0,
        width:"100%",
        height: "100%"
      });
      this.width = $("html").width();
      this.height = $("html").height();
      this.setAdjustHeight();
      this.scrollTop = document.body.scrollTop;
    },
    setAdjustHeight:function(){
      if (OS.mobileSafari && OS.iosVersion < 12) {
        this.adjustHeight = 40;
        if(screen.height == 812 && screen.width == 375){
          console.log("苹果X");
        }else if(screen.height == 736 && screen.width == 414){
          if (this.width > 365 && this.width < 385) {
              this.adjustHeight = 0;
              this.special = 288
          }
          if (this.width > 404 && this.width < 424) {
            this.adjustHeight = 0;
            this.special = 303
          }
        }else if(screen.height == 667 && screen.width == 375){
          if (this.width > 365 && this.width < 385) {
            this.adjustHeight = 0;
            this.special = 288
          }
          if (this.width > 404 && this.width < 424) {
            this.adjustHeight = 0;
            this.special = 303
          }
        }else if(screen.height == 568 && screen.width == 320){
            console.log("iPhone5");
        }else{
            console.log("iPhone4");
        }
      }
    },
    startCheck:function(){
      var m = this;
      m.onCheck = true;
      if(navigator.userAgent.indexOf("iPhone")> -1   ){
        m.checkIphone();
      }else{
        m.checkNotIphone();
      }
    },
    checkIphone:function(){
      var m = this;
      if(m.checkInterval){
        clearInterval(m.checkInterval);
      }
      m.scrollToBottom();
        m.checkInterval = setInterval(function(){
           m.checkIphoneFun();
        },300)
    },
    checkNotIphone:function(){
      var m = this;
      setTimeout(function() {
        if (window.scrollY < 100) {
           window.scrollTo(0, 99999);
        }
        m.scrollToBottom();
        setTimeout(function() {
            if (window.scrollY < 100) {
                window.scrollTo(0, 99999);
            }
            m.checkNotIphoneFun();
        }, 100);
      }, 500);
    },
    checkNotIphoneFun:function() {
      var m = this;
      if(m.endScroll){
        return;
      }
      if(this.scrollY()<document.body.scrollHeight && document.documentElement.scrollTop!=0){
        this.checkIphone()
      }else if(!(navigator.userAgent.indexOf("iPhone") > -1 && $("body").width()==320) ){//iphone5例外
        if (window.scrollY < 100) {
            window.scrollTo(0, 99999);
        }
        if(document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
          window.setTimeout(function() {
             document.activeElement.scrollIntoViewIfNeeded();
          },0);
        }
        m.success();
      }
    },
    checkIphoneFunV3:function(){
      var m = this;
      console.warn("endScroll"+m.endScroll)
      if(m.endScroll){
        if(m.checkInterval){
          clearInterval(m.checkInterval);
        }
        return;
      }
      m.samples= [];
      m.getSample();
    },
    samples:[],
    getSample:function(){
      var m = this;
      if(m.endScroll){
        if(m.checkInterval){
          clearInterval(m.checkInterval);
        }
        return;
      }
      if(document.activeElement && document.activeElement.scrollIntoViewIfNeeded) {
        window.setTimeout(function() {
          document.activeElement.scrollIntoViewIfNeeded();
        },0);
      }
      
      if (this.special && m.samples.length == 0) {
        console.warn("special");
        $(window).scrollTop(this.special);
      }
      if(m.checkInterval){
        clearInterval(m.checkInterval);
      }
      
      var scscrollHeight = document.body.scrollHeight;
      var height = $("html").height();
      var scscrollY = this.scrollY();
      m.samples.push({
        scHeight:scscrollHeight,
        scrollY:scscrollY,
        height:height
      });
      m.changeHeight();
      if(m.samples.length==1){
        this.sampleTimeout = window.setTimeout(function() {
          if (m.onCheck == true) {
            if (window.scrollY < 100) {
              var keyboardHeight = m.scrollY() || (m.height - top.innerHeight)
              console.warn("keyboardHeight"+keyboardHeight);
              if (m.special && keyboardHeight != m.special) {
                $(window).scrollTop(m.special);
                window.scrollTo(0, keyboardHeight || 99999);
              }else{
                window.scrollTo(0, keyboardHeight || 99999);
              }
            }
            m.getSample();
          }else{
            m.end();
          }
        },500);
      }
    },
    changeHeight:function(){
      var m = this;
      console.log(JSON.stringify(m.samples));
      if(m.samples.length==1){
        var a = Math.abs(m.samples[0].scHeight-this.height);//
          var b = m.samples[0].scrollY-this.height*2;//
          var c = m.samples[0].height-this.height;
          var ppheight = m.samples[0].scHeight-m.samples[0].scrollY ;
        var sctop = -Math.abs(m.samples[0].scrollY);
        var h = Math.min(ppheight,this.height/2);
        h = Math.max(h,this.height/2);
        h = parseInt(h);
        if(c<-100){//高度不等
          m.samples[0].type=1;
        }else if(a<10){//高度近似
            if(b>0){
              m.samples[0].type=2;
              $("html").css({
                top:0,
                width:"100%",
                height:h
              });
            }else{
              m.samples[0].type=3;
              $("html").css({
                top:0,
                width:"100%",
                height:(this.height)
              });
              //window.scrollTo(0, m.samples[0].scrollY);
            }
          }else{
            m.samples[0].type=4;
            $("html").css({
            top:0,
            width:"100%",
            height:this.height
          });
            document.body.scrollTop = 0;
          }
      }else if(m.samples.length==2){
        var ppheight = m.samples[1].scHeight-m.samples[1].scrollY ;
        var sctop = -Math.abs(m.samples[1].scrollY);
        var h = Math.min(ppheight,this.height/2);
        h = Math.max(h,this.height/2);
        h = parseInt(h);
        if(m.samples[0].scrollY==m.samples[1].scrollY&&m.samples[0].height==m.samples[1].height&&m.samples[0].scHeight==m.samples[1].scHeight){

        }else if(m.samples[0].scrollY!=m.samples[1].scrollY){
          var b = m.samples[1].scrollY-this.height*2;//
          if(b>0){
            m.samples[1].type=2;
              $("html").css({
                top:0,
                width:"100%",
                height:h
              });
              m.samples[0] = m.samples[1];
              m.samples.pop();
          }else {
            $("html").css({
              top:0,
              width:"100%",
              height:"100%"
            })
            m.samples[0] = m.samples[1];
            m.samples.pop();
            return;
          }
        }else if(m.samples[0].height!=m.samples[1].height){
         if (m.samples[0].type==3) {
           $("html").css({
             top:0,
             width:"100%",
             height:(m.samples[1].height)
           });
         }
        }
        m.success();
      }
    },
    checkIphoneFun: function() {
      var m = this;
      console.log(m.endScroll);
      if(m.endScroll){
        if(m.checkInterval){
          clearInterval(m.checkInterval);
        }
        return;
      }
      m.checkIphoneFunV3();
      return;
    },
    success:function(){
      this.scrollToBottom();
      this.endScroll = true;
      $("body").height($("html").height()-this.adjustHeight)
      $("#"+this.options.inputId).animate({scrollTop:document.getElementById(this.options.inputId).scrollHeight},1000);
    },
    end: function() {
      var m = this;
      m.onCheck = false;
      setTimeout(function(){
        console.warn("onCheck"+m.onCheck)
        if(!m.onCheck){
          if(m.checkInterval){
            clearInterval(m.checkInterval);
          }
          m.endScroll = false;
          $("html").css({
                position: "absolute",
              top: "0px",
              left: "0px",
              width: "100%"
          });
          $("html").animate({height:"100%"},"fast",function(){
            $("body").height($("html").height())
          });
          document.body.scrollTop = m.scrollTop;
          m.scrollToBottom();
        }
      },100);
    },
    scrollY:function(){
      return document.body.scrollTop + document.documentElement.scrollTop;
    },
    scrollToBottom:function () {
      document.getElementById(this.options.inputId).scrollTop = document.getElementById(this.options.inputId).scrollHeight; // 滚动条置底
    }
  }
  $.mobileInput = function(options) {
    var mobileInput = new MOBILEINPUT(options);
    mobileInput.init();
    return mobileInput;
  }
})(window, jQuery);