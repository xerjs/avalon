import "reflect-metadata"
import { ClassType } from "./types"
import { META_KEY } from "./consts"
import { paramTypes } from "./utils";

export class Avaion {
    private pool: Map<ClassType, any>
    constructor() {
        this.pool = new Map();
    }
    resolve<T>(constructor: ClassType<T>): T {
        const instance = this.pool.get(constructor) as T;
        return instance;
    }

    initialize<T extends ClassType>(servs: T[]) {
        this.fillPool(servs, 0)
        this.createInstances()
    }

    private createInstances() {
        for (const ctr of this.pool.keys()) {
            const fns = paramTypes(ctr)
            if (fns.length === 0) {
                // 无参数的构造函数
                this.pool.set(ctr, new ctr())
            }
        }
        let i = 0;
        do {
            let goon = false;
            for (const [ctr, v] of this.pool.entries()) {
                if (v) continue // 已经初始化过了
                const pars = paramTypes(ctr).map(fn => this.pool.get(fn))
                if (pars.every(e => e)) {
                    this.pool.set(ctr, new ctr(...pars))
                    goon = true
                }
            }
            if (goon === false) {
                break
            }

        } while ([...this.pool.values()].filter(e => e).length < this.pool.size)

    }

    private fillPool<T extends ClassType>(servs: T[], deep: number) {
        const deps: ClassType[] = []
        for (const ctr of servs) {
            this.pool.set(ctr, 0)
            const fns = paramTypes(ctr)
            deps.push(...fns)
        }
        if (deps.length) {
            this.fillPool(deps, deep + 1)
        }
    }
}

export const SingleAvalon = new Avaion();


