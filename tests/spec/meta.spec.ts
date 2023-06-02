import { assert } from "chai";
import { MetaUtil } from "../../src/meta";

const tool = new MetaUtil("test1");
const tool2 = new MetaUtil("test2");

const Dec1 = tool.classDecorator<{ moe: string }>();
const Dec2 = tool2.classDecorator<{ aa: string }>();
const Pro1 = tool.propertyDecorator<{ res: string }>();
const Pro2 = tool2.propertyDecorator<{ rej: string }>();

@Dec1({ moe: "aa" })
@Dec2({ aa: "aa2" })
class Cat {
    constructor(public name: string) {}

    @Pro1({ res: "res" })
    parent!: string;

    @Pro1({ res: "son" })
    @Pro2({ rej: "rej2" })
    son!: string;

    @Pro2({ rej: "rej" })
    some!: string;
    say(age: number) {
        return this.name + "." + age;
    }
}

class Dog {
    constructor(public name: string) {}
}

const Dec1s = tool.manyClassDecorator<{ moe: string }>();
const Dec2s = tool2.manyClassDecorator<{ mon: string }>();
const Pro1s = tool.manyPropertyDecorator<{ res: string }>();
const Pro2s = tool2.manyPropertyDecorator<{ rss: string }>();

@Dec1s({ moe: "a2" })
@Dec1s({ moe: "a1" })
@Dec2s({ mon: "mon2" })
@Dec2s({ mon: "mon1" })
class Man {
    constructor(public name: string) {}

    @Pro1s({ res: "re2" })
    @Pro1s({ res: "re1" })
    parent!: string;

    @Pro1s({ res: "son" })
    @Pro2s({ rss: "sss" })
    son!: string;

    @Pro2s({ rss: "ss2" })
    @Pro2s({ rss: "ss1" })
    some!: string;
}

describe("meta utils", () => {
    it("class value", () => {
        assert.deepEqual(tool.classValue(Cat), { moe: "aa" });
        assert.deepEqual(tool.paramTypes(Cat), [String]);

        assert.equal(tool.paramTypes(Dog), undefined);

        assert.deepEqual(tool2.classValue(Cat), { aa: "aa2" });
        assert.deepEqual(tool.paramTypes(Cat), [String]);
    });

    it("class many value", () => {
        assert.deepEqual(tool.classValue(Man), [{ moe: "a1" }, { moe: "a2" }]);
        assert.deepEqual(tool.paramTypes(Man), [String]);

        assert.deepEqual(tool2.classValue(Man), [{ mon: "mon1" }, { mon: "mon2" }]);
    });

    it("property value", () => {
        assert.deepEqual(tool.propertyValue(Cat, "parent"), { res: "res" });
        assert.deepEqual(tool.propertyKeys(Cat), ["parent", "son"]);
        assert.deepEqual(tool.propertyType(Cat, "parent"), String);

        assert.deepEqual(tool2.propertyValue(Cat, "some"), { rej: "rej" });
        assert.deepEqual(tool2.propertyKeys(Cat), ["son", "some"]);
        assert.deepEqual(tool2.propertyType(Cat, "some"), String);
    });

    it("property many value", () => {
        assert.deepEqual(tool.propertyValue(Man, "parent"), [{ res: "re1" }, { res: "re2" }]);
        assert.deepEqual(tool.propertyKeys(Man), ["parent", "son"]);
        assert.deepEqual(tool.propertyValue(Man, "son"), [{ res: "son" }]);

        assert.deepEqual(tool2.propertyValue(Man, "some"), [{ rss: "ss1" }, { rss: "ss2" }]);
        assert.deepEqual(tool2.propertyKeys(Man), ["son", "some"]);
        assert.deepEqual(tool2.propertyValue(Man, "son"), [{ rss: "sss" }]);
    });

    class Test4Method {}
});
