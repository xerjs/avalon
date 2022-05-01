import "reflect-metadata";
import * as assert from "assert";
import { ClassType, Ioc, PropertyMeta } from "./types";
import { BASE_META_KEY, META_KEY } from "./consts";
import { designType, paramTypes } from "./utils";

const unFill = -1;

export class Avalon implements Ioc {
    private pool: Map<ClassType, any>;
    constructor() {
        const mm = new Map();
        mm.set(Number, 0);
        mm.set(String, "");
        this.pool = mm;
    }
    resolve<T>(constructor: ClassType<T>): T {
        return this.pool.get(constructor);
    }

    initialize<T extends ClassType>(servs: T[]) {
        this.fillPool(servs, 0);
        this.createInstances();
        this.injectProperty();
    }

    protected get allClass(): IterableIterator<ClassType> {
        return this.pool.keys();
    }

    private createInstances() {
        for (const ctr of this.pool.keys()) {
            const fns = paramTypes(ctr);
            if (!fns || fns.length === 0) {
                // 无参数的构造函数
                this.pool.set(ctr, new ctr());
            }
        }
        do {
            let goon = false;
            for (const [ctr, v] of this.pool.entries()) {
                if (v !== unFill) continue; // 已经初始化过了
                const pars = paramTypes(ctr).map(fn => this.pool.get(fn));
                if (pars.every(e => e)) {
                    this.pool.set(ctr, new ctr(...pars));
                    goon = true;
                }
            }
            if (goon === false) {
                break;
            }

        } while ([...this.pool.values()].filter(e => e).length < this.pool.size);

    }

    /**
     * 填充pool里的key
     * @param servs
     * @param deep
     */
    private fillPool<T extends ClassType>(servs: T[], deep: number) {
        const deps: ClassType[] = [];
        const size = this.pool.size;
        for (const ctr of servs) {
            this.pool.set(ctr, unFill);
            const fns = paramTypes(ctr);
            if (!fns) continue; // no constructor
            deps.push(...fns);

            const { ext } = Reflect.getMetadata(META_KEY.svc, ctr);
            if (ext) {
                deps.push(ext);
            }

            const pkeys = Reflect.getMetadataKeys(ctr.prototype);
            for (const pk of pkeys) {
                const pAttr: PropertyMeta = Reflect.getMetadata(pk, ctr.prototype);
                if (pAttr.svc) {
                    deps.push(pAttr.svc);
                }
            }

            if (deps.length && size < this.pool.size) {
                this.fillPool(deps, deep + 1);
            }
        }
    }

    private injectProperty() {
        function cecProto(prototype: any): unknown[] {
            const v = prototype.__proto__;
            if (v) {
                return [v, ...cecProto(v)];
            }
            return [];
        }
        for (const [ctr, inst] of this.pool) {
            const pkeys = Reflect.getMetadataKeys(ctr.prototype) || [];
            for (const pk of pkeys) {
                const pAttr: PropertyMeta = Reflect.getMetadata(pk, ctr.prototype);
                const ptype = designType(ctr.prototype, pAttr.key);
                if (pAttr.svc) {
                    const bases = cecProto(pAttr.svc.prototype);
                    const exts = bases.find(e => e === ptype.prototype);
                    assert.ok(exts, `[class ${pAttr.svc.name}] not extends [class ${ptype.name}]`);
                }
                Object.assign(inst, { [pAttr.key]: this.pool.get(pAttr.svc || ptype) });
            }
        }
    }
}

export const SingleAvalon = new Avalon();


