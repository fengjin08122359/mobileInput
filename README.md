1.该插件针对于手机端输入框点击后输入法唤起的适配

2.该插件依赖于jQuery

3.使用时必须设置inputId(输入框的ID)

使用样例:

var mobileInput = $.mobileInput({inputId: "message"});

$(".footer").on('focus', function() {

  mobileInput.startCheck();

}).on('blur', function() {

  mobileInput.end();

});

//to-do-list

(x)iphone6 微信无法适配

( )多次滑动不适配iphone6sp

( )点击向上滑动不适配iphone6

( )部分机型发送后重新绑定会出现跳动
