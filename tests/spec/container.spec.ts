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

    @Provider({ ioc: avalon })
    class Ser4 {
        constructor(public name: string, public age: number) {}
    }

    it("method=resolve;constructor=default", () => {
        const ins = avalon.resolve(Ser4);
        assert.ok(ins);
        assert.equal(ins.age, 0);
        assert.equal(ins.name, "");
    });

    class Ser5 {
        constructor() {}
    }
    it("method=register;input=Symbol", () => {
        const orig = Symbol();
        avalon.register(Ser5, orig);
        const ins = avalon.resolve(Ser5);
        assert.equal(ins, orig);

        function Some() {
            const a = 1;
            return { a };
        }
        avalon.register(Some, Some());

        assert.deepEqual(avalon.resolve(Some), { a: 1 });
    });
});
