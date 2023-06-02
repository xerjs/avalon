# @xerjs/avalon

利用`class function`本身做`key`的依赖注入容器

### 声明 Provider

```
@Provider()
class DataBase {
}

@Provider()
class Ser {
    constructor(public db: DataBase) {
    }
}

const svc = AvalonContainer.root.resolve(Ser)
assert.ok(svc)
assert.ok(svc.db)

```

实例默认保存在`AvalonContainer.root`里，用 ioc 参数调整存储位置

### 简化闭包

```
function Some() {
    const a = 1;
    return { a };
}
avalon.register(Some, Some());

assert.deepEqual(avalon.resolve(Some), { a: 1 });

```
