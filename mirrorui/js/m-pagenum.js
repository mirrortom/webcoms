// ====================================================================================
// m-pagenum 自定义标记
// ====================================================================================
((win) => {
  const $ = win.ns.domHelp || win.ns.jslib;
  win.customElements.define('m-pagenum', class extends HTMLElement {
    // =======
    // 构造函数
    // =======
    constructor() {
      // 必须首先调用 super 方法
      super();
      //
      this.cfg = {};
      // =======
      // event
      // =======

      // ==================
      // init set prop
      // ==================
      // 添加样式
      let thisobj = $(this);
      thisobj.addClass('pagenum');
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
    // 配置
    get config() {
      return this.cfg;
    }
    // 总页数
    set config(cfg) {
      // 当前页码(必须)
      this.cfg.PageIndex = cfg.pageIndex || 1;
      // 每页数量[5-50]
      this.cfg.PageSize = (cfg.pageSize > 4 && cfg.pageSize < 51) ? cfg.pageSize : 10;
      // 数据总数(必须)
      this.cfg.TotalData = cfg.totalData || 0;
      // 总页数
      let pagecount = parseInt(this.cfg.TotalData / this.cfg.PageSize);
      let pagecountMod = this.cfg.TotalData % this.cfg.PageSize;
      this.cfg.TotalPage = pagecountMod > 0 ? pagecount + 1 : pagecount;
      // 分页按钮个数[5-10].
      this.cfg.TotalBtn = (cfg.totalBtn > 4 && cfg.totalBtn < 11) ? cfg.totalBtn : 5;

      // 页码改变后执行(pageIndex:改变后的页码)
      this.cfg.OnPageChg = cfg.onPageChg;
      //console.log(this.cfg);
    }

    // =======
    // method
    // =======
    // 计算起始页(这个方法在内部使用)
    pagenumRange() {
      let cfg = this.cfg;
      let startIndex = cfg.PageIndex - parseInt(cfg.TotalBtn / 2) +
        (cfg.TotalBtn % 2 == 0 ? 1 : 0);
      let endIndex = cfg.PageIndex + parseInt(cfg.TotalBtn / 2);

      // 起始页小于1,说明当前页码位于正中时,前面页码数不够了.应将第1页为起始页码,而结束页码也应该重新计算
      if (startIndex < 1) {
        startIndex = 1;
        // 根据要显示的页码数计算结束页码,如果算出页码数大于总页码,则以总页码数为结束页码
        endIndex = endIndex > cfg.TotalPage ? cfg.TotalPage : cfg.TotalBtn;
      }
      // 结束页码大于总页码,说明当前页码位于正中时,后面的页码数不够.应将总页码数为终止页码,起始页码应重新计算
      if (endIndex > cfg.TotalPage) {
        endIndex = cfg.TotalPage;
        // 根据要显示的页码数计算起始页码,如果算出小于1,则以1为起始页码
        startIndex = endIndex - cfg.TotalBtn + 1;
        if (startIndex < 1)
          startIndex = 1;
      }
      this.cfg.StartIndex = startIndex;
      this.cfg.EndIndex = endIndex;
      //console.log(this.cfg);
    };

    // 主要方法: 生成分页条
    create(config) {
      // 1.配置设置
      if (config)
        this.config = config;
      let cfg = this.cfg;
      // 1.2 计算页码起止
      this.pagenumRange();

      // 2. dom生成
      this.innerHTML = '';
      this.innerText = '';
      // 2.1 页码按钮区域
      let btnsarea = $('<span>').addClass('btn-group', 'pagenum-btns')[0];

      // 2.1.1 向前按钮
      btnsarea.append($('<a>').addClass('btn', 'pagenum-num').prop('pagenum', cfg.PageIndex - 1).text('〈')[0]);
      // 2.1.2 第1页按钮,当起始页码大于1时添加
      if (cfg.StartIndex > 1) {
        let isactiveNum = cfg.PageIndex == 1 ? 'active' : 'num';
        btnsarea.append($('<a>').addClass('btn', 'pagenum-' + isactiveNum).prop('pagenum', 1).text('1')[0]);
      }
      // 2.1.3 前省略号,当起始页码大于2时添加
      if (cfg.StartIndex > 2) {
        btnsarea.append($('<span>').addClass('btn').text('...')[0]);
      }
      // 2.1.4 页码按钮
      for (let i = cfg.StartIndex; i <= cfg.EndIndex; i++) {
        let pagenum = i;
        let isactiveNum = pagenum == cfg.PageIndex ? 'active' : 'num';
        btnsarea.append($('<a>').addClass('btn', 'pagenum-' + isactiveNum).prop('pagenum', pagenum).text(pagenum)[0]);
      }
      // 2.1.4 后省略号,当结束页小于最大页码-1时
      if (cfg.EndIndex < (cfg.TotalPage - 1)) {
        btnsarea.append($('<span>').addClass('btn').text('...')[0]);
      }
      // 2.1.5 最后页按钮,当结束页小于最大页码时添加
      if (cfg.EndIndex < cfg.TotalPage) {
        let isactiveNum = cfg.PageIndex == cfg.TotalPage ? 'active' : 'num';
        btnsarea.append($('<a>').addClass('btn', 'pagenum-' + isactiveNum).prop('pagenum', cfg.TotalPage).text(cfg.TotalPage)[0]);
      }
      // 2.1.6 向后按钮
      btnsarea.append($('<a>').addClass('btn', 'pagenum-num').prop('pagenum', cfg.PageIndex + 1).text('〉')[0]);

      // 2.2 跳转按钮区域
      let btnskip = $('<span>').addClass('pagenum-skip')[0];
      btnskip.innerHTML = `共<b class="pagenum-total">${cfg.TotalPage}</b>页&emsp;跳转<input class="input-text pagenum-input" />页&emsp;<a class="btn pagenum-ok">确定</a>`;

      // 2.3 添加dom到容器
      this.appendChild(btnsarea);
      this.appendChild(btnskip);

      // 3. 绑定事件
      // 3.1 页码按钮点击
      $(this).find('.pagenum-num').each((item) => {
        item.onclick = () => {
          // 当前页码参数范围[1-总页码],范围外不动作
          let pgindex = parseInt($(item).prop('pagenum')) || 0;
          if (pgindex < 1 || pgindex > cfg.TotalPage) return;
          // 改变当前页面后,重新生成分页条
          cfg.PageIndex = pgindex;
          this.create();
          //
          if (typeof this.cfg.OnPageChg == 'function')
            this.cfg.OnPageChg(pgindex);
        };
      });

      // 3.2 跳转确定按钮点击
      $(this).find('.pagenum-ok')[0].onclick = () => {
        let pgindex = parseInt($(this).find('.pagenum-input')[0].value) || 0;
        if (pgindex < 1 || pgindex > cfg.TotalPage) return;
        // 改变当前页面后,重新生成分页条
        cfg.PageIndex = pgindex;
        this.create();
        //
        if (typeof this.cfg.OnPageChg == 'function')
          this.cfg.OnPageChg(pgindex);
      };
    }
  });
})(window);