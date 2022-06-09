import { assert } from "chai";
import { MetaRule } from "../../src";
import { actionOn, actionErr, action, actionArr } from "../utils.spec";

const rule = new MetaRule("test:utils", "act");

class TestAb {

    @action({ a: 1 }, rule)
    sayMa() {

    }

    @action({ b: 1 }, rule)
    sayMb() {

    }

    @actionArr({ x: 1 }, rule)
    @actionArr({ y: 1 }, rule)
    say22() {

    }
}

describe("utils action tests", () => {

    it("action expect=ok", () => {
        const target = TestAb.prototype;
        const [a, b] = ["sayMa", "sayMb"];
        assert.deepEqual(rule.getMetadata(target), [a, b, "say22"]);

        assert.deepEqual(rule.propertyMeta(target, a), { a: 1 });
        assert.deepEqual(rule.propertyMeta(target, b), { b: 1 });
    });

    it("actionArr expect=ok", () => {
        const s22 = "say22";
        const target = TestAb.prototype;
        assert.deepEqual(rule.propertyMeta(target, s22), [{ x: 1 }, { y: 1 }]);
    });

    it("actionOn expect=ok", () => {
        let i = 0;
        class Ab {
            @actionOn(() => i++)
            say(s: number) {
                return s + 1;
            }
        }
        const e = new Ab();
        assert.equal(i, 0);
        e.say(1);
        assert.equal(i, 1);
    });

    it("actionOn;input=err;expect=ok", () => {

        const fn = () => {
            throw new Error("stop");
        };
        class Ab {
            @actionOn(fn)
            say(s: number) {
                return s + 1;
            }
        }
        const e = new Ab();
        let i = 0;
        assert.throw(() => i = e.say(1), "stop");
        assert.equal(i, 0);
    });

    it("actionErr expect=err", () => {
        let i = 0;

        const catchErr = (err: Error) => {
            i = err.message.length;
        };

        class Ac {
            @actionErr(catchErr)
            say(s: number) {
                throw new Error("say" + s);
            }
        }
        assert.equal(i, 0);
        const e = new Ac();

        assert.throw(() => e.say(1));
        assert.equal(i, 4);

        assert.throw(() => e.say(11));
        assert.equal(i, 5);
    });
});