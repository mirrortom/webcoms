((win) => {
    // 验证类型.每个类型对应一个完成验证功能的函数
    const vType = {
        // 必要项且不能为空或空白字符
        'notnull': 'isNotNull',
        // 电子邮件格式
        'email': 'isEmail',
        // 国内手机号1[34578]\d{9}
        'mobile': 'isMobile',
        // 限26个英文,大小写不限.
        'abc': 'isAbc',
        // 限0-9数字
        '123': 'isDigit',
        // 限26个英文字母(开头)和0-9整数(可选)
        'abc123': 'isAbcDigit',
        // 限26个英文字母和0-9整数(可选)和_下划线(可选),并且是字母或者下划线开头.
        'abc_123': 'isAbcDigitUline',
        // 限url
        'url': 'isUrl',
        // 标准日期 "1999-02-28 12:08:33"
        'date': 'isDate',
        // 是否超长度限制
        'maxlen': 'isMaxLength',
        // 是否小于长度
        'minlen': 'isMinLength',
        // 正整数或正1-2位小数
        'money': "isMoney"
    };
    let $ = win.lib;
    /**
     * 验证表单元素的值
     * @param {HTMLElement|any} elem input,textarea元素
     * @returns {boolean} t/f 
     */
    $.formCheck = (elem) => {
        let inputCls = 'formcheck-err',
            errmsgCls = 'formcheck-errmsg';
        // ------------------------------------------------------------
        // 辅助方法
        // ------------------------------------------------------------
        // input获得焦点事件,作用:获得焦点时,去掉错误样式和提示语,恢复原样
        let inputfocus = () => {
            if ($(elem).hasClass(inputCls)) {
                $(elem).next('.' + errmsgCls).remove();
                elem.style.backgroundColor = null;
            }
            elem.removeEventListener('focus', inputfocus);
        };
        // input出错时,背景变红,在其后生成span,显示提示语
        let checkAlert = (msg) => {
            // input加背景色
            $(elem).addClass(inputCls);
            elem.style.backgroundColor = '#ffebec';
            // 删除旧的提示语span
            $(elem).next('.' + errmsgCls).remove();
            // 新的提示语span.其长度,背景色与input相同.
            let errmsg = $('<span>').addClass(errmsgCls).text('× ' + msg)[0];
            errmsg.style.cssText = 'display:block;padding:3px;background-color:#ffebec;color:#e6393d;width:'
                + elem.offsetWidth + 'px';
            $(elem).after(errmsg);
            // 焦点事件
            elem.addEventListener('focus', inputfocus);
        };

        // 1.验证准备
        // 获取验证类型和错误提示语.元素上的vtype属性值(多个验证用|隔开).未找到或者类型错误则退出
        let vtypeStr = elem.getAttribute('vtype');
        // 没有在要验证的元素上设置vtype属性,忽略并通过
        if ($.isNullOrWhiteSpace(vtypeStr))
            return true;
        //
        let validtype = vtypeStr.split("|");
        // 如果检测到一个验证类型无效,丢异常
        for (var i = 0, len = validtype.length; i < len; i++) {
            if (!vType.hasOwnProperty(validtype[i]))
                throw 'vtype value wrong: ' + validtype[i];
        }

        // 自定义的错误提示信息,多个也是|号分开.与vtype索引对应
        let validerrmsg = [],
            verrmsgStr = elem.getAttribute('verrmsg');
        if (!$.isNullOrWhiteSpace(verrmsgStr))
            validerrmsg = verrmsgStr.split("|");

        // 长度验证参数来自input上的maxlength,minlength属性值
        let maxlen = elem.getAttribute('maxlength');
        let minlen = elem.getAttribute('minlength');

        // 2.开始验证
        for (var n = 0, nlen = validtype.length; n < nlen; n++) {
            // 执行验证的函数名字
            let vfunname = vType[validtype[n]];
            // 验证
            let isValid = $[vfunname](elem.value);
            if (validtype[n] === 'minlen')
                isValid = !$[vfunname](elem.value, minlen);
            else if (validtype[n] === 'maxlen')
                isValid = !$[vfunname](elem.value, maxlen);
            if (!isValid) {
                checkAlert(validerrmsg[n] || 'validation failed: ' + validtype[n]);
                return false;
            }
        }
        //
        return true;
    };
    /**
     * 将一个父元素中的所有含有name属性的input,select,textarea子元素,将其name值为属性名,value值为属性值,组成一个json对象返回.
     * @param {HTMLElement} parent 容器元素dom对象
     * @returns {any} json对象
     */
    $.formJson = (parent) => {
        let nodelist = parent.querySelectorAll("input[name],select[name],textarea[name]");
        let json = {};
        nodelist.forEach((item) => {
            // 如果json中已经添加了这个属性(这里是防止相同name值,如果发现则变数组)
            if (json.hasOwnProperty(item.name)) {
                if (json instanceof Array)// 如果这个属性是数组
                {
                    json[item.name].push(item.value);// 往后加入值
                }
                else {
                    json[item.name] = [json[item.name]];// 不是数组说明该元素当前有一个值,将其变数组并置此值于其中
                    json[item.name].push(item.value);// 然后往后加入新值
                }
            }
            else {
                json[item.name] = item.value;// 加入键值对
            }
        });
        return json;
    };
})(window);