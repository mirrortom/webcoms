// window上的引用名,在此修改
if (!win.ns)
    win.ns = {};
win.ns.jslib = factory;
// 用$更加简洁方便
if (!win.$)
    win.$ = win.ns.jslib;
}) (window);