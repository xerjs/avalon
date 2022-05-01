import { assert } from "chai";
import { Serve, Serve2, Config, ImpCfg, avalon } from "./def";

describe("resolve instance", () => {

    before(() => {
        avalon.initialize([Serve2]);
    });

    it("servClass", () => {
        assert.ok(avalon.resolve(Serve2));
        const cnf = avalon.resolve(Config);
        const s1 = avalon.resolve(Serve);
        const i = cnf.db = 1;
        assert.equal(s1.getNum(), i);
    });

    it("Inject property", () => {
        const s1 = avalon.resolve(Serve);
        assert.ok(s1.config);
        assert.ok(s1.config2);
        assert.equal(s1.config, s1.config2);

        const s2 = avalon.resolve(Serve2);
        assert.equal(s2.config, s2.config2);

        assert.equal(s1.config, s2.config);
    });

    it("Inject property implements", () => {
        const s1 = avalon.resolve(Serve);
        assert.ok(s1);
        assert.ok(s1.cfg);
        assert.ok(s1.cfg instanceof ImpCfg);
    });
});