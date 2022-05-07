export interface ClassType<T = any> {
    new(...args: any): T;
}

export type Method = (...args: any) => any;

export interface Ioc {
    resolve<T>(ctr: ClassType<T>): T;
}

export interface PropertyMeta {
    svc?: ClassType;
    key: string;
}
