# 一些webui组件
为什么要重复造轮子呢?  
其意义不再于造了更劣质的轮子,而是熟悉造法.
## mirrorui 模仿bt
学习bootstrap快速增加前端熟悉度,模仿它做一个webui  
## msgbox 弹出层
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

## MyDatePick 日期时间
日期选框,参考自火狐浏览器自带的日期框  
支持年月日,可选时分秒,选择方便  
示例:mydatepick/index.html
```
// 在input上调用MyDatePick方法
<input onclick="MyDatePick()" type="text" />

// 需要时分秒
<input onclick="MyDatePick({fmt:'datetime'})" type="text">
```

## cachepage 缓存页
组件的主要能力是使用createDocumentFragment这个API将页面缓存为DOM片段.由于片段不在文档流内,所以不会影响当前HTML文档.  
示例:cachepage/index.html  
```
// 选项卡框Dom对象
let tabsDom = document.getElementById('tabsbox1');
// 显示内容Domc对象
let contDom = document.getElementById('mainbox');

// cachepage 实例化
let cpg = cachepage(tabsDom, contDom);
// 主要方法
let cacheDom = cpg.load(页面id, 选项卡标题);

if (cacheDom) {
    contDom.append(cacheDom);
}
```

## pagenum 分页条
组件按钮 上一页,1页,当前页前几页,当前页,当前页后几页,最后页,下一页,总页数,跳转页输入框,确定  
示例:pagenum/index.html  
```
<nav class="pagenum" id="testpagenumbox1"></nav>

function newpagenum(pnnum) {
    let cfg = {
        // 容器ID(必须)
        domId: 'testpagenumbox1',
        // 点击事件(必须)
        pageClickE: newpagenum,
        // 总数(必须) >0 由后端返回新的总数
        totalData: 96,
        // 当前页码(必须) >0 由后端返回当前页码,或者页面记住当前请求页面
        pageIndex: pnnum,
        // 每页数量 [5-50]
        pageSize: 10,
        // 显示几个按钮[5-10]
        totalBtn: 5
    }
    pagenum(cfg);
}
newpagenum(1);
```