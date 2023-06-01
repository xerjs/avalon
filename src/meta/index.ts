import "reflect-metadata";
import { ClassType } from "./type";

export const SYS_META_KEY = {
    type: "design:type",
    paramtypes: "design:paramtypes",
    returntype: "design:returntype",
};

type PropertyKey = string | symbol;

export class MetaUtil {
    constructor(public readonly group: string) {}

    paramTypes(target: object, propertyKey?: string): ClassType[] {
        if (propertyKey) {
            return Reflect.getMetadata(SYS_META_KEY.paramtypes, target, propertyKey);
        }
        return Reflect.getMetadata(SYS_META_KEY.paramtypes, target);
    }

    designType(target: object, propertyKey: string): ClassType {
        return Reflect.getMetadata(SYS_META_KEY.type, target, propertyKey);
    }

    get svcKey() {
        return this.group + ".svc";
    }

    get proKey() {
        return this.group + ".pro";
    }

    get proName() {
        return this.group + ".ns";
    }

    classDecorator<P>(before?: (x: P) => any) {
        return (p?: P) => {
            const v = before?.call(null, p!) || p;
            const decorator: ClassDecorator = (target: Function) => {
                Reflect.defineMetadata(this.svcKey, v, target);
            };
            return decorator;
        };
    }

    propertyDecorator<P>(before?: (x: P) => any) {
        return (p?: P) => {
            const decorator: PropertyDecorator = (target: Object, key: PropertyKey) => {
                // target 指向 class.prototype
                this.setUniqPro(target, key);
                const v = before?.call(null, p!) || p;
                Reflect.defineMetadata(this.proKey, v, target, key);
            };
            return decorator;
        };
    }

    classValue(target: Function) {
        return Reflect.getMetadata(this.svcKey, target);
    }

    propertyValue(target: Function | object, key: PropertyKey) {
        const item = typeof target === "function" ? target.prototype : target;
        return Reflect.getMetadata(this.proKey, item, key);
    }

    propertyType(target: Function, key: string) {
        return Reflect.getMetadata(SYS_META_KEY.type, target.prototype || target, key);
    }

    propertyKeys(target: Function): string[] {
        const values = Reflect.getMetadata(this.proName, target.prototype || target);
        return values ? [...values] : [];
    }

    manyClassDecorator<P>() {
        return (p: P) => {
            const decorator: ClassDecorator = (target: Function) => {
                const orig: P[] = this.classValue(target) || [];
                orig.push(p);
                Reflect.defineMetadata(this.svcKey, orig, target);
            };
            return decorator;
        };
    }

    setUniqPro(target: Object, key: PropertyKey) {
        const property: Set<PropertyKey> = Reflect.getMetadata(this.proName, target) || new Set();
        property.add(key);
        Reflect.defineMetadata(this.proName, property, target);
    }

    manyPropertyDecorator<P>() {
        return (p: P) => {
            const decorator: PropertyDecorator = (target: Object, key: PropertyKey) => {
                // target 指向 class.prototype
                this.setUniqPro(target, key);
                const orig: P[] = this.propertyValue(target, key) || [];
                orig.push(p);
                Reflect.defineMetadata(this.proKey, orig, target, key);
            };
            return decorator;
        };
    }
}
