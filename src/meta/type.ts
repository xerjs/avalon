export interface ClassType<T = any> {
    new (...args: any): T;
}

export interface AnyFunc<T = any> {
    (...args: any): T;
}

export type Method = (...args: any) => any;

export interface Ioc {
    resolve<T>(ctr: ClassType<T>): T;
    register<T>(ctr: ClassType<T>, e: T): void;
}
