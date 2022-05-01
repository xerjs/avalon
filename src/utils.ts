import "reflect-metadata";
import { Ioc, SingleAvalon } from "./avalon";

import { BASE_META_KEY, META_KEY } from "./consts";
import { ClassType } from "./types";


export function paramTypes(target: Function, propertyKey?: string): ClassType[] {
    if (propertyKey) {
        return Reflect.getMetadata(BASE_META_KEY.paramtypes, target, propertyKey);
    }
    return Reflect.getMetadata(BASE_META_KEY.paramtypes, target);
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
 * @param id 指向属性 type 的子类, 实现替换
 */
export function Inject(id?: ClassType): PropertyDecorator {
    return (target: Object, key: string | symbol) => {
        const k = META_KEY.property(key as string);
        Reflect.defineMetadata(k, { id, key }, target); // target 指向 class.prototype
    };
}