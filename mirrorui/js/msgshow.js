//===========================================
// 在页面上提示信息.
// msgshow1=msgshow('#id')
// msgshow1.ok("内容")
//===========================================

((win) => {
    // 帮助函数
    const M = win.$ui;
    /**
     * 返回一个msgshow实例.
     * @param {any} id 容器id,要带#号.例如 #infobox
     */
    let msgshow = (id) => {
        let obj = {};
        obj.id = id;
        /** 
         * 在页面上提示信息.如果只传id,就清空容器.
         * @param {string} msg 信息内容
         * @param {string} title 标题
         * @param {string} title 主题类
         */
        obj.show = function (msg, title, clsN) {
            if (!this.id) return;
            let tpl = `<div class="msgshow ${clsN}"><span class="title">${title}</span><span class="text">${msg}</span></div>`;
            M(this.id).html(tpl);
        }
        obj.ok = function (msg) {
            if (!this.id) return;
            let tpl = `<div class="msgshow success"><span class="title">\u2714 成功</span><span class="text">${msg}</span></div>`;
            M(this.id).html(tpl);
        }
        obj.err = function (msg) {
            if (!this.id) return;
            let tpl = `<div class="msgshow danger"><span class="title">\u2716 错误</span><span class="text">${msg}</span></div>`;
            M(this.id).html(tpl);
        }
        obj.warn = function (msg) {
            if (!this.id) return;
            let tpl = `<div class="msgshow warning"><span class="title">\u26A0 警示</span><span class="text">${msg}</span></div>`;
            M(this.id).html(tpl);
        }
        obj.clear = function () {
            if (!this.id) return;
            M(this.id).empty();
        }
        return obj;
    }
    //
    win.msgshow = msgshow;
})(window)