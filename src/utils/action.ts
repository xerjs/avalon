/**
 * method 拦截器 Interceptor
 */

export const ONCE_MKEY = {
    res: "once:res",
    ttl: "once:ttl",
};

export class MetaRule {
    constructor(public readonly perfix: string, public readonly key: string) {}

    metaKey(propertyKey: string): string {
        return [this.perfix, this.key, propertyKey].join(":");
    }

    propertyKey(metaKey: string): string | undefined {
        const re = new RegExp(this.perfix + `:${this.key}:(\\w+)`);
        const m = re.exec(metaKey);
        if (m) {
            return m[1];
        }
    }

    propertyMeta<T>(target: object, propertyKey: string): T | undefined {
        return Reflect.getMetadata(this.metaKey(propertyKey), target, propertyKey);
    }

    getMetadata<T>(target: object, valD?: T): T | undefined {
        return Reflect.getMetadata(this.perfix, target) || valD;
    }

    arrMetadata<T>(target: object, propertyKey: string): T[] {
        let rr: T[] = Reflect.getMetadata(this.metaKey(propertyKey), target, propertyKey);
        if (rr) return rr;
        rr = [];
        Reflect.defineMetadata(this.metaKey(propertyKey), rr, target, propertyKey);
        return rr;
    }
}

/** 添加propertyKey到class.meta, 做为索引  */
function addProperty(target: Object, rule: MetaRule, propertyKey?: string): string[] {
    const vals: string[] = Reflect.getMetadata(rule.perfix, target) || [];
    if (!propertyKey) {
        return vals;
    }
    if (vals.includes(propertyKey)) {
        return vals;
    }
    vals.push(propertyKey);
    Reflect.defineMetadata(rule.perfix, vals, target);
    return vals;
}
/** 对method.meta做设置 */
export function action(opt: any, rule: MetaRule): MethodDecorator {
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);

        if (opt && typeof opt === "object") {
            addProperty(target, rule, pkey);
            Reflect.defineMetadata(rule.metaKey(pkey), opt, target, pkey);
        }
        return descriptor;
    };
}

/** 对method.meta设置Array值 */
export function actionArr(opt: any, rule: MetaRule): MethodDecorator {
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);

        addProperty(target, rule, pkey);
        const origin = rule.arrMetadata(target, pkey);
        if (opt && typeof opt === "object") {
            origin.push(opt);
        }
        return descriptor;
    };
}

export function actionOn(fn: Function): MethodDecorator {
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);

        const apply = (me: any, pp: any) => method.apply(me, pp);
        function newMethod(this: object, ...args: any) {
            fn();
            return apply(this, args);
        }
        descriptor.value = newMethod as any;
        return descriptor;
    };
}

/**
 * 异常拦截, 继续外抛
 */
export function actionErr(fn: (err: Error) => void): MethodDecorator {
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);

        const apply = (me: any, pp: any) => method.apply(me, pp);
        function newMethod(this: object, ...args: any) {
            let res: any;
            let err!: Error;
            try {
                res = apply(this, args);
            } catch (error) {
                fn((err = error as Error));
            }
            if (err) {
                throw err;
            }
            return res;
        }
        descriptor.value = newMethod as any;
        return descriptor;
    };
}

/**
 * 单例结果缓存, 多实例共享
 * @param ss 单位秒
 */
export function once(ss: number): MethodDecorator {
    const metaKey = ONCE_MKEY;
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);

        const apply = (me: any, pp: any) => method.apply(me, pp);
        function newMethod(this: object, ...args: any) {
            let res = Reflect.getMetadata(metaKey.res, target, pkey);
            if (res) {
                const exp: number = Reflect.getMetadata(metaKey.ttl, target, pkey);
                if (Date.now() < exp) {
                    return res;
                }
            }
            res = apply(this, args);
            Reflect.defineMetadata(metaKey.res, res, target, pkey);
            const ttl = Date.now() + ss * 1000;
            Reflect.defineMetadata(metaKey.ttl, ttl, target, pkey);
            return res;
        }
        descriptor.value = newMethod as any;
        return descriptor;
    };
}

/**
 * 缓存结果, 多实例分离
 * @param ss 单位秒
 */
export function onceOn(ss: number): MethodDecorator {
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const mKey = {
            res: Symbol(ONCE_MKEY.res + ":" + pkey),
            ttl: Symbol(ONCE_MKEY.ttl + ":" + pkey),
        };
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);
        const apply = (me: any, pp: any) => method.apply(me, pp);
        function newMethod(this: any, ...args: any) {
            let res = this[mKey.res];
            if (typeof res !== "undefined") {
                const exp: number = this[mKey.ttl];
                if (Date.now() < exp) {
                    return res;
                }
            }
            res = this[mKey.res] = apply(this, args);
            this[mKey.ttl] = Date.now() + ss * 1000;
            return res;
        }
        descriptor.value = newMethod as any;
        return descriptor;
    };
}
