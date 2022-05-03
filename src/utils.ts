import "reflect-metadata";
import { SingleAvalon } from "./avalon";

import { BASE_META_KEY, META_KEY } from "./consts";
import { ClassType, Ioc } from "./types";


export function paramTypes(target: object, propertyKey?: string): ClassType[] {
    if (propertyKey) {
        return Reflect.getMetadata(BASE_META_KEY.paramtypes, target, propertyKey);
    }
    return Reflect.getMetadata(BASE_META_KEY.paramtypes, target);
}

export function designType(target: object, propertyKey: string): ClassType {
    return Reflect.getMetadata(BASE_META_KEY.type, target, propertyKey);
}

/* eslint-disable @typescript-eslint/naming-convention */
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

/**
 * 洗牌算法
 * @param len 数组长度
 * @returns 洗后的数组下标 0 ~ len-1
 */
export function shuffArr(len: number): number[] {
    const arr = "1".repeat(len).split("").map((e, i) => i);
    let cut = arr.length;
    while (cut) {
        const idx = Math.floor(Math.random() * cut);
        [arr[cut - 1], arr[idx]] = [arr[idx], arr[cut - 1]];
        cut--;
    }
    return arr;
}