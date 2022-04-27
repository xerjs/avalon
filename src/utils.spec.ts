import { log4Method } from "./utils"

class Person {

    constructor(public name: string) {

    }

    @callx('y')
    @log4Method("p")
    say(a: number): number {
        console.log("person %s say %s", this.name, a);
        return a;
    }
}

function callx(p: string) {
    return log4Method('from callx ' + p)
}

function main() {
    const p = new Person('lxing');
    p.say(2)
}

process.nextTick(main)