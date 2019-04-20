# 一些webui组件
为什么要重复造轮子呢?  
其意义不再于造了更劣质的轮子,而是熟悉造法.
## msgbox
弹出框,模仿了alert confirm prompt  
弹出自定义html片段  
修改成js原生,没有用jquery了  
示例:msgbox/index.html
```
// 弹出alert
msgbox.alert('alert框');

// 弹出confirm
msgbox.confirm('confirm标题',callback);

// 弹出prompt
msgbox.prompt('输入信息',callback);

// 弹出自定义框
msgbox.show(innerhtml)
```
