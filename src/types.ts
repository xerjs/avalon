import { ClassType, Ioc } from "./meta/type";

export interface PropertyMeta {
    svc?: ClassType;
}

export interface ProviderOptions {
    ioc?: Ioc;
    deps?: ClassType[];
    id?: string;
}
