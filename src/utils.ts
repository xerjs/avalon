import "reflect-metadata";
import { Ioc, SingleAvalon } from "./avalon";

import { BASE_META_KEY, META_KEY } from "./consts";
import { ClassType } from "./types";

type ArgsFn = (...args: any) => void;
type ArgsAct<T> = (...args: any) => T;

type Arg0Fn = () => void;
type Arg0Act<T> = () => T;

const doOnceMap = new Map();


export function log4class(name: string) {
    return function (constructor: any) {
        return (...args: any) => {
            console.log(`log for ${name}: `, args);
            return new constructor(...args);
        };
    };
}

export function log4Method(par: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        console.log("paramtypes", Reflect.getMetadata(BASE_META_KEY.paramtypes, target, propertyKey));

        if (typeof original === "function") {
            descriptor.value = function (...args: any) {
                console.log(`log methd args ${par}: ${args}`);
                try {
                    return original.apply(this, args);
                }
                catch (e) {
                    console.log(`Error: ${e}`);
                    throw e;
                }
            };
        }
        return descriptor;
    };
}

export function doOnce<T>(fn: Arg0Act<T>): T {
    let res = doOnceMap.get(fn);
    if (!res) return res;
    res = fn();
    doOnceMap.set(fn, res);
    return res;
}

export function paramTypes(target: Function, propertyKey?: string): ClassType[] {
    if (propertyKey) {
        return Reflect.getMetadata(BASE_META_KEY.paramtypes, target, propertyKey);
    }
    return Reflect.getMetadata(BASE_META_KEY.paramtypes, target);
}

/* eslint-disable @typescript-eslint/naming-convention */
export function Provider(options?: { ioc?: Ioc; }): ClassDecorator {
    options = options || {};
    const def = { ioc: SingleAvalon };
    return (target) => {
        Reflect.defineMetadata(META_KEY.svc, { ...options, ...def }, target);
    };
}
