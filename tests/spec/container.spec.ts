import { AvalonContainer, Inject, Provider } from "../../src";
import { assert } from "chai";

const avalon = new AvalonContainer();

describe("AvalonContainer", () => {
    @Provider({ ioc: avalon })
    class Conf {
        get db() {
            return 1;
        }
    }

    @Provider({ ioc: avalon })
    class Ser1 {
        @Inject()
        conf!: Conf;
    }

    it("method=resolve;constructor=[]", () => {
        const ins = avalon.resolve(Ser1);
        assert.ok(ins);
        assert.ok(ins.conf instanceof Conf);
        assert.equal(ins.conf.db, 1);
    });

    @Provider({ ioc: avalon })
    class Ser2 {
        constructor(public ser1: Ser1) {}
        @Inject()
        conf!: Conf;
    }

    it("method=resolve;constructor=val", () => {
        const ins = avalon.resolve(Ser2);
        assert.ok(ins);
        assert.ok(ins.conf instanceof Conf);
        assert.ok(ins.ser1 instanceof Ser1);
        assert.ok(ins.ser1.conf instanceof Conf);
    });

    @Provider({ ioc: avalon })
    class ConfImp extends Conf {
        get db() {
            return 2;
        }
    }

    @Provider({ ioc: avalon })
    class Ser3 {
        constructor(public ser1: Ser1) {}

        @Inject(ConfImp)
        conf!: Conf;
    }

    it("method=resolve;constructor=val", () => {
        const ins = avalon.resolve(Ser3);
        assert.ok(ins);
        assert.ok(ins.conf instanceof ConfImp);
        assert.equal(ins.conf.db, 2);

        assert.ok(ins.ser1 instanceof Ser1);
        assert.ok(ins.ser1.conf instanceof Conf);
    });
});
