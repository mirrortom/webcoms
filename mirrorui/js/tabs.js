// 标签卡自定义组件
((win) => {
    // 帮助函数
    const $ = win.ns.domHelp;
    win.customElements.define('m-tabs', class extends HTMLElement {
        // =======
        // fields
        // =======
        // 容器高度 (px)
        height = 320;
        // =======
        // 构造函数
        // =======
        constructor() {
            // 必须首先调用 super 方法
            super();

            // ==================
            // init set prop
            // ==================
            this._init();
        }

        // ========
        // 钩子函数
        // 元素每次插入到 DOM 时都会调用.用于运行安装代码,例如获取资源或渲染.一般来说,您应将工作延迟至合适时机执行
        // ========
        connectedCallback() {
            // 自定义标记放入documentFragment后再取出.也会触发connectedCallback()方法
            // 所以,此方法里最好不用
            // 宜: 元素初始化后不再改变的量,可以读取使用.每次加入dom时,都要呈现新状态,丢弃旧状态的.
            // 不可: 添加子元素,修改变量,其它会导致元素状态改变的行为.

        }


        // =======
        // prop
        // =======


        // =======
        // method
        // =======

        // 初始化
        _init() {
            let thisobj = $(this);
            // height属性设置到容器
            this.style.height = thisobj.prop('height') || this.height + 'px';
            // 样式
            thisobj.addClass('tabs');
            // 标签和面板设置

            // --事件绑定--
            // 标签点击事件
            this._tabOnClick();
        }

        // 点击标签
        _tabOnClick() {
            $(this).find('.tabs-label').each((item) => {
                item.onclick = () => {
                    let actCls = 'active';
                    if ($(item).hasClass(actCls)) {
                        return;
                    }
                    // 去掉当前活动的标签和面板
                    $(this).find('.active').removeClass(actCls);
                    $(item).addClass(actCls);
                    // 根据pid找对应面板,否则根据索引
                    let pid = $(item).prop('pid');
                    if (pid == null || pid.length == 0) {
                        let index = $(item).index();
                        $(this).find('.tabs-panel').eq(index).addClass(actCls);
                        return;
                    }
                    $(this).find('.tabs-panel[pid="' + pid + '"]').addClass(actCls);
                }
            });
        }

        // 激活标签 index:标签索引.index无效则不动作
        activeTab(index) {
            if (index == undefined || isNaN(parseInt(index)))
                return;
            let tabobj = $(this).find('.tabs-label').eq(index)[0];
            if (tabobj) {
                tabobj.click();
            }
        }
    });
})(window);