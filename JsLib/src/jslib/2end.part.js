// window上的引用名 "lib",.在此修改
win.lib = factory;
// 用$更加简洁方便
if (!win.$)
    win.$ = win.lib;
}) (window);