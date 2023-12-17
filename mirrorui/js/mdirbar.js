((win) => {
  // 帮助函数
  const $ = win.ns.domHelp || win.ns.jslib;
  // 生成选项卡和功能区DOM,添加到容器内
  /* html内容:
      <a class="back"></a>
      <span class="title text-overflow"></span>
      <a class=""></a>
   */
  let createBarDom = (barDom) => {
    let fragment = $.fragment();
    fragment.append($('<a>').addClass('back')[0]);
    fragment.append($('<span>').addClass('title', 'text-overflow')[0]);
    fragment.append($('<a>')[0]);
    $(barDom).append(fragment).addClass('mdirbar');
  };

  // 初始化mdirbar实例(构造)
  // barDom:导航容器DOM
  let mDirBar = (barDom, contDom) => {
    if (!barDom) throw '必须传入barDom,contDom容器对象';
    let self = {};
    self.barDom = barDom;
    self.contDom = contDom;
    // 缓存数组容器 {pid,title,documentFragment}
    self.cache = [];
    // 生成dom
    createBarDom(self.barDom);
    //====================================================================================
    // 主要方法 载入新页面.做了更新缓存状态,新载入的页面始终在缓存设置最后.在菜单的点击事件上要执行此方法.
    // 该方法第3个参数onload(loadType)是一个方法,可以根据loadType参数值判断是否要载入新的页面
    // loadType=1: 菜单是当前页面
    // loadType=2: 菜单之前载入过
    // loadType=3: 是新载入菜单,其对应的页面没有载入过,需要做载入新页面的操作
    //====================================================================================
    // {pid:菜单唯一标识,title:选项卡标题},点击左侧菜单时,调用此方法
    self.load = (pid, title, onload) => {
      //console.log(`pid:${pid},title:${title}`);
      // 1.载入的页面是当前页面,不动作
      if (isCurrPage(pid) == true) {
        if (typeof onload === 'function')
          onload(1);
        //printlog(1);
        return;
      }
      // 2.载入是的已缓存过的页面
      let pidIndex = pidCacheIndex(pid);
      if (pidIndex > -1) {
        // 添加当前DOM到缓存
        cacheActivePage();
        // 取出pid对应的DOM片段,放入显示容器
        let pidItem = self.cache[pidIndex];
        $(contDom).html(pidItem.dom);
        barTitle(pidItem.title);
        // 移动到缓存最后,设置dom为null.(当前页面始终在缓存最后面)
        self.cache.splice(pidIndex, 1);
        pidItem.dom = null;
        self.cache.push(pidItem);
        //
        if (typeof onload === 'function')
          onload(2);
        //printlog(2);
        return;
      }
      // 3.新页面
      // 当增加的是第1个选项卡时,没有活动页面,不需要缓存
      if (self.cache.length > 0) {
        cacheActivePage();
      }
      // 加到缓存最后
      self.cache.push({ pid: pid, title: title, dom: null });
      barTitle(title);
      if (typeof onload === 'function')
        onload(3);
      //printlog(3);
    }

    // 指定的pid是否为当前页面
    let isCurrPage = (pid) => {
      let index = pidCacheIndex(pid);
      if (index == -1) return false;
      // dom属性为null表示当前页面
      return self.cache[index].dom == null;
    }

    // 缓存当前页面
    let cacheActivePage = () => {
      // 找到cache中null值的键,将显示容器div中的所有元素添加DOM片段后,赋值
      for (var i = 0, len = self.cache.length; i < len; i++) {
        if (self.cache[i].dom == null) {
          self.cache[i].title = barTitle();
          self.cache[i].dom = $.fragment(...self.contDom.childNodes)
          return;
        }
      }
    }

    // 返回指定pid在缓存数组中的索引,不存在返回-1;
    let pidCacheIndex = (pid) => {
      for (var i = 0, len = self.cache.length; i < len; i++) {
        if (self.cache[i].pid == pid)
          return i;
      }
      return -1;
    }

    // 设置获取标题
    let barTitle = (title) => {
      if (!title)
        return $(barDom).find('.title').text();
      $(barDom).find('.title').text(title);
    }

    //==========
    // back 回退
    //==========
    self.back = (onback) => {
      // 回退目标页面是cache的倒数第2个项
      let targetIndex = self.cache.length - 2;
      // 回退到最后一个页面,返回-1
      if (targetIndex < 0) {
        //msgbox.alert('已经不能退了!');
        if (typeof onback === 'function')
          onback(-1);
        return;
      }
      // 删除cahce最后一个项
      self.cache.pop();
      // 取出缓存
      let pageitem = self.cache[targetIndex];
      // 载入缓存页面,设置标题
      $(self.contDom).html(pageitem.dom);
      barTitle(pageitem.title)
      // 设置为当前页面
      pageitem.dom = null;
      //
      if (typeof onback === 'function')
        onback(0);
      //printlog();
    }
    $(barDom).find('.back')[0].onclick = self.back;

    //let printlog = (type) => {
    //  if (type)
    //    console.log('type: ' + type);
    //  console.log('cache:');
    //  console.log(self.cache);
    //  console.log('--- --- --- ---');
    //}
    return self;
  }
  //
  win.ns.mdirbar = mDirBar;
})(window);