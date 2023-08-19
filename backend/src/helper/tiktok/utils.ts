class Utils {
  static getRandomInt(a: number, b: number): number {
    const min = Math.min(a, b);
    const max = Math.max(a, b);
    const diff = max - min + 1;
    return min + Math.floor(Math.random() * Math.floor(diff));
  }

  static generateVerifyFp(): string {
    return "verify_5b161567bda98b6a50c0414d99909d4b"; // !!! NOT SURE IF EXPIRE
    const e = Date.now();
    const t =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split(
        ""
      );
    const n = Date.now().toString(36);
    const r: (string | undefined)[] = [];
    r[8] = r[13] = r[18] = r[23] = "_";
    r[14] = "4";
    let i: number;
    for (let o = 0; o < 36; o++) {
      if (!r[o]) {
        i = 0 | (Math.random() * t.length);
        r[o] = t[19 == o ? (3 & i) | 8 : i];
      }
    }
    return "verify_" + n + "_" + r.join("");
  }
}

export default Utils;
