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
export function Provider(options?: { ioc?: Ioc; }): ClassDecorator {
    options = options || {};
    const def = { ioc: SingleAvalon };
    return (target) => {
        Reflect.defineMetadata(META_KEY.svc, { ...def, ...options, }, target);
    };
}
