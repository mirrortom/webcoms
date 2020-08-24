### 如何定制mirrorUI?  

/stylus , /js 这两个目录是UI的原始css和js代码,可以复制一份,然后修改编译.
为了便于管理,做法如下:  

##### 1. 新建目录:  
为这个自定义版本建一个新目录,将/stylus , /js复制一份.目录名字可以是版本名称.  
##### 2.新建css,js的编译配置文件:  
bundleconfig.json,compilerconfig.json.可以复制系统已有的这两个文件到新目录下  
,再修改其中的文件目录,输出的css,js路径也放再新目录下.
##### 3.修改和编译
自定义的过程就是修改/stylus,/js文件里的内容.如果有的组件不需要,对于css,修改/stylus/index.styl文件.  
对于js,修改bundleconfig.json的inputFiles配置.  

简单的讲就是修改源码,调整配置,重新编译输出,就成自己的UI了.这也是模仿bootstrap自定义ui功能的.
##### 4.必须环境:
vs2017+  
Bundler & Minifier 插件(vs2017+版本)  
Web Compiler 插件(vs2017+版本)  