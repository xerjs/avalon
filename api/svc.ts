
import { action, Avalon, ClassType, Provider, sleep } from "../src";
import { MetaRule, META_KEY } from "../src/consts";
import Koa from "koa";
import Router from "koa-router";

class Person {
    age!: number;
}


const actionRule = new MetaRule("avalon:svc", "api");

export function apiSvc(perfix: string): ClassDecorator {
    return (target) => {
        Provider()(target);
        Reflect.defineMetadata(actionRule.perfix, { perfix }, target);
    };
}
export namespace apiSvc {

    export interface ActOpt {
        method: string;
        path: string;
    }

    export const rule = actionRule;

    function httpAct(opt: ActOpt) {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return action(opt, rule)(target, propertyKey, descriptor);
        };
    }

    export function get(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "GET", path })(target, propertyKey, descriptor);
        };
    };

    export function post(path: string): MethodDecorator {
        return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
            return httpAct({ method: "POST", path })(target, propertyKey, descriptor);
        };
    };
}

@apiSvc("/")
export class Serv {

    pp: string;
    constructor() {
        this.pp = "xxx";
    }

    @apiSvc.get("/users")
    async listUsers(): Promise<Person[]> {
        await sleep(100);
        const p = new Person();
        p.age = this.pp.length;
        return [p];
    }
}

export class AdaKoa extends Avalon {
    constructor(svcs: ClassType[], port?: number) {
        super();
        this.initialize(svcs);
        this.install();
    }

    install(): void {
        const app = new Koa();

        const router = new Router();
        for (const ctr of this.allClass) {
            const ctrMeta = apiSvc.rule.getMetadata(ctr) as { perfix: string; };
            if (!ctrMeta) continue;

            const propertyNames = apiSvc.rule.getMetadata(ctr.prototype) as string[];
            console.log(ctr.name, ctrMeta, propertyNames);

            for (const pkey of propertyNames) {
                const mkey = apiSvc.rule.metaKey(pkey);
                const meta = Reflect.getMetadata(mkey, ctr.prototype, pkey) as apiSvc.ActOpt;
                console.log(pkey, mkey, meta);

                this.resolve(ctr)[pkey]().then((e: any) => console.log(e));
                router.get(ctrMeta.perfix + meta.path, async (ctx, next) => {
                    // ctx.router available
                    ctx.body = await this.resolve(ctr)[pkey]();
                    console.log(ctx.body);
                });
            }

            app
                .use(router.routes())
                .use(router.allowedMethods());
        }
    }
}

function main() {
    const xx = new AdaKoa([Serv]);
}

process.nextTick(main);