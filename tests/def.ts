import { Provider, Inject, AvalonContainer } from "../src";

export const avalon = new AvalonContainer();

const cfgVal = require("./cfg.json");

interface Cfg {
    db: number;
}

@Provider()
export class Config implements Cfg {
    db!: number;
    constructor() {
        Object.assign(this, cfgVal);
    }
    get url() {
        return "https://";
    }
}

@Provider()
export class DataBase {
    constructor(public config: Config) {}

    init() {
        console.log(this.config.url);
    }

    get no() {
        return this.config.db;
    }
}

export class ImpCfg extends Config {}
@Provider({ id: "ImpImpCfg" })
export class ImpImpCfg extends ImpCfg {}

@Provider({ deps: [ImpImpCfg] })
export class Serve {
    constructor(public db: DataBase) {}

    @Inject()
    config!: Config;

    @Inject()
    config2!: Config;

    @Inject(ImpCfg)
    cfg!: Config;

    @Inject()
    cfg1!: ImpImpCfg;

    @Inject("ImpImpCfg")
    cfg2!: Config;

    getNum() {
        return this.db.no;
    }
}

@Provider({ deps: [Serve] })
export class Serve2 extends Serve {
    constructor(db: DataBase) {
        super(db);
    }
}
