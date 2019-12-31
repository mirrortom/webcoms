##### 作用
主要封装一些常用的js原生api,为了便于使用  
在程序组织上,形式上模仿借鉴了jquery的做法  
##### 目录
src/ 其内文件打包成lib.js
##### 主要文件
lib.js,由多个js文件合成,实际上是一个文件,分文件便于维护
##### 函数对象
window上的引用对象 lib,实际工作的对象jslib  
jslib是一个类数组对象,选择器匹配的元素会保留在其中以供操作.这是模仿jQuery对象的.
##### 使用
类似jquery.选择器,链式调用,还有些静态方法  
// 取id值为box的元素的val属性的值  
```let val = lib('#box').prop('val')```  
// 新建div元素,加上active样式类  
```lib('<div>').addClass('active')```
