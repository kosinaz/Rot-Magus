"use strict";

const STRETCH_2D = (1 / Math.sqrt(2 + 1) - 1) / 2;
const STRETCH_3D = (1 / Math.sqrt(3 + 1) - 1) / 3;
const STRETCH_4D = (1 / Math.sqrt(4 + 1) - 1) / 4;
const SQUISH_2D = (Math.sqrt(2 + 1) - 1) / 2;
const SQUISH_3D = (Math.sqrt(3 + 1) - 1) / 3;
const SQUISH_4D = (Math.sqrt(4 + 1) - 1) / 4;
const NORM_2D = 1 / 47;
const NORM_3D = 1 / 103;
const NORM_4D = 1 / 30;


export default class OpenSimplexNoise {

  constructor(seed) {
    const rand = (function xoshiro128ss(a, b, c, d) {
      return function() {
        const t = b << 9;
        let r = a * 5; r = (r << 7 | r >>> 25) * 9;
        c ^= a; d ^= b; b ^= c; a ^= d; c ^= t;
        d = d << 11 | d >>> 21;
        return r;
      }
    })(Math.floor(seed), Math.floor(seed >> 24), Math.floor(seed << 24), 1);

    this.perm = new Uint8Array(256);
    this.perm2D = new Uint8Array(256);
    this.perm3D = new Uint8Array(256);
    this.perm4D = new Uint8Array(256);
    const source = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      source[i] = i;
    }
    for (let i = 255; i >= 0; i--) {
      const r = rand() % (i + 1);
      const p = this.perm[i] = source[r];
      source[r] = source[i];
      this.perm2D[i] = p % OpenSimplexNoise.gradients2D.length;
      this.perm3D[i] = p % OpenSimplexNoise.gradients3D.length;
      this.perm4D[i] = p % OpenSimplexNoise.gradients4D.length;
    }
  }

  evaluate2D(x, y) {
    const stretchOffset = (x + y) * STRETCH_2D;
    const xs = x + stretchOffset;
    const ys = y + stretchOffset;

    const xsb = Math.floor(xs);
    const ysb = Math.floor(ys);

    const squishOffset = (xsb + ysb) * SQUISH_2D;
    const dx0 = x - (xsb + squishOffset);
    const dy0 = y - (ysb + squishOffset);

    const xins = xs - xsb;
    const yins = ys - ysb;

    const inSum = xins + yins;

    const hash =
      (Math.floor(xins - yins + 1) << 0) |
      (Math.floor(inSum) << 1) |
      (Math.floor(inSum + yins) << 2) |
      (Math.floor(inSum + xins) << 4);

    const perm = this.perm;
    let value = 0.0;
    for (let c of OpenSimplexNoise.lookup2D[hash]) {
      const dx = dx0 + c.dx;
      const dy = dy0 + c.dy;
      let attn = 2 - dx * dx - dy * dy;
      if (attn > 0) {
        const px = xsb + c.xsb;
        const py = ysb + c.ysb;

        const i = this.perm2D[(perm[px & 0xFF] + py) & 0xFF];
        const g = OpenSimplexNoise.gradients2D[i]

        attn *= attn;
        value += attn * attn * (g[0] * dx + g[1] * dy);
      }
    }
    return value * NORM_2D;
  }


  evaluate3D(x, y, z) {
    const stretchOffset = (x + y + z) * STRETCH_3D;
    const xs = x + stretchOffset;
    const ys = y + stretchOffset;
    const zs = z + stretchOffset;

    const xsb = Math.floor(xs);
    const ysb = Math.floor(ys);
    const zsb = Math.floor(zs);

    const squishOffset = (xsb + ysb + zsb) * SQUISH_3D;
    const dx0 = x - (xsb + squishOffset);
    const dy0 = y - (ysb + squishOffset);
    const dz0 = z - (zsb + squishOffset);

    const xins = xs - xsb;
    const yins = ys - ysb;
    const zins = zs - zsb;

    const inSum = xins + yins + zins;

    const hash =
      (Math.floor(yins - zins + 1)) |
      (Math.floor(xins - yins + 1)) << 1 |
      (Math.floor(xins - zins + 1)) << 2 |
      (Math.floor(inSum)) << 3 |
      (Math.floor(inSum + zins)) << 5 |
      (Math.floor(inSum + yins)) << 7 |
      (Math.floor(inSum + xins)) << 9;

    const perm = this.perm;
    let value = 0.0;
    for (let c of OpenSimplexNoise.lookup3D[hash]) {
      const dx = dx0 + c.dx;
      const dy = dy0 + c.dy;
      const dz = dz0 + c.dz;
      let attn = 2 - dx * dx - dy * dy - dz * dz;
      if (attn > 0) {
        const px = xsb + c.xsb;
        const py = ysb + c.ysb;
        const pz = zsb + c.zsb;

        const i = this.perm3D[(perm[(perm[px & 0xFF] + py) & 0xFF] + pz) & 0xFF];
        const g = OpenSimplexNoise.gradients3D[i];

        attn *= attn;
        value += attn * attn * (g[0] * dx + g[1] * dy + g[2] * dz);
      }
    }
    return value * NORM_3D;
  }



  evaluate4D(x, y, z, w) {
    const stretchOffset = (x + y + z + w) * STRETCH_4D;
    const xs = x + stretchOffset;
    const ys = y + stretchOffset;
    const zs = z + stretchOffset;
    const ws = w + stretchOffset;

    const xsb = Math.floor(xs);
    const ysb = Math.floor(ys);
    const zsb = Math.floor(zs);
    const wsb = Math.floor(ws);

    const squishOffset = (xsb + ysb + zsb + wsb) * SQUISH_4D;
    const dx0 = x - (xsb + squishOffset);
    const dy0 = y - (ysb + squishOffset);
    const dz0 = z - (zsb + squishOffset);
    const dw0 = w - (wsb + squishOffset);

    const xins = xs - xsb;
    const yins = ys - ysb;
    const zins = zs - zsb;
    const wins = ws - wsb;

    const inSum = xins + yins + zins + wins;

    const hash =
      (Math.floor(zins - wins + 1)) |
      (Math.floor(yins - zins + 1)) << 1 |
      (Math.floor(yins - wins + 1)) << 2 |
      (Math.floor(xins - yins + 1)) << 3 |
      (Math.floor(xins - zins + 1)) << 4 |
      (Math.floor(xins - wins + 1)) << 5 |
      (Math.floor(inSum)) << 6 |
      (Math.floor(inSum + wins)) << 8 |
      (Math.floor(inSum + zins)) << 11 |
      (Math.floor(inSum + yins)) << 14 |
      (Math.floor(inSum + xins)) << 17;

    const perm = this.perm;
    let value = 0.0;
    for (let c of OpenSimplexNoise.lookup4D[hash]) {
      const dx = dx0 + c.dx;
      const dy = dy0 + c.dy;
      const dz = dz0 + c.dz;
      const dw = dw0 + c.dw;
      let attn = 2 - dx * dx - dy * dy - dz * dz - dw * dw;
      if (attn > 0) {
        const px = xsb + c.xsb;
        const py = ysb + c.ysb;
        const pz = zsb + c.zsb;
        const pw = wsb + c.wsb;

        const i = this.perm4D[(perm[(perm[(perm[px & 0xFF] + py) & 0xFF] + pz) & 0xFF] + pw) & 0xFF];
        const g = OpenSimplexNoise.gradients4D[i];

        attn *= attn;
        value += attn * attn * (g[0] * dx + g[1] * dy + g[2] * dz + g[3] * dw);
      }
    }
    return value * NORM_4D;
  }
}


(function(OpenSimplexNoise) {

  function genGradients(N, v1, v2, E) {
    if (!E) E = 0;
    const rg = [];
    for (let i = 0; i < 2 ** N; i++) {
      for (let j = 0; j < N; j++) {
        let elt = [];
        rg.push(elt);
        for (let k = 0; k < N; k++) {
          const v = (j == k) ? v1 : v2;
          elt.push((i ^ E) & (1 << k) ? v : -v);
        }
      }
    }
    return rg;
  }


  class Contribution2 {
    constructor(multiplier, xsb, ysb) {
      this.dx = -xsb - multiplier * SQUISH_2D;
      this.dy = -ysb - multiplier * SQUISH_2D;
      this.xsb = xsb;
      this.ysb = ysb;
    }
  }

  class Contribution3 {
    constructor(multiplier, xsb, ysb, zsb) {
      this.dx = -xsb - multiplier * SQUISH_3D;
      this.dy = -ysb - multiplier * SQUISH_3D;
      this.dz = -zsb - multiplier * SQUISH_3D;
      this.xsb = xsb;
      this.ysb = ysb;
      this.zsb = zsb;
    }
  }

  class Contribution4 {
    constructor(multiplier, xsb, ysb, zsb, wsb) {
      this.dx = -xsb - multiplier * SQUISH_4D;
      this.dy = -ysb - multiplier * SQUISH_4D;
      this.dz = -zsb - multiplier * SQUISH_4D;
      this.dw = -wsb - multiplier * SQUISH_4D;
      this.xsb = xsb;
      this.ysb = ysb;
      this.zsb = zsb;
      this.wsb = wsb;
    }
  }

  function create(Cls, v) {
    return new (Cls.bind.apply(Cls, [null].concat(v)));
  }


  function createLookup(Class, baseDefs, contributionDefs, lookupDefs) {

    const base = baseDefs.map(rg => rg.map(create.bind(null, Class)));
    const contributions = contributionDefs.map(p => base[p.base].concat(create.bind(null, Class)));

    const lookup = [];
    lookupDefs.forEach((e, i) => e.forEach(k => lookup[k] = contributions[i]));
    return lookup;
  }

  OpenSimplexNoise.gradients2D = genGradients(2, 5, 2);
  OpenSimplexNoise.gradients3D = genGradients(3, 11, 4, 1);
  OpenSimplexNoise.gradients4D = genGradients(4, 3, 1);


  OpenSimplexNoise.lookup2D = createLookup(
    Contribution2, [
      [[1, 1, 0], [1, 0, 1], [0, 0, 0]],
      [[1, 1, 0], [1, 0, 1], [2, 1, 1]]
    ], [
      { base: 0, args: [0, 1, -1] },
      { base: 0, args: [0, -1, 1] },
      { base: 0, args: [2, 1, 1] },
      { base: 1, args: [2, 2, 0] },
      { base: 1, args: [2, 0, 2] },
      { base: 1, args: [0, 0, 0] },
    ], [
      [1, 17], [0, 4], [20, 21],
      [39, 43], [26, 42], [22, 23],
    ]
  );


  OpenSimplexNoise.lookup3D = createLookup(
    Contribution3, [
      [[0, 0, 0, 0], [1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1]],
      [[2, 1, 1, 0], [2, 1, 0, 1], [2, 0, 1, 1], [3, 1, 1, 1]],
      [[1, 1, 0, 0], [1, 0, 1, 0], [1, 0, 0, 1], [2, 1, 1, 0], [2, 1, 0, 1], [2, 0, 1, 1]],
    ], [
      { base: 0, args: [[0, 1, -1, 0], [0, 1, 0, -1]] },
      { base: 0, args: [[0, -1, 1, 0], [0, 0, 1, -1]] },
      { base: 0, args: [[0, -1, 0, 1], [0, 0, -1, 1]] },
      { base: 0, args: [[2, 1, 1, 0], [1, 1, 1, -1]] },
      { base: 0, args: [[2, 1, 0, 1], [1, 1, -1, 1]] },
      { base: 0, args: [[2, 0, 1, 1], [1, -1, 1, 1]] },
      { base: 1, args: [[3, 2, 1, 0], [3, 1, 2, 0]] },
      { base: 1, args: [[3, 2, 0, 1], [3, 1, 0, 2]] },
      { base: 1, args: [[3, 0, 2, 1], [3, 0, 1, 2]] },
      { base: 1, args: [[1, 1, 0, 0], [2, 2, 0, 0]] },
      { base: 1, args: [[1, 0, 1, 0], [2, 0, 2, 0]] },
      { base: 1, args: [[1, 0, 0, 1], [2, 0, 0, 2]] },
      { base: 2, args: [[0, 0, 0, 0], [1, 1, -1, 1]] },
      { base: 2, args: [[0, 0, 0, 0], [1, -1, 1, 1]] },
      { base: 2, args: [[0, 0, 0, 0], [1, 1, 1, -1]] },
      { base: 2, args: [[3, 1, 1, 1], [2, 0, 0, 2]] },
      { base: 2, args: [[3, 1, 1, 1], [2, 2, 0, 0]] },
      { base: 2, args: [[3, 1, 1, 1], [2, 0, 2, 0]] },
      { base: 2, args: [[1, 1, -1, 1], [2, 0, 0, 2]] },
      { base: 2, args: [[1, 1, -1, 1], [2, 2, 0, 0]] },
      { base: 2, args: [[1, -1, 1, 1], [2, 0, 0, 2]] },
      { base: 2, args: [[1, -1, 1, 1], [2, 0, 2, 0]] },
      { base: 2, args: [[1, 1, 1, -1], [2, 2, 0, 0]] },
      { base: 2, args: [[1, 1, 1, -1], [2, 0, 2, 0]] }
    ], [
      [6, 7, 518, 519], [1, 5, 129, 133], [0, 2, 32, 34],
      [645, 647, 677, 679], [546, 550, 674, 678], [160, 161, 672, 673],
      [2005, 2007, 2037, 2039], [1906, 1910, 2034, 2038],
      [1520, 1521, 2032, 2033], [1366, 1367, 1878, 1879],
      [1361, 1365, 1489, 1493], [1360, 1362, 1392, 1394],
      [682, 686], [680, 681], [685, 687],
      [1352, 1354], [1358, 1359], [1353, 1357],
      [714, 1226], [1198, 1230], [712, 840],
      [809, 841], [1199, 1327], [813, 1325],
    ]
  );

  OpenSimplexNoise.lookup4D = createLookup(
    Contribution4, [
      [[0, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1]],
      [[3, 1, 1, 1, 0], [3, 1, 1, 0, 1], [3, 1, 0, 1, 1], [3, 0, 1, 1, 1], [4, 1, 1, 1, 1]],
      [[1, 1, 0, 0, 0], [1, 0, 1, 0, 0], [1, 0, 0, 1, 0], [1, 0, 0, 0, 1], [2, 1, 1, 0, 0], [2, 1, 0, 1, 0], [2, 1, 0, 0, 1], [2, 0, 1, 1, 0], [2, 0, 1, 0, 1], [2, 0, 0, 1, 1]],
      [[3, 1, 1, 1, 0], [3, 1, 1, 0, 1], [3, 1, 0, 1, 1], [3, 0, 1, 1, 1], [2, 1, 1, 0, 0], [2, 1, 0, 1, 0], [2, 1, 0, 0, 1], [2, 0, 1, 1, 0], [2, 0, 1, 0, 1], [2, 0, 0, 1, 1]]
    ], [
      { base: 0, args: [[0, 1, -1, 0, 0], [0, 1, 0, -1, 0], [0, 1, 0, 0, -1]] },
      { base: 0, args: [[0, -1, 1, 0, 0], [0, 0, 1, -1, 0], [0, 0, 1, 0, -1]] },
      { base: 0, args: [[0, -1, 0, 1, 0], [0, 0, -1, 1, 0], [0, 0, 0, 1, -1]] },
      { base: 0, args: [[0, -1, 0, 0, 1], [0, 0, -1, 0, 1], [0, 0, 0, -1, 1]] },
      { base: 0, args: [[2, 1, 1, 0, 0], [1, 1, 1, -1, 0], [1, 1, 1, 0, -1]] },
      { base: 0, args: [[2, 1, 0, 1, 0], [1, 1, -1, 1, 0], [1, 1, 0, 1, -1]] },
      { base: 0, args: [[2, 0, 1, 1, 0], [1, -1, 1, 1, 0], [1, 0, 1, 1, -1]] },
      { base: 0, args: [[2, 1, 0, 0, 1], [1, 1, -1, 0, 1], [1, 1, 0, -1, 1]] },
      { base: 0, args: [[2, 0, 1, 0, 1], [1, -1, 1, 0, 1], [1, 0, 1, -1, 1]] },
      { base: 0, args: [[2, 0, 0, 1, 1], [1, -1, 0, 1, 1], [1, 0, -1, 1, 1]] },
      { base: 1, args: [[4, 2, 1, 1, 0], [4, 1, 2, 1, 0], [4, 1, 1, 2, 0]] },
      { base: 1, args: [[4, 2, 1, 0, 1], [4, 1, 2, 0, 1], [4, 1, 1, 0, 2]] },
      { base: 1, args: [[4, 2, 0, 1, 1], [4, 1, 0, 2, 1], [4, 1, 0, 1, 2]] },
      { base: 1, args: [[4, 0, 2, 1, 1], [4, 0, 1, 2, 1], [4, 0, 1, 1, 2]] },
      { base: 1, args: [[2, 1, 1, 0, 0], [3, 2, 1, 0, 0], [3, 1, 2, 0, 0]] },
      { base: 1, args: [[2, 1, 0, 1, 0], [3, 2, 0, 1, 0], [3, 1, 0, 2, 0]] },
      { base: 1, args: [[2, 0, 1, 1, 0], [3, 0, 2, 1, 0], [3, 0, 1, 2, 0]] },
      { base: 1, args: [[2, 1, 0, 0, 1], [3, 2, 0, 0, 1], [3, 1, 0, 0, 2]] },
      { base: 1, args: [[2, 0, 1, 0, 1], [3, 0, 2, 0, 1], [3, 0, 1, 0, 2]] },
      { base: 1, args: [[2, 0, 0, 1, 1], [3, 0, 0, 2, 1], [3, 0, 0, 1, 2]] },
      { base: 2, args: [[3, 1, 1, 1, 0], [2, 1, 1, 1, -1], [2, 2, 0, 0, 0]] },
      { base: 2, args: [[3, 1, 1, 0, 1], [2, 1, 1, -1, 1], [2, 2, 0, 0, 0]] },
      { base: 2, args: [[3, 1, 0, 1, 1], [2, 1, -1, 1, 1], [2, 2, 0, 0, 0]] },
      { base: 2, args: [[3, 1, 1, 1, 0], [2, 1, 1, 1, -1], [2, 0, 2, 0, 0]] },
      { base: 2, args: [[3, 1, 1, 0, 1], [2, 1, 1, -1, 1], [2, 0, 2, 0, 0]] },
      { base: 2, args: [[3, 0, 1, 1, 1], [2, -1, 1, 1, 1], [2, 0, 2, 0, 0]] },
      { base: 2, args: [[3, 1, 1, 1, 0], [2, 1, 1, 1, -1], [2, 0, 0, 2, 0]] },
      { base: 2, args: [[3, 1, 0, 1, 1], [2, 1, -1, 1, 1], [2, 0, 0, 2, 0]] },
      { base: 2, args: [[3, 0, 1, 1, 1], [2, -1, 1, 1, 1], [2, 0, 0, 2, 0]] },
      { base: 2, args: [[3, 1, 1, 0, 1], [2, 1, 1, -1, 1], [2, 0, 0, 0, 2]] },
      { base: 2, args: [[3, 1, 0, 1, 1], [2, 1, -1, 1, 1], [2, 0, 0, 0, 2]] },
      { base: 2, args: [[3, 0, 1, 1, 1], [2, -1, 1, 1, 1], [2, 0, 0, 0, 2]] },
      { base: 2, args: [[1, 1, 1, -1, 0], [1, 1, 1, 0, -1], [0, 0, 0, 0, 0]] },
      { base: 2, args: [[1, 1, -1, 1, 0], [1, 1, 0, 1, -1], [0, 0, 0, 0, 0]] },
      { base: 2, args: [[1, -1, 1, 1, 0], [1, 0, 1, 1, -1], [0, 0, 0, 0, 0]] },
      { base: 2, args: [[1, 1, -1, 0, 1], [1, 1, 0, -1, 1], [0, 0, 0, 0, 0]] },
      { base: 2, args: [[1, -1, 1, 0, 1], [1, 0, 1, -1, 1], [0, 0, 0, 0, 0]] },
      { base: 2, args: [[1, -1, 0, 1, 1], [1, 0, -1, 1, 1], [0, 0, 0, 0, 0]] },
      { base: 2, args: [[1, 1, 1, -1, 0], [1, 1, 1, 0, -1], [2, 2, 0, 0, 0]] },
      { base: 2, args: [[1, 1, -1, 1, 0], [1, 1, 0, 1, -1], [2, 2, 0, 0, 0]] },
      { base: 2, args: [[1, 1, -1, 0, 1], [1, 1, 0, -1, 1], [2, 2, 0, 0, 0]] },
      { base: 2, args: [[1, 1, 1, -1, 0], [1, 1, 1, 0, -1], [2, 0, 2, 0, 0]] },
      { base: 2, args: [[1, -1, 1, 1, 0], [1, 0, 1, 1, -1], [2, 0, 2, 0, 0]] },
      { base: 2, args: [[1, -1, 1, 0, 1], [1, 0, 1, -1, 1], [2, 0, 2, 0, 0]] },
      { base: 2, args: [[1, 1, -1, 1, 0], [1, 1, 0, 1, -1], [2, 0, 0, 2, 0]] },
      { base: 2, args: [[1, -1, 1, 1, 0], [1, 0, 1, 1, -1], [2, 0, 0, 2, 0]] },
      { base: 2, args: [[1, -1, 0, 1, 1], [1, 0, -1, 1, 1], [2, 0, 0, 2, 0]] },
      { base: 2, args: [[1, 1, -1, 0, 1], [1, 1, 0, -1, 1], [2, 0, 0, 0, 2]] },
      { base: 2, args: [[1, -1, 1, 0, 1], [1, 0, 1, -1, 1], [2, 0, 0, 0, 2]] },
      { base: 2, args: [[1, -1, 0, 1, 1], [1, 0, -1, 1, 1], [2, 0, 0, 0, 2]] },
      { base: 3, args: [[1, 1, 0, 0, 0], [2, 2, 0, 0, 0], [2, 1, 1, 1, -1]] },
      { base: 3, args: [[1, 0, 1, 0, 0], [2, 0, 2, 0, 0], [2, 1, 1, 1, -1]] },
      { base: 3, args: [[1, 0, 0, 1, 0], [2, 0, 0, 2, 0], [2, 1, 1, 1, -1]] },
      { base: 3, args: [[1, 1, 0, 0, 0], [2, 2, 0, 0, 0], [2, 1, 1, -1, 1]] },
      { base: 3, args: [[1, 0, 1, 0, 0], [2, 0, 2, 0, 0], [2, 1, 1, -1, 1]] },
      { base: 3, args: [[1, 0, 0, 0, 1], [2, 0, 0, 0, 2], [2, 1, 1, -1, 1]] },
      { base: 3, args: [[1, 1, 0, 0, 0], [2, 2, 0, 0, 0], [2, 1, -1, 1, 1]] },
      { base: 3, args: [[1, 0, 0, 1, 0], [2, 0, 0, 2, 0], [2, 1, -1, 1, 1]] },
      { base: 3, args: [[1, 0, 0, 0, 1], [2, 0, 0, 0, 2], [2, 1, -1, 1, 1]] },
      { base: 3, args: [[1, 0, 1, 0, 0], [2, 0, 2, 0, 0], [2, -1, 1, 1, 1]] },
      { base: 3, args: [[1, 0, 0, 1, 0], [2, 0, 0, 2, 0], [2, -1, 1, 1, 1]] },
      { base: 3, args: [[1, 0, 0, 0, 1], [2, 0, 0, 0, 2], [2, -1, 1, 1, 1]] },
      { base: 3, args: [[3, 2, 1, 0, 0], [3, 1, 2, 0, 0], [4, 1, 1, 1, 1]] },
      { base: 3, args: [[3, 2, 0, 1, 0], [3, 1, 0, 2, 0], [4, 1, 1, 1, 1]] },
      { base: 3, args: [[3, 0, 2, 1, 0], [3, 0, 1, 2, 0], [4, 1, 1, 1, 1]] },
      { base: 3, args: [[3, 2, 0, 0, 1], [3, 1, 0, 0, 2], [4, 1, 1, 1, 1]] },
      { base: 3, args: [[3, 0, 2, 0, 1], [3, 0, 1, 0, 2], [4, 1, 1, 1, 1]] },
      { base: 3, args: [[3, 0, 0, 2, 1], [3, 0, 0, 1, 2], [4, 1, 1, 1, 1]] },
      { base: 3, args: [[3, 2, 1, 0, 0], [3, 1, 2, 0, 0], [2, 1, 1, 1, -1]] },
      { base: 3, args: [[3, 2, 0, 1, 0], [3, 1, 0, 2, 0], [2, 1, 1, 1, -1]] },
      { base: 3, args: [[3, 0, 2, 1, 0], [3, 0, 1, 2, 0], [2, 1, 1, 1, -1]] },
      { base: 3, args: [[3, 2, 1, 0, 0], [3, 1, 2, 0, 0], [2, 1, 1, -1, 1]] },
      { base: 3, args: [[3, 2, 0, 0, 1], [3, 1, 0, 0, 2], [2, 1, 1, -1, 1]] },
      { base: 3, args: [[3, 0, 2, 0, 1], [3, 0, 1, 0, 2], [2, 1, 1, -1, 1]] },
      { base: 3, args: [[3, 2, 0, 1, 0], [3, 1, 0, 2, 0], [2, 1, -1, 1, 1]] },
      { base: 3, args: [[3, 2, 0, 0, 1], [3, 1, 0, 0, 2], [2, 1, -1, 1, 1]] },
      { base: 3, args: [[3, 0, 0, 2, 1], [3, 0, 0, 1, 2], [2, 1, -1, 1, 1]] },
      { base: 3, args: [[3, 0, 2, 1, 0], [3, 0, 1, 2, 0], [2, -1, 1, 1, 1]] },
      { base: 3, args: [[3, 0, 2, 0, 1], [3, 0, 1, 0, 2], [2, -1, 1, 1, 1]] },
      { base: 3, args: [[3, 0, 0, 2, 1], [3, 0, 0, 1, 2], [2, -1, 1, 1, 1]] },
    ], [
      [56, 57, 58, 59, 60, 61, 62, 63, 131128, 131129, 131130, 131131, 131132, 131133, 131134, 131135],
      [6, 7, 22, 23, 38, 39, 54, 55, 16390, 16391, 16406, 16407, 16422, 16423, 16438, 16439],
      [1, 5, 9, 13, 33, 37, 41, 45, 2049, 2053, 2057, 2061, 2081, 2085, 2089, 2093],
      [0, 2, 8, 10, 16, 18, 24, 26, 256, 258, 264, 266, 272, 274, 280, 282],
      [147510, 147511, 147518, 147519, 147766, 147767, 147774, 147775, 149558, 149559, 149566, 149567, 149814, 149815, 149822, 149823],
      [133161, 133165, 133177, 133181, 133417, 133421, 133433, 133437, 149545, 149549, 149561, 149565, 149801, 149805, 149817, 149821],
      [18437, 18439, 18469, 18471, 18693, 18695, 18725, 18727, 149509, 149511, 149541, 149543, 149765, 149767, 149797, 149799],
      [131352, 131354, 131384, 131386, 133400, 133402, 133432, 133434, 147736, 147738, 147768, 147770, 149784, 149786, 149816, 149818],
      [16642, 16646, 16658, 16662, 18690, 18694, 18706, 18710, 147714, 147718, 147730, 147734, 149762, 149766, 149778, 149782],
      [2304, 2305, 2312, 2313, 18688, 18689, 18696, 18697, 133376, 133377, 133384, 133385, 149760, 149761, 149768, 149769],
      [599013, 599015, 599021, 599023, 599029, 599031, 599037, 599039, 599269, 599271, 599277, 599279, 599285, 599287, 599293, 599295],
      [597202, 597206, 597210, 597214, 597234, 597238, 597242, 597246, 599250, 599254, 599258, 599262, 599282, 599286, 599290, 599294],
      [582856, 582857, 582872, 582873, 582888, 582889, 582904, 582905, 599240, 599241, 599256, 599257, 599272, 599273, 599288, 599289],
      [468160, 468161, 468162, 468163, 468164, 468165, 468166, 468167, 599232, 599233, 599234, 599235, 599236, 599237, 599238, 599239],
      [449526, 449527, 449534, 449535, 465910, 465911, 465918, 465919, 580598, 580599, 580606, 580607, 596982, 596983, 596990, 596991],
      [449513, 449517, 449529, 449533, 451561, 451565, 451577, 451581, 580585, 580589, 580601, 580605, 582633, 582637, 582649, 582653],
      [449477, 449479, 449509, 449511, 451525, 451527, 451557, 451559, 465861, 465863, 465893, 465895, 467909, 467911, 467941, 467943],
      [449496, 449498, 449528, 449530, 449752, 449754, 449784, 449786, 580568, 580570, 580600, 580602, 580824, 580826, 580856, 580858],
      [449474, 449478, 449490, 449494, 449730, 449734, 449746, 449750, 465858, 465862, 465874, 465878, 466114, 466118, 466130, 466134],
      [449472, 449473, 449480, 449481, 449728, 449729, 449736, 449737, 451520, 451521, 451528, 451529, 451776, 451777, 451784, 451785],
      [299389, 299391, 299645, 299647],
      [297594, 297598, 299642, 299646],
      [283256, 283257, 299640, 299641],
      [299367, 299383, 299623, 299639],
      [297558, 297590, 299606, 299638],
      [168518, 168519, 299590, 299591],
      [299365, 299373, 299621, 299629],
      [283209, 283241, 299593, 299625],
      [168513, 168517, 299585, 299589],
      [297554, 297562, 299602, 299610],
      [283208, 283224, 299592, 299608],
      [168512, 168514, 299584, 299586],
      [149878, 149879, 149886, 149887],
      [149865, 149869, 149881, 149885],
      [149829, 149831, 149861, 149863],
      [149848, 149850, 149880, 149882],
      [149826, 149830, 149842, 149846],
      [149824, 149825, 149832, 149833],
      [280958, 280959, 297342, 297343],
      [280953, 280957, 283001, 283005],
      [280952, 280954, 281208, 281210],
      [166262, 166263, 297334, 297335],
      [166215, 166247, 168263, 168295],
      [166214, 166230, 166470, 166486],
      [151913, 151917, 282985, 282989],
      [151877, 151909, 168261, 168293],
      [151873, 151881, 152129, 152137],
      [150104, 150106, 281176, 281178],
      [150082, 150098, 166466, 166482],
      [150080, 150088, 152128, 152136],
      [299709, 299711, 430781, 430783],
      [299687, 299703, 316071, 316087],
      [299685, 299693, 301733, 301741],
      [299706, 299710, 430778, 430782],
      [299670, 299702, 316054, 316086],
      [299666, 299674, 299922, 299930],
      [299704, 299705, 430776, 430777],
      [299657, 299689, 301705, 301737],
      [299656, 299672, 299912, 299928],
      [299654, 299655, 316038, 316039],
      [299649, 299653, 301697, 301701],
      [299648, 299650, 299904, 299906],
      [449462, 449463, 449470, 449471],
      [449449, 449453, 449465, 449469],
      [449413, 449415, 449445, 449447],
      [449432, 449434, 449464, 449466],
      [449410, 449414, 449426, 449430],
      [449408, 449409, 449416, 449417],
      [447159, 447167, 449207, 449215],
      [432813, 432829, 449197, 449213],
      [318117, 318119, 449189, 449191],
      [447158, 447166, 447414, 447422],
      [431002, 431034, 447386, 447418],
      [316306, 316310, 447378, 447382],
      [432809, 432825, 433065, 433081],
      [431000, 431032, 433048, 433080],
      [301960, 301961, 433032, 433033],
      [318085, 318087, 318341, 318343],
      [316290, 316294, 318338, 318342],
      [301952, 301953, 318336, 318337]
    ]);
})(OpenSimplexNoise);
