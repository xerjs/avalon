import { assert } from "chai";
import { once, onceOn } from "../../src/utils/action";
import { sleep } from "../../src/utils";

describe("utils Decorator tests", () => {
    require("../utils/action.spec");

    class Person {
        constructor(public age: number = 1) {}

        @once(3600)
        say(i: number) {
            return `${this.age} say ${i} at ${new Date()}`;
        }

        @once(1)
        say2(i: number) {
            return `${this.age} say ${i} at ${new Date()}`;
        }

        @onceOn(3600)
        sayOn(i: number) {
            return `${this.age} say ${i} at ${new Date()}`;
        }

        @onceOn(1)
        sayOn2(i: number) {
            return `${this.age} say ${i} at ${new Date()}`;
        }
    }

    it("Decorator once", () => {
        const p = new Person();
        const pres = p.say(22);

        const p2 = new Person();
        const p2res = p2.say(33);

        assert.equal(pres, p2res);

        assert.equal(pres, p.say(22));
        assert.equal(pres, p.say(21));

        assert.equal(p2res, p.say(33));
        assert.equal(p2res, p.say(24));
    });

    it("Decorator onceOn", () => {
        const p = new Person(1);
        const pres = p.sayOn(22);
        assert.equal(pres, p.sayOn(33));

        const p2 = new Person(2);
        const p2res = p2.sayOn(33);
        assert.equal(p2res, p2.sayOn(34));

        assert.notEqual(pres, p2res);
    });

    it("Decorator once ttl", async () => {
        const p = new Person();
        const pres = p.say2(22);
        assert.equal(pres, p.say2(33));

        await sleep(1100);
        assert.notEqual(pres, p.say2(33));
        assert.equal(p.say2(33), p.say2(44));
    });

    it("Decorator onceOn ttl", async () => {
        const p = new Person(1);
        const pres = p.sayOn2(22);
        assert.equal(pres, p.sayOn2(33));

        await sleep(1100);
        assert.notEqual(pres, p.say2(33));
        assert.equal(p.say2(33), p.say2(44));
    });
});
