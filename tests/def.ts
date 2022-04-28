import { Provider } from "../src"
const cfgVal = require("./cfg.json")

interface Cfg {
    db: number
}

@Provider()
export class Config implements Cfg {
    db!: number
    constructor() {
        Object.assign(this, cfgVal)
    }
    get url(){
        return "https://"
    }
}

@Provider()
export class DataBase {
    constructor(public config: Config) {

    }

    init() {
        console.log(this.config.url)
    }

    get no() {
        return this.config.db
    }
}

@Provider()
export class Serve {
    constructor(public db: DataBase) {

    }

    getNum() {
        return this.db.no
    }
}