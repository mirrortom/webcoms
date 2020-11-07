// 定时检测input输入框的值的变化,检测到变化时执行一个方法
((win) => {
    let watch = (self) => {
        if (self.stopListen == 0) {
            //console.log('停止监听!');
            return;
        }
        let val = self.dom.value.replace(/^\s*|\s*$/g, '');
        //console.log(`lastvalue: ${self.lastValue} value: ${val}`);
        if (self.zhTyping == 0 && val != self.lastValue) {
            self.lastValue = val;
            if (typeof self.changeE == 'function')
                self.changeE(val, self.dom);
            //console.log('监听到变化');
        } else {
            //console.log('监听中...');
        }
        setTimeout(function () {
            watch(self)
        }, self.timeout);
    }
    /**
     * 检查input的值是否变化-功能方法
     * @param input input dom
     * @param fn 监听到变化时执行
     * @param time 监听频率,默认1秒钟检查一次
     */
    let inputvalwatch = (input, fn, time) => {
        let obj = {};
        obj.dom = input;
        // 监听改变时,执行的方法
        obj.changeE = fn;
        // 监听时间间隔
        obj.timeout = time || 1000;
        // 监听状态值 1=监听中 0=停止监听
        obj.stopListen = 0;
        // 中文输入状态值 1=输入中 0=输入结束
        obj.zhTyping = 0;

        // ==event function==
        // 1.input获得焦点时开始监听
        let watchStartE = () => {
            obj.stopListen = 1;
            obj.lastValue = obj.dom.value;
            watch(obj);
        }
        // 2.失去焦点,结束监听
        let watchEndE = () => {
            obj.stopListen = 0;
        }
        //  输入中文之前,设置标记为正在输入中,更具此标志,不执行input值比较
        let zhTypingStart = () => {
            obj.zhTyping = 1;
        }
        //  输入中文之后.这时才执行input值的比较
        let zhTypingEnd = () => {
            obj.zhTyping = 0;
        }

        // bind event
        obj.dom.addEventListener('focus', watchStartE);
        obj.dom.addEventListener('blur', watchEndE);
        obj.dom.addEventListener('compositionstart', zhTypingStart);
        obj.dom.addEventListener('compositionend', zhTypingEnd);

        // == fun ==
        // 删除监听并且解绑所有事件
        obj.clear = () => {
            obj.dom.removeEventListener('focus', watchStartE);
            obj.dom.removeEventListener('blur', watchEndE);
            obj.dom.removeEventListener('compositionstart', zhTypingStart);
            obj.dom.removeEventListener('compositionend', zhTypingEnd);
            obj.stopListen = 0;
        }
        //
        return obj;
    }
    //
    win.inputValWatch = inputvalwatch;
})(window);