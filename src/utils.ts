/* eslint-disable @typescript-eslint/naming-convention */

import "reflect-metadata";
import { SingleAvalon } from "./avalon";

import { BASE_META_KEY, META_KEY, ONCE_MKEY } from "./consts";
import { ClassType, Ioc, Method } from "./types";


export function paramTypes(target: object, propertyKey?: string): ClassType[] {
    if (propertyKey) {
        return Reflect.getMetadata(BASE_META_KEY.paramtypes, target, propertyKey);
    }
    return Reflect.getMetadata(BASE_META_KEY.paramtypes, target);
}

export function designType(target: object, propertyKey: string): ClassType {
    return Reflect.getMetadata(BASE_META_KEY.type, target, propertyKey);
}

export function Provider(options?: { ioc?: Ioc, ext?: ClassType; }): ClassDecorator {
    options = options || {};
    const def = { ioc: SingleAvalon };
    return (target) => {
        Reflect.defineMetadata(META_KEY.svc, { ...def, ...options, }, target);
    };
}

/**
 * 注入属性
 * 默认情况下请使用构造参数注入
 * 只有解决循环依赖/子类实现时才使用属性注入
 * @param svc 指向属性 type 的子类, 实现替换
 */
export function Inject(svc?: ClassType): PropertyDecorator {
    return (target: Object, key: string | symbol) => {
        const k = META_KEY.property(key as string);
        Reflect.defineMetadata(k, { svc, key }, target); // target 指向 class.prototype
    };
}

export function action(opt?: any): MethodDecorator {
    return <M>(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
        const pkey = propertyKey as string;
        const method = descriptor.value;
        if (!method || typeof method !== "function") throw new Error(`property ${pkey} isnt function`);

        if (opt) {
            for (const opK of Object.keys(opt)) {
                Reflect.defineMetadata(opK, opt[opK], target, pkey);
            }
        }

        const apply = (me: any, pp: any) => method.apply(me, pp);
        function newMethod(this: object, ...args: any) {
            console.log(`method ${pkey} args:`, args);
            const res = apply(this, args);
            console.log(`method ${pkey} res:`, res);
        };
        descriptor.value = newMethod as any;
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
        };
        descriptor.value = newMethod as any;
        return descriptor;
    };
}


/**
 * 缓存结果, 多实例分离
 * @param ss 单位秒
 */
export function onceOn(ss: number): MethodDecorator {
    return <M>(_target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<M>) => {
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
        };
        descriptor.value = newMethod as any;
        return descriptor;
    };
}

/**
 * 生成序列
 */
export function indexes(len: number): number[] {
    return "1".repeat(len).split("").map((_e, i) => i);
}

export const sleep = (ms: number) => new Promise<void>(res => global.setTimeout(res, ms));

/* 洗牌算法
 * @param len 数组长度
 * @returns 洗后的数组下标 0 ~ len-1
 */
export function shuffArr(len: number): number[] {
    const arr = indexes(len);
    let cut = arr.length;
    while (cut) {
        const idx = Math.floor(Math.random() * cut);
        [arr[cut - 1], arr[idx]] = [arr[idx], arr[cut - 1]];
        cut--;
    }
    return arr;
}