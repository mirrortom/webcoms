((win) => {
    // 验证类型.每个类型对应一个完成验证功能的函数
    const vType = {
        // 必要项且不能为空或空白字符
        'notnull': 'isNotNull',
        // 电子邮件格式
        'email': 'isEmail',
        // 指示一个字符串是否为国内11位手机号
        // [可匹配"(+86)013800138000",()号可以省略，+号可以省略，(+86)可以省略, 11位手机号前的0可以省略; 11位手机号第二位数可以是3~9中的任意一个]
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
        // 限ipv4
        'ipv4': 'isIpv4',
        // 标准日期 "1999-02-28 12:08:33"
        'date': 'isDate',
        // 是否超长度限制
        'maxlen': 'isMaxLength',
        // 是否小于长度
        'minlen': 'isMinLength',
        // 数值是否小于指定数值
        'minnum': 'isMinNum',
        // 数值是否大于指定数值
        'maxnum': 'isMaxNum',
        // 正整数或正1-3位小数
        'money': "isMoney"
    };
    // 表单元素错误提示样式类,提示语样式类
    const inputCls = 'formcheck-err',
        errmsgCls = 'formcheck-errmsg';
    //
    const $ = win.ns.jslib;
    /**
     * 清除表单元素的错误样式和提示语.
     * @param {HTMLElement|any} elem input,textarea元素
     */
    $.formClear = (elem) => {
        if ($(elem).hasClass(inputCls)) {
            $(elem).next('.' + errmsgCls).remove();
            elem.style.backgroundColor = null;
            elem.parentNode.style.position = null;
        }
        elem.removeEventListener('focus', $.formClear);
    };
    // 
    /**
     * 生成表单元素验证出错时的错误样式和提示语: 背景变红,在其正下方生成span,显示提示语
     * @param {HTMLElement|any} elem input,textarea元素
     * @param {string} msg 提示语
     */
    $.formAlert = (elem, msg) => {
        let bgColor = '#ffebec', fgColor = '#e6393d';
        // input加背景色
        $(elem).addClass(inputCls);
        elem.style.backgroundColor = bgColor;
        // input父级相对定位
        elem.parentNode.style.position = 'relative';
        // 显示提示语的span.其长度,背景色与input相同.显示在input正下方,对齐input左边
        let errmsg = $('<span>').addClass(errmsgCls).text('⛔ ' + msg)[0];
        errmsg.style.cssText = $.format(
            'position:absolute;top:{0}px;left:{1}px;padding:3px;background-color:{2};color:{3};width:{4}px',
            elem.offsetTop + elem.offsetHeight, elem.offsetLeft, bgColor, fgColor, elem.offsetWidth);
        $(elem).after(errmsg);
        // 焦点事件
        elem.addEventListener('focus', () => { $.formClear(elem) });
    };
    /**
     * 验证表单元素的值
     * @param {HTMLElement|any} elem input,textarea元素
     * @returns {boolean} t/f 
     */
    $.formCheck = (elem) => {
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
        // 验证前清除旧的提示语span(如果有)
        $.formClear(elem);
        // 2.开始验证
        for (var n = 0, nlen = validtype.length; n < nlen; n++) {
            // 执行验证的函数名字
            let vfunname = vType[validtype[n]];
            // 验证
            let isValid = true;
            // 长度验证参数来自input上的maxlength,minlength属性值
            if (validtype[n] === 'minlen') {
                let minlen = elem.getAttribute('minlength');
                isValid = !$[vfunname](elem.value, minlen);
            }
            else if (validtype[n] === 'maxlen') {
                let maxlen = elem.getAttribute('maxlength');
                isValid = !$[vfunname](elem.value, maxlen);
            }
            else if (validtype[n] === 'minnum') {
                let minnum = elem.getAttribute('minnum');
                isValid = !$[vfunname](elem.value, minnum);
            }
            else if (validtype[n] === 'maxnum') {
                let maxnum = elem.getAttribute('maxnum');
                isValid = !$[vfunname](elem.value, maxnum);
            }
            else {
                isValid = $[vfunname](elem.value);
            }
            if (isValid != true) {
                $.formAlert(elem, validerrmsg[n] || 'validation failed: ' + validtype[n]);
                return false;
            }
        }
        //
        return true;
    };
    /**
     * 将一个父元素中的所有含有name属性的input,select,textarea子元素,将其name值为属性名,value值为属性值,组成一个json对象返回.
     * @param {HTMLElement} parent 容器元素dom对象
     * @param {bool} notEmptyVal 设为true时,input的值长度为空时,不加入json
     * @returns {any} json对象
     */
    $.formJson = (parent, notEmptyVal) => {
        let nodelist = parent.querySelectorAll("input[name],select[name],textarea[name]");
        let json = {};
        for (var i = 0, len = nodelist.length; i < len; i++) {
            let item = nodelist[i];
            if (notEmptyVal == true && item.value.length == 0)
                continue;
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
        };
        return json;
    };
})(window);