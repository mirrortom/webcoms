//===========================================
// 在页面上提示信息.
// msgshow1=msgshow('id')
// msgshow1.ok("内容")
//===========================================

((win) => {
    // 帮助函数
    const M = win.$ui;
    /**
     * 返回一个msgshow实例.
     * @param {any} id 容器id
     */
    let msgshow = (id) => {
        let obj = {};
        obj.dom = document.getElementById(id);
        //
        /** 
         * 在页面上提示自定义信息.
         * @param {string} msg 信息内容
         * @param {string} title 标题
         * @param {string} title 主题类
         */
        obj.show = function (msg, title, clsN) {
            if (!this.dom) return;
            let tpl = `<div class="msgshow ${clsN}"><span class="title">${title}</span><span class="text">${msg}</span><b class="close">x</b></div>`;
            M(this.dom).html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }
        obj.ok = function (msg) {
            if (!this.dom) return;
            let tpl = `<div class="msgshow success"><span class="title">\u2714 成功</span><span class="text">${msg}</span><b class="close">x</b></div>`;
            M(this.dom).html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }
        obj.info = function (msg) {
            if (!this.dom) return;
            let tpl = `<div class="msgshow info"><span class="title">! 提示</span><span class="text">${msg}</span><b class="close">x</b></div>`;
            M(this.dom).html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }
        obj.err = function (msg) {
            if (!this.dom) return;
            let tpl = `<div class="msgshow danger"><span class="title">\u2716 错误</span><span class="text">${msg}</span><b class="close">x</b></div>`;
            M(this.dom).html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }
        obj.warn = function (msg) {
            if (!this.dom) return;
            let tpl = `<div class="msgshow warning"><span class="title">\u26A0 警示</span><span class="text">${msg}</span><b class="close">x</b></div>`;
            M(this.dom).html(tpl).find('.close')[0].onclick = () => {
                this.clear();
            }
        }
        obj.clear = function () {
            if (!this.dom) return;
            M(this.dom).empty();
        }
        return obj;
    }
    //
    win.msgshow = msgshow;
})(window);