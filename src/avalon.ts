import "reflect-metadata";
import * as assert from "assert";
import { ClassType, Ioc, PropertyMeta, ProviderOptions } from "./types";
import { META_KEY } from "./consts";
import { designType, MetaRule, paramTypes } from "./utils";

const unFill = -1;

export class Avalon implements Ioc {
    private pool: Map<ClassType, any>;
    private rule: MetaRule;

    private namedPool: Map<string, ClassType>;
    constructor() {
        this.rule = new MetaRule(META_KEY.svc, META_KEY.property);
        const mm = new Map();
        mm.set(Number, 0);
        mm.set(String, "");
        this.pool = mm;
        this.namedPool = new Map();
    }
    resolve<T>(constructor: ClassType<T>): T {
        return this.pool.get(constructor);
    }

    initialize<T extends ClassType>(servs: T[]) {
        this.fillPool(servs, 0);
        this.createInstances();
        this.fillNamedPool();
        this.injectProperty();
    }

    private fillNamedPool() {
        for (const [ctr] of this.pool) { // ctr is class
            const meta: { id: string; } = this.rule.getMetadata(ctr) as any;
            if (meta?.id && typeof meta.id === "string") {
                this.namedPool.set(meta.id, ctr);
            }
        }
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
            deps.push(...fns); // deps on constructor

            const cfg: ProviderOptions | undefined = this.rule.getMetadata(ctr);
            if (cfg?.deps) {
                deps.push(...cfg.deps);
            }

            const mkeys = Reflect.getMetadataKeys(ctr.prototype);
            for (const mk of mkeys) {
                const propertyKey = this.rule.propertyKey(mk);
                if (!propertyKey) continue;
                const pAttr: PropertyMeta = Reflect.getMetadata(mk, ctr.prototype);
                if (pAttr.svc && typeof pAttr.svc === "function") {
                    deps.push(pAttr.svc);
                }
            }

            if (deps.length && size < this.pool.size) {
                this.fillPool(deps, deep + 1);
            }
        }
    }

    private injectProperty() {
        function recProto(prototype: any): unknown[] {
            const v = prototype.__proto__;
            if (v) {
                return [v, ...recProto(v)];
            }
            return [];
        }
        for (const [ctr, inst] of this.pool) {
            const mkeys = Reflect.getMetadataKeys(ctr.prototype) || [];
            for (const mk of mkeys) {
                const meta: PropertyMeta = Reflect.getMetadata(mk, ctr.prototype);
                const ptype = designType(ctr.prototype, meta.key); // 默认returntype
                if (typeof meta.svc === "string") {
                    const type = this.namedPool.get(meta.svc);
                    assert.ok(type, `miss [${meta.svc}] class `);
                    meta.svc = type;
                }
                if (meta.svc) { // 可配置的子类
                    const bases = recProto(meta.svc.prototype);
                    const exts = bases.find(e => e === ptype.prototype);
                    assert.ok(exts, `[class ${meta.svc.name}] not extends [class ${ptype.name}]`);
                }
                Object.assign(inst, { [meta.key]: this.pool.get(meta.svc || ptype) });
            }
        }
    }
}

export const SingleAvalon = new Avalon();


