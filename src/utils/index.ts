/**
 * 生成序列
 */
export function indexes(len: number): number[] {
    return "1"
        .repeat(len)
        .split("")
        .map((_e, i) => i);
}

export const sleep = (ms: number) => new Promise<void>((res) => global.setTimeout(res, ms));

/* 洗牌算法
 * @param len 数组长度
 * @returns 洗后的数组下标 0 ~ len-1
 */
export function shuffle(len: number): number[] {
    const arr = indexes(len);
    let cut = arr.length;
    while (cut) {
        const idx = Math.floor(Math.random() * cut);
        [arr[cut - 1], arr[idx]] = [arr[idx], arr[cut - 1]];
        cut--;
    }
    return arr;
}
