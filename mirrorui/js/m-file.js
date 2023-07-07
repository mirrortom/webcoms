// ====================================================================================
// m-file 自定义标记
// ====================================================================================
((win) => {
    const $ = win.ns.domHelp;
    win.customElements.define('m-file', class extends HTMLElement {
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();
            // =======
            // event
            // =======

            // ==================
            // init set prop
            // ==================
            let thisobj = $(this);
            // tag属性设置初始标题
            this.tag = thisobj.prop('tag') || '请选择文件...';
            // 样式
            thisobj.addClass('input-file');
            //
            this.reset();
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
        }

        // =======
        // prop
        // =======
        // 获取input-file的dom对象
        get inputFile() {
            return this.querySelector('input[type=file]');
        }
        // 获取files文件数组
        get files() {
            return this.querySelector('input[type=file]').files;
        }
        // =======
        // method
        // =======
        // 重置控件,已选的文件会清除
        reset() {
            this.innerHTML = '';
            this.innerText = '';
            let thisobj = $(this);

            // 添加input type=file和label标签
            let fileDom = $('<input>').prop('type', 'file')[0];
            if (this.hasAttribute('disabled')) {
                fileDom.disabled = true;
            }
            if (this.hasAttribute('multiple')) {
                fileDom.multiple = true;
            }
            // input-file选择改变时,文件路径显示在label上
            fileDom.onchange = () => {
                let fnlist = '';
                let files = this.inputFile.files;
                [].forEach.call(files, (item) => {
                    fnlist += item.name + ',';
                });
                fnlist = fnlist.substring(0, fnlist.length - 1);
                //console.log(fnlist);
                $(this).find('.form-label').text(fnlist);
            }
            // 设置标题
            let labelDom = $('<label>').addClass('form-label').text(this.tag)[0];
            //
            thisobj.append(fileDom);
            thisobj.append(labelDom);
        }
    });
})(window);