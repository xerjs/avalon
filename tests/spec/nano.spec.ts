import { assert } from "chai";
import { Nano } from "../../src";

const singleNano = Nano.instance;

describe("nano tests", () => {
    function splitId(b48: string): string[] {
        return [b48.slice(0, 31), b48.slice(31, 35), b48.slice(35)];
    }
    it("id test", () => {
        const id1 = singleNano.newId();
        assert.ok(id1);
        const id2 = singleNano.newId();
        assert.ok(id2);
        const bf1 = Buffer.from(id1, "base64").toString("hex");
        const bf2 = Buffer.from(id2, "base64").toString("hex");
        assert.notEqual(bf1, bf2);
        const n1 = parseInt(bf1, 16).toString(2);
        const n2 = parseInt(bf2, 16).toString(2);
        const [t1, m1, s1] = splitId(n1);
        const [t2, m2, s2] = splitId(n2);
        assert.equal(t1, t2);
        assert.notEqual(m1, m2);
        assert.notEqual(s1, s2);
    });
});
