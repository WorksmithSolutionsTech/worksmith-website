(()=>{function no(){let i=document.getElementById("scene");if(!i)return;let f=document.documentElement,S=f.classList.contains("js-loading"),x=()=>window.innerWidth<860,y=x(),e=null;try{e=i.getContext("webgl2",{antialias:y,alpha:!1,depth:!0,stencil:!1,powerPreference:"high-performance"})}catch{e=null}if(!e){f.classList.add("no-webgl");return}let E=window.matchMedia("(prefers-reduced-motion: reduce)"),F=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],g={bg:F("#171412"),ivory:F("#ebe5d9"),plinth:F("#2a2521"),curve:F("#978b80"),cream:F("#f3eee6"),ember:F("#e5602f"),dot:F("#6a6058"),black:[.02,.016,.014]},p=(t,o,n)=>t+(o-t)*n,T=(t,o,n)=>Math.min(n,Math.max(o,t)),w=(t,o,n)=>{let r=T((n-t)/(o-t),0,1);return r*r*(3-2*r)},de=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Fe=t=>1-Math.pow(1-t,3),Me=()=>new Float32Array(16);function uo(t,o,n,r,a){let s=1/Math.tan(o/2),c=1/(r-a);return t.fill(0),t[0]=s/n,t[5]=s,t[10]=(a+r)*c,t[11]=-1,t[14]=2*a*r*c,t}function fo(t,o,n,r){let a=o[0]-n[0],s=o[1]-n[1],c=o[2]-n[2],u=Math.hypot(a,s,c);a/=u,s/=u,c/=u;let A=r[1]*c-r[2]*s,M=r[2]*a-r[0]*c,d=r[0]*s-r[1]*a;u=Math.hypot(A,M,d),A/=u,M/=u,d/=u;let O=s*d-c*M,L=c*A-a*d,m=a*M-s*A;return t[0]=A,t[1]=O,t[2]=a,t[3]=0,t[4]=M,t[5]=L,t[6]=s,t[7]=0,t[8]=d,t[9]=m,t[10]=c,t[11]=0,t[12]=-(A*o[0]+M*o[1]+d*o[2]),t[13]=-(O*o[0]+L*o[1]+m*o[2]),t[14]=-(a*o[0]+s*o[1]+c*o[2]),t[15]=1,t}function ie(t,o,n,r,a,s,c,u){let A=Math.cos(a),M=Math.sin(a);return t.fill(0),t[0]=A*s,t[2]=-M*s,t[5]=c,t[8]=M*u,t[10]=A*u,t[12]=o,t[13]=n,t[14]=r,t[15]=1,t}let mo=`#version 300 es
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
}`,ho=`#version 300 es
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
}`,vo=`#version 300 es
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
}`,po=`#version 300 es
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
}`,go=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aT;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out float vDepth; out float vT; out float vX;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vec4 v = uView * w;
  vDepth = -v.z; vT = aT; vX = w.x;
  gl_Position = uProj * v;
}`,yo=`#version 300 es
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
}`,bo=`#version 300 es
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
}`,xo=`#version 300 es
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
}`,Ao=`#version 300 es
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
}`,wo=`#version 300 es
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
}`,Eo=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUv;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out vec2 vUv; out float vDepth;
void main(){
  vec4 v = uView * uModel * vec4(aPos, 1.0);
  vUv = aUv; vDepth = -v.z;
  gl_Position = uProj * v;
}`,So=`#version 300 es
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
}`,ht=`#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,Fo=`#version 300 es
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
}`,Mo=`#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
out vec4 o;
void main(){
  vec3 c = texture(uTex, vUv).rgb * 0.2270270270;
  c += (texture(uTex, vUv + uDir * 1.3846153846).rgb + texture(uTex, vUv - uDir * 1.3846153846).rgb) * 0.3162162162;
  c += (texture(uTex, vUv + uDir * 3.2307692308).rgb + texture(uTex, vUv - uDir * 3.2307692308).rgb) * 0.0702702703;
  o = vec4(c, 1.0);
}`,Ro=`#version 300 es
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
}`;function Rt(t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"shader");return n}function ve(t,o){let n=e.createProgram();if(e.attachShader(n,Rt(e.VERTEX_SHADER,t)),e.attachShader(n,Rt(e.FRAGMENT_SHADER,o)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n)||"link");let r={},a=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let s=0;s<a;s++){let c=e.getActiveUniform(n,s);r[c.name]=e.getUniformLocation(n,c.name)}return{p:n,u:r}}let Ee=[2.4,.03,1.56],Ie=5,me=[{id:"SYS-01",name:"ERP",note:"orders \xB7 dispatch",a:[-4.4,.7,-1.6],ay:.28,b:[-2.62,0,-.89]},{id:"SYS-02",name:"Ledger",note:"books \xB7 GST returns",a:[.3,1.5,-3.8],ay:-.16,b:[0,0,-.89]},{id:"SYS-03",name:"Stock",note:"inventory \xB7 3 sites",a:[4.6,.35,-1.1],ay:.38,b:[2.62,0,-.89]},{id:"SYS-04",name:"WhatsApp",note:"vendors \xB7 customers",a:[3.5,1.15,3],ay:-.32,b:[2.62,0,.89]},{id:"SYS-05",name:"Sheets",note:"final_v2.xlsx",a:[-.6,-.05,3.4],ay:.18,b:[0,0,.89]},{id:"SYS-06",name:"Bank",note:"receipts \xB7 payments",a:[-4.7,1.25,2.2],ay:-.22,b:[-2.62,0,.89]}],W=[[0,1,1],[1,2,.25],[2,3,1],[3,4,.25],[4,5,1],[5,0,.25],[0,2,.2],[1,4,1],[5,3,.2]],te=[0,2,4,7],se=W.length,Y=64,$=-1.4,et=[{eye:[17.7,13,22.2],tgt:[0,.3,0],dx:.56,leak:.45,find:0,carry:0,ground:0,flow:1},{eye:[14.5,5.4,17.5],tgt:[0,.5,0],dx:.6,leak:.95,find:0,carry:0,ground:0,flow:.7},{eye:[-12.65,10.45,14.85],tgt:[0,.4,0],dx:.5,leak:.6,find:1,carry:0,ground:0,flow:.5},{eye:[1.98,24.4,15.8],tgt:[0,-.2,.4],dx:.5,leak:0,find:0,carry:1,ground:0,flow:1.7},{eye:[10.45,3.96,11.55],tgt:[0,-.2,0],dx:.56,leak:0,find:0,carry:.3,ground:1,flow:1},{eye:[13.2,11,16.5],tgt:[0,-.2,0],dx:.48,leak:0,find:0,carry:.7,ground:1,flow:1.2},{eye:[-14.3,11,18.7],tgt:[0,-.3,0],dx:.6,leak:0,find:0,carry:.5,ground:1,flow:1}],Tt=["Six systems, each individually correct.","Value leaving between systems \u2014 not inside any one of them.","Vertical I \u2014 the gaps located and put on record.","Vertical II \u2014 work carried end to end, nothing dropped.","Vertical III \u2014 the record layer everything stands on.","Diagnose, ground, then automate.","Measured against the baseline agreed at the start."],Lt=["Status \xB7 0 errors \xB7 every record valid","Correct inside \xB7 value leaving at its edges","Correct inside \xB7 gaps now on record","Work carried in and out \xB7 every step logged","Standing on the shared record layer","Grounded first \xB7 then automated","Measured against the agreed baseline"];function oe(t,o,n){let r=e.createVertexArray(),a=e.createBuffer();e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,o,n||e.STATIC_DRAW);let s=t.reduce((u,A)=>u+A,0),c=0;return t.forEach((u,A)=>{e.enableVertexAttribArray(A),e.vertexAttribPointer(A,u,e.FLOAT,!1,s*4,c*4),c+=u}),e.bindVertexArray(null),{v:r,b:a,data:o}}function To(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],o=[],n=(r,a,s,c,u)=>[0,1,2].map(A=>r[A]*.5+a[A]*c*.5+s[A]*u*.5);return t.forEach(([r,a,s])=>{[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([u,A])=>{o.push(...n(r,a,s,u,A),...r,0,0)})}),new Float32Array(o)}function Lo(){let t=[-.5,.5],o=[];for(let n of t)for(let r of t)o.push(-.5,n,r,.5,.5,n,r,.5),o.push(n,-.5,r,.5,n,.5,r,.5),o.push(n,r,-.5,.5,n,r,.5,.5);return new Float32Array(o)}function _o(t,o){let n=[];for(let a=1;a<t;a++){let s=-.5+a/t;n.push(s,.52,-.5,.5,s,.52,.5,.5)}for(let a=1;a<o;a++){let s=-.5+a/o;n.push(-.5,.52,s,.5,.5,.52,s,.5)}return new Float32Array(n)}function Po(){let t=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]],o=[];return t.forEach(([n,r])=>o.push(n,0,r,n+.5,r+.5)),new Float32Array(o)}function Co(){let t=[[0,-.5],[1,-.5],[1,.5],[0,-.5],[1,.5],[0,.5]],o=[];return t.forEach(([n,r])=>o.push(0,n,r,r+.5,n)),new Float32Array(o)}function Do(){let t=[];for(let r=-22;r<=22+1e-6;r+=.55)for(let a=-22;a<=22+1e-6;a+=.55){let s=Math.hypot(r,a),c=.75*(1-w(6,21,s));c<=.01||t.push(r,$,a,g.dot[0],g.dot[1],g.dot[2],c,.034)}return new Float32Array(t)}let No=()=>oe([2],new Float32Array([-1,-1,3,-1,-1,3])),v,P,G=y?760:1600,_t=se+te.length,Pt=se+te.length*3;try{v={mesh:ve(mo,ho),line:ve(go,yo),point:ve(Ao,wo),decal:ve(Eo,So),glass:ve(vo,po),ribbon:ve(bo,xo)},P={box:oe([3,3,2],To()),edges:oe([3,1],Lo()),plinthGrid:oe([3,1],_o(19,9)),floor:oe([3,2],Po()),sheet:oe([3,2],Co()),dots:oe([3,4,1],Do()),curves:oe([3,1],new Float32Array(se*Y*4),e.DYNAMIC_DRAW),ribbons:oe([3,3,3,1,1],new Float32Array(se*Y*2*11),e.DYNAMIC_DRAW),particles:oe([3,4,1],new Float32Array((G+_t)*8),e.DYNAMIC_DRAW),markers:oe([3,4,1],new Float32Array(Pt*8),e.DYNAMIC_DRAW),pins:oe([3,1],new Float32Array((te.length*2+2)*4),e.DYNAMIC_DRAW)},P.dots.count=P.dots.data.length/8}catch(t){console.warn("[scene] WebGL init failed:",t),f.classList.add("no-webgl");return}let l={on:!1,w:0,h:0};function Io(){if(!y)try{l.hdr=!!e.getExtension("EXT_color_buffer_float"),l.fmt=l.hdr?e.RGBA16F:e.RGBA8,l.type=l.hdr?e.HALF_FLOAT:e.UNSIGNED_BYTE,l.samples=Math.min(4,e.getParameter(e.MAX_SAMPLES)||0),l.bright=ve(ht,Fo),l.blur=ve(ht,Mo),l.comp=ve(ht,Ro),l.tri=No(),l.on=!0}catch(t){console.warn("[scene] post-processing off:",t),l.on=!1}}function Uo(t,o){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,l.fmt,t,o,0,e.RGBA,l.type,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}function Be(t,o,n){let r={w:t,h:o,tex:Uo(t,o),fbo:e.createFramebuffer()};return e.bindFramebuffer(e.FRAMEBUFFER,r.fbo),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r.tex,0),n&&(r.depth=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,r.depth)),r.ok=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,r}function ko(t){t&&(e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo),t.depth&&e.deleteRenderbuffer(t.depth))}function Bo(t,o){if(!l.on||l.w===t&&l.h===o)return;l.w=t,l.h=o,[l.scene,l.h1,l.h2,l.q1,l.q2].forEach(ko),l.ms&&(e.deleteFramebuffer(l.ms.fbo),e.deleteRenderbuffer(l.ms.color),e.deleteRenderbuffer(l.ms.depth),l.ms=null),l.scene=Be(t,o,l.samples===0);let n=Math.max(1,t>>1),r=Math.max(1,o>>1),a=Math.max(1,t>>3),s=Math.max(1,o>>3);l.h1=Be(n,r),l.h2=Be(n,r),l.q1=Be(a,s),l.q2=Be(a,s);let c=l.scene.ok&&l.h1.ok&&l.h2.ok&&l.q1.ok&&l.q2.ok;if(c&&l.samples>0){let u={fbo:e.createFramebuffer(),color:e.createRenderbuffer(),depth:e.createRenderbuffer()};e.bindFramebuffer(e.FRAMEBUFFER,u.fbo),e.bindRenderbuffer(e.RENDERBUFFER,u.color),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,l.fmt,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.color),e.bindRenderbuffer(e.RENDERBUFFER,u.depth),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,u.depth),c=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,l.ms=u}e.bindFramebuffer(e.FRAMEBUFFER,null),c||(console.warn("[scene] render targets incomplete; drawing direct"),l.on=!1)}Io();let vt=new Uint8Array(G),Se=new Uint8Array(G),tt=new Float32Array(G),Ct=new Float32Array(G),ot=new Float32Array(G),nt=new Float32Array(G),pt=new Float32Array(G),ne=new Float32Array(G*3),ce=new Float32Array(G*3);for(let t=0;t<G;t++)vt[t]=t%se,tt[t]=Math.random(),Ct[t]=.09+Math.random()*.06,Se[t]=Math.random()<.45*W[vt[t]][2]?1:0,ot[t]=.38+Math.random()*.24;let pe=[],he=-1,at=null;function rt(){pe=Array.from(document.querySelectorAll("[data-stage]")).map(n=>({i:+n.dataset.stage,top:n.getBoundingClientRect().top+window.scrollY})).sort((n,r)=>n.top-r.top);let t=document.querySelector("[data-focus]");he=t?+t.dataset.focus:-1;let o=document.querySelector("[data-caption]");at=o?{stage:+o.dataset.stage,text:o.dataset.caption}:null}function gt(){if(!pe.length)return 0;let t=window.scrollY+window.innerHeight*.5,o=0;for(let s=0;s<pe.length;s++)pe[s].top<=t&&(o=s);if(o>=pe.length-1||t<pe[0].top)return pe[o].i;let n=pe[o],r=pe[o+1],a=(t-n.top)/Math.max(1,r.top-n.top);return n.i+(r.i-n.i)*w(.55,1,a)}let Oo=["dx","leak","find","carry","ground","flow"];function Dt(t,o){let n=t[0]-o[0],r=t[1]-o[1],a=t[2]-o[2],s=Math.hypot(n,r,a)||1;return[s,Math.atan2(n,a),Math.asin(T(r/s,-1,1))]}function qo(t,o,n){let r=o-t;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;return t+r*n}function it(t,o,n){let r={};for(let M of Oo)r[M]=p(t[M],o[M],n);if(r.tgt=[0,1,2].map(M=>p(t.tgt[M],o.tgt[M],n)),n<=0)return r.eye=t.eye.slice(),r;if(n>=1)return r.eye=o.eye.slice(),r;let a=Dt(t.eye,t.tgt),s=Dt(o.eye,o.tgt),c=Math.exp(p(Math.log(a[0]),Math.log(s[0]),n)),u=qo(a[1],s[1],n),A=p(a[2],s[2],n);return r.eye=[r.tgt[0]+c*Math.cos(A)*Math.sin(u),r.tgt[1]+c*Math.sin(A),r.tgt[2]+c*Math.cos(A)*Math.cos(u)],r}let Nt=t=>it(t,t,0);function It(t){let o=T(Math.floor(t),0,et.length-1),n=Math.min(o+1,et.length-1);return it(et[o],et[n],T(t-o,0,1))}let X=me.map(()=>({p:[0,0,0],base:0,ry:0,hov:0,foc:0,pulse:0,gap:.085,h:.37,top:0})),Ut=new Float32Array(W.length),Ue=[];for(let t=0;t<me.length;t++)for(let o=0;o<Ie;o++)Ue.push({i:t,k:o,x:0,y:0,z:0,ry:0,d:0});let kt=5.5,I=P.curves.data;function Ho(t){for(let o=0;o<se;o++){let n=X[W[o][0]],r=X[W[o][1]],a=n.p,s=r.p,c=[a[0],n.top+.02,a[2]],u=[s[0],r.top+.02,s[2]],A=u[0]-c[0],M=u[1]-c[1],d=u[2]-c[2],O=Math.hypot(A,M,d),L=p(1.1+.17*O,.6+.13*O,t),m=[c[0]+A*.14,c[1]+L,c[2]+d*.14],_=[u[0]-A*.14,u[1]+L,u[2]-d*.14];for(let D=0;D<Y;D++){let U=D/(Y-1),ae=1-U,ke=ae*ae*ae,Ce=3*ae*ae*U,$e=3*ae*U*U,Xe=U*U*U,Ke=(o*Y+D)*4;I[Ke]=ke*c[0]+Ce*m[0]+$e*_[0]+Xe*u[0],I[Ke+1]=ke*c[1]+Ce*m[1]+$e*_[1]+Xe*u[1],I[Ke+2]=ke*c[2]+Ce*m[2]+$e*_[2]+Xe*u[2],I[Ke+3]=U}}}function Vo(){let t=P.ribbons.data;for(let o=0;o<se;o++)for(let n=0;n<Y;n++){let r=(o*Y+n)*4,a=(o*Y+Math.max(0,n-1))*4,s=(o*Y+Math.min(Y-1,n+1))*4;for(let c=0;c<2;c++){let u=((o*Y+n)*2+c)*11;t[u]=I[r],t[u+1]=I[r+1],t[u+2]=I[r+2],t[u+3]=I[a],t[u+4]=I[a+1],t[u+5]=I[a+2],t[u+6]=I[s],t[u+7]=I[s+1],t[u+8]=I[s+2],t[u+9]=c?1:-1,t[u+10]=I[r+3]}}}function Oe(t,o,n){let r=T(o,0,1)*(Y-1),a=Math.min(Y-2,Math.floor(r)),s=r-a,c=(t*Y+a)*4,u=c+4;return n[0]=I[c]+(I[u]-I[c])*s,n[1]=I[c+1]+(I[u+1]-I[c+1])*s,n[2]=I[c+2]+(I[u+2]-I[c+2])*s,n}let zo=document.getElementById("fig-no"),Bt=document.getElementById("fig-text"),st=Array.from(document.querySelectorAll(".findings .tag")),yt=-1,K=document.querySelector(".inspect");K||(K=document.createElement("div"),K.className="inspect",K.setAttribute("aria-hidden","true"),K.innerHTML='<div class="inspect-in"><p class="i-id"></p><p class="i-name"></p><p class="i-note"></p><p class="i-status"></p></div>',document.body.appendChild(K));let Yo=K.querySelector(".i-id"),jo=K.querySelector(".i-name"),Go=K.querySelector(".i-note"),Wo=K.querySelector(".i-status"),Ot=-1,qt=-1,Re=document.querySelector(".sys-tags");Re||(Re=document.createElement("div"),Re.className="sys-tags",Re.setAttribute("aria-hidden","true"),Re.innerHTML=me.map((t,o)=>`<div class="sys-tag"><span><b>${String(o+1).padStart(2,"0")}</b>${t.name}</span></div>`).join(""),document.body.appendChild(Re));let ct=Array.from(Re.children),Ht=ct.map(()=>-1),ge=Me(),Q=Me(),k=Me(),le=0,ye=0,qe=0,Vt=0,zt=0,bt=1,Z=E.matches||!S?1:0,Yt=2.6,He=!1,Te=E.matches?1:0,ue=null,jt=-1,N={x:0,y:0,sx:0,sy:0,px:-1,py:-1,active:!1};window.addEventListener("pointermove",t=>{N.x=t.clientX/window.innerWidth*2-1,N.y=t.clientY/window.innerHeight*2-1,N.px=t.clientX,N.py=t.clientY,N.active=t.pointerType==="mouse"},{passive:!0}),window.addEventListener("mouseout",t=>{t.relatedTarget||(N.active=!1)}),window.addEventListener("blur",()=>{N.active=!1});let Gt=[1.75,1.35,1],J={acc:0,n:0,slow:0,level:0};function $o(t){if(J.level>=Gt.length-1||t<=0||t>.25||(J.acc+=t,J.n++,J.n<90))return;let o=J.acc/J.n;J.acc=0,J.n=0,J.slow=o>.026?J.slow+1:0,J.slow>=2&&(J.level++,J.slow=0)}function Xo(){let t=Math.min(window.devicePixelRatio||1,x()?1.5:Gt[J.level]),o=Math.max(1,Math.round(i.clientWidth*t)),n=Math.max(1,Math.round(i.clientHeight*t));(i.width!==o||i.height!==n)&&(i.width=o,i.height=n),Bo(o,n)}let z=[0,0,0],xt=[0,0,0],At=te.map(()=>[0,0,0]),Le=It(0),_e=[0,0,0],wt=0;function lt(t){let o=Q[0]*t[0]+Q[4]*t[1]+Q[8]*t[2]+Q[12],n=Q[1]*t[0]+Q[5]*t[1]+Q[9]*t[2]+Q[13],r=Q[2]*t[0]+Q[6]*t[1]+Q[10]*t[2]+Q[14],a=ge[0]*o+ge[8]*r,s=ge[5]*n+ge[9]*r,c=-r;return c<.1?null:[(a/c*.5+.5)*i.clientWidth,(1-(s/c*.5+.5))*i.clientHeight,c]}function Ko(){if(!N.active||x()||Z<.9||N.px<i.clientWidth*.42)return-1;let t=-1,o=1e9;for(let n=0;n<me.length;n++){let r=X[n],a=lt([r.p[0],r.base-.09+r.h*.5,r.p[2]]);if(!a)continue;let s=ge[5]*i.clientHeight*.5*(n===jt?1.45:1.15)/a[2],c=Math.hypot(N.px-a[0],(N.py-a[1])*1.4);c<s&&c<o&&(o=c,t=n)}return t}function Ve(t){let o=E.matches;ye+=t*(o?.2:1);let n=!He&&!f.classList.contains("js-loading");n&&Z<1&&(Z=Math.min(1,Z+t/Yt)),n&&Te<1&&(Te=Math.min(1,Te+t/1.6)),Vt%30===0&&rt(),Vt++;let r=gt();le+=(r-le)*(1-Math.exp(-t*(o?12:2.4))),Math.abs(r-le)<5e-4&&(le=r);let a=It(le);ue&&!He?(ue.t=Math.min(1,ue.t+t/1.5),a=it(ue.from,a,de(ue.t)),ue.t>=1&&(ue=null)):ue&&(a=it(ue.from,a,0)),Le=a;let s=x(),c=He?-1:Ko();jt=c;let u=de(T(a.ground,0,1));for(let h=0;h<me.length;h++){let R=me[h],b=X[h];b.hov+=((c===h?1:0)-b.hov)*(1-Math.exp(-t*9)),b.foc+=((he===h?1:0)-b.foc)*(1-Math.exp(-t*3));let B=Fe(T(Z*1.55-h*.09,0,1)),C=b.hov*.32+b.foc*.22*(1-u*.6);b.p[0]=p(R.a[0],R.b[0],u),b.base=p(R.a[1],R.b[1],u),b.p[1]=b.base+C+(1-B)*kt,b.p[2]=p(R.a[2],R.b[2],u),b.ry=p(R.ay,0,u)+(1-B)*.5*(h%2?1:-1),b.pulse=Math.max(0,b.pulse-t*1.3);let re=p(.085+b.hov*.14+(1-B)*.12,.05+b.hov*.06,u);b.gap+=(re-b.gap)*(1-Math.exp(-t*6)),b.h=(Ie-1)*b.gap+Ee[1],b.top=b.p[1]-.09+b.h;for(let q=0;q<Ie;q++){let j=Ue[h*Ie+q],H=(1-u)*a.leak;j.x=b.p[0]+H*.07*Math.sin(q*2.1+h*1.3),j.z=b.p[2]+H*.055*Math.cos(q*1.7+h*.9),j.y=b.p[1]-.09+Ee[1]*.5+q*b.gap,j.ry=b.ry+H*.05*Math.sin(q*1.3+h)}}Ho(u),Vo();let A=a.flow*(o?.25:1),M=a.leak,d=P.particles.data,O=w(.45,.95,Z);for(let h=0;h<G;h++){let R=vt[h],b=h*8;if(Se[h]!==2){let q=tt[h],j=q+Ct[h]*t*A;if(j>=1?(j-=1,Se[h]=Math.random()<M*W[R][2]?1:0,ot[h]=.38+Math.random()*.24):Se[h]===1&&M<.02&&(Se[h]=0),tt[h]=j,Se[h]===1&&q<ot[h]&&j>=ot[h]){Oe(R,j,z),Oe(R,Math.min(1,j+.02),xt);let H=xt[0]-z[0],Ae=xt[2]-z[2],to=Math.hypot(H,Ae)||1;H/=to,Ae/=to;let oo=(Math.random()-.5)*1.8;ce[h*3]=H*.45-Ae*oo,ce[h*3+1]=.1+Math.random()*.5,ce[h*3+2]=Ae*.45+H*oo,ne[h*3]=z[0],ne[h*3+1]=z[1],ne[h*3+2]=z[2],nt[h]=0,pt[h]=2.8+Math.random()*1.2,Se[h]=2}else{Oe(R,j,z);let H=w(0,.07,j)*(1-w(.93,1,j)),Ae=he>=0&&(W[R][0]===he||W[R][1]===he)?X[he].foc:0;d[b]=z[0],d[b+1]=z[1],d[b+2]=z[2],d[b+3]=p(g.cream[0],1,Ae*.3),d[b+4]=p(g.cream[1],.8,Ae*.3),d[b+5]=p(g.cream[2],.65,Ae*.3),d[b+6]=H*(.62+.38*a.carry+Ae*.3)*O,d[b+7]=.05+.014*a.carry;continue}}let B=t*(o?.3:1);nt[h]+=B;let C=h*3;if(ne[C+1]>$+.02){ce[C+1]-=1.15*B;let q=Math.pow(.55,B);ce[C]*=q,ce[C+2]*=q,ne[C]+=ce[C]*B,ne[C+1]+=ce[C+1]*B,ne[C+2]+=ce[C+2]*B,ne[C+1]<=$+.02&&(ne[C+1]=$+.02,ce[C]*=.15,ce[C+2]*=.15)}if(nt[h]>=pt[h]){Se[h]=0,tt[h]=0,d[b+6]=0;continue}let re=1-nt[h]/pt[h];d[b]=ne[C],d[b+1]=ne[C+1],d[b+2]=ne[C+2],d[b+3]=g.ember[0]*1.15,d[b+4]=g.ember[1]*1.1,d[b+5]=g.ember[2],d[b+6]=Math.pow(re,1.2)*.95*O,d[b+7]=.072}zt+=t*.1*A;let L=P.markers.data;for(let h=0;h<se;h++){let R=(zt+h*.37)%1;Ut[h]<.93&&R>=.93&&a.carry>.05&&(X[W[h][1]].pulse=1),Ut[h]=R,Oe(h,R,z);let b=w(0,.08,R)*(1-w(.92,1,R)),B=(G+h)*8;d[B]=z[0],d[B+1]=z[1],d[B+2]=z[2],d[B+3]=1.18,d[B+4]=1.12,d[B+5]=1.06,d[B+6]=a.carry*b*O,d[B+7]=.14;let C=h*8;L[C]=z[0],L[C+1]=z[1],L[C+2]=z[2],L[C+3]=g.cream[0],L[C+4]=g.cream[1],L[C+5]=g.cream[2],L[C+6]=a.carry*b*.55*O,L[C+7]=.46}let m=P.pins.data;for(let h=0;h<te.length;h++){let R=Oe(te[h],.5,At[h]),b=(G+se+h)*8;d[b]=R[0],d[b+1]=R[1],d[b+2]=R[2],d[b+3]=g.ember[0]*1.5,d[b+4]=g.ember[1]*1.4,d[b+5]=g.ember[2]*1.2,d[b+6]=a.find*O,d[b+7]=.12;let B=o?.5:(ye*.5+h*.25)%1;[[R[0],R[1],R[2],a.find,.62+(o?0:.05*Math.sin(ye*2.4+h))],[R[0],R[1],R[2],a.find*(1-B)*.8,.6+B*1.6],[R[0],$+.01,R[2],a.find*.6,.55]].forEach((q,j)=>{let H=(se+h*3+j)*8;L[H]=q[0],L[H+1]=q[1],L[H+2]=q[2],L[H+3]=g.ember[0],L[H+4]=g.ember[1],L[H+5]=g.ember[2],L[H+6]=q[3]*O,L[H+7]=q[4]});let re=h*8;m[re]=R[0],m[re+1]=R[1]-.12,m[re+2]=R[2],m[re+3]=.5,m[re+4]=R[0],m[re+5]=$+.01,m[re+6]=R[2],m[re+7]=.5}let _=o?0:-7.5+ye/3.8%1*15,D=te.length*8;m[D]=_,m[D+1]=$+.01,m[D+2]=-5,m[D+3]=.5,m[D+4]=_,m[D+5]=$+.01,m[D+6]=5,m[D+7]=.5,a.scanX=_,a.sweep=o?0:-5.2+ye/5.5%1*10.4,wt+=(M*.55+a.find*.35-wt)*(1-Math.exp(-t*2)),N.sx+=(N.x-N.sx)*(1-Math.exp(-t*2)),N.sy+=(N.y-N.sy)*(1-Math.exp(-t*2));let U=a.tgt.slice(),ae=a.eye[0]-U[0],ke=a.eye[1]-U[1],Ce=a.eye[2]-U[2],$e=1+(1-Fe(Z))*.28+(1-Fe(Te))*.045,Xe=window.innerWidth/Math.max(1,window.innerHeight),ft=(s?Math.min(3.1,Math.max(1.6,1.35/Xe)):1)*$e;bt=ft,ae*=ft,ke*=ft,Ce*=ft;let Jt=o?0:Math.sin(ye*.07)*.07+N.sx*.05+(1-Fe(Z))*.35+(1-Fe(Te))*.05,Zt=Math.cos(Jt),eo=Math.sin(Jt);_e=[U[0]+ae*Zt+Ce*eo,U[1]+ke-N.sy*.5,U[2]-ae*eo+Ce*Zt];let De=T(Math.round(le),0,Tt.length-1);De!==yt&&Bt&&(yt=De,zo.textContent="Fig. "+String(De+1).padStart(2,"0"),Bt.textContent=at&&at.stage===De?at.text:Tt[De],document.dispatchEvent(new CustomEvent("ws:stage",{detail:De}))),a.hovIdx=c,a.ci=De}function be(t){e.useProgram(t.p),t.u.uProj&&e.uniformMatrix4fv(t.u.uProj,!1,ge),t.u.uView&&e.uniformMatrix4fv(t.u.uView,!1,Q),t.u.uFog&&e.uniform3fv(t.u.uFog,g.bg),t.u.uFogRange&&e.uniform2f(t.u.uFogRange,17*bt,54*bt),t.u.uEmber&&e.uniform3fv(t.u.uEmber,g.ember)}function ze(t,o,n,r,a,s){let c=v.line.u;e.uniform3fv(c.uColor,t),e.uniform1f(c.uAlpha,o),e.uniform1f(c.uDash,n||0),e.uniform1f(c.uEnds,r||0),e.uniform1f(c.uDraw,a===void 0?2:a),e.uniform1f(c.uSweepAmt,s||0)}function Wt(t,o){let n=Le;e.viewport(0,0,t,o),uo(ge,34*Math.PI/180,t/o,.1,140),ge[8]-=x()?0:n.dx,fo(Q,_e,n.tgt,[0,1,0]);let r=o*.5*ge[5],a=w(0,.5,Z);e.clearColor(g.bg[0],g.bg[1],g.bg[2],1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.enable(e.BLEND);let s=de(T(n.ground,0,1));be(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanX,n.scanX||0),e.uniform1f(v.point.u.uScanAmt,n.find*.9),e.uniform1f(v.point.u.uFade,a),e.uniform1f(v.point.u.uGain,1),e.uniform1i(v.point.u.uMode,0),e.depthMask(!1),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(P.dots.v),e.drawArrays(e.POINTS,0,P.dots.count),be(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.uniform1i(v.decal.u.uMode,1),e.uniform3fv(v.decal.u.uColor,g.black),e.bindVertexArray(P.floor.v);for(let m=0;m<me.length;m++){let _=X[m],D=_.p[1]-$;ie(k,_.p[0],$+.005,_.p[2],_.ry,3.4+D*.4,1,2.4+D*.3),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,.78*(1-s)/(1+D*.35)*a),e.drawArrays(e.TRIANGLES,0,6)}s>.01&&(ie(k,0,$+.005,0,0,12.5,1,7.5),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,.8*s),e.drawArrays(e.TRIANGLES,0,6)),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.cream),ie(k,0,$+.002,.2,0,17,1,12),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,.035*a),e.drawArrays(e.TRIANGLES,0,6),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.ember);for(let m=0;m<te.length;m++){let _=At[m];ie(k,_[0],$+.01,_[2],0,3.2,1,3.2),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,(n.leak*W[te[m]][2]*.16+n.find*.12)*a),e.drawArrays(e.TRIANGLES,0,6)}e.depthMask(!0),be(v.mesh),e.uniform3fv(v.mesh.u.uCam,_e),e.uniform1f(v.mesh.u.uBounce,0),e.uniform1f(v.mesh.u.uHi,0),e.uniform1f(v.mesh.u.uSheets,0);let c=w(0,.5,s),u=p(-3.4,-.37,1-Math.pow(1-s,3)),A=[8.44,.5,4.14];c>.005&&(e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),ie(k,0,u,0,0,A[0],A[1],A[2]),e.uniformMatrix4fv(v.mesh.u.uModel,!1,k),e.uniform3fv(v.mesh.u.uColor,g.plinth),e.uniform1f(v.mesh.u.uAlpha,c),e.uniform1f(v.mesh.u.uUseTex,0),e.bindVertexArray(P.box.v),e.drawArrays(e.TRIANGLES,0,36));for(let m of Ue){let _=X[m.i];m.d=(_.p[0]-_e[0])**2+(_.p[1]-_e[1])**2+(_.p[2]-_e[2])**2}Ue.sort((m,_)=>_.d-m.d||m.k-_.k),be(v.glass),e.uniform3fv(v.glass.u.uCam,_e),e.uniform3fv(v.glass.u.uCream,g.cream),e.uniform1f(v.glass.u.uAlpha,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindVertexArray(P.box.v);let M=T(n.leak*.7+n.find,0,1)*(1-s);for(let m of Ue){let _=X[m.i],D=m.k===Ie-1;ie(k,m.x,m.y,m.z,m.ry,Ee[0],Ee[1],Ee[2]),e.uniformMatrix4fv(v.glass.u.uModel,!1,k),e.uniform1f(v.glass.u.uSeed,m.i+1+m.k*.37),e.uniform1f(v.glass.u.uLevel,D?1:.3+.45*_.hov),e.uniform1f(v.glass.u.uHi,Math.max(_.hov,_.foc*.8)),e.uniform1f(v.glass.u.uGlow,T(_.pulse*n.carry+_.foc*.45+_.hov*.55+n.find*.15,0,1.4)),e.uniform1f(v.glass.u.uBad,M),e.uniform1f(v.glass.u.uBounce,m.k===0?wt*(1-s):0),e.drawArrays(e.TRIANGLES,0,36)}e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.CULL_FACE),be(v.line),e.uniform1f(v.line.u.uTime,ye),e.uniform1f(v.line.u.uSweep,n.sweep||0),e.depthMask(!1),e.blendFunc(e.SRC_ALPHA,e.ONE),e.bindVertexArray(P.edges.v);for(let m of Ue){let _=X[m.i],D=Math.max(_.hov,_.foc*.85),U=m.k===Ie-1?1:.4;ie(k,m.x,m.y,m.z,m.ry,Ee[0],Ee[1],Ee[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,k),ze(D>.02?[p(g.cream[0],g.ember[0],D),p(g.cream[1],g.ember[1],D),p(g.cream[2],g.ember[2],D)]:g.cream,U*(.75+.35*_.pulse*n.carry)+D*.35),e.drawArrays(e.LINES,0,24)}e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),c>.005&&(ie(k,0,u,0,0,A[0],A[1],A[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,k),ze(g.ivory,.26*c),e.drawArrays(e.LINES,0,24),e.bindVertexArray(P.plinthGrid.v),ze(g.ivory,.09*c,0,0,2,.9*c),e.drawArrays(e.LINES,0,P.plinthGrid.data.length/4)),ie(k,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,k),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),be(v.ribbon);let d=v.ribbon.u,O=t/Math.max(1,i.clientWidth),L=(.75+.35*n.carry)*O;e.uniform2f(d.uHalf,t*.5,o*.5),e.uniform1f(d.uWidth,L),e.uniform1f(d.uFeather,T(1.3/Math.max(L,.5),.2,1)),e.uniform1f(d.uTime,ye),e.uniform1f(d.uDash,n.carry),e.uniform1f(d.uEnds,1),e.uniform1f(d.uDraw,w(.2,.9,Z)*1.02),e.bindVertexArray(P.ribbons.v),e.bindBuffer(e.ARRAY_BUFFER,P.ribbons.b),e.bufferSubData(e.ARRAY_BUFFER,0,P.ribbons.data);for(let m=0;m<se;m++){let _=he>=0&&(W[m][0]===he||W[m][1]===he)?X[he].foc:0,D=n.hovIdx>=0&&(W[m][0]===n.hovIdx||W[m][1]===n.hovIdx)?X[n.hovIdx].hov:0,U=Math.max(_,D),ae=U>.01?[p(g.curve[0],g.ember[0],U*.7),p(g.curve[1],g.ember[1],U*.7),p(g.curve[2],g.ember[2],U*.7)]:g.curve;e.uniform3fv(d.uColor,ae),e.uniform1f(d.uAlpha,.3+.22*n.carry+.06*n.find+U*.35),e.drawArrays(e.TRIANGLE_STRIP,m*Y*2,Y*2)}be(v.line),ie(k,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,k),n.find>.01&&(e.bindVertexArray(P.pins.v),e.bindBuffer(e.ARRAY_BUFFER,P.pins.b),e.bufferSubData(e.ARRAY_BUFFER,0,P.pins.data),ze(g.ember,.5*n.find),e.drawArrays(e.LINES,0,te.length*2),ze(g.ember,.85*n.find),e.drawArrays(e.LINES,te.length*2,2),be(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform1i(v.decal.u.uMode,0),e.uniform3fv(v.decal.u.uColor,g.ember),e.uniform1f(v.decal.u.uAlpha,.14*n.find),ie(k,n.scanX||0,$,0,0,1,3.8,10),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.bindVertexArray(P.sheet.v),e.drawArrays(e.TRIANGLES,0,6)),be(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanAmt,0),e.uniform1f(v.point.u.uFade,1),e.uniform1f(v.point.u.uGain,l.on?1.35:1),e.blendFunc(e.ONE,e.ONE),e.uniform1i(v.point.u.uMode,1),e.bindVertexArray(P.particles.v),e.bindBuffer(e.ARRAY_BUFFER,P.particles.b),e.bufferSubData(e.ARRAY_BUFFER,0,P.particles.data),e.drawArrays(e.POINTS,0,G+_t),(n.find>.01||n.carry>.01)&&(e.uniform1i(v.point.u.uMode,2),e.bindVertexArray(P.markers.v),e.bindBuffer(e.ARRAY_BUFFER,P.markers.b),e.bufferSubData(e.ARRAY_BUFFER,0,P.markers.data),e.drawArrays(e.POINTS,0,Pt)),e.depthMask(!0),e.bindVertexArray(null)}function Pe(t,o,n){e.bindFramebuffer(e.FRAMEBUFFER,o?o.fbo:null),e.viewport(0,0,o?o.w:i.width,o?o.h:i.height),e.useProgram(t.p),n(t.u),e.bindVertexArray(l.tri.v),e.drawArrays(e.TRIANGLES,0,3)}function xe(t,o,n){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(n,t)}function Ye(){Xo();let t=i.width,o=i.height;if(!l.on){e.bindFramebuffer(e.FRAMEBUFFER,null),Wt(t,o),Et(Le);return}e.bindFramebuffer(e.FRAMEBUFFER,l.ms?l.ms.fbo:l.scene.fbo),Wt(t,o),l.ms&&(e.bindFramebuffer(e.READ_FRAMEBUFFER,l.ms.fbo),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.scene.fbo),e.blitFramebuffer(0,0,t,o,0,0,t,o,e.COLOR_BUFFER_BIT,e.NEAREST)),e.disable(e.DEPTH_TEST),e.disable(e.BLEND);let n=l.hdr?.58:.46;Pe(l.bright,l.h1,a=>{xe(0,l.scene.tex,a.uTex),e.uniform2f(a.uTexel,1/t,1/o),e.uniform1f(a.uThresh,n)}),Pe(l.blur,l.h2,a=>{xe(0,l.h1.tex,a.uTex),e.uniform2f(a.uDir,1/l.h1.w,0)}),Pe(l.blur,l.h1,a=>{xe(0,l.h2.tex,a.uTex),e.uniform2f(a.uDir,0,1/l.h1.h)}),Pe(l.bright,l.q1,a=>{xe(0,l.h1.tex,a.uTex),e.uniform2f(a.uTexel,1/l.h1.w,1/l.h1.h),e.uniform1f(a.uThresh,0)});for(let a=0;a<2;a++)Pe(l.blur,l.q2,s=>{xe(0,l.q1.tex,s.uTex),e.uniform2f(s.uDir,1.5/l.q1.w,0)}),Pe(l.blur,l.q1,s=>{xe(0,l.q2.tex,s.uTex),e.uniform2f(s.uDir,0,1.5/l.q1.h)});let r=Le;Pe(l.comp,null,a=>{xe(0,l.scene.tex,a.uScene),xe(1,l.h1.tex,a.uB1),xe(2,l.q1.tex,a.uB2),e.uniform1f(a.uBloom,1.85+r.find*.45+r.carry*.12),e.uniform2f(a.uRes,t,o),e.uniform2f(a.uCenter,x()?.5:.5+r.dx*.5,.48),e.uniform1f(a.uTime,ye)}),e.bindVertexArray(null),Et(r)}let $t=st.map(()=>({o:-1}));function Et(t){let o=i.clientWidth,n=i.clientHeight;if(st.length){let u=t.find>.02&&Z>.8,A=x();for(let M=0;M<st.length&&M<te.length;M++){let d=st[M],O=0;if(u){let L=lt(At[M]);if(L){let m=A?w(12,36,L[0])*(1-w(o-36,o-12,L[0]))*w(72,120,L[1]):w(o*.44,o*.52,L[0])*(1-w(o-40,o,L[0]+180))*w(90,160,L[1]);O=w(.55,.95,t.find)*m,d.style.transform=`translate3d(${L[0].toFixed(1)}px, ${L[1].toFixed(1)}px, 0)`}}Math.abs(O-$t[M].o)>.01&&(d.style.opacity=O.toFixed(3),$t[M].o=O)}}let r=je&&Z>.9?1-w(.15,.6,t.find):0,a=x();for(let u=0;u<ct.length;u++){let A=0;if(r>0){let M=X[u],d=lt([M.p[0],M.top+.05,M.p[2]]);if(d){let O=a?w(8,24,d[0])*(1-w(o-24,o-8,d[0])):w(o*.46,o*.54,d[0])*(1-w(o-30,o,d[0]+60));A=r*(1-M.hov)*O*w(96,150,d[1])*(1-w(n-90,n-40,d[1])),A>.01&&(ct[u].style.transform=`translate3d(${d[0].toFixed(1)}px, ${d[1].toFixed(1)}px, 0)`)}}Math.abs(A-Ht[u])>.01&&(ct[u].style.opacity=A.toFixed(3),Ht[u]=A)}let s=t.hovIdx===void 0?-1:t.hovIdx,c=0;if(s>=0&&je){let u=X[s],A=lt([u.p[0],u.top+.12,u.p[2]]);A&&(c=u.hov,(Ot!==s||K.dataset.ci!==String(t.ci))&&(Ot=s,K.dataset.ci=String(t.ci),Yo.textContent=`${me[s].id} \xB7 ${String(s+1).padStart(2,"0")} / 06`,jo.textContent=me[s].name,Go.textContent=me[s].note,Wo.textContent=Lt[t.ci]||Lt[0]),K.style.transform=`translate3d(${A[0].toFixed(1)}px, ${A[1].toFixed(1)}px, 0)`)}Math.abs(c-qt)>.01&&(K.style.opacity=c.toFixed(3),qt=c),f.classList.toggle("is-inspecting",c>.4)}let St=0,je=!1,Xt=/[?&]wsdebug\b/.test(location.search);Xt&&(window.__wsScene={step(t,o=1){for(let n=0;n<o;n++)Ve(t);return Ye(),{stage:le,intro:Z}},hover(t,o){N.px=t,N.py=o,N.x=t/window.innerWidth*2-1,N.y=o/window.innerHeight*2-1,N.active=t>=0}});function Kt(t){if(Xt)return;St=requestAnimationFrame(Kt);let o=t/1e3,n=qe?o-qe:0,r=qe?Math.min(.05,n):1/60;qe=o,$o(n),Ve(r),Ye()}function Ge(t){t!==je&&(je=t,t?(qe=0,St=requestAnimationFrame(Kt)):(cancelAnimationFrame(St),Et(Object.assign({},Le,{hovIdx:-1,find:0}))))}let We=Array.from(document.querySelectorAll("[data-canvas]")),ut=new Map,Ft=new IntersectionObserver(t=>{t.forEach(o=>ut.set(o.target,o.isIntersecting)),Ge(!document.hidden&&Array.from(ut.values()).some(Boolean))},{rootMargin:"80px 0px"});We.forEach(t=>Ft.observe(t)),document.addEventListener("visibilitychange",()=>{Ge(!document.hidden&&Array.from(ut.values()).some(Boolean))}),document.addEventListener("ws:route",()=>{Ft.disconnect(),ut.clear(),We=Array.from(document.querySelectorAll("[data-canvas]")),We.forEach(o=>Ft.observe(o));let t=Nt(Le);rt(),le=gt(),yt=-1,E.matches||(ue={from:t,t:0},Te=Math.min(Te,.4)),Ve(0),Ye(),We.length||Ge(!1)}),window.addEventListener("resize",()=>{rt(),je||(Ve(0),Ye())},{passive:!0}),i.addEventListener("webglcontextlost",t=>{t.preventDefault(),Ge(!1),f.classList.add("no-webgl")}),rt(),le=gt(),Yt=le<.5?2.6:2,kt=le<.5?5.5:1.4;let Qt="ws-cam";if(!S&&!E.matches)try{let t=JSON.parse(sessionStorage.getItem(Qt)||"null");t&&Date.now()-t.at<8e3&&t.st&&t.st.eye&&(ue={from:t.st,t:0})}catch{}window.addEventListener("pagehide",()=>{try{sessionStorage.setItem(Qt,JSON.stringify({at:Date.now(),st:Nt(Le)}))}catch{}}),He=!0;for(let t=0;t<90;t++)Ve(1/30);He=!1,Ye(),f.classList.add("scene-ready"),We.length||Ge(!0)}var ee=document.documentElement,io=ee.dataset.bundle==="1",Ne=window.matchMedia("(prefers-reduced-motion: reduce)").matches;ee.classList.add("js-ready");location.protocol==="file:"&&!io&&document.querySelectorAll("a[href]").forEach(i=>{let f=i.getAttribute("href");if(/^(https?:|mailto:|tel:|#)/.test(f))return;let[S,x]=f.split("#");S&&S.endsWith("/")&&i.setAttribute("href",`${S}index.html${x?`#${x}`:""}`)});var V=document.getElementById("nav"),Je=document.getElementById("menu-btn"),fe=V&&V.querySelector(".drop-btn"),Ze=document.getElementById("mega"),so=[],Mt=!1;function dt(){if(Mt=!1,!V)return;let i=36,f=window.innerHeight-44,S="dark",x=!1;for(let e of so){let E=e.getBoundingClientRect();E.top<=i&&E.bottom>i&&(S=e.dataset.tone),E.top<=f&&E.bottom>f&&(x=e.hasAttribute("data-canvas")&&!e.hasAttribute("data-no-hud"))}let y=V.classList.contains("is-open")||V.classList.contains("is-drop");V.classList.toggle("is-paper",S==="paper"&&!y),V.classList.toggle("is-scrolled",window.scrollY>24),ee.classList.toggle("hud-on",x)}var co=()=>{Mt||(Mt=!0,requestAnimationFrame(dt))};window.addEventListener("scroll",co,{passive:!0});window.addEventListener("resize",co,{passive:!0});var Qe=window.matchMedia("(min-width: 1061px)"),ao=window.matchMedia("(hover: hover)"),ro=0;function we(i){!fe||!Ze||(fe.setAttribute("aria-expanded",String(i)),Ze.hidden=!i,V.classList.toggle("is-drop",i&&Qe.matches),dt())}if(fe&&Ze){let i=fe.parentElement;fe.addEventListener("click",()=>we(fe.getAttribute("aria-expanded")!=="true")),i.addEventListener("mouseenter",()=>{ao.matches&&Qe.matches&&(clearTimeout(ro),we(!0))}),i.addEventListener("mouseleave",()=>{ao.matches&&Qe.matches&&(ro=setTimeout(()=>we(!1),160))}),i.addEventListener("focusout",f=>{Qe.matches&&!i.contains(f.relatedTarget)&&we(!1)}),document.addEventListener("click",f=>{Qe.matches&&!i.contains(f.target)&&we(!1)})}function mt(i){!V||!Je||(V.classList.toggle("is-open",i),Je.setAttribute("aria-expanded",String(i)),i||we(!1),dt())}Je&&Je.addEventListener("click",()=>mt(!V.classList.contains("is-open")));V&&V.addEventListener("click",i=>{i.target.closest(".nav-links a")&&(mt(!1),we(!1))});document.addEventListener("keydown",i=>{i.key==="Escape"&&(fe&&fe.getAttribute("aria-expanded")==="true"?(we(!1),fe.focus()):V&&V.classList.contains("is-open")&&(mt(!1),Je.focus()))});function Qo(i){let f=Array.from(i.querySelectorAll(".svc"));f.forEach(y=>{let e=y.querySelector(".svc-row"),E=y.querySelector(".svc-body");e.addEventListener("click",()=>{let F=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!F)),E.hidden=F,y.classList.toggle("is-open",!F)})});let S=Array.from(i.querySelectorAll(".filters [data-filter]")),x=y=>{S.forEach(E=>E.setAttribute("aria-pressed",String(E.dataset.filter===y)));let e=null;f.forEach(E=>{let F=y==="all"||E.dataset.v===y;E.hidden=!F,F&&!e&&(e=E)}),y!=="all"&&e&&!e.classList.contains("is-open")&&e.querySelector(".svc-row").click()};S.forEach(y=>y.addEventListener("click",()=>x(y.dataset.filter)))}function Jo(i){let f=i.querySelector("[data-brief]");if(!f)return;let S=f.querySelector("[data-status]"),x=f.dataset.to,y=(e,E)=>{S.textContent=e,S.classList.toggle("is-error",E==="error"),S.classList.toggle("is-ok",E==="ok")};f.addEventListener("submit",async e=>{e.preventDefault();let E=new FormData(f),F=String(E.get("name")||"").trim(),g=String(E.get("email")||"").trim(),p=String(E.get("company")||"").trim(),T=String(E.get("message")||"").trim(),w=[];if(F||w.push("your name"),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g)||w.push("a work email we can reply to"),w.length){y(`Add ${w.join(" and ")}, then send again.`,"error"),(F?f.elements.email:f.elements.name).focus();return}if(f.elements.consent&&!f.elements.consent.checked){y("Tick the consent box so we can reply, then send again.","error"),f.elements.consent.focus();return}if(f.dataset.endpoint){try{y("Sending\u2026");let Me=await fetch(f.dataset.endpoint,{method:"POST",body:E,headers:{Accept:"application/json"}});if(!Me.ok)throw new Error(String(Me.status));f.reset(),y("Received. We reply within two working days.","ok")}catch{y(`That did not go through. Write to ${x} and we will pick it up.`,"error")}return}let de=[`Name: ${F}`,`Company: ${p||"\u2014"}`,`Email: ${g}`];T&&de.push("","Your thoughts:",T);let Fe=`Scoping conversation${p?` \u2014 ${p}`:""}`;y(`Your email app should open with the request filled in. If it doesn\u2019t, write to ${x}.`,"ok"),window.location.href=`mailto:${x}?subject=${encodeURIComponent(Fe)}&body=${encodeURIComponent(de.join(`
`))}`})}function Zo(i){let f=i.querySelector("[data-ledger]");if(!f)return;if(Ne||!("IntersectionObserver"in window)){f.classList.add("is-run");return}let S=new IntersectionObserver(([x])=>{x.isIntersecting&&(f.classList.add("is-run"),S.disconnect())},{threshold:.3});S.observe(f)}function en(i){let f=Array.from(i.querySelectorAll(".h2, .v-title, .h-limits, .display-2, .tl-body h2")).filter(y=>!y.dataset.split&&y.children.length===0);if(Ne||!("IntersectionObserver"in window))return;let S=window.innerHeight,x=new IntersectionObserver(y=>{y.forEach(e=>{e.isIntersecting&&(e.target.classList.add("is-in"),x.unobserve(e.target))})},{rootMargin:"0px 0px -12% 0px"});f.forEach(y=>{let e=y.textContent.trim().split(/\s+/);if(y.dataset.split="1",y.setAttribute("aria-label",y.textContent.trim()),y.innerHTML=e.map((E,F)=>`<span class="rw" aria-hidden="true"><span style="--i:${F}">${E.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span></span>`).join(" "),y.classList.add("rise"),y.getBoundingClientRect().top<S*.9){let E=()=>ee.classList.contains("js-loading")?setTimeout(E,120):requestAnimationFrame(()=>y.classList.add("is-in"));E()}else x.observe(y)})}function tn(i){let f=i.querySelector(".lg-toc");if(!f||!("IntersectionObserver"in window))return;let S=new Map(Array.from(f.querySelectorAll('a[href^="#"]')).map(e=>[e.getAttribute("href").slice(1),e])),x=new Set,y=new IntersectionObserver(e=>{e.forEach(F=>F.isIntersecting?x.add(F.target.id):x.delete(F.target.id));let E=Array.from(S.keys()).find(F=>x.has(F));E&&S.forEach((F,g)=>g===E?F.setAttribute("aria-current","true"):F.removeAttribute("aria-current"))},{rootMargin:"-20% 0px -55% 0px"});i.querySelectorAll(".lg-sec").forEach(e=>y.observe(e))}function on(i){let f=Array.from(i.querySelectorAll("[data-count]"));if(!f.length||Ne||!("IntersectionObserver"in window))return;let S=new IntersectionObserver(x=>{x.forEach(y=>{if(!y.isIntersecting)return;S.unobserve(y.target);let e=y.target,E=+e.dataset.count,F=performance.now(),g=p=>{let T=Math.min(1,(p-F)/1300);e.textContent=String(Math.round(E*(1-Math.pow(1-T,4)))),T<1&&requestAnimationFrame(g)};e.textContent="0",requestAnimationFrame(g)})},{threshold:.4});f.forEach(x=>S.observe(x))}function lo(i=document){so=Array.from(document.querySelectorAll("[data-tone]")),Qo(i),Jo(i),Zo(i),en(i),on(i),tn(i),document.querySelectorAll("[data-year]").forEach(f=>{f.textContent=String(new Date().getFullYear())}),dt()}lo();document.addEventListener("keydown",i=>{if(i.key!=="ArrowLeft"&&i.key!=="ArrowRight"||i.defaultPrevented||i.altKey||i.ctrlKey||i.metaKey||i.shiftKey||i.target.closest&&i.target.closest("input, textarea, select, button, [contenteditable], .spec-scroll, .nav-links")||V&&V.classList.contains("is-open")||Ze&&!Ze.hidden)return;let f=document.querySelector(i.key==="ArrowRight"?'.pager a[rel="next"], .pager a[rel="first"]':'.pager a[rel="prev"]');f&&(i.preventDefault(),f.click())});(function(){if(!ee.classList.contains("js-loading"))return;let f=document.querySelector(".curtain");if(!f){ee.classList.remove("js-loading");return}let S=f.querySelector(".c-count"),x=f.querySelector(".c-bar i"),y=performance.now(),e=1250,E=F=>{let g=ee.classList.contains("scene-ready")||ee.classList.contains("no-webgl"),p=Math.min(1,(F-y)/e),T=g?p:Math.min(p,.86),w=Math.round(100*(1-Math.pow(1-T,2.2)));if(S.textContent=String(w).padStart(2,"0"),x.style.transform=`scaleX(${w/100})`,T<1){requestAnimationFrame(E);return}ee.classList.add("curtain-lift"),setTimeout(()=>ee.classList.remove("js-loading"),380),setTimeout(()=>ee.classList.remove("curtain-lift"),1100);try{sessionStorage.setItem("ws-seen","1")}catch{}};requestAnimationFrame(E)})();document.addEventListener("ws:stage",i=>{document.querySelectorAll(".scrub [data-stage-link]").forEach(f=>{+f.dataset.stageLink===i.detail?f.setAttribute("aria-current","step"):f.removeAttribute("aria-current")})});window.matchMedia("(hover: hover) and (pointer: fine)").matches&&!Ne&&(document.addEventListener("pointermove",i=>{let f=i.target.closest&&i.target.closest(".spot");if(f){let x=f.getBoundingClientRect();f.style.setProperty("--mx",`${i.clientX-x.left}px`),f.style.setProperty("--my",`${i.clientY-x.top}px`)}let S=i.target.closest&&i.target.closest('.btn-ember:not([type="submit"])');if(S){let x=S.getBoundingClientRect(),y=(i.clientX-(x.left+x.width/2))/x.width,e=(i.clientY-(x.top+x.height/2))/x.height;S.style.transform=`translate(${(y*8).toFixed(1)}px, ${(e*6).toFixed(1)}px)`}},{passive:!0}),document.addEventListener("pointerout",i=>{let f=i.target.closest&&i.target.closest(".btn-ember");f&&!f.contains(i.relatedTarget)&&(f.style.transform="")}));(function(){let f=()=>document.querySelectorAll("[data-clock]"),S;try{S=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return}let x=()=>f().forEach(y=>{y.textContent=`Hyderabad \xB7 ${S.format(new Date)} IST`});x(),setInterval(x,2e4)})();no();if(io){let i=document.getElementById("page"),f=new Map(Array.from(document.querySelectorAll("template[data-route]")).map(p=>[p.dataset.route,p])),S=p=>p&&p.startsWith("#/")?p.slice(1).split("#")[0]:"/",x=p=>requestAnimationFrame(()=>{let T=p&&document.getElementById(p);T&&T.scrollIntoView({block:"start"})}),y="/",e=p=>{V.querySelectorAll(".nav-links > a[data-key]").forEach(T=>{let w=S(T.getAttribute("href"));w!=="/"&&p.startsWith(w)?T.setAttribute("aria-current","page"):T.removeAttribute("aria-current")}),fe&&fe.toggleAttribute("data-current",/^\/(services|verticals)\//.test(p))},E=(p,{scroll:T=!0}={})=>{let w=f.get(p)||f.get("/404/");y=f.has(p)?p:"/404/",i.replaceChildren(w.content.cloneNode(!0)),document.title=w.dataset.title,e(y),T&&(ee.style.scrollBehavior="auto",window.scrollTo(0,0),ee.style.scrollBehavior=""),lo(i),document.dispatchEvent(new Event("ws:route"))},F=(p,T)=>{if(p===y){window.scrollTo({top:0,behavior:Ne?"auto":"smooth"});return}if(mt(!1),we(!1),y=f.has(p)?p:"/404/",T)try{history.pushState({route:p},"",`#${p}`)}catch{}E(p),!Ne&&i.animate&&i.animate([{opacity:0},{opacity:1}],{duration:380,easing:"cubic-bezier(0.2, 0.7, 0.1, 1)"})};document.addEventListener("click",p=>{let T=p.target.closest('a[href^="#"]');if(!T||p.defaultPrevented||p.metaKey||p.ctrlKey||p.shiftKey)return;let w=T.getAttribute("href");if(p.preventDefault(),w.startsWith("#/")){F(S(w),!0),x(w.slice(2).split("#")[1]);return}let de=w.length>1&&document.getElementById(w.slice(1));de&&de.scrollIntoView({behavior:Ne?"auto":"smooth",block:"start"})}),window.addEventListener("popstate",()=>F(S(location.hash),!1)),window.addEventListener("hashchange",()=>{let p=S(location.hash);p!==y&&F(p,!1)});let g=S(location.hash);g!=="/"?E(g,{scroll:!1}):e("/")}})();
