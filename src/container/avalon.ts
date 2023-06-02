import "reflect-metadata";
import { PropertyMeta } from "../types";
import { MetaUtil } from "../meta";
import { ClassType, Ioc } from "../meta/type";

const unFill = Symbol();
const meta = new MetaUtil("avalon");

export class AvalonContainer implements Ioc {
    static root = new AvalonContainer();
    private pool: Map<ClassType, any>;

    private namedPool: Map<string, ClassType>;
    private finCtr = new Set();
    constructor() {
        const mm = new Map();
        mm.set(Number, 0);
        mm.set(String, "");
        this.pool = mm;
        this.namedPool = new Map();
    }

    register<T>(ctr: ClassType<T>, instance: T): void {
        this.pool.set(ctr, instance);
    }

    resolve<T>(ctr: ClassType<T>): T {
        return this.recResolve(ctr, 0);
    }

    recResolve<T>(ctr: ClassType<T>, deep: number): T {
        if (deep === 8) {
            throw new Error("recResolve");
        }

        let instance = this.pool.get(ctr);
        if (!instance) {
            this.initialize([ctr]);
            return this.recResolve(ctr, deep + 1);
        }
        return instance;
    }

    initialize<T extends ClassType>(cls: T[]) {
        this.fillPool(cls, 0);
        this.createInstances();
        this.fillNamedPool();
        this.injectProperty();
    }

    private fillNamedPool() {
        for (const [ctr] of this.pool) {
            // ctr is class
            const opt: ProviderOptions = meta.classValue(ctr);
            if (opt?.id && typeof opt.id === "string") {
                this.namedPool.set(opt.id, ctr);
            }
        }
    }

    private createInstances() {
        for (const [ctr, ins] of this.pool.entries()) {
            if (ins !== unFill) continue;
            const fns = meta.paramTypes(ctr);
            if (!fns || fns.length === 0) {
                // 无参数的构造函数
                this.pool.set(ctr, new ctr());
            }
        }
        do {
            let goon = false;
            for (const [ctr, ins] of this.pool.entries()) {
                if (ins !== unFill) continue; // 已经初始化过了
                const pars = meta.paramTypes(ctr).map((dep) => this.pool.get(dep));
                if (pars.every((e) => e !== unFill)) {
                    this.pool.set(ctr, new ctr(...pars));
                    goon = true;
                }
            }
            if (goon === false) {
                break;
            }
        } while ([...this.pool.values()].filter((e) => e).length < this.pool.size);
    }

    /**
     * 填充pool里的key
     * @param cls
     * @param deep
     */
    private fillPool<T extends ClassType>(cls: T[], deep: number) {
        if (deep === 8) {
            throw new Error("rec fillPool");
        }
        const deps: ClassType[] = [];
        const size = this.pool.size;
        for (const ctr of cls) {
            if (this.pool.has(ctr)) {
                continue;
            }
            this.pool.set(ctr, unFill);
            const fns = meta.paramTypes(ctr);
            if (!fns) continue; // no constructor
            deps.push(...fns); // deps on constructor

            const cfg: ProviderOptions | undefined = meta.classValue(ctr);
            if (cfg?.deps) {
                deps.push(...cfg.deps);
            }

            // deps on property
            for (const mk of meta.propertyKeys(ctr)) {
                const pAttr: PropertyMeta | undefined = meta.propertyValue(ctr, mk);
                if (pAttr?.svc && typeof pAttr.svc === "function") {
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
            for (const mk of meta.propertyKeys(ctr)) {
                const opt: PropertyMeta = meta.propertyValue(ctr.prototype, mk);
                const propertyType = meta.propertyType(ctr.prototype, mk);
                // if (typeof opt.svc === "string") {
                //     const type = this.namedPool.get(opt.svc);
                //     assert.ok(type, `miss [${opt.svc}] class `);
                //     opt.svc = type;
                // }
                // if (opt.svc) {
                //     // 可配置的子类
                //     const bases = recProto(opt.svc.prototype);
                //     const exts = bases.find(e => e === propertyType.prototype);
                //     assert.ok(
                //         exts,
                //         `[class ${opt.svc.name}] not extends [class ${propertyType.name}]`,
                //     );
                // }
                Object.assign(inst, {
                    [mk]: this.resolve(opt.svc || propertyType),
                });
            }
        }
    }
}

export interface ProviderOptions {
    ioc?: Ioc;
    deps?: ClassType[];
    id?: string;
}

export const Provider = meta.classDecorator<ProviderOptions>((opt) => {
    opt = opt || {};
    opt.ioc = opt.ioc || AvalonContainer.root;
    return opt;
});

export const Inject = meta.propertyDecorator<ClassType | string>((e) => {
    return { svc: e };
});
