export const BASE_META_KEY = {
    type: "design:type",
    paramtypes: "design:paramtypes",
    returntype: "design:returntype",
};

const perfix = "avalon:svc";

export const META_KEY = {
    svc: perfix,
    property: (propertyKey: string) => {
        return perfix + ":property:" + propertyKey;
    },
    propertyMatch: (longKey: string) => {
        const re = new RegExp(perfix + ":property:(\\w+)");
        const m = re.exec(longKey);
        if (m) {
            return m[1];
        }
    },
    param: (po: number) => {
        return perfix + ":par:" + po;
    }
} as const;


export const ONCE_MKEY = {
    res: "once:res",
    ttl: "once:ttl",
};