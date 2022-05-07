# @xerjs/Avalon

利用`class`本身做`key`的依赖注入容器

### 初始化

从`initialize`入口, 寻找依赖

- 向上找`constructor`的依赖,
- Provider`deps`参数
- 属性类型使用子类

```
@Provider({ id: "xxx", deps: [Config, ImpImpCfg] })
class Serv extends Some {
    constructor(public db: DataBase) {

    }

    @Inject("ImpImpCfg")
    cfg: Config // class ImpImpCfg 需要设置id别名, 并在deps声明

    @Inject(ImpImpCfg)
    config: Config // 属性类型使用子类实现
}

avalon.initialize([Serv])

const svc = avalon.resolve(Serv)

```
