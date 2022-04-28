
import { SingleAvalon } from "../src"
import { Serve } from "./def"
import { assert } from "chai";

describe("resolve instance", () => {    
    SingleAvalon.initialize([Serve])    
    
    it("serv", () => {
        const s1 = SingleAvalon.resolve(Serve);
        assert.equal(s1.getNum(), 1);
    })
})