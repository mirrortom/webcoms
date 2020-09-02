##### 作用
主要封装一些常用的js原生api,为了便于使用  
在程序组织上,形式上模仿借鉴了jquery的做法  
##### 目录
src/ 其内文件打包成lib.js,每个库一个文件夹.
##### 主要文件
jslib.js 常用jsapi封装库,如dom操作,随机数函数等  
cavlib.js canvas画图帮助库,如直线,曲线,图标绘画等等
##### 函数对象
window上的引用对象 lib,实际工作的对象jslib  
jslib是一个类数组对象,选择器匹配的元素会保留在其中以供操作.这是模仿jQuery对象的.
##### 使用
###### jslib
类似jquery.选择器,链式调用,还有些静态方法  
// 取id值为box的元素的val属性的值  
```let val = $('#box').prop('val')```  
// 新建div元素,加上active样式类  
```$('<div>').addClass('active')```  
文档 [Document](https://mirrortom.date/jslib/index.html)  
