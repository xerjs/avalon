import { ClassType, Ioc } from "./meta/type";

export interface PropertyMeta {
    svc?: ClassType;
    key: string;
}

export interface ProviderOptions {
    ioc?: Ioc;
    deps?: ClassType[];
    id?: string;
}
