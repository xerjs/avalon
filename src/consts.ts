export const BASE_META_KEY = {
    type: "design:type",
    paramtypes: "design:paramtypes",
    returntype: "design:returntype",
};

export const META_KEY = {
    svc: "avalon:class",
    ctx: "ctx:module",
    property: "svc:property:%s",
    par: "par:%d",
} as const;