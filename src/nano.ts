import * as assert from "assert";
import { shuffle } from "./utils";

const MAX = parseInt("1".repeat(13), 2);

export class NaItem {
    public from: number;
    public hid: string;
    /**
     * @param mid 0~15
     */
    constructor(public mid: number, public skip: number = 0) {
        this.from = Math.floor(Math.random() * MAX);
        this.hid = mid.toString(2).padStart(4, "0");
    }

    newId(): string {
        const time = Math.floor(Date.now() / 1000) + this.skip; // 31bit
        const head = time.toString(2);
        const ser = this.from++ % MAX;
        const end = ser.toString(2).padStart(13, "0");
        const byte6 = head + this.hid + end;
        assert.equal(byte6.length, 48);
        const hex = parseInt(byte6, 2).toString(16);
        return Buffer.from(hex, "hex").toString("base64url");
    }
}

export class Nano {
    protected items: NaItem[];
    protected cur: number = 0;
    constructor(public instances: number = 16, public skip: number = 0) {
        const arr = shuffle(instances);
        this.items = arr.map((i) => new NaItem(i, skip));
    }

    newId(): string {
        const item = this.items[this.cur];
        this.cur++;
        this.cur = this.cur % this.instances;
        return item.newId();
    }
    static instance = new Nano();
}
