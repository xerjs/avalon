import { assert } from "chai";
import { actionOn, actionErr } from "../utils.spec";

describe("utils action tests", () => {
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