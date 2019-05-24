/*====================================================================================*
 * 处理表单元素的一些辅助方法.例如文件选择框选中文件时,将文件名显示在文件框标题上,
 * 使用这些方法时,一般是绑定到表单元素的事件上,例如change,blur等事件.
 * 所有辅助方法都绑定到$ui这个对象上,调用时 $ui.fn(参数);
 *====================================================================================*/
((win) => {
    let ui = {};
    // 文件选择框选择后,将文件名显示在标签上.可绑定到input-file的onchange方法,传参this
    ui.inputFileChange = (inputfileDom) => {
        let fnlist = '';
        [].forEach.call(inputfileDom.files, (item) => {
            fnlist += item.name + ',';
            //console.dir(item);
        })
        fnlist = fnlist.substr(0, fnlist.length - 1);
        let labelDom = inputfileDom.parentNode.querySelector('.input-file-label');
        labelDom.innerHTML = fnlist;
    }
    // 清空文件选择框
    ui.clsInputFile = (inputfileDom) => {
        // 标签清空一定要先执行,然后再执行文件框清空.
        // 如果反过来执行,那么inputfileDom就会找不到对象,因为outterHTML相当于换一个input
        let labelDom = inputfileDom.parentNode.querySelector('.input-file-label');
        labelDom.innerHTML = ''; 
        inputfileDom.outerHTML = inputfileDom.outerHTML;
    }
    // 判断btn是否含有loading样式.如果没有会添加上等待样式
    ui.isBtnLoading =  (btn)=> {
        if (btn.classList.contains('loading'))
            return true;
        btn.classList.add('loading');
        return false;
    }
    // 去掉btn的loading样式.time是豪秒数,表示经过此时间后去掉loading样式
    ui.clsBtnLoading =  (btn, time)=> {
        if (time >= 0) {
            setInterval( ()=> {
                btn.classList.remove('loading');
            }, time);
        } else {
            btn.classList.remove('loading');
        }
    }
    // window上的名称
    win.$ui = ui;
})(window);