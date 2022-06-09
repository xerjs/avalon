export const BASE_META_KEY = {
    type: "design:type",
    paramtypes: "design:paramtypes",
    returntype: "design:returntype",
};

const perfix = "avalon:svc";

export const META_KEY = {
    svc: perfix,
    property: "property",
    param: (po: number) => {
        return perfix + ":par:" + po;
    }
} as const;


export const ONCE_MKEY = {
    res: "once:res",
    ttl: "once:ttl",
};