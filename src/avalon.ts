
import { ClassType } from './types'

class Avaion {
    private pool: Map<any, any>
    constructor() {
        this.pool = new Map();
    }
    resolve<T>(constructor: ClassType<T>): T {
        const instance = this.pool.get(constructor) as T
        if (!instance) {
            const msg = `[class ${constructor.name}] missed`
            throw new Error(msg)
        }
        return instance;
    }

    tryResolve<T>(constructor: ClassType<T>): T | undefined {
        return this.pool.get(constructor)
    }
}

export const SingleAvalon = new Avaion();


export function injectable() {
    
}

