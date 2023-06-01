import { assert } from "chai";
import { MetaUtil } from "../../src/meta";

const tool = new MetaUtil("test");

const Provider = tool.classDecorator<{ moe: string }>();
const Inject = tool.propertyDecorator<{ res: string }>();

@Provider({ moe: "aa" })
class Cat {
    constructor(public name: string) {}

    @Inject({ res: "res" })
    parent!: string;

    @Inject({ res: "son" })
    son!: string;

    say(age: number) {
        return this.name + "." + age;
    }
}

class Dog {
    constructor(public name: string) {}
}

const Providers = tool.manyClassDecorator<{ moe: string }>();
const Injects = tool.manyPropertyDecorator<{ res: string }>();

@Providers({ moe: "a2" })
@Providers({ moe: "a1" })
class Man {
    constructor(public name: string) {}

    @Injects({ res: "re2" })
    @Injects({ res: "re1" })
    parent!: string;

    @Injects({ res: "son" })
    son!: string;
}

describe("meta utils", () => {
    const str = "abc";
    const cat = new Cat(str);

    it("class value", () => {
        assert.deepEqual(tool.classValue(Cat), { moe: "aa" });
        assert.deepEqual(tool.paramTypes(Cat), [String]);

        assert.equal(tool.paramTypes(Dog), undefined);
    });

    it("class many value", () => {
        assert.deepEqual(tool.classValue(Man), [{ moe: "a1" }, { moe: "a2" }]);
        assert.deepEqual(tool.paramTypes(Man), [String]);
    });

    it("property value", () => {
        assert.deepEqual(tool.propertyValue(Cat, "parent"), { res: "res" });
        assert.deepEqual(tool.propertyKeys(Cat), ["parent", "son"]);
        assert.deepEqual(tool.propertyType(Cat, "parent"), String);
    });

    it("property may value", () => {
        assert.deepEqual(tool.propertyValue(Man, "parent"), [{ res: "re1" }, { res: "re2" }]);
        assert.deepEqual(tool.propertyKeys(Man), ["parent", "son"]);
        assert.deepEqual(tool.propertyValue(Man, "son"), [{ res: "son" }]);
    });
});
