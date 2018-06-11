1.该插件针对于手机端输入框点击后输入法唤起的适配

2.该插件依赖于jQuery

3.使用时必须设置inputId(输入框的ID)

使用样例:

var mobileInput = $.mobileInput({inputId: "message"});

$("#message").on('focus', function() {

  mobileInput.startCheck();

}).on('blur', function() {

  mobileInput.end();

});