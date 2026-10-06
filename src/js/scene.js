/* Worksmith.tech — the figure (v3)
 * Dependency-free WebGL2. Six business systems float as record slabs; records travel between
 * them along arcs, and some of the value falls out in the gaps. Scrolling moves the figure
 * through the verticals: find (gaps located) → carry (work flows end to end) → ground (one record layer).
 * Stages are read from [data-stage] elements, so the copy drives the figure.
 *
 * v3 adds, on top of the original motion:
 *   · HDR render target with MSAA, two-level bloom, vignette, soft shoulder and dither
 *   · satin shading on the slabs (key + sheen + fresnel), sheet-stack edges, ember bounce light
 *   · an assembly entrance (slabs settle, arcs draw, records start)
 *   · hover inspection of any system, and a per-page focus system ([data-focus], [data-caption])
 *   · loss pooling on the floor, a sweep across the record layer
 */
export function startScene() {
  const canvas = document.getElementById('scene');
  if (!canvas) return;
  const root = document.documentElement;
  const entrance = root.classList.contains('js-loading');
  const isSmall = () => window.innerWidth < 860;
  const small0 = isSmall();

  let gl = null;
  try {
    gl = canvas.getContext('webgl2', { antialias: small0, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance' });
  } catch (e) { gl = null; }
  if (!gl) { root.classList.add('no-webgl'); return; }

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- palette (brand) ---------- */
  const hex = (h) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
  const C = {
    bg: hex('#171412'),
    ivory: hex('#ebe5d9'),
    plinth: hex('#2a2521'),
    curve: hex('#978b80'),
    cream: hex('#f3eee6'),
    ember: hex('#e5602f'),
    dot: hex('#6a6058'),
    black: [0.02, 0.016, 0.014],
  };

  /* ---------- small math ---------- */
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const mat = () => new Float32Array(16);
  function perspective(out, fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out.fill(0);
    out[0] = f / aspect; out[5] = f; out[10] = (far + near) * nf; out[11] = -1; out[14] = 2 * far * near * nf;
    return out;
  }
  function lookAt(out, e, t, u) {
    let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
    let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
    let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
    l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
    out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
    out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
    out[12] = -(xx * e[0] + xy * e[1] + xz * e[2]);
    out[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
    out[14] = -(zx * e[0] + zy * e[1] + zz * e[2]);
    out[15] = 1;
    return out;
  }
  function trs(out, x, y, z, ry, sx, sy, sz) {
    const c = Math.cos(ry), s = Math.sin(ry);
    out.fill(0);
    out[0] = c * sx; out[2] = -s * sx;
    out[5] = sy;
    out[8] = s * sz; out[10] = c * sz;
    out[12] = x; out[13] = y; out[14] = z; out[15] = 1;
    return out;
  }

  /* ---------- shaders ---------- */
  const MESH_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec2 aUv;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out vec3 vN; out vec3 vW; out vec2 vUv; out float vDepth; out vec3 vL;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz; vL = aPos;
  vN = normalize(mat3(uModel) * aNormal);
  vUv = aUv;
  vec4 v = uView * w;
  vDepth = -v.z;
  gl_Position = uProj * v;
}`;
  const MESH_FS = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in vec2 vUv; in float vDepth; in vec3 vL;
uniform vec3 uColor; uniform float uAlpha; uniform vec3 uCam;
uniform vec3 uFog; uniform vec2 uFogRange;
uniform sampler2D uTex; uniform float uUseTex;
uniform float uSheets; uniform float uHi; uniform vec3 uEmber; uniform float uBounce;
out vec4 o;
void main(){
  vec3 n = normalize(vN);
  vec3 L = normalize(vec3(0.42, 1.0, 0.3));
  vec3 V = normalize(uCam - vW);
  vec3 H = normalize(L + V);
  float diff = max(dot(n, L), 0.0) * 0.7 + 0.3;
  float hemi = mix(0.6, 1.0, n.y * 0.5 + 0.5);
  float spec = pow(clamp(dot(n, H), 0.0, 1.0), 60.0);
  float fres = pow(clamp(1.0 - dot(n, V), 0.0, 1.0), 4.0);
  vec3 col; float a = uAlpha;
  if (uUseTex > 0.5) {
    vec4 t = texture(uTex, vUv);
    col = t.rgb * (0.86 + 0.1 * diff) + spec * 0.035;
    a *= t.a;
  } else {
    col = uColor * diff * hemi + spec * 0.11 + fres * 0.07 * vec3(1.0, 0.94, 0.86);
    // sheet-stack edges: fine horizontal leaves on the sides of a record slab
    float side = 1.0 - abs(n.y);
    float leaf = fract((vL.y + 0.5) * 11.0);
    float line = smoothstep(0.0, 0.1, leaf) * (1.0 - smoothstep(0.2, 0.34, leaf));
    line = mix(line, 0.2, smoothstep(0.3, 0.75, fwidth((vL.y + 0.5) * 11.0)));
    col *= 1.0 - uSheets * side * (0.08 + line * 0.16);
  }
  // ember: hover / focus rim, and light bouncing up from lost value on the floor
  col = mix(col, col * 0.92 + uEmber * 0.22, uHi * (0.35 + fres * 0.9));
  col += uEmber * uBounce * max(-n.y, 0.0) * 0.55;
  float f = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  o = vec4(mix(col, uFog, f), clamp(a, 0.0, 1.0));
}`;
  // a record sheet: smoked glass, lit rim, luminous record rows on its top face
  const GLASS_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out vec3 vN; out vec3 vW; out float vDepth; out vec3 vL; out vec3 vLN;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vW = w.xyz; vL = aPos; vLN = aNormal;
  vN = normalize(mat3(uModel) * aNormal);
  vec4 v = uView * w;
  vDepth = -v.z;
  gl_Position = uProj * v;
}`;
  const GLASS_FS = `#version 300 es
precision highp float;
in vec3 vN; in vec3 vW; in float vDepth; in vec3 vL; in vec3 vLN;
uniform vec3 uCam; uniform vec3 uFog; uniform vec2 uFogRange; uniform vec3 uEmber; uniform vec3 uCream;
uniform float uSeed; uniform float uLevel; uniform float uHi; uniform float uGlow; uniform float uBad;
uniform float uAlpha; uniform float uBounce;
out vec4 o;
float hash(float n){ return fract(sin(n * 12.9898) * 43758.5453); }
float band(float lo, float hi, float x){
  float w = max(fwidth(x), 1e-4);
  return smoothstep(lo - w, lo + w, x) * (1.0 - smoothstep(hi - w, hi + w, x));
}
void main(){
  vec3 n = normalize(vN);
  vec3 V = normalize(uCam - vW);
  vec3 L = normalize(vec3(0.42, 1.0, 0.3));
  vec3 H = normalize(L + V);
  float ndv = clamp(abs(dot(n, V)), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 3.0);
  float diff = clamp(dot(n, L), 0.0, 1.0);
  float spec = pow(clamp(dot(n, H), 0.0, 1.0), 90.0);
  vec3 col = vec3(0.34, 0.31, 0.28) * (0.82 + 0.4 * diff) + vec3(0.12, 0.11, 0.09) * max(n.y, 0.0);
  float a = 0.72 + 0.26 * fres;
  col += uCream * (fres * 0.72 + spec * 0.95);
  if (vLN.y > 0.5) {
    vec2 p = vL.xz + 0.5;
    float inside = band(0.07, 0.93, p.x) * band(0.1, 0.9, p.y);
    float ry = (p.y - 0.1) / 0.8 * 6.0;
    float ri = floor(ry);
    float row = band(0.36, 0.64, fract(ry));
    float x = (p.x - 0.07) / 0.86;
    float w1 = 0.34 + hash(ri + uSeed * 17.0) * 0.36;
    float w2 = 0.07 + hash(ri * 3.7 + uSeed * 5.0) * 0.07;
    float idc = band(0.0, 0.09, x);
    float f1 = band(0.15, w1, x);
    float f2 = band(1.0 - w2, 1.0, x);
    float cells = max(max(idc * 0.85, f1 * 0.5), f2 * 0.8) * row * inside;
    float bad = step(0.7, hash(ri * 5.3 + uSeed * 11.0)) * uBad;
    vec3 ink = mix(uCream, uEmber * 1.7, clamp(bad * f1 * 2.0, 0.0, 1.0));
    col += ink * cells * uLevel * (0.9 + 1.2 * uGlow);
    a = max(a, cells * uLevel * 0.95);
    float rule = band(0.074, 0.086, p.y) * band(0.07, 0.93, p.x);
    col += uCream * rule * 0.6 * uLevel;
  }
  col += uEmber * uHi * (0.1 + fres * 0.85);
  col += uEmber * uBounce * max(-n.y, 0.0) * 0.5;
  float f = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  o = vec4(mix(col, uFog, f), clamp(a * uAlpha, 0.0, 1.0));
}`;
  const LINE_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aT;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out float vDepth; out float vT; out float vX;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vec4 v = uView * w;
  vDepth = -v.z; vT = aT; vX = w.x;
  gl_Position = uProj * v;
}`;
  const LINE_FS = `#version 300 es
precision highp float;
in float vDepth; in float vT; in float vX;
uniform vec3 uColor; uniform float uAlpha;
uniform vec3 uFog; uniform vec2 uFogRange;
uniform float uDash; uniform float uEnds; uniform float uTime;
uniform float uDraw; uniform float uSweep; uniform float uSweepAmt; uniform vec3 uEmber;
out vec4 o;
void main(){
  if (vT > uDraw) discard;
  float f = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  float a = uAlpha;
  a *= mix(1.0, smoothstep(0.0, 0.14, vT) * (1.0 - smoothstep(0.86, 1.0, vT)), uEnds);
  float dash = step(0.5, fract(vT * 16.0 - uTime * 1.1));
  a *= mix(1.0, 0.2 + 0.8 * dash, uDash);
  float sd = (vX - uSweep) * 1.6;
  float sw = uSweepAmt > 0.0 ? exp(-sd * sd) * uSweepAmt : 0.0;
  vec3 col = mix(uColor, uEmber, clamp(sw * 1.4, 0.0, 1.0));
  a += sw * 0.55;
  o = vec4(mix(col, uFog, f), clamp(a * (1.0 - f * 0.9), 0.0, 1.0));
}`;
  // arcs: screen-space ribbons, a constant width in pixels, feathered edges, anti-aliased dashes
  const RIBBON_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aPrev;
layout(location=2) in vec3 aNext;
layout(location=3) in float aSide;
layout(location=4) in float aT;
uniform mat4 uProj; uniform mat4 uView; uniform vec2 uHalf; uniform float uWidth;
out float vDepth; out float vT; out float vSide;
void main(){
  vec4 vp = uView * vec4(aPos, 1.0);
  vec4 c = uProj * vp;
  vec4 cp = uProj * (uView * vec4(aPrev, 1.0));
  vec4 cn = uProj * (uView * vec4(aNext, 1.0));
  vec2 sp = cp.xy / max(cp.w, 1e-3) * uHalf;
  vec2 sn = cn.xy / max(cn.w, 1e-3) * uHalf;
  vec2 d = sn - sp;
  float len = length(d);
  d = len > 1e-4 ? d / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-d.y, d.x);
  c.xy += nrm * (aSide * uWidth) / uHalf * c.w;
  vDepth = -vp.z; vT = aT; vSide = aSide;
  gl_Position = c;
}`;
  const RIBBON_FS = `#version 300 es
precision highp float;
in float vDepth; in float vT; in float vSide;
uniform vec3 uColor; uniform float uAlpha; uniform vec3 uFog; uniform vec2 uFogRange;
uniform float uDash; uniform float uEnds; uniform float uTime; uniform float uDraw; uniform float uFeather;
out vec4 o;
void main(){
  if (vT > uDraw) discard;
  float f = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  float a = uAlpha * (1.0 - smoothstep(1.0 - uFeather, 1.0, abs(vSide)));
  a *= mix(1.0, smoothstep(0.0, 0.14, vT) * (1.0 - smoothstep(0.86, 1.0, vT)), uEnds);
  float x = vT * 16.0 - uTime * 1.1;
  float w = clamp(fwidth(x), 1e-3, 0.25);
  float dash = 1.0 - smoothstep(0.25 - w, 0.25 + w, abs(fract(x) - 0.75));
  a *= mix(1.0, 0.2 + 0.8 * dash, uDash);
  o = vec4(mix(uColor, uFog, f), clamp(a * (1.0 - f * 0.9), 0.0, 1.0));
}`;
  const POINT_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec4 aCol;
layout(location=2) in float aSize;
uniform mat4 uProj; uniform mat4 uView;
uniform float uScale; uniform vec2 uFogRange; uniform float uFade;
uniform float uScanX; uniform float uScanAmt; uniform vec3 uEmber;
out vec4 vCol; out float vFog;
void main(){
  vec4 v = uView * vec4(aPos, 1.0);
  float d = max(-v.z, 0.001);
  gl_Position = uProj * v;
  float px = aSize * uScale / d;
  gl_PointSize = clamp(px, 2.0, 320.0);
  float k = exp(-abs(aPos.x - uScanX) * 2.4) * uScanAmt;
  float sub = clamp(px * px * 0.25, 0.0, 1.0);
  vCol = vec4(mix(aCol.rgb, uEmber, clamp(k, 0.0, 1.0)), aCol.a * sub * (1.0 + k * 2.2) * uFade);
  vFog = smoothstep(uFogRange.x, uFogRange.y, d);
}`;
  const POINT_FS = `#version 300 es
precision highp float;
in vec4 vCol; in float vFog;
uniform int uMode; uniform float uGain;
out vec4 o;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  float a;
  if (uMode == 0) { a = (1.0 - smoothstep(0.26, 0.5, r)); }
  else if (uMode == 1) { a = (1.0 - smoothstep(0.0, 0.22, r)) + (1.0 - smoothstep(0.0, 0.5, r)) * 0.32; }
  else { a = (1.0 - smoothstep(0.0, 0.04, abs(r - 0.43))); }
  a = clamp(a * vCol.a * (1.0 - vFog), 0.0, 1.0);
  if (a < 0.002) discard;
  o = vec4(vCol.rgb * a * uGain, a);
}`;
  const DECAL_VS = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUv;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out vec2 vUv; out float vDepth;
void main(){
  vec4 v = uView * uModel * vec4(aPos, 1.0);
  vUv = aUv; vDepth = -v.z;
  gl_Position = uProj * v;
}`;
  const DECAL_FS = `#version 300 es
precision highp float;
in vec2 vUv; in float vDepth;
uniform vec3 uColor; uniform float uAlpha; uniform int uMode;
uniform vec2 uFogRange;
out vec4 o;
void main(){
  float f = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  float a;
  if (uMode == 0) {
    a = pow(clamp(1.0 - vUv.y, 0.0, 1.0), 2.4) * smoothstep(0.0, 0.25, vUv.x) * (1.0 - smoothstep(0.75, 1.0, vUv.x));
  } else {
    float r = length(vUv - 0.5) * 2.0;
    a = 1.0 - smoothstep(0.1, 1.0, r); a *= a;
  }
  o = vec4(uColor, clamp(a * uAlpha * (1.0 - f), 0.0, 1.0));
}`;
  // post
  const FS_VS = `#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;
  const BRIGHT_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uTexel; uniform float uThresh;
out vec4 o;
void main(){
  vec3 c = texture(uTex, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture(uTex, vUv + uTexel * vec2(1.0, -1.0)).rgb
         + texture(uTex, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture(uTex, vUv + uTexel * vec2(1.0, 1.0)).rgb;
  c *= 0.25;
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.0);
  c = clamp(c, 0.0, 8.0);
  float l = max(max(c.r, c.g), c.b);
  o = vec4(c * smoothstep(uThresh, uThresh + 0.4, l), 1.0);
}`;
  const BLUR_FS = `#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
out vec4 o;
void main(){
  vec3 c = texture(uTex, vUv).rgb * 0.2270270270;
  c += (texture(uTex, vUv + uDir * 1.3846153846).rgb + texture(uTex, vUv - uDir * 1.3846153846).rgb) * 0.3162162162;
  c += (texture(uTex, vUv + uDir * 3.2307692308).rgb + texture(uTex, vUv - uDir * 3.2307692308).rgb) * 0.0702702703;
  o = vec4(c, 1.0);
}`;
  const COMP_FS = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene; uniform sampler2D uB1; uniform sampler2D uB2;
uniform float uBloom; uniform vec2 uRes; uniform float uTime; uniform vec2 uCenter;
out vec4 o;
void main(){
  vec3 c = texture(uScene, vUv).rgb;
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.09, 0.078, 0.07);
  c = clamp(c, 0.0, 8.0);
  c *= 2.35;
  vec3 b = texture(uB1, vUv).rgb * 0.85 + texture(uB2, vUv).rgb * 1.1;
  if (any(isnan(b)) || any(isinf(b))) b = vec3(0.0);
  c += b * uBloom;
  vec2 q = vUv - uCenter; q.x *= uRes.x / uRes.y;
  c *= mix(0.96, 1.0, 1.0 - smoothstep(0.6, 1.6, length(q)));
  vec3 over = max(c - 1.2, 0.0);
  c = min(c, vec3(1.2)) + over / (1.0 + over * 1.4);
  vec2 fc = gl_FragCoord.xy + fract(uTime) * 91.0;
  float n1 = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float n2 = fract(sin(dot(fc, vec2(39.3468, 11.1354))) * 24634.6345);
  c += (n1 + n2 - 1.0) / 255.0;
  o = vec4(c, 1.0);
}`;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }
  function program(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(p, i);
      u[info.name] = gl.getUniformLocation(p, info.name);
    }
    return { p, u };
  }

  /* ---------- the model ---------- */
  const SHEET = [2.4, 0.03, 1.56];   // one record sheet
  const NS = 5;                        // sheets per system
  const SYS = [
    { id: 'SYS-01', name: 'ERP', note: 'orders · dispatch', a: [-4.4, 0.7, -1.6], ay: 0.28, b: [-2.62, 0, -0.89] },
    { id: 'SYS-02', name: 'Ledger', note: 'books · GST returns', a: [0.3, 1.5, -3.8], ay: -0.16, b: [0, 0, -0.89] },
    { id: 'SYS-03', name: 'Stock', note: 'inventory · 3 sites', a: [4.6, 0.35, -1.1], ay: 0.38, b: [2.62, 0, -0.89] },
    { id: 'SYS-04', name: 'WhatsApp', note: 'vendors · customers', a: [3.5, 1.15, 3.0], ay: -0.32, b: [2.62, 0, 0.89] },
    { id: 'SYS-05', name: 'Sheets', note: 'final_v2.xlsx', a: [-0.6, -0.05, 3.4], ay: 0.18, b: [0, 0, 0.89] },
    { id: 'SYS-06', name: 'Bank', note: 'receipts · payments', a: [-4.7, 1.25, 2.2], ay: -0.22, b: [-2.62, 0, 0.89] },
  ];
  const LINKS = [[0, 1, 1], [1, 2, 0.25], [2, 3, 1], [3, 4, 0.25], [4, 5, 1], [5, 0, 0.25], [0, 2, 0.2], [1, 4, 1], [5, 3, 0.2]];
  const GAPS = [0, 2, 4, 7];
  const NL = LINKS.length;
  const S = 64;
  const FLOOR = -1.4;

  // stage keyframes — index matches data-stage in the page
  const STAGES = [
    { eye: [17.7, 13.0, 22.2], tgt: [0, 0.3, 0], dx: 0.56, leak: 0.45, find: 0, carry: 0, ground: 0, flow: 1.0 },
    { eye: [14.5, 5.4, 17.5], tgt: [0, 0.5, 0], dx: 0.6, leak: 0.95, find: 0, carry: 0, ground: 0, flow: 0.7 },
    { eye: [-12.65, 10.45, 14.85], tgt: [0, 0.4, 0], dx: 0.5, leak: 0.6, find: 1, carry: 0, ground: 0, flow: 0.5 },
    { eye: [1.98, 24.4, 15.8], tgt: [0, -0.2, 0.4], dx: 0.5, leak: 0, find: 0, carry: 1, ground: 0, flow: 1.7 },
    { eye: [10.45, 3.96, 11.55], tgt: [0, -0.2, 0], dx: 0.56, leak: 0, find: 0, carry: 0.3, ground: 1, flow: 1.0 },
    { eye: [13.2, 11.0, 16.5], tgt: [0, -0.2, 0], dx: 0.48, leak: 0, find: 0, carry: 0.7, ground: 1, flow: 1.2 },
    { eye: [-14.3, 11.0, 18.7], tgt: [0, -0.3, 0], dx: 0.6, leak: 0, find: 0, carry: 0.5, ground: 1, flow: 1.0 },
  ];
  const CAPTIONS = [
    'Six systems, each individually correct.',
    'Value leaving between systems — not inside any one of them.',
    'Vertical I — the gaps located and put on record.',
    'Vertical II — work carried end to end, nothing dropped.',
    'Vertical III — the record layer everything stands on.',
    'Diagnose, ground, then automate.',
    'Measured against the baseline agreed at the start.',
  ];
  const STATUS = [
    'Status · 0 errors · every record valid',
    'Correct inside · value leaving at its edges',
    'Correct inside · gaps now on record',
    'Work carried in and out · every step logged',
    'Standing on the shared record layer',
    'Grounded first · then automated',
    'Measured against the agreed baseline',
  ];

  /* ---------- geometry ---------- */
  function vao(attribs, data, usage) {
    const v = gl.createVertexArray();
    const b = gl.createBuffer();
    gl.bindVertexArray(v);
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage || gl.STATIC_DRAW);
    const stride = attribs.reduce((s, a) => s + a, 0);
    let off = 0;
    attribs.forEach((size, loc) => {
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, off * 4);
      off += size;
    });
    gl.bindVertexArray(null);
    return { v, b, data };
  }
  function boxData() {
    const faces = [
      [[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
      [[0, 1, 0], [0, 0, 1], [1, 0, 0]], [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
      [[0, 0, 1], [1, 0, 0], [0, 1, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
    ];
    const out = [];
    const corner = (n, u, v, su, sv) => [0, 1, 2].map((k) => n[k] * 0.5 + u[k] * su * 0.5 + v[k] * sv * 0.5);
    faces.forEach(([n, u, v]) => {
      const q = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
      q.forEach(([su, sv]) => { out.push(...corner(n, u, v, su, sv), ...n, 0, 0); });
    });
    return new Float32Array(out);
  }
  function edgeData() {
    const c = [-0.5, 0.5], out = [];
    for (const a of c) for (const b of c) {
      out.push(-0.5, a, b, 0.5, 0.5, a, b, 0.5);
      out.push(a, -0.5, b, 0.5, a, 0.5, b, 0.5);
      out.push(a, b, -0.5, 0.5, a, b, 0.5, 0.5);
    }
    return new Float32Array(out);
  }
  function gridTopData(nx, nz) {
    const out = [], y = 0.52;
    for (let i = 1; i < nx; i++) { const x = -0.5 + i / nx; out.push(x, y, -0.5, 0.5, x, y, 0.5, 0.5); }
    for (let j = 1; j < nz; j++) { const z = -0.5 + j / nz; out.push(-0.5, y, z, 0.5, 0.5, y, z, 0.5); }
    return new Float32Array(out);
  }
  function floorQuadData() {
    const p = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
    const out = [];
    p.forEach(([x, z]) => out.push(x, 0, z, x + 0.5, z + 0.5));
    return new Float32Array(out);
  }
  function sheetQuadData() {
    const p = [[0, -0.5], [1, -0.5], [1, 0.5], [0, -0.5], [1, 0.5], [0, 0.5]];
    const out = [];
    p.forEach(([y, z]) => out.push(0, y, z, z + 0.5, y));
    return new Float32Array(out);
  }
  function groundDotsData() {
    const out = [], step = 0.55, ext = 22;
    for (let x = -ext; x <= ext + 1e-6; x += step) {
      for (let z = -ext; z <= ext + 1e-6; z += step) {
        const r = Math.hypot(x, z);
        const a = 0.75 * (1 - smooth(6, 21, r));
        if (a <= 0.01) continue;
        out.push(x, FLOOR, z, C.dot[0], C.dot[1], C.dot[2], a, 0.034);
      }
    }
    return new Float32Array(out);
  }
  const fsTri = () => vao([2], new Float32Array([-1, -1, 3, -1, -1, 3]));

  /* ---------- init GL resources ---------- */
  let P, geo;
  const NP = small0 ? 760 : 1600;
  const EXTRA = NL + GAPS.length;
  const NM = NL + GAPS.length * 3;

  try {
    P = {
      mesh: program(MESH_VS, MESH_FS),
      line: program(LINE_VS, LINE_FS),
      point: program(POINT_VS, POINT_FS),
      decal: program(DECAL_VS, DECAL_FS),
      glass: program(GLASS_VS, GLASS_FS),
      ribbon: program(RIBBON_VS, RIBBON_FS),
    };
    geo = {
      box: vao([3, 3, 2], boxData()),
      edges: vao([3, 1], edgeData()),
      plinthGrid: vao([3, 1], gridTopData(19, 9)),
      floor: vao([3, 2], floorQuadData()),
      sheet: vao([3, 2], sheetQuadData()),
      dots: vao([3, 4, 1], groundDotsData()),
      curves: vao([3, 1], new Float32Array(NL * S * 4), gl.DYNAMIC_DRAW),
      ribbons: vao([3, 3, 3, 1, 1], new Float32Array(NL * S * 2 * 11), gl.DYNAMIC_DRAW),
      particles: vao([3, 4, 1], new Float32Array((NP + EXTRA) * 8), gl.DYNAMIC_DRAW),
      markers: vao([3, 4, 1], new Float32Array(NM * 8), gl.DYNAMIC_DRAW),
      pins: vao([3, 1], new Float32Array((GAPS.length * 2 + 2) * 4), gl.DYNAMIC_DRAW),
    };
    geo.dots.count = geo.dots.data.length / 8;
  } catch (err) {
    console.warn('[scene] WebGL init failed:', err);
    root.classList.add('no-webgl');
    return;
  }

  /* ---------- post-processing (desktop) ---------- */
  const post = { on: false, w: 0, h: 0 };
  function initPost() {
    if (small0) return;
    try {
      post.hdr = !!gl.getExtension('EXT_color_buffer_float');
      post.fmt = post.hdr ? gl.RGBA16F : gl.RGBA8;
      post.type = post.hdr ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE;
      post.samples = Math.min(4, gl.getParameter(gl.MAX_SAMPLES) || 0);
      post.bright = program(FS_VS, BRIGHT_FS);
      post.blur = program(FS_VS, BLUR_FS);
      post.comp = program(FS_VS, COMP_FS);
      post.tri = fsTri();
      post.on = true;
    } catch (err) {
      console.warn('[scene] post-processing off:', err);
      post.on = false;
    }
  }
  function makeTex(w, h) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, post.fmt, w, h, 0, gl.RGBA, post.type, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function makeTarget(w, h, depth) {
    const t = { w, h, tex: makeTex(w, h), fbo: gl.createFramebuffer() };
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
    if (depth) {
      t.depth = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, t.depth);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, t.depth);
    }
    t.ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    return t;
  }
  function freeTarget(t) {
    if (!t) return;
    gl.deleteTexture(t.tex); gl.deleteFramebuffer(t.fbo);
    if (t.depth) gl.deleteRenderbuffer(t.depth);
  }
  function sizePost(w, h) {
    if (!post.on || (post.w === w && post.h === h)) return;
    post.w = w; post.h = h;
    [post.scene, post.h1, post.h2, post.q1, post.q2].forEach(freeTarget);
    if (post.ms) { gl.deleteFramebuffer(post.ms.fbo); gl.deleteRenderbuffer(post.ms.color); gl.deleteRenderbuffer(post.ms.depth); post.ms = null; }
    post.scene = makeTarget(w, h, post.samples === 0);
    const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1);
    const qw = Math.max(1, w >> 3), qh = Math.max(1, h >> 3);
    post.h1 = makeTarget(hw, hh); post.h2 = makeTarget(hw, hh);
    post.q1 = makeTarget(qw, qh); post.q2 = makeTarget(qw, qh);
    let ok = post.scene.ok && post.h1.ok && post.h2.ok && post.q1.ok && post.q2.ok;
    if (ok && post.samples > 0) {
      const ms = { fbo: gl.createFramebuffer(), color: gl.createRenderbuffer(), depth: gl.createRenderbuffer() };
      gl.bindFramebuffer(gl.FRAMEBUFFER, ms.fbo);
      gl.bindRenderbuffer(gl.RENDERBUFFER, ms.color);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, post.samples, post.fmt, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, ms.color);
      gl.bindRenderbuffer(gl.RENDERBUFFER, ms.depth);
      gl.renderbufferStorageMultisample(gl.RENDERBUFFER, post.samples, gl.DEPTH_COMPONENT24, w, h);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, ms.depth);
      ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
      post.ms = ms;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    if (!ok) { console.warn('[scene] render targets incomplete; drawing direct'); post.on = false; }
  }
  initPost();

  /* ---------- particle state ---------- */
  const pLink = new Uint8Array(NP), pState = new Uint8Array(NP);
  const pT = new Float32Array(NP), pSpeed = new Float32Array(NP), pLeakAt = new Float32Array(NP);
  const pAge = new Float32Array(NP), pLife = new Float32Array(NP);
  const pPos = new Float32Array(NP * 3), pVel = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    pLink[i] = i % NL;
    pT[i] = Math.random();
    pSpeed[i] = 0.09 + Math.random() * 0.06;
    pState[i] = Math.random() < 0.45 * LINKS[pLink[i]][2] ? 1 : 0;
    pLeakAt[i] = 0.38 + Math.random() * 0.24;
  }

  /* ---------- scroll → stage, page focus ---------- */
  let marks = [];
  let focusIdx = -1, captionOverride = null;
  function measure() {
    marks = Array.from(document.querySelectorAll('[data-stage]'))
      .map((el) => ({ i: +el.dataset.stage, top: el.getBoundingClientRect().top + window.scrollY }))
      .sort((a, b) => a.top - b.top);
    const f = document.querySelector('[data-focus]');
    focusIdx = f ? +f.dataset.focus : -1;
    const c = document.querySelector('[data-caption]');
    captionOverride = c ? { stage: +c.dataset.stage, text: c.dataset.caption } : null;
  }
  function stageTarget() {
    if (!marks.length) return 0;
    const y = window.scrollY + window.innerHeight * 0.5;
    let k = 0;
    for (let j = 0; j < marks.length; j++) if (marks[j].top <= y) k = j;
    if (k >= marks.length - 1 || y < marks[0].top) return marks[k].i;
    const a = marks[k], b = marks[k + 1];
    const fr = (y - a.top) / Math.max(1, b.top - a.top);
    return a.i + (b.i - a.i) * smooth(0.55, 1.0, fr);
  }
  const KEYS = ['dx', 'leak', 'find', 'carry', 'ground', 'flow'];
  // the camera travels on an orbit around its target: distance, azimuth and elevation are blended,
  // so a move between two views arcs around the figure instead of cutting through it
  function toOrbit(eye, tgt) {
    const x = eye[0] - tgt[0], y = eye[1] - tgt[1], z = eye[2] - tgt[2];
    const d = Math.hypot(x, y, z) || 1;
    return [d, Math.atan2(x, z), Math.asin(clamp(y / d, -1, 1))];
  }
  function mixAngle(a, b, f) {
    let d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * f;
  }
  function mixState(A, B, f) {
    const o = {};
    for (const k of KEYS) o[k] = lerp(A[k], B[k], f);
    o.tgt = [0, 1, 2].map((n) => lerp(A.tgt[n], B.tgt[n], f));
    if (f <= 0) { o.eye = A.eye.slice(); return o; }
    if (f >= 1) { o.eye = B.eye.slice(); return o; }
    const a = toOrbit(A.eye, A.tgt), b = toOrbit(B.eye, B.tgt);
    const d = Math.exp(lerp(Math.log(a[0]), Math.log(b[0]), f));
    const az = mixAngle(a[1], b[1], f), el = lerp(a[2], b[2], f);
    o.eye = [o.tgt[0] + d * Math.cos(el) * Math.sin(az), o.tgt[1] + d * Math.sin(el), o.tgt[2] + d * Math.cos(el) * Math.cos(az)];
    return o;
  }
  const snap = (st) => mixState(st, st, 0);
  function interp(stage) {
    const i = clamp(Math.floor(stage), 0, STAGES.length - 1);
    const j = Math.min(i + 1, STAGES.length - 1);
    return mixState(STAGES[i], STAGES[j], clamp(stage - i, 0, 1));
  }

  /* ---------- per-frame buffers ---------- */
  const cur = SYS.map(() => ({ p: [0, 0, 0], base: 0, ry: 0, hov: 0, foc: 0, pulse: 0, gap: 0.085, h: 0.37, top: 0 }));
  const agentPrev = new Float32Array(LINKS.length);
  const sheets = [];
  for (let i = 0; i < SYS.length; i++) for (let k = 0; k < NS; k++) sheets.push({ i, k, x: 0, y: 0, z: 0, ry: 0, d: 0 });
  let dropH = 5.5;
  const curveData = geo.curves.data;
  function buildCurves(g) {
    for (let l = 0; l < NL; l++) {
      const ca = cur[LINKS[l][0]], cb = cur[LINKS[l][1]];
      const A = ca.p, B = cb.p;
      const p0 = [A[0], ca.top + 0.02, A[2]], p3 = [B[0], cb.top + 0.02, B[2]];
      const dx = p3[0] - p0[0], dy = p3[1] - p0[1], dz = p3[2] - p0[2];
      const dist = Math.hypot(dx, dy, dz);
      const h = lerp(1.1 + 0.17 * dist, 0.6 + 0.13 * dist, g);
      const p1 = [p0[0] + dx * 0.14, p0[1] + h, p0[2] + dz * 0.14];
      const p2 = [p3[0] - dx * 0.14, p3[1] + h, p3[2] - dz * 0.14];
      for (let s = 0; s < S; s++) {
        const t = s / (S - 1), u = 1 - t;
        const b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
        const o = (l * S + s) * 4;
        curveData[o] = b0 * p0[0] + b1 * p1[0] + b2 * p2[0] + b3 * p3[0];
        curveData[o + 1] = b0 * p0[1] + b1 * p1[1] + b2 * p2[1] + b3 * p3[1];
        curveData[o + 2] = b0 * p0[2] + b1 * p1[2] + b2 * p2[2] + b3 * p3[2];
        curveData[o + 3] = t;
      }
    }
  }
  function buildRibbons() {
    const rd = geo.ribbons.data;
    for (let l = 0; l < NL; l++) {
      for (let s = 0; s < S; s++) {
        const c = (l * S + s) * 4;
        const pv = (l * S + Math.max(0, s - 1)) * 4;
        const nx = (l * S + Math.min(S - 1, s + 1)) * 4;
        for (let side = 0; side < 2; side++) {
          const o = ((l * S + s) * 2 + side) * 11;
          rd[o] = curveData[c]; rd[o + 1] = curveData[c + 1]; rd[o + 2] = curveData[c + 2];
          rd[o + 3] = curveData[pv]; rd[o + 4] = curveData[pv + 1]; rd[o + 5] = curveData[pv + 2];
          rd[o + 6] = curveData[nx]; rd[o + 7] = curveData[nx + 1]; rd[o + 8] = curveData[nx + 2];
          rd[o + 9] = side ? 1 : -1;
          rd[o + 10] = curveData[c + 3];
        }
      }
    }
  }
  function sampleCurve(l, t, out) {
    const f = clamp(t, 0, 1) * (S - 1);
    const i = Math.min(S - 2, Math.floor(f));
    const fr = f - i;
    const a = (l * S + i) * 4, b = a + 4;
    out[0] = curveData[a] + (curveData[b] - curveData[a]) * fr;
    out[1] = curveData[a + 1] + (curveData[b + 1] - curveData[a + 1]) * fr;
    out[2] = curveData[a + 2] + (curveData[b + 2] - curveData[a + 2]) * fr;
    return out;
  }

  /* ---------- DOM hooks ---------- */
  const figNo = document.getElementById('fig-no');
  const figText = document.getElementById('fig-text');
  const tags = Array.from(document.querySelectorAll('.findings .tag'));
  let lastCaption = -1;
  let inspect = document.querySelector('.inspect');
  if (!inspect) {
    inspect = document.createElement('div');
    inspect.className = 'inspect';
    inspect.setAttribute('aria-hidden', 'true');
    inspect.innerHTML = '<div class="inspect-in"><p class="i-id"></p><p class="i-name"></p><p class="i-note"></p><p class="i-status"></p></div>';
    document.body.appendChild(inspect);
  }
  const iId = inspect.querySelector('.i-id'), iName = inspect.querySelector('.i-name');
  const iNote = inspect.querySelector('.i-note'), iStatus = inspect.querySelector('.i-status');
  let inspectFor = -1, inspectOp = -1;
  // system names live in the page, not painted on the geometry: crisp at any size, readable by screen readers only via the inspector
  let sysTags = document.querySelector('.sys-tags');
  if (!sysTags) {
    sysTags = document.createElement('div');
    sysTags.className = 'sys-tags';
    sysTags.setAttribute('aria-hidden', 'true');
    sysTags.innerHTML = SYS.map((s, i) => `<div class="sys-tag"><span><b>${String(i + 1).padStart(2, '0')}</b>${s.name}</span></div>`).join('');
    document.body.appendChild(sysTags);
  }
  const tagEls = Array.from(sysTags.children);
  const tagOp = tagEls.map(() => -1);

  /* ---------- camera + state ---------- */
  const proj = mat(), view = mat(), model = mat();
  let stage = 0, time = 0, last = 0, frameNo = 0, agentPhase = 0;
  let viewZoom = 1;
  let intro = reduceMq.matches || !entrance ? 1 : 0, introDur = 2.6, warming = false;
  let settle = reduceMq.matches ? 1 : 0;           // gentle camera settle on every page
  let handoff = null;                              // camera carried over from the previous page
  let lastHov = -1;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, px: -1, py: -1, active: false };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.px = e.clientX; pointer.py = e.clientY;
    pointer.active = e.pointerType === 'mouse';
  }, { passive: true });
  window.addEventListener('mouseout', (e) => { if (!e.relatedTarget) pointer.active = false; });
  window.addEventListener('blur', () => { pointer.active = false; });

  const DPR_CAP = [1.75, 1.35, 1.0];
  const perf = { acc: 0, n: 0, slow: 0, level: 0 };
  function watchFrame(realDt) {
    if (perf.level >= DPR_CAP.length - 1 || realDt <= 0 || realDt > 0.25) return;
    perf.acc += realDt; perf.n++;
    if (perf.n < 90) return;
    const avg = perf.acc / perf.n;
    perf.acc = 0; perf.n = 0;
    perf.slow = avg > 0.026 ? perf.slow + 1 : 0;
    if (perf.slow >= 2) { perf.level++; perf.slow = 0; }
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, isSmall() ? 1.5 : DPR_CAP[perf.level]);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    sizePost(w, h);
  }

  const tmpA = [0, 0, 0], tmpB = [0, 0, 0];
  const gapPts = GAPS.map(() => [0, 0, 0]);
  let S_ = interp(0);
  let camEye = [0, 0, 0];
  let emberBounce = 0;

  function project(p) {
    const vx = view[0] * p[0] + view[4] * p[1] + view[8] * p[2] + view[12];
    const vy = view[1] * p[0] + view[5] * p[1] + view[9] * p[2] + view[13];
    const vz = view[2] * p[0] + view[6] * p[1] + view[10] * p[2] + view[14];
    const cx = proj[0] * vx + proj[8] * vz;
    const cy = proj[5] * vy + proj[9] * vz;
    const w = -vz;
    if (w < 0.1) return null;
    return [(cx / w * 0.5 + 0.5) * canvas.clientWidth, (1 - (cy / w * 0.5 + 0.5)) * canvas.clientHeight, w];
  }

  function pickHover() {
    if (!pointer.active || isSmall() || intro < 0.9) return -1;
    if (pointer.px < canvas.clientWidth * 0.42) return -1;
    let best = -1, bestD = 1e9;
    for (let i = 0; i < SYS.length; i++) {
      const c = cur[i];
      const s = project([c.p[0], c.base - 0.09 + c.h * 0.5, c.p[2]]);
      if (!s) continue;
      const r = (proj[5] * canvas.clientHeight * 0.5) * (i === lastHov ? 1.45 : 1.15) / s[2];
      const d = Math.hypot(pointer.px - s[0], (pointer.py - s[1]) * 1.4);
      if (d < r && d < bestD) { bestD = d; best = i; }
    }
    return best;
  }

  function update(dt) {
    const rm = reduceMq.matches;
    time += dt * (rm ? 0.2 : 1);
    const live = !warming && !root.classList.contains('js-loading');
    if (live && intro < 1) intro = Math.min(1, intro + dt / introDur);
    if (live && settle < 1) settle = Math.min(1, settle + dt / 1.6);
    if (frameNo % 30 === 0) measure();
    frameNo++;

    const target = stageTarget();
    stage += (target - stage) * (1 - Math.exp(-dt * (rm ? 12 : 2.4)));
    if (Math.abs(target - stage) < 0.0005) stage = target;
    let st = interp(stage);
    if (handoff && !warming) {
      handoff.t = Math.min(1, handoff.t + dt / 1.5);
      st = mixState(handoff.from, st, easeInOut(handoff.t));
      if (handoff.t >= 1) handoff = null;
    } else if (handoff) st = mixState(handoff.from, st, 0);
    S_ = st;
    const small = isSmall();

    // hover + focus
    const hovIdx = warming ? -1 : pickHover();
    lastHov = hovIdx;
    const g = easeInOut(clamp(st.ground, 0, 1));
    for (let i = 0; i < SYS.length; i++) {
      const s = SYS[i], c = cur[i];
      c.hov += ((hovIdx === i ? 1 : 0) - c.hov) * (1 - Math.exp(-dt * 9));
      c.foc += ((focusIdx === i ? 1 : 0) - c.foc) * (1 - Math.exp(-dt * 3));
      const arrive = easeOut(clamp(intro * 1.55 - i * 0.09, 0, 1));
      const lift = c.hov * 0.32 + c.foc * 0.22 * (1 - g * 0.6);
      c.p[0] = lerp(s.a[0], s.b[0], g);
      c.base = lerp(s.a[1], s.b[1], g);
      c.p[1] = c.base + lift + (1 - arrive) * dropH;
      c.p[2] = lerp(s.a[2], s.b[2], g);
      c.ry = lerp(s.ay, 0, g) + (1 - arrive) * 0.5 * (i % 2 ? 1 : -1);
      // the stack breathes open on hover and on arrivals; it presses flat on the record layer
      c.pulse = Math.max(0, c.pulse - dt * 1.3);
      const open = lerp(0.085 + c.hov * 0.14 + (1 - arrive) * 0.12, 0.05 + c.hov * 0.06, g);
      c.gap += (open - c.gap) * (1 - Math.exp(-dt * 6));
      c.h = (NS - 1) * c.gap + SHEET[1];
      c.top = c.p[1] - 0.09 + c.h;
      for (let k = 0; k < NS; k++) {
        const sh = sheets[i * NS + k];
        const drift = (1 - g) * st.leak;
        sh.x = c.p[0] + drift * 0.07 * Math.sin(k * 2.1 + i * 1.3);
        sh.z = c.p[2] + drift * 0.055 * Math.cos(k * 1.7 + i * 0.9);
        sh.y = c.p[1] - 0.09 + SHEET[1] * 0.5 + k * c.gap;
        sh.ry = c.ry + drift * 0.05 * Math.sin(k * 1.3 + i);
      }
    }
    buildCurves(g);
    buildRibbons();

    // particles
    const flow = st.flow * (rm ? 0.25 : 1);
    const leak = st.leak;
    const pd = geo.particles.data;
    const reveal = smooth(0.45, 0.95, intro);
    for (let i = 0; i < NP; i++) {
      const l = pLink[i], o = i * 8;
      if (pState[i] !== 2) {
        const prev = pT[i];
        let nt = prev + pSpeed[i] * dt * flow;
        if (nt >= 1) {
          nt -= 1;
          pState[i] = Math.random() < leak * LINKS[l][2] ? 1 : 0;
          pLeakAt[i] = 0.38 + Math.random() * 0.24;
        } else if (pState[i] === 1 && leak < 0.02) {
          pState[i] = 0;
        }
        pT[i] = nt;
        if (pState[i] === 1 && prev < pLeakAt[i] && nt >= pLeakAt[i]) {
          sampleCurve(l, nt, tmpA);
          sampleCurve(l, Math.min(1, nt + 0.02), tmpB);
          let tx = tmpB[0] - tmpA[0], tz = tmpB[2] - tmpA[2];
          const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
          const side = (Math.random() - 0.5) * 1.8;
          pVel[i * 3] = tx * 0.45 - tz * side;
          pVel[i * 3 + 1] = 0.1 + Math.random() * 0.5;
          pVel[i * 3 + 2] = tz * 0.45 + tx * side;
          pPos[i * 3] = tmpA[0]; pPos[i * 3 + 1] = tmpA[1]; pPos[i * 3 + 2] = tmpA[2];
          pAge[i] = 0; pLife[i] = 2.8 + Math.random() * 1.2;
          pState[i] = 2;
        } else {
          sampleCurve(l, nt, tmpA);
          const a = smooth(0, 0.07, nt) * (1 - smooth(0.93, 1, nt));
          const touch = focusIdx >= 0 && (LINKS[l][0] === focusIdx || LINKS[l][1] === focusIdx) ? cur[focusIdx].foc : 0;
          pd[o] = tmpA[0]; pd[o + 1] = tmpA[1]; pd[o + 2] = tmpA[2];
          pd[o + 3] = lerp(C.cream[0], 1.0, touch * 0.3); pd[o + 4] = lerp(C.cream[1], 0.8, touch * 0.3); pd[o + 5] = lerp(C.cream[2], 0.65, touch * 0.3);
          pd[o + 6] = a * (0.62 + 0.38 * st.carry + touch * 0.3) * reveal;
          pd[o + 7] = 0.05 + 0.014 * st.carry;
          continue;
        }
      }
      const d = dt * (rm ? 0.3 : 1);
      pAge[i] += d;
      const k = i * 3;
      if (pPos[k + 1] > FLOOR + 0.02) {
        pVel[k + 1] -= 1.15 * d;
        const drag = Math.pow(0.55, d);
        pVel[k] *= drag; pVel[k + 2] *= drag;
        pPos[k] += pVel[k] * d; pPos[k + 1] += pVel[k + 1] * d; pPos[k + 2] += pVel[k + 2] * d;
        if (pPos[k + 1] <= FLOOR + 0.02) { pPos[k + 1] = FLOOR + 0.02; pVel[k] *= 0.15; pVel[k + 2] *= 0.15; }
      }
      if (pAge[i] >= pLife[i]) {
        pState[i] = 0; pT[i] = 0;
        pd[o + 6] = 0;
        continue;
      }
      const life = 1 - pAge[i] / pLife[i];
      pd[o] = pPos[k]; pd[o + 1] = pPos[k + 1]; pd[o + 2] = pPos[k + 2];
      pd[o + 3] = C.ember[0] * 1.15; pd[o + 4] = C.ember[1] * 1.1; pd[o + 5] = C.ember[2];
      pd[o + 6] = Math.pow(life, 1.2) * 0.95 * reveal;
      pd[o + 7] = 0.072;
    }

    // agents (vertical II) — one bright carrier per arc
    agentPhase += dt * 0.1 * flow;
    const md = geo.markers.data;
    for (let l = 0; l < NL; l++) {
      const t = (agentPhase + l * 0.37) % 1;
      if (agentPrev[l] < 0.93 && t >= 0.93 && st.carry > 0.05) cur[LINKS[l][1]].pulse = 1;
      agentPrev[l] = t;
      sampleCurve(l, t, tmpA);
      const ends = smooth(0, 0.08, t) * (1 - smooth(0.92, 1, t));
      const o = (NP + l) * 8;
      pd[o] = tmpA[0]; pd[o + 1] = tmpA[1]; pd[o + 2] = tmpA[2];
      pd[o + 3] = 1.18; pd[o + 4] = 1.12; pd[o + 5] = 1.06;
      pd[o + 6] = st.carry * ends * reveal; pd[o + 7] = 0.14;
      const m = l * 8;
      md[m] = tmpA[0]; md[m + 1] = tmpA[1]; md[m + 2] = tmpA[2];
      md[m + 3] = C.cream[0]; md[m + 4] = C.cream[1]; md[m + 5] = C.cream[2];
      md[m + 6] = st.carry * ends * 0.55 * reveal; md[m + 7] = 0.46;
    }

    // gaps located (vertical I)
    const pins = geo.pins.data;
    for (let k = 0; k < GAPS.length; k++) {
      const gp = sampleCurve(GAPS[k], 0.5, gapPts[k]);
      const oc = (NP + NL + k) * 8;
      pd[oc] = gp[0]; pd[oc + 1] = gp[1]; pd[oc + 2] = gp[2];
      pd[oc + 3] = C.ember[0] * 1.5; pd[oc + 4] = C.ember[1] * 1.4; pd[oc + 5] = C.ember[2] * 1.2;
      pd[oc + 6] = st.find * reveal; pd[oc + 7] = 0.12;
      const pulse = rm ? 0.5 : (time * 0.5 + k * 0.25) % 1;
      const ring = [
        [gp[0], gp[1], gp[2], st.find, 0.62 + (rm ? 0 : 0.05 * Math.sin(time * 2.4 + k))],
        [gp[0], gp[1], gp[2], st.find * (1 - pulse) * 0.8, 0.6 + pulse * 1.6],
        [gp[0], FLOOR + 0.01, gp[2], st.find * 0.6, 0.55],
      ];
      ring.forEach((r, n) => {
        const m = (NL + k * 3 + n) * 8;
        md[m] = r[0]; md[m + 1] = r[1]; md[m + 2] = r[2];
        md[m + 3] = C.ember[0]; md[m + 4] = C.ember[1]; md[m + 5] = C.ember[2];
        md[m + 6] = r[3] * reveal; md[m + 7] = r[4];
      });
      const pi = k * 8;
      pins[pi] = gp[0]; pins[pi + 1] = gp[1] - 0.12; pins[pi + 2] = gp[2]; pins[pi + 3] = 0.5;
      pins[pi + 4] = gp[0]; pins[pi + 5] = FLOOR + 0.01; pins[pi + 6] = gp[2]; pins[pi + 7] = 0.5;
    }
    const scanX = rm ? 0 : -7.5 + ((time / 3.8) % 1) * 15;
    const si = GAPS.length * 8;
    pins[si] = scanX; pins[si + 1] = FLOOR + 0.01; pins[si + 2] = -5; pins[si + 3] = 0.5;
    pins[si + 4] = scanX; pins[si + 5] = FLOOR + 0.01; pins[si + 6] = 5; pins[si + 7] = 0.5;
    st.scanX = scanX;
    st.sweep = rm ? 0 : -5.2 + ((time / 5.5) % 1) * 10.4;
    emberBounce += ((leak * 0.55 + st.find * 0.35) - emberBounce) * (1 - Math.exp(-dt * 2));

    // camera
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dt * 2));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dt * 2));
    const tg = st.tgt.slice();
    let ex = st.eye[0] - tg[0], ey = st.eye[1] - tg[1], ez = st.eye[2] - tg[2];
    const push = 1 + (1 - easeOut(intro)) * 0.28 + (1 - easeOut(settle)) * 0.045;
    // narrow screens: sit further back so the figure fits the gap with space on both sides
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const fit = small ? Math.min(3.1, Math.max(1.6, 1.35 / aspect)) : 1;
    const zoom = fit * push;
    viewZoom = zoom;
    ex *= zoom; ey *= zoom; ez *= zoom;
    const ang = rm ? 0 : Math.sin(time * 0.07) * 0.07 + pointer.sx * 0.05 + (1 - easeOut(intro)) * 0.35 + (1 - easeOut(settle)) * 0.05;
    const ca = Math.cos(ang), sa = Math.sin(ang);
    camEye = [tg[0] + ex * ca + ez * sa, tg[1] + ey - pointer.sy * 0.5, tg[2] - ex * sa + ez * ca];

    // captions
    const ci = clamp(Math.round(stage), 0, CAPTIONS.length - 1);
    if (ci !== lastCaption && figText) {
      lastCaption = ci;
      figNo.textContent = 'Fig. ' + String(ci + 1).padStart(2, '0');
      figText.textContent = captionOverride && captionOverride.stage === ci ? captionOverride.text : CAPTIONS[ci];
      document.dispatchEvent(new CustomEvent('ws:stage', { detail: ci }));
    }
    st.hovIdx = hovIdx;
    st.ci = ci;
  }

  function setCommon(prog) {
    gl.useProgram(prog.p);
    if (prog.u.uProj) gl.uniformMatrix4fv(prog.u.uProj, false, proj);
    if (prog.u.uView) gl.uniformMatrix4fv(prog.u.uView, false, view);
    if (prog.u.uFog) gl.uniform3fv(prog.u.uFog, C.bg);
    if (prog.u.uFogRange) gl.uniform2f(prog.u.uFogRange, 17 * viewZoom, 54 * viewZoom);
    if (prog.u.uEmber) gl.uniform3fv(prog.u.uEmber, C.ember);
  }
  function lineUniforms(color, alpha, dash, ends, draw, sweepAmt) {
    const u = P.line.u;
    gl.uniform3fv(u.uColor, color); gl.uniform1f(u.uAlpha, alpha);
    gl.uniform1f(u.uDash, dash || 0); gl.uniform1f(u.uEnds, ends || 0);
    gl.uniform1f(u.uDraw, draw === undefined ? 2 : draw);
    gl.uniform1f(u.uSweepAmt, sweepAmt || 0);
  }

  function drawScene(W, H) {
    const st = S_;
    gl.viewport(0, 0, W, H);
    perspective(proj, (34 * Math.PI) / 180, W / H, 0.1, 140);
    proj[8] -= isSmall() ? 0 : st.dx;
    lookAt(view, camEye, st.tgt, [0, 1, 0]);
    const pScale = H * 0.5 * proj[5];
    const reveal = smooth(0.0, 0.5, intro);

    gl.clearColor(C.bg[0], C.bg[1], C.bg[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);

    const g = easeInOut(clamp(st.ground, 0, 1));

    // floor dots (scan tints them)
    setCommon(P.point);
    gl.uniform1f(P.point.u.uScale, pScale);
    gl.uniform1f(P.point.u.uScanX, st.scanX || 0);
    gl.uniform1f(P.point.u.uScanAmt, st.find * 0.9);
    gl.uniform1f(P.point.u.uFade, reveal);
    gl.uniform1f(P.point.u.uGain, 1);
    gl.uniform1i(P.point.u.uMode, 0);
    gl.depthMask(false);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(geo.dots.v);
    gl.drawArrays(gl.POINTS, 0, geo.dots.count);

    // soft shadows on the floor
    setCommon(P.decal);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1i(P.decal.u.uMode, 1);
    gl.uniform3fv(P.decal.u.uColor, C.black);
    gl.bindVertexArray(geo.floor.v);
    for (let i = 0; i < SYS.length; i++) {
      const c = cur[i];
      const height = c.p[1] - FLOOR;
      trs(model, c.p[0], FLOOR + 0.005, c.p[2], c.ry, 3.4 + height * 0.4, 1, 2.4 + height * 0.3);
      gl.uniformMatrix4fv(P.decal.u.uModel, false, model);
      gl.uniform1f(P.decal.u.uAlpha, 0.78 * (1 - g) / (1 + height * 0.35) * reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    if (g > 0.01) {
      trs(model, 0, FLOOR + 0.005, 0, 0, 12.5, 1, 7.5);
      gl.uniformMatrix4fv(P.decal.u.uModel, false, model);
      gl.uniform1f(P.decal.u.uAlpha, 0.8 * g);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    // a soft key-light pool under the figure
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform3fv(P.decal.u.uColor, C.cream);
    trs(model, 0, FLOOR + 0.002, 0.2, 0, 17, 1, 12);
    gl.uniformMatrix4fv(P.decal.u.uModel, false, model);
    gl.uniform1f(P.decal.u.uAlpha, 0.035 * reveal);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // loss pooling under the gaps: warm light on the floor where value lands
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.uniform3fv(P.decal.u.uColor, C.ember);
    for (let k = 0; k < GAPS.length; k++) {
      const gp = gapPts[k];
      trs(model, gp[0], FLOOR + 0.01, gp[2], 0, 3.2, 1, 3.2);
      gl.uniformMatrix4fv(P.decal.u.uModel, false, model);
      gl.uniform1f(P.decal.u.uAlpha, (st.leak * LINKS[GAPS[k]][2] * 0.16 + st.find * 0.12) * reveal);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    gl.depthMask(true);

    // plinth — the record layer (vertical III)
    setCommon(P.mesh);
    gl.uniform3fv(P.mesh.u.uCam, camEye);
    gl.uniform1f(P.mesh.u.uBounce, 0);
    gl.uniform1f(P.mesh.u.uHi, 0);
    gl.uniform1f(P.mesh.u.uSheets, 0);
    const plA = smooth(0, 0.5, g);
    const plY = lerp(-3.4, -0.37, 1 - Math.pow(1 - g, 3));
    const PL = [8.44, 0.5, 4.14];
    if (plA > 0.005) {
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      trs(model, 0, plY, 0, 0, PL[0], PL[1], PL[2]);
      gl.uniformMatrix4fv(P.mesh.u.uModel, false, model);
      gl.uniform3fv(P.mesh.u.uColor, C.plinth);
      gl.uniform1f(P.mesh.u.uAlpha, plA);
      gl.uniform1f(P.mesh.u.uUseTex, 0);
      gl.bindVertexArray(geo.box.v);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // record stacks: smoked-glass sheets, drawn back to front
    for (const sh of sheets) { const c = cur[sh.i]; sh.d = (c.p[0] - camEye[0]) ** 2 + (c.p[1] - camEye[1]) ** 2 + (c.p[2] - camEye[2]) ** 2; }
    sheets.sort((p, q) => (q.d - p.d) || (p.k - q.k));
    setCommon(P.glass);
    gl.uniform3fv(P.glass.u.uCam, camEye);
    gl.uniform3fv(P.glass.u.uCream, C.cream);
    gl.uniform1f(P.glass.u.uAlpha, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    gl.bindVertexArray(geo.box.v);
    const badAmt = clamp(st.leak * 0.7 + st.find, 0, 1) * (1 - g);
    for (const sh of sheets) {
      const c = cur[sh.i];
      const topSheet = sh.k === NS - 1;
      trs(model, sh.x, sh.y, sh.z, sh.ry, SHEET[0], SHEET[1], SHEET[2]);
      gl.uniformMatrix4fv(P.glass.u.uModel, false, model);
      gl.uniform1f(P.glass.u.uSeed, sh.i + 1 + sh.k * 0.37);
      gl.uniform1f(P.glass.u.uLevel, topSheet ? 1 : 0.3 + 0.45 * c.hov);
      gl.uniform1f(P.glass.u.uHi, Math.max(c.hov, c.foc * 0.8));
      gl.uniform1f(P.glass.u.uGlow, clamp(c.pulse * st.carry + c.foc * 0.45 + c.hov * 0.55 + st.find * 0.15, 0, 1.4));
      gl.uniform1f(P.glass.u.uBad, badAmt);
      gl.uniform1f(P.glass.u.uBounce, sh.k === 0 ? emberBounce * (1 - g) : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disable(gl.CULL_FACE);

    // lines: lit sheet edges (additive), plinth grid, arcs, pins
    setCommon(P.line);
    gl.uniform1f(P.line.u.uTime, time);
    gl.uniform1f(P.line.u.uSweep, st.sweep || 0);
    gl.depthMask(false);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.bindVertexArray(geo.edges.v);
    for (const sh of sheets) {
      const c = cur[sh.i];
      const hi = Math.max(c.hov, c.foc * 0.85);
      const lit = sh.k === NS - 1 ? 1.0 : 0.4;
      trs(model, sh.x, sh.y, sh.z, sh.ry, SHEET[0], SHEET[1], SHEET[2]);
      gl.uniformMatrix4fv(P.line.u.uModel, false, model);
      lineUniforms(hi > 0.02 ? [lerp(C.cream[0], C.ember[0], hi), lerp(C.cream[1], C.ember[1], hi), lerp(C.cream[2], C.ember[2], hi)] : C.cream,
        lit * (0.75 + 0.35 * c.pulse * st.carry) + hi * 0.35);
      gl.drawArrays(gl.LINES, 0, 24);
    }
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    if (plA > 0.005) {
      trs(model, 0, plY, 0, 0, PL[0], PL[1], PL[2]);
      gl.uniformMatrix4fv(P.line.u.uModel, false, model);
      lineUniforms(C.ivory, 0.26 * plA);
      gl.drawArrays(gl.LINES, 0, 24);
      gl.bindVertexArray(geo.plinthGrid.v);
      lineUniforms(C.ivory, 0.09 * plA, 0, 0, 2, 0.9 * plA);
      gl.drawArrays(gl.LINES, 0, geo.plinthGrid.data.length / 4);
    }
    trs(model, 0, 0, 0, 0, 1, 1, 1);
    gl.uniformMatrix4fv(P.line.u.uModel, false, model);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    // arcs
    setCommon(P.ribbon);
    const ru = P.ribbon.u;
    const dpr = W / Math.max(1, canvas.clientWidth);
    const halfW = (0.75 + 0.35 * st.carry) * dpr;
    gl.uniform2f(ru.uHalf, W * 0.5, H * 0.5);
    gl.uniform1f(ru.uWidth, halfW);
    gl.uniform1f(ru.uFeather, clamp(1.3 / Math.max(halfW, 0.5), 0.2, 1));
    gl.uniform1f(ru.uTime, time);
    gl.uniform1f(ru.uDash, st.carry);
    gl.uniform1f(ru.uEnds, 1);
    gl.uniform1f(ru.uDraw, smooth(0.2, 0.9, intro) * 1.02);
    gl.bindVertexArray(geo.ribbons.v);
    gl.bindBuffer(gl.ARRAY_BUFFER, geo.ribbons.b);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, geo.ribbons.data);
    for (let l = 0; l < NL; l++) {
      const touch = focusIdx >= 0 && (LINKS[l][0] === focusIdx || LINKS[l][1] === focusIdx) ? cur[focusIdx].foc : 0;
      const hovTouch = st.hovIdx >= 0 && (LINKS[l][0] === st.hovIdx || LINKS[l][1] === st.hovIdx) ? cur[st.hovIdx].hov : 0;
      const t2 = Math.max(touch, hovTouch);
      const col = t2 > 0.01 ? [lerp(C.curve[0], C.ember[0], t2 * 0.7), lerp(C.curve[1], C.ember[1], t2 * 0.7), lerp(C.curve[2], C.ember[2], t2 * 0.7)] : C.curve;
      gl.uniform3fv(ru.uColor, col);
      gl.uniform1f(ru.uAlpha, 0.3 + 0.22 * st.carry + 0.06 * st.find + t2 * 0.35);
      gl.drawArrays(gl.TRIANGLE_STRIP, l * S * 2, S * 2);
    }
    setCommon(P.line);
    trs(model, 0, 0, 0, 0, 1, 1, 1);
    gl.uniformMatrix4fv(P.line.u.uModel, false, model);

    if (st.find > 0.01) {
      gl.bindVertexArray(geo.pins.v);
      gl.bindBuffer(gl.ARRAY_BUFFER, geo.pins.b);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, geo.pins.data);
      lineUniforms(C.ember, 0.5 * st.find);
      gl.drawArrays(gl.LINES, 0, GAPS.length * 2);
      lineUniforms(C.ember, 0.85 * st.find);
      gl.drawArrays(gl.LINES, GAPS.length * 2, 2);

      setCommon(P.decal);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.uniform1i(P.decal.u.uMode, 0);
      gl.uniform3fv(P.decal.u.uColor, C.ember);
      gl.uniform1f(P.decal.u.uAlpha, 0.14 * st.find);
      trs(model, st.scanX || 0, FLOOR, 0, 0, 1, 3.8, 10);
      gl.uniformMatrix4fv(P.decal.u.uModel, false, model);
      gl.bindVertexArray(geo.sheet.v);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // particles + markers (additive)
    setCommon(P.point);
    gl.uniform1f(P.point.u.uScale, pScale);
    gl.uniform1f(P.point.u.uScanAmt, 0);
    gl.uniform1f(P.point.u.uFade, 1);
    gl.uniform1f(P.point.u.uGain, post.on ? 1.35 : 1);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.uniform1i(P.point.u.uMode, 1);
    gl.bindVertexArray(geo.particles.v);
    gl.bindBuffer(gl.ARRAY_BUFFER, geo.particles.b);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, geo.particles.data);
    gl.drawArrays(gl.POINTS, 0, NP + EXTRA);
    if (st.find > 0.01 || st.carry > 0.01) {
      gl.uniform1i(P.point.u.uMode, 2);
      gl.bindVertexArray(geo.markers.v);
      gl.bindBuffer(gl.ARRAY_BUFFER, geo.markers.b);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, geo.markers.data);
      gl.drawArrays(gl.POINTS, 0, NM);
    }
    gl.depthMask(true);
    gl.bindVertexArray(null);
  }

  function fsPass(prog, target, setup) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null);
    gl.viewport(0, 0, target ? target.w : canvas.width, target ? target.h : canvas.height);
    gl.useProgram(prog.p);
    setup(prog.u);
    gl.bindVertexArray(post.tri.v);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function bindTex(unit, t, loc) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.uniform1i(loc, unit);
  }

  function draw() {
    resize();
    const W = canvas.width, H = canvas.height;
    if (!post.on) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      drawScene(W, H);
      placeOverlays(S_);
      return;
    }
    // 1 · scene into HDR target (multisampled, then resolved)
    gl.bindFramebuffer(gl.FRAMEBUFFER, post.ms ? post.ms.fbo : post.scene.fbo);
    drawScene(W, H);
    if (post.ms) {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, post.ms.fbo);
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, post.scene.fbo);
      gl.blitFramebuffer(0, 0, W, H, 0, 0, W, H, gl.COLOR_BUFFER_BIT, gl.NEAREST);
    }
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    // 2 · bright pass → half, blur; → eighth, blur
    const thresh = post.hdr ? 0.58 : 0.46;
    fsPass(post.bright, post.h1, (u) => { bindTex(0, post.scene.tex, u.uTex); gl.uniform2f(u.uTexel, 1 / W, 1 / H); gl.uniform1f(u.uThresh, thresh); });
    fsPass(post.blur, post.h2, (u) => { bindTex(0, post.h1.tex, u.uTex); gl.uniform2f(u.uDir, 1 / post.h1.w, 0); });
    fsPass(post.blur, post.h1, (u) => { bindTex(0, post.h2.tex, u.uTex); gl.uniform2f(u.uDir, 0, 1 / post.h1.h); });
    fsPass(post.bright, post.q1, (u) => { bindTex(0, post.h1.tex, u.uTex); gl.uniform2f(u.uTexel, 1 / post.h1.w, 1 / post.h1.h); gl.uniform1f(u.uThresh, 0.0); });
    for (let n = 0; n < 2; n++) {
      fsPass(post.blur, post.q2, (u) => { bindTex(0, post.q1.tex, u.uTex); gl.uniform2f(u.uDir, 1.5 / post.q1.w, 0); });
      fsPass(post.blur, post.q1, (u) => { bindTex(0, post.q2.tex, u.uTex); gl.uniform2f(u.uDir, 0, 1.5 / post.q1.h); });
    }
    // 3 · composite to screen
    const st = S_;
    fsPass(post.comp, null, (u) => {
      bindTex(0, post.scene.tex, u.uScene);
      bindTex(1, post.h1.tex, u.uB1);
      bindTex(2, post.q1.tex, u.uB2);
      gl.uniform1f(u.uBloom, 1.85 + st.find * 0.45 + st.carry * 0.12);
      gl.uniform2f(u.uRes, W, H);
      gl.uniform2f(u.uCenter, isSmall() ? 0.5 : 0.5 + st.dx * 0.5, 0.48);
      gl.uniform1f(u.uTime, time);
    });
    gl.bindVertexArray(null);
    placeOverlays(st);
  }

  // HTML overlays: gap annotations (vertical I) and the system inspector
  const tagState = tags.map(() => ({ o: -1 }));
  function placeOverlays(st) {
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (tags.length) {
      const show = st.find > 0.02 && intro > 0.8;
      const small = isSmall();
      for (let k = 0; k < tags.length && k < GAPS.length; k++) {
        const el = tags[k];
        let op = 0;
        if (show) {
          const s = project(gapPts[k]);
          if (s) {
            const edge = small
              ? smooth(12, 36, s[0]) * (1 - smooth(cw - 36, cw - 12, s[0])) * smooth(72, 120, s[1])
              : smooth(cw * 0.44, cw * 0.52, s[0]) * (1 - smooth(cw - 40, cw, s[0] + 180)) * smooth(90, 160, s[1]);
            op = smooth(0.55, 0.95, st.find) * edge;
            el.style.transform = `translate3d(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px, 0)`;
          }
        }
        if (Math.abs(op - tagState[k].o) > 0.01) { el.style.opacity = op.toFixed(3); tagState[k].o = op; }
      }
    }
    // system name tags ride above each stack
    const showNames = running && intro > 0.9 ? (1 - smooth(0.15, 0.6, st.find)) : 0;
    const smallNames = isSmall();
    for (let i = 0; i < tagEls.length; i++) {
      let op = 0;
      if (showNames > 0) {
        const c = cur[i];
        const s = project([c.p[0], c.top + 0.05, c.p[2]]);
        if (s) {
          const side = smallNames
            ? smooth(8, 24, s[0]) * (1 - smooth(cw - 24, cw - 8, s[0]))
            : smooth(cw * 0.46, cw * 0.54, s[0]) * (1 - smooth(cw - 30, cw, s[0] + 60));
          op = showNames * (1 - c.hov) * side * smooth(96, 150, s[1]) * (1 - smooth(ch - 90, ch - 40, s[1]));
          if (op > 0.01) tagEls[i].style.transform = `translate3d(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px, 0)`;
        }
      }
      if (Math.abs(op - tagOp[i]) > 0.01) { tagEls[i].style.opacity = op.toFixed(3); tagOp[i] = op; }
    }
    // inspector follows the hovered system
    const h = st.hovIdx === undefined ? -1 : st.hovIdx;
    let op = 0;
    if (h >= 0 && running) {
      const c = cur[h];
      const s = project([c.p[0], c.top + 0.12, c.p[2]]);
      if (s) {
        op = c.hov;
        if (inspectFor !== h || inspect.dataset.ci !== String(st.ci)) {
          inspectFor = h;
          inspect.dataset.ci = String(st.ci);
          iId.textContent = `${SYS[h].id} · ${String(h + 1).padStart(2, '0')} / 06`;
          iName.textContent = SYS[h].name;
          iNote.textContent = SYS[h].note;
          iStatus.textContent = STATUS[st.ci] || STATUS[0];
        }
        inspect.style.transform = `translate3d(${s[0].toFixed(1)}px, ${s[1].toFixed(1)}px, 0)`;
      }
    }
    if (Math.abs(op - inspectOp) > 0.01) { inspect.style.opacity = op.toFixed(3); inspectOp = op; }
    root.classList.toggle('is-inspecting', op > 0.4);
  }

  /* ---------- loop, visibility ---------- */
  let raf = 0, running = false;
  const manual = /[?&]wsdebug\b/.test(location.search);
  if (manual) {
    window.__wsScene = {
      step(dt, n = 1) { for (let i = 0; i < n; i++) update(dt); draw(); return { stage, intro }; },
      hover(x, y) { pointer.px = x; pointer.py = y; pointer.x = (x / window.innerWidth) * 2 - 1; pointer.y = (y / window.innerHeight) * 2 - 1; pointer.active = x >= 0; },
    };
  }
  function loop(now) {
    if (manual) return;
    raf = requestAnimationFrame(loop);
    const t = now / 1000;
    const real = last ? t - last : 0;
    const dt = last ? Math.min(0.05, real) : 1 / 60;
    last = t;
    watchFrame(real);
    update(dt);
    draw();
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) { last = 0; raf = requestAnimationFrame(loop); }
    else { cancelAnimationFrame(raf); placeOverlays(Object.assign({}, S_, { hovIdx: -1, find: 0 })); }
  }

  let canvasSections = Array.from(document.querySelectorAll('[data-canvas]'));
  const vis = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => vis.set(e.target, e.isIntersecting));
    setRunning(!document.hidden && Array.from(vis.values()).some(Boolean));
  }, { rootMargin: '80px 0px' });
  canvasSections.forEach((s) => io.observe(s));
  document.addEventListener('visibilitychange', () => {
    setRunning(!document.hidden && Array.from(vis.values()).some(Boolean));
  });

  // page swapped under the figure (single-file preview): re-observe, re-measure, jump to the new stage
  document.addEventListener('ws:route', () => {
    io.disconnect();
    vis.clear();
    canvasSections = Array.from(document.querySelectorAll('[data-canvas]'));
    canvasSections.forEach((s) => io.observe(s));
    const from = snap(S_);
    measure();
    stage = stageTarget();
    lastCaption = -1;
    if (!reduceMq.matches) { handoff = { from, t: 0 }; settle = Math.min(settle, 0.4); }
    update(0); draw();
    if (!canvasSections.length) setRunning(false);
  });

  window.addEventListener('resize', () => { measure(); if (!running) { update(0); draw(); } }, { passive: true });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); setRunning(false); root.classList.add('no-webgl'); });

  measure();
  stage = stageTarget();
  introDur = stage < 0.5 ? 2.6 : 2.0;
  dropH = stage < 0.5 ? 5.5 : 1.4;
  const KEY = 'ws-cam';
  if (!entrance && !reduceMq.matches) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (saved && Date.now() - saved.at < 8000 && saved.st && saved.st.eye) handoff = { from: saved.st, t: 0 };
    } catch (e) { /* storage blocked */ }
  }
  window.addEventListener('pagehide', () => {
    try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), st: snap(S_) })); } catch (e) { /* storage blocked */ }
  });
  // warm the particle field so the first frame already has records in flight;
  // the entrance itself waits for the page curtain (html.js-loading) to lift
  warming = true;
  for (let i = 0; i < 90; i++) update(1 / 30);
  warming = false;
  draw();
  root.classList.add('scene-ready');
  if (!canvasSections.length) setRunning(true);
}
