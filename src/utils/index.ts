/* eslint-disable @typescript-eslint/naming-convention */

export * from "./action";


import "reflect-metadata";
import { SingleAvalon } from "../avalon";

import { BASE_META_KEY, META_KEY, } from "../consts";
import { ClassType, Ioc, ProviderOptions } from "../types";
import { MetaRule } from "./action";

export function paramTypes(target: object, propertyKey?: string): ClassType[] {
    if (propertyKey) {
        return Reflect.getMetadata(BASE_META_KEY.paramtypes, target, propertyKey);
    }
    return Reflect.getMetadata(BASE_META_KEY.paramtypes, target);
}

export function designType(target: object, propertyKey: string): ClassType {
    return Reflect.getMetadata(BASE_META_KEY.type, target, propertyKey);
}

export function Provider(options?: ProviderOptions): ClassDecorator {
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
export function Inject(svc?: ClassType | string): PropertyDecorator {
    const rule = new MetaRule(META_KEY.svc, META_KEY.property);
    return (target: Object, key: string | symbol) => {
        const mk = rule.metaKey(key as string);
        Reflect.defineMetadata(mk, { svc, key }, target); // target 指向 class.prototype
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