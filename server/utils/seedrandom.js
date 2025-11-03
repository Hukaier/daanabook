// 简单的种子随机数生成器
class SeedRandom {
  constructor(seed) {
    this.seed = seed;
  }

  // 线性同余生成器
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // 生成0到max之间的整数
  randomInt(max) {
    return Math.floor(this.next() * max);
  }
}

// 将seedrandom方法添加到Math对象
Math.seedrandom = function(seed) {
  return new SeedRandom(seed);
};

module.exports = { SeedRandom };