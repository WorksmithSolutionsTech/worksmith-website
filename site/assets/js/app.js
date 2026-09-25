(()=>{function eo(){let i=document.getElementById("scene");if(!i)return;let f=document.documentElement,E=f.classList.contains("js-loading"),x=()=>window.innerWidth<860,y=x(),e=null;try{e=i.getContext("webgl2",{antialias:y,alpha:!1,depth:!0,stencil:!1,powerPreference:"high-performance"})}catch{e=null}if(!e){f.classList.add("no-webgl");return}let w=window.matchMedia("(prefers-reduced-motion: reduce)"),F=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],g={bg:F("#171412"),ivory:F("#ebe5d9"),plinth:F("#2a2521"),curve:F("#978b80"),cream:F("#f3eee6"),ember:F("#e5602f"),dot:F("#6a6058"),black:[.02,.016,.014]},h=(t,o,n)=>t+(o-t)*n,T=(t,o,n)=>Math.min(n,Math.max(o,t)),S=(t,o,n)=>{let a=T((n-t)/(o-t),0,1);return a*a*(3-2*a)},de=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Fe=t=>1-Math.pow(1-t,3),Re=()=>new Float32Array(16);function so(t,o,n,a,r){let c=1/Math.tan(o/2),s=1/(a-r);return t.fill(0),t[0]=c/n,t[5]=c,t[10]=(r+a)*s,t[11]=-1,t[14]=2*r*a*s,t}function co(t,o,n,a){let r=o[0]-n[0],c=o[1]-n[1],s=o[2]-n[2],l=Math.hypot(r,c,s);r/=l,c/=l,s/=l;let A=a[1]*s-a[2]*c,R=a[2]*r-a[0]*s,p=a[0]*c-a[1]*r;l=Math.hypot(A,R,p),A/=l,R/=l,p/=l;let Y=c*p-s*R,D=s*A-r*p,v=r*R-c*A;return t[0]=A,t[1]=Y,t[2]=r,t[3]=0,t[4]=R,t[5]=D,t[6]=c,t[7]=0,t[8]=p,t[9]=v,t[10]=s,t[11]=0,t[12]=-(A*o[0]+R*o[1]+p*o[2]),t[13]=-(Y*o[0]+D*o[1]+v*o[2]),t[14]=-(r*o[0]+c*o[1]+s*o[2]),t[15]=1,t}function ie(t,o,n,a,r,c,s,l){let A=Math.cos(r),R=Math.sin(r);return t.fill(0),t[0]=A*c,t[2]=-R*c,t[5]=s,t[8]=R*l,t[10]=A*l,t[12]=o,t[13]=n,t[14]=a,t[15]=1,t}let lo=`#version 300 es
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
}`,uo=`#version 300 es
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
}`,fo=`#version 300 es
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
}`,mo=`#version 300 es
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
  vec3 col = vec3(0.13, 0.118, 0.108) * (0.6 + 0.4 * diff) + vec3(0.055, 0.05, 0.044) * max(n.y, 0.0);
  float a = 0.62 + 0.3 * fres;
  col += uCream * (fres * 0.42 + spec * 0.7);
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
    col += ink * cells * uLevel * (0.55 + 0.9 * uGlow);
    a = max(a, cells * uLevel * 0.95);
    float rule = band(0.074, 0.086, p.y) * band(0.07, 0.93, p.x);
    col += uCream * rule * 0.6 * uLevel;
  }
  col += uEmber * uHi * (0.1 + fres * 0.85);
  col += uEmber * uBounce * max(-n.y, 0.0) * 0.5;
  float f = smoothstep(uFogRange.x, uFogRange.y, vDepth);
  o = vec4(mix(col, uFog, f), clamp(a * uAlpha, 0.0, 1.0));
}`,ho=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aT;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out float vDepth; out float vT; out float vX;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vec4 v = uView * w;
  vDepth = -v.z; vT = aT; vX = w.x;
  gl_Position = uProj * v;
}`,vo=`#version 300 es
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
}`,po=`#version 300 es
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
}`,go=`#version 300 es
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
}`,yo=`#version 300 es
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
}`,bo=`#version 300 es
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
}`,xo=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUv;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out vec2 vUv; out float vDepth;
void main(){
  vec4 v = uView * uModel * vec4(aPos, 1.0);
  vUv = aUv; vDepth = -v.z;
  gl_Position = uProj * v;
}`,Ao=`#version 300 es
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
}`,mt=`#version 300 es
layout(location=0) in vec2 aPos;
out vec2 vUv;
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,wo=`#version 300 es
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
}`,Eo=`#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
out vec4 o;
void main(){
  vec3 c = texture(uTex, vUv).rgb * 0.2270270270;
  c += (texture(uTex, vUv + uDir * 1.3846153846).rgb + texture(uTex, vUv - uDir * 1.3846153846).rgb) * 0.3162162162;
  c += (texture(uTex, vUv + uDir * 3.2307692308).rgb + texture(uTex, vUv - uDir * 3.2307692308).rgb) * 0.0702702703;
  o = vec4(c, 1.0);
}`,So=`#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uScene; uniform sampler2D uB1; uniform sampler2D uB2;
uniform float uBloom; uniform vec2 uRes; uniform float uTime; uniform vec2 uCenter;
out vec4 o;
void main(){
  vec3 c = texture(uScene, vUv).rgb;
  if (any(isnan(c)) || any(isinf(c))) c = vec3(0.09, 0.078, 0.07);
  c = clamp(c, 0.0, 8.0);
  vec3 b = texture(uB1, vUv).rgb * 0.85 + texture(uB2, vUv).rgb * 1.1;
  if (any(isnan(b)) || any(isinf(b))) b = vec3(0.0);
  c += b * uBloom;
  vec2 q = vUv - uCenter; q.x *= uRes.x / uRes.y;
  c *= mix(0.66, 1.0, 1.0 - smoothstep(0.3, 1.35, length(q)));
  vec3 over = max(c - 0.8, 0.0);
  c = min(c, vec3(0.8)) + over / (1.0 + over * 2.4);
  vec2 fc = gl_FragCoord.xy + fract(uTime) * 91.0;
  float n1 = fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453);
  float n2 = fract(sin(dot(fc, vec2(39.3468, 11.1354))) * 24634.6345);
  c += (n1 + n2 - 1.0) / 255.0;
  o = vec4(c, 1.0);
}`;function Ft(t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"shader");return n}function ve(t,o){let n=e.createProgram();if(e.attachShader(n,Ft(e.VERTEX_SHADER,t)),e.attachShader(n,Ft(e.FRAGMENT_SHADER,o)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n)||"link");let a={},r=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let c=0;c<r;c++){let s=e.getActiveUniform(n,c);a[s.name]=e.getUniformLocation(n,s.name)}return{p:n,u:a}}let Ee=[2.4,.03,1.56],ke=5,me=[{id:"SYS-01",name:"ERP",note:"orders \xB7 dispatch",a:[-4.4,.7,-1.6],ay:.28,b:[-2.62,0,-.89]},{id:"SYS-02",name:"Ledger",note:"books \xB7 GST returns",a:[.3,1.5,-3.8],ay:-.16,b:[0,0,-.89]},{id:"SYS-03",name:"Stock",note:"inventory \xB7 3 sites",a:[4.6,.35,-1.1],ay:.38,b:[2.62,0,-.89]},{id:"SYS-04",name:"WhatsApp",note:"vendors \xB7 customers",a:[3.5,1.15,3],ay:-.32,b:[2.62,0,.89]},{id:"SYS-05",name:"Sheets",note:"final_v2.xlsx",a:[-.6,-.05,3.4],ay:.18,b:[0,0,.89]},{id:"SYS-06",name:"Bank",note:"receipts \xB7 payments",a:[-4.7,1.25,2.2],ay:-.22,b:[-2.62,0,.89]}],W=[[0,1,1],[1,2,.25],[2,3,1],[3,4,.25],[4,5,1],[5,0,.25],[0,2,.2],[1,4,1],[5,3,.2]],te=[0,2,4,7],se=W.length,z=64,$=-1.4,et=[{eye:[17.7,13,22.2],tgt:[0,.3,0],dx:.56,leak:.45,find:0,carry:0,ground:0,flow:1},{eye:[14.5,5.4,17.5],tgt:[0,.5,0],dx:.6,leak:.95,find:0,carry:0,ground:0,flow:.7},{eye:[-12.65,10.45,14.85],tgt:[0,.4,0],dx:.5,leak:.6,find:1,carry:0,ground:0,flow:.5},{eye:[1.98,24.4,15.8],tgt:[0,-.2,.4],dx:.5,leak:0,find:0,carry:1,ground:0,flow:1.7},{eye:[10.45,3.96,11.55],tgt:[0,-.2,0],dx:.56,leak:0,find:0,carry:.3,ground:1,flow:1},{eye:[13.2,11,16.5],tgt:[0,-.2,0],dx:.48,leak:0,find:0,carry:.7,ground:1,flow:1.2},{eye:[-14.3,11,18.7],tgt:[0,-.3,0],dx:.6,leak:0,find:0,carry:.5,ground:1,flow:1}],Rt=["Six systems, each individually correct.","Value leaving between systems \u2014 not inside any one of them.","Vertical I \u2014 the gaps located and put on record.","Vertical II \u2014 work carried end to end, nothing dropped.","Vertical III \u2014 the record layer everything stands on.","Diagnose, ground, then automate.","Measured against the baseline agreed at the start."],Mt=["Status \xB7 0 errors \xB7 every record valid","Correct inside \xB7 value leaving at its edges","Correct inside \xB7 gaps now on record","Work carried in and out \xB7 every step logged","Standing on the shared record layer","Grounded first \xB7 then automated","Measured against the agreed baseline"];function oe(t,o,n){let a=e.createVertexArray(),r=e.createBuffer();e.bindVertexArray(a),e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,o,n||e.STATIC_DRAW);let c=t.reduce((l,A)=>l+A,0),s=0;return t.forEach((l,A)=>{e.enableVertexAttribArray(A),e.vertexAttribPointer(A,l,e.FLOAT,!1,c*4,s*4),s+=l}),e.bindVertexArray(null),{v:a,b:r,data:o}}function Fo(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],o=[],n=(a,r,c,s,l)=>[0,1,2].map(A=>a[A]*.5+r[A]*s*.5+c[A]*l*.5);return t.forEach(([a,r,c])=>{[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([l,A])=>{o.push(...n(a,r,c,l,A),...a,0,0)})}),new Float32Array(o)}function Ro(){let t=[-.5,.5],o=[];for(let n of t)for(let a of t)o.push(-.5,n,a,.5,.5,n,a,.5),o.push(n,-.5,a,.5,n,.5,a,.5),o.push(n,a,-.5,.5,n,a,.5,.5);return new Float32Array(o)}function Mo(t,o){let n=[];for(let r=1;r<t;r++){let c=-.5+r/t;n.push(c,.52,-.5,.5,c,.52,.5,.5)}for(let r=1;r<o;r++){let c=-.5+r/o;n.push(-.5,.52,c,.5,.5,.52,c,.5)}return new Float32Array(n)}function To(){let t=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]],o=[];return t.forEach(([n,a])=>o.push(n,0,a,n+.5,a+.5)),new Float32Array(o)}function Lo(){let t=[[0,-.5],[1,-.5],[1,.5],[0,-.5],[1,.5],[0,.5]],o=[];return t.forEach(([n,a])=>o.push(0,n,a,a+.5,n)),new Float32Array(o)}function _o(){let t=[];for(let a=-22;a<=22+1e-6;a+=.55)for(let r=-22;r<=22+1e-6;r+=.55){let c=Math.hypot(a,r),s=.75*(1-S(6,21,c));s<=.01||t.push(a,$,r,g.dot[0],g.dot[1],g.dot[2],s,.034)}return new Float32Array(t)}let Po=()=>oe([2],new Float32Array([-1,-1,3,-1,-1,3])),m,_,G=y?760:1600,Tt=se+te.length,Lt=se+te.length*3;try{m={mesh:ve(lo,uo),line:ve(ho,vo),point:ve(yo,bo),decal:ve(xo,Ao),glass:ve(fo,mo),ribbon:ve(po,go)},_={box:oe([3,3,2],Fo()),edges:oe([3,1],Ro()),plinthGrid:oe([3,1],Mo(19,9)),floor:oe([3,2],To()),sheet:oe([3,2],Lo()),dots:oe([3,4,1],_o()),curves:oe([3,1],new Float32Array(se*z*4),e.DYNAMIC_DRAW),ribbons:oe([3,3,3,1,1],new Float32Array(se*z*2*11),e.DYNAMIC_DRAW),particles:oe([3,4,1],new Float32Array((G+Tt)*8),e.DYNAMIC_DRAW),markers:oe([3,4,1],new Float32Array(Lt*8),e.DYNAMIC_DRAW),pins:oe([3,1],new Float32Array((te.length*2+2)*4),e.DYNAMIC_DRAW)},_.dots.count=_.dots.data.length/8}catch(t){console.warn("[scene] WebGL init failed:",t),f.classList.add("no-webgl");return}let u={on:!1,w:0,h:0};function Co(){if(!y)try{u.hdr=!!e.getExtension("EXT_color_buffer_float"),u.fmt=u.hdr?e.RGBA16F:e.RGBA8,u.type=u.hdr?e.HALF_FLOAT:e.UNSIGNED_BYTE,u.samples=Math.min(4,e.getParameter(e.MAX_SAMPLES)||0),u.bright=ve(mt,wo),u.blur=ve(mt,Eo),u.comp=ve(mt,So),u.tri=Po(),u.on=!0}catch(t){console.warn("[scene] post-processing off:",t),u.on=!1}}function Do(t,o){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,u.fmt,t,o,0,e.RGBA,u.type,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}function qe(t,o,n){let a={w:t,h:o,tex:Do(t,o),fbo:e.createFramebuffer()};return e.bindFramebuffer(e.FRAMEBUFFER,a.fbo),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,a.tex,0),n&&(a.depth=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,a.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,a.depth)),a.ok=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,a}function Io(t){t&&(e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo),t.depth&&e.deleteRenderbuffer(t.depth))}function No(t,o){if(!u.on||u.w===t&&u.h===o)return;u.w=t,u.h=o,[u.scene,u.h1,u.h2,u.q1,u.q2].forEach(Io),u.ms&&(e.deleteFramebuffer(u.ms.fbo),e.deleteRenderbuffer(u.ms.color),e.deleteRenderbuffer(u.ms.depth),u.ms=null),u.scene=qe(t,o,u.samples===0);let n=Math.max(1,t>>1),a=Math.max(1,o>>1),r=Math.max(1,t>>3),c=Math.max(1,o>>3);u.h1=qe(n,a),u.h2=qe(n,a),u.q1=qe(r,c),u.q2=qe(r,c);let s=u.scene.ok&&u.h1.ok&&u.h2.ok&&u.q1.ok&&u.q2.ok;if(s&&u.samples>0){let l={fbo:e.createFramebuffer(),color:e.createRenderbuffer(),depth:e.createRenderbuffer()};e.bindFramebuffer(e.FRAMEBUFFER,l.fbo),e.bindRenderbuffer(e.RENDERBUFFER,l.color),e.renderbufferStorageMultisample(e.RENDERBUFFER,u.samples,u.fmt,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,l.color),e.bindRenderbuffer(e.RENDERBUFFER,l.depth),e.renderbufferStorageMultisample(e.RENDERBUFFER,u.samples,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,l.depth),s=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,u.ms=l}e.bindFramebuffer(e.FRAMEBUFFER,null),s||(console.warn("[scene] render targets incomplete; drawing direct"),u.on=!1)}Co();let ht=new Uint8Array(G),Se=new Uint8Array(G),tt=new Float32Array(G),_t=new Float32Array(G),ot=new Float32Array(G),nt=new Float32Array(G),vt=new Float32Array(G),ne=new Float32Array(G*3),ce=new Float32Array(G*3);for(let t=0;t<G;t++)ht[t]=t%se,tt[t]=Math.random(),_t[t]=.09+Math.random()*.06,Se[t]=Math.random()<.45*W[ht[t]][2]?1:0,ot[t]=.38+Math.random()*.24;let pe=[],he=-1,rt=null;function at(){pe=Array.from(document.querySelectorAll("[data-stage]")).map(n=>({i:+n.dataset.stage,top:n.getBoundingClientRect().top+window.scrollY})).sort((n,a)=>n.top-a.top);let t=document.querySelector("[data-focus]");he=t?+t.dataset.focus:-1;let o=document.querySelector("[data-caption]");rt=o?{stage:+o.dataset.stage,text:o.dataset.caption}:null}function pt(){if(!pe.length)return 0;let t=window.scrollY+window.innerHeight*.5,o=0;for(let c=0;c<pe.length;c++)pe[c].top<=t&&(o=c);if(o>=pe.length-1||t<pe[0].top)return pe[o].i;let n=pe[o],a=pe[o+1],r=(t-n.top)/Math.max(1,a.top-n.top);return n.i+(a.i-n.i)*S(.55,1,r)}let Uo=["dx","leak","find","carry","ground","flow"];function Pt(t,o){let n=t[0]-o[0],a=t[1]-o[1],r=t[2]-o[2],c=Math.hypot(n,a,r)||1;return[c,Math.atan2(n,r),Math.asin(T(a/c,-1,1))]}function ko(t,o,n){let a=o-t;for(;a>Math.PI;)a-=Math.PI*2;for(;a<-Math.PI;)a+=Math.PI*2;return t+a*n}function it(t,o,n){let a={};for(let R of Uo)a[R]=h(t[R],o[R],n);if(a.tgt=[0,1,2].map(R=>h(t.tgt[R],o.tgt[R],n)),n<=0)return a.eye=t.eye.slice(),a;if(n>=1)return a.eye=o.eye.slice(),a;let r=Pt(t.eye,t.tgt),c=Pt(o.eye,o.tgt),s=Math.exp(h(Math.log(r[0]),Math.log(c[0]),n)),l=ko(r[1],c[1],n),A=h(r[2],c[2],n);return a.eye=[a.tgt[0]+s*Math.cos(A)*Math.sin(l),a.tgt[1]+s*Math.sin(A),a.tgt[2]+s*Math.cos(A)*Math.cos(l)],a}let Ct=t=>it(t,t,0);function Dt(t){let o=T(Math.floor(t),0,et.length-1),n=Math.min(o+1,et.length-1);return it(et[o],et[n],T(t-o,0,1))}let X=me.map(()=>({p:[0,0,0],base:0,ry:0,hov:0,foc:0,pulse:0,gap:.085,h:.37,top:0})),It=new Float32Array(W.length),Be=[];for(let t=0;t<me.length;t++)for(let o=0;o<ke;o++)Be.push({i:t,k:o,x:0,y:0,z:0,ry:0,d:0});let Nt=5.5,N=_.curves.data;function Bo(t){for(let o=0;o<se;o++){let n=X[W[o][0]],a=X[W[o][1]],r=n.p,c=a.p,s=[r[0],n.top+.02,r[2]],l=[c[0],a.top+.02,c[2]],A=l[0]-s[0],R=l[1]-s[1],p=l[2]-s[2],Y=Math.hypot(A,R,p),D=h(1.1+.17*Y,.6+.13*Y,t),v=[s[0]+A*.14,s[1]+D,s[2]+p*.14],L=[l[0]-A*.14,l[1]+D,l[2]-p*.14];for(let C=0;C<z;C++){let U=C/(z-1),re=1-U,Oe=re*re*re,Ce=3*re*re*U,Ke=3*re*U*U,De=U*U*U,Ie=(o*z+C)*4;N[Ie]=Oe*s[0]+Ce*v[0]+Ke*L[0]+De*l[0],N[Ie+1]=Oe*s[1]+Ce*v[1]+Ke*L[1]+De*l[1],N[Ie+2]=Oe*s[2]+Ce*v[2]+Ke*L[2]+De*l[2],N[Ie+3]=U}}}function Oo(){let t=_.ribbons.data;for(let o=0;o<se;o++)for(let n=0;n<z;n++){let a=(o*z+n)*4,r=(o*z+Math.max(0,n-1))*4,c=(o*z+Math.min(z-1,n+1))*4;for(let s=0;s<2;s++){let l=((o*z+n)*2+s)*11;t[l]=N[a],t[l+1]=N[a+1],t[l+2]=N[a+2],t[l+3]=N[r],t[l+4]=N[r+1],t[l+5]=N[r+2],t[l+6]=N[c],t[l+7]=N[c+1],t[l+8]=N[c+2],t[l+9]=s?1:-1,t[l+10]=N[a+3]}}}function He(t,o,n){let a=T(o,0,1)*(z-1),r=Math.min(z-2,Math.floor(a)),c=a-r,s=(t*z+r)*4,l=s+4;return n[0]=N[s]+(N[l]-N[s])*c,n[1]=N[s+1]+(N[l+1]-N[s+1])*c,n[2]=N[s+2]+(N[l+2]-N[s+2])*c,n}let qo=document.getElementById("fig-no"),Ut=document.getElementById("fig-text"),st=Array.from(document.querySelectorAll(".findings .tag")),gt=-1,K=document.querySelector(".inspect");K||(K=document.createElement("div"),K.className="inspect",K.setAttribute("aria-hidden","true"),K.innerHTML='<div class="inspect-in"><p class="i-id"></p><p class="i-name"></p><p class="i-note"></p><p class="i-status"></p></div>',document.body.appendChild(K));let Ho=K.querySelector(".i-id"),Vo=K.querySelector(".i-name"),zo=K.querySelector(".i-note"),Yo=K.querySelector(".i-status"),kt=-1,Bt=-1,Me=document.querySelector(".sys-tags");Me||(Me=document.createElement("div"),Me.className="sys-tags",Me.setAttribute("aria-hidden","true"),Me.innerHTML=me.map((t,o)=>`<div class="sys-tag"><span><b>${String(o+1).padStart(2,"0")}</b>${t.name}</span></div>`).join(""),document.body.appendChild(Me));let ct=Array.from(Me.children),Ot=ct.map(()=>-1),ge=Re(),Q=Re(),k=Re(),le=0,ye=0,Ve=0,qt=0,Ht=0,Z=w.matches||!E?1:0,Vt=2.6,ze=!1,Te=w.matches?1:0,ue=null,zt=-1,I={x:0,y:0,sx:0,sy:0,px:-1,py:-1,active:!1};window.addEventListener("pointermove",t=>{I.x=t.clientX/window.innerWidth*2-1,I.y=t.clientY/window.innerHeight*2-1,I.px=t.clientX,I.py=t.clientY,I.active=t.pointerType==="mouse"},{passive:!0}),window.addEventListener("mouseout",t=>{t.relatedTarget||(I.active=!1)}),window.addEventListener("blur",()=>{I.active=!1});let Yt=[1.75,1.35,1],J={acc:0,n:0,slow:0,level:0};function jo(t){if(J.level>=Yt.length-1||t<=0||t>.25||(J.acc+=t,J.n++,J.n<90))return;let o=J.acc/J.n;J.acc=0,J.n=0,J.slow=o>.026?J.slow+1:0,J.slow>=2&&(J.level++,J.slow=0)}function Go(){let t=Math.min(window.devicePixelRatio||1,x()?1.5:Yt[J.level]),o=Math.max(1,Math.round(i.clientWidth*t)),n=Math.max(1,Math.round(i.clientHeight*t));(i.width!==o||i.height!==n)&&(i.width=o,i.height=n),No(o,n)}let V=[0,0,0],yt=[0,0,0],bt=te.map(()=>[0,0,0]),Le=Dt(0),_e=[0,0,0],xt=0;function lt(t){let o=Q[0]*t[0]+Q[4]*t[1]+Q[8]*t[2]+Q[12],n=Q[1]*t[0]+Q[5]*t[1]+Q[9]*t[2]+Q[13],a=Q[2]*t[0]+Q[6]*t[1]+Q[10]*t[2]+Q[14],r=ge[0]*o+ge[8]*a,c=ge[5]*n+ge[9]*a,s=-a;return s<.1?null:[(r/s*.5+.5)*i.clientWidth,(1-(c/s*.5+.5))*i.clientHeight,s]}function Wo(){if(!I.active||x()||Z<.9||I.px<i.clientWidth*.42)return-1;let t=-1,o=1e9;for(let n=0;n<me.length;n++){let a=X[n],r=lt([a.p[0],a.base-.09+a.h*.5,a.p[2]]);if(!r)continue;let c=ge[5]*i.clientHeight*.5*(n===zt?1.45:1.15)/r[2],s=Math.hypot(I.px-r[0],(I.py-r[1])*1.4);s<c&&s<o&&(o=s,t=n)}return t}function Ye(t){let o=w.matches;ye+=t*(o?.2:1);let n=!ze&&!f.classList.contains("js-loading");n&&Z<1&&(Z=Math.min(1,Z+t/Vt)),n&&Te<1&&(Te=Math.min(1,Te+t/1.6)),qt%30===0&&at(),qt++;let a=pt();le+=(a-le)*(1-Math.exp(-t*(o?12:2.4))),Math.abs(a-le)<5e-4&&(le=a);let r=Dt(le);ue&&!ze?(ue.t=Math.min(1,ue.t+t/1.5),r=it(ue.from,r,de(ue.t)),ue.t>=1&&(ue=null)):ue&&(r=it(ue.from,r,0)),Le=r;let c=x(),s=ze?-1:Wo();zt=s;let l=de(T(r.ground,0,1));for(let d=0;d<me.length;d++){let M=me[d],b=X[d];b.hov+=((s===d?1:0)-b.hov)*(1-Math.exp(-t*9)),b.foc+=((he===d?1:0)-b.foc)*(1-Math.exp(-t*3));let B=Fe(T(Z*1.55-d*.09,0,1)),P=b.hov*.32+b.foc*.22*(1-l*.6);b.p[0]=h(M.a[0],M.b[0],l),b.base=h(M.a[1],M.b[1],l),b.p[1]=b.base+P+(1-B)*Nt,b.p[2]=h(M.a[2],M.b[2],l),b.ry=h(M.ay,0,l)+(1-B)*.5*(d%2?1:-1),b.pulse=Math.max(0,b.pulse-t*1.3);let ae=h(.085+b.hov*.14+(1-B)*.12,.05+b.hov*.06,l);b.gap+=(ae-b.gap)*(1-Math.exp(-t*6)),b.h=(ke-1)*b.gap+Ee[1],b.top=b.p[1]-.09+b.h;for(let O=0;O<ke;O++){let j=Be[d*ke+O],q=(1-l)*r.leak;j.x=b.p[0]+q*.07*Math.sin(O*2.1+d*1.3),j.z=b.p[2]+q*.055*Math.cos(O*1.7+d*.9),j.y=b.p[1]-.09+Ee[1]*.5+O*b.gap,j.ry=b.ry+q*.05*Math.sin(O*1.3+d)}}Bo(l),Oo();let A=r.flow*(o?.25:1),R=r.leak,p=_.particles.data,Y=S(.45,.95,Z);for(let d=0;d<G;d++){let M=ht[d],b=d*8;if(Se[d]!==2){let O=tt[d],j=O+_t[d]*t*A;if(j>=1?(j-=1,Se[d]=Math.random()<R*W[M][2]?1:0,ot[d]=.38+Math.random()*.24):Se[d]===1&&R<.02&&(Se[d]=0),tt[d]=j,Se[d]===1&&O<ot[d]&&j>=ot[d]){He(M,j,V),He(M,Math.min(1,j+.02),yt);let q=yt[0]-V[0],Ae=yt[2]-V[2],Jt=Math.hypot(q,Ae)||1;q/=Jt,Ae/=Jt;let Zt=(Math.random()-.5)*1.8;ce[d*3]=q*.45-Ae*Zt,ce[d*3+1]=.1+Math.random()*.5,ce[d*3+2]=Ae*.45+q*Zt,ne[d*3]=V[0],ne[d*3+1]=V[1],ne[d*3+2]=V[2],nt[d]=0,vt[d]=2.8+Math.random()*1.2,Se[d]=2}else{He(M,j,V);let q=S(0,.07,j)*(1-S(.93,1,j)),Ae=he>=0&&(W[M][0]===he||W[M][1]===he)?X[he].foc:0;p[b]=V[0],p[b+1]=V[1],p[b+2]=V[2],p[b+3]=h(g.cream[0],1,Ae*.3),p[b+4]=h(g.cream[1],.8,Ae*.3),p[b+5]=h(g.cream[2],.65,Ae*.3),p[b+6]=q*(.62+.38*r.carry+Ae*.3)*Y,p[b+7]=.05+.014*r.carry;continue}}let B=t*(o?.3:1);nt[d]+=B;let P=d*3;if(ne[P+1]>$+.02){ce[P+1]-=1.15*B;let O=Math.pow(.55,B);ce[P]*=O,ce[P+2]*=O,ne[P]+=ce[P]*B,ne[P+1]+=ce[P+1]*B,ne[P+2]+=ce[P+2]*B,ne[P+1]<=$+.02&&(ne[P+1]=$+.02,ce[P]*=.15,ce[P+2]*=.15)}if(nt[d]>=vt[d]){Se[d]=0,tt[d]=0,p[b+6]=0;continue}let ae=1-nt[d]/vt[d];p[b]=ne[P],p[b+1]=ne[P+1],p[b+2]=ne[P+2],p[b+3]=g.ember[0]*1.15,p[b+4]=g.ember[1]*1.1,p[b+5]=g.ember[2],p[b+6]=Math.pow(ae,1.2)*.95*Y,p[b+7]=.072}Ht+=t*.1*A;let D=_.markers.data;for(let d=0;d<se;d++){let M=(Ht+d*.37)%1;It[d]<.93&&M>=.93&&r.carry>.05&&(X[W[d][1]].pulse=1),It[d]=M,He(d,M,V);let b=S(0,.08,M)*(1-S(.92,1,M)),B=(G+d)*8;p[B]=V[0],p[B+1]=V[1],p[B+2]=V[2],p[B+3]=1.18,p[B+4]=1.12,p[B+5]=1.06,p[B+6]=r.carry*b*Y,p[B+7]=.14;let P=d*8;D[P]=V[0],D[P+1]=V[1],D[P+2]=V[2],D[P+3]=g.cream[0],D[P+4]=g.cream[1],D[P+5]=g.cream[2],D[P+6]=r.carry*b*.55*Y,D[P+7]=.46}let v=_.pins.data;for(let d=0;d<te.length;d++){let M=He(te[d],.5,bt[d]),b=(G+se+d)*8;p[b]=M[0],p[b+1]=M[1],p[b+2]=M[2],p[b+3]=g.ember[0]*1.5,p[b+4]=g.ember[1]*1.4,p[b+5]=g.ember[2]*1.2,p[b+6]=r.find*Y,p[b+7]=.12;let B=o?.5:(ye*.5+d*.25)%1;[[M[0],M[1],M[2],r.find,.62+(o?0:.05*Math.sin(ye*2.4+d))],[M[0],M[1],M[2],r.find*(1-B)*.8,.6+B*1.6],[M[0],$+.01,M[2],r.find*.6,.55]].forEach((O,j)=>{let q=(se+d*3+j)*8;D[q]=O[0],D[q+1]=O[1],D[q+2]=O[2],D[q+3]=g.ember[0],D[q+4]=g.ember[1],D[q+5]=g.ember[2],D[q+6]=O[3]*Y,D[q+7]=O[4]});let ae=d*8;v[ae]=M[0],v[ae+1]=M[1]-.12,v[ae+2]=M[2],v[ae+3]=.5,v[ae+4]=M[0],v[ae+5]=$+.01,v[ae+6]=M[2],v[ae+7]=.5}let L=o?0:-7.5+ye/3.8%1*15,C=te.length*8;v[C]=L,v[C+1]=$+.01,v[C+2]=-5,v[C+3]=.5,v[C+4]=L,v[C+5]=$+.01,v[C+6]=5,v[C+7]=.5,r.scanX=L,r.sweep=o?0:-5.2+ye/5.5%1*10.4,xt+=(R*.55+r.find*.35-xt)*(1-Math.exp(-t*2)),I.sx+=(I.x-I.sx)*(1-Math.exp(-t*2)),I.sy+=(I.y-I.sy)*(1-Math.exp(-t*2));let U=r.tgt.slice(),re=r.eye[0]-U[0],Oe=r.eye[1]-U[1],Ce=r.eye[2]-U[2],Ke=1+(1-Fe(Z))*.28+(1-Fe(Te))*.045,De=(c?1.4:1)*Ke;re*=De,Oe*=De,Ce*=De;let Ie=o?0:Math.sin(ye*.07)*.07+I.sx*.05+(1-Fe(Z))*.35+(1-Fe(Te))*.05,Kt=Math.cos(Ie),Qt=Math.sin(Ie);_e=[U[0]+re*Kt+Ce*Qt,U[1]+Oe-I.sy*.5,U[2]-re*Qt+Ce*Kt];let Ne=T(Math.round(le),0,Rt.length-1);Ne!==gt&&Ut&&(gt=Ne,qo.textContent="Fig. "+String(Ne+1).padStart(2,"0"),Ut.textContent=rt&&rt.stage===Ne?rt.text:Rt[Ne],document.dispatchEvent(new CustomEvent("ws:stage",{detail:Ne}))),r.hovIdx=s,r.ci=Ne}function be(t){e.useProgram(t.p),t.u.uProj&&e.uniformMatrix4fv(t.u.uProj,!1,ge),t.u.uView&&e.uniformMatrix4fv(t.u.uView,!1,Q),t.u.uFog&&e.uniform3fv(t.u.uFog,g.bg),t.u.uFogRange&&e.uniform2f(t.u.uFogRange,17,54),t.u.uEmber&&e.uniform3fv(t.u.uEmber,g.ember)}function je(t,o,n,a,r,c){let s=m.line.u;e.uniform3fv(s.uColor,t),e.uniform1f(s.uAlpha,o),e.uniform1f(s.uDash,n||0),e.uniform1f(s.uEnds,a||0),e.uniform1f(s.uDraw,r===void 0?2:r),e.uniform1f(s.uSweepAmt,c||0)}function jt(t,o){let n=Le;e.viewport(0,0,t,o),so(ge,34*Math.PI/180,t/o,.1,140),ge[8]-=x()?0:n.dx,co(Q,_e,n.tgt,[0,1,0]);let a=o*.5*ge[5],r=S(0,.5,Z);e.clearColor(g.bg[0],g.bg[1],g.bg[2],1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.enable(e.BLEND);let c=de(T(n.ground,0,1));be(m.point),e.uniform1f(m.point.u.uScale,a),e.uniform1f(m.point.u.uScanX,n.scanX||0),e.uniform1f(m.point.u.uScanAmt,n.find*.9),e.uniform1f(m.point.u.uFade,r),e.uniform1f(m.point.u.uGain,1),e.uniform1i(m.point.u.uMode,0),e.depthMask(!1),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(_.dots.v),e.drawArrays(e.POINTS,0,_.dots.count),be(m.decal),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.uniform1i(m.decal.u.uMode,1),e.uniform3fv(m.decal.u.uColor,g.black),e.bindVertexArray(_.floor.v);for(let v=0;v<me.length;v++){let L=X[v],C=L.p[1]-$;ie(k,L.p[0],$+.005,L.p[2],L.ry,3.4+C*.4,1,2.4+C*.3),e.uniformMatrix4fv(m.decal.u.uModel,!1,k),e.uniform1f(m.decal.u.uAlpha,.78*(1-c)/(1+C*.35)*r),e.drawArrays(e.TRIANGLES,0,6)}c>.01&&(ie(k,0,$+.005,0,0,12.5,1,7.5),e.uniformMatrix4fv(m.decal.u.uModel,!1,k),e.uniform1f(m.decal.u.uAlpha,.8*c),e.drawArrays(e.TRIANGLES,0,6)),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(m.decal.u.uColor,g.cream),ie(k,0,$+.002,.2,0,17,1,12),e.uniformMatrix4fv(m.decal.u.uModel,!1,k),e.uniform1f(m.decal.u.uAlpha,.035*r),e.drawArrays(e.TRIANGLES,0,6),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(m.decal.u.uColor,g.ember);for(let v=0;v<te.length;v++){let L=bt[v];ie(k,L[0],$+.01,L[2],0,3.2,1,3.2),e.uniformMatrix4fv(m.decal.u.uModel,!1,k),e.uniform1f(m.decal.u.uAlpha,(n.leak*W[te[v]][2]*.16+n.find*.12)*r),e.drawArrays(e.TRIANGLES,0,6)}e.depthMask(!0),be(m.mesh),e.uniform3fv(m.mesh.u.uCam,_e),e.uniform1f(m.mesh.u.uBounce,0),e.uniform1f(m.mesh.u.uHi,0),e.uniform1f(m.mesh.u.uSheets,0);let s=S(0,.5,c),l=h(-3.4,-.37,1-Math.pow(1-c,3)),A=[8.44,.5,4.14];s>.005&&(e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),ie(k,0,l,0,0,A[0],A[1],A[2]),e.uniformMatrix4fv(m.mesh.u.uModel,!1,k),e.uniform3fv(m.mesh.u.uColor,g.plinth),e.uniform1f(m.mesh.u.uAlpha,s),e.uniform1f(m.mesh.u.uUseTex,0),e.bindVertexArray(_.box.v),e.drawArrays(e.TRIANGLES,0,36));for(let v of Be){let L=X[v.i];v.d=(L.p[0]-_e[0])**2+(L.p[1]-_e[1])**2+(L.p[2]-_e[2])**2}Be.sort((v,L)=>L.d-v.d||v.k-L.k),be(m.glass),e.uniform3fv(m.glass.u.uCam,_e),e.uniform3fv(m.glass.u.uCream,g.cream),e.uniform1f(m.glass.u.uAlpha,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindVertexArray(_.box.v);let R=T(n.leak*.7+n.find,0,1)*(1-c);for(let v of Be){let L=X[v.i],C=v.k===ke-1;ie(k,v.x,v.y,v.z,v.ry,Ee[0],Ee[1],Ee[2]),e.uniformMatrix4fv(m.glass.u.uModel,!1,k),e.uniform1f(m.glass.u.uSeed,v.i+1+v.k*.37),e.uniform1f(m.glass.u.uLevel,C?1:.3+.45*L.hov),e.uniform1f(m.glass.u.uHi,Math.max(L.hov,L.foc*.8)),e.uniform1f(m.glass.u.uGlow,T(L.pulse*n.carry+L.foc*.45+L.hov*.55+n.find*.15,0,1.4)),e.uniform1f(m.glass.u.uBad,R),e.uniform1f(m.glass.u.uBounce,v.k===0?xt*(1-c):0),e.drawArrays(e.TRIANGLES,0,36)}e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.CULL_FACE),be(m.line),e.uniform1f(m.line.u.uTime,ye),e.uniform1f(m.line.u.uSweep,n.sweep||0),e.depthMask(!1),e.blendFunc(e.SRC_ALPHA,e.ONE),e.bindVertexArray(_.edges.v);for(let v of Be){let L=X[v.i],C=Math.max(L.hov,L.foc*.85),U=v.k===ke-1?1:.4;ie(k,v.x,v.y,v.z,v.ry,Ee[0],Ee[1],Ee[2]),e.uniformMatrix4fv(m.line.u.uModel,!1,k),je(C>.02?[h(g.cream[0],g.ember[0],C),h(g.cream[1],g.ember[1],C),h(g.cream[2],g.ember[2],C)]:g.cream,U*(.75+.35*L.pulse*n.carry)+C*.35),e.drawArrays(e.LINES,0,24)}e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),s>.005&&(ie(k,0,l,0,0,A[0],A[1],A[2]),e.uniformMatrix4fv(m.line.u.uModel,!1,k),je(g.ivory,.26*s),e.drawArrays(e.LINES,0,24),e.bindVertexArray(_.plinthGrid.v),je(g.ivory,.09*s,0,0,2,.9*s),e.drawArrays(e.LINES,0,_.plinthGrid.data.length/4)),ie(k,0,0,0,0,1,1,1),e.uniformMatrix4fv(m.line.u.uModel,!1,k),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),be(m.ribbon);let p=m.ribbon.u,Y=t/Math.max(1,i.clientWidth),D=(.75+.35*n.carry)*Y;e.uniform2f(p.uHalf,t*.5,o*.5),e.uniform1f(p.uWidth,D),e.uniform1f(p.uFeather,T(1.3/Math.max(D,.5),.2,1)),e.uniform1f(p.uTime,ye),e.uniform1f(p.uDash,n.carry),e.uniform1f(p.uEnds,1),e.uniform1f(p.uDraw,S(.2,.9,Z)*1.02),e.bindVertexArray(_.ribbons.v),e.bindBuffer(e.ARRAY_BUFFER,_.ribbons.b),e.bufferSubData(e.ARRAY_BUFFER,0,_.ribbons.data);for(let v=0;v<se;v++){let L=he>=0&&(W[v][0]===he||W[v][1]===he)?X[he].foc:0,C=n.hovIdx>=0&&(W[v][0]===n.hovIdx||W[v][1]===n.hovIdx)?X[n.hovIdx].hov:0,U=Math.max(L,C),re=U>.01?[h(g.curve[0],g.ember[0],U*.7),h(g.curve[1],g.ember[1],U*.7),h(g.curve[2],g.ember[2],U*.7)]:g.curve;e.uniform3fv(p.uColor,re),e.uniform1f(p.uAlpha,.3+.22*n.carry+.06*n.find+U*.35),e.drawArrays(e.TRIANGLE_STRIP,v*z*2,z*2)}be(m.line),ie(k,0,0,0,0,1,1,1),e.uniformMatrix4fv(m.line.u.uModel,!1,k),n.find>.01&&(e.bindVertexArray(_.pins.v),e.bindBuffer(e.ARRAY_BUFFER,_.pins.b),e.bufferSubData(e.ARRAY_BUFFER,0,_.pins.data),je(g.ember,.5*n.find),e.drawArrays(e.LINES,0,te.length*2),je(g.ember,.85*n.find),e.drawArrays(e.LINES,te.length*2,2),be(m.decal),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform1i(m.decal.u.uMode,0),e.uniform3fv(m.decal.u.uColor,g.ember),e.uniform1f(m.decal.u.uAlpha,.14*n.find),ie(k,n.scanX||0,$,0,0,1,3.8,10),e.uniformMatrix4fv(m.decal.u.uModel,!1,k),e.bindVertexArray(_.sheet.v),e.drawArrays(e.TRIANGLES,0,6)),be(m.point),e.uniform1f(m.point.u.uScale,a),e.uniform1f(m.point.u.uScanAmt,0),e.uniform1f(m.point.u.uFade,1),e.uniform1f(m.point.u.uGain,u.on?1.35:1),e.blendFunc(e.ONE,e.ONE),e.uniform1i(m.point.u.uMode,1),e.bindVertexArray(_.particles.v),e.bindBuffer(e.ARRAY_BUFFER,_.particles.b),e.bufferSubData(e.ARRAY_BUFFER,0,_.particles.data),e.drawArrays(e.POINTS,0,G+Tt),(n.find>.01||n.carry>.01)&&(e.uniform1i(m.point.u.uMode,2),e.bindVertexArray(_.markers.v),e.bindBuffer(e.ARRAY_BUFFER,_.markers.b),e.bufferSubData(e.ARRAY_BUFFER,0,_.markers.data),e.drawArrays(e.POINTS,0,Lt)),e.depthMask(!0),e.bindVertexArray(null)}function Pe(t,o,n){e.bindFramebuffer(e.FRAMEBUFFER,o?o.fbo:null),e.viewport(0,0,o?o.w:i.width,o?o.h:i.height),e.useProgram(t.p),n(t.u),e.bindVertexArray(u.tri.v),e.drawArrays(e.TRIANGLES,0,3)}function xe(t,o,n){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(n,t)}function Ge(){Go();let t=i.width,o=i.height;if(!u.on){e.bindFramebuffer(e.FRAMEBUFFER,null),jt(t,o),At(Le);return}e.bindFramebuffer(e.FRAMEBUFFER,u.ms?u.ms.fbo:u.scene.fbo),jt(t,o),u.ms&&(e.bindFramebuffer(e.READ_FRAMEBUFFER,u.ms.fbo),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.scene.fbo),e.blitFramebuffer(0,0,t,o,0,0,t,o,e.COLOR_BUFFER_BIT,e.NEAREST)),e.disable(e.DEPTH_TEST),e.disable(e.BLEND);let n=u.hdr?.97:.86;Pe(u.bright,u.h1,r=>{xe(0,u.scene.tex,r.uTex),e.uniform2f(r.uTexel,1/t,1/o),e.uniform1f(r.uThresh,n)}),Pe(u.blur,u.h2,r=>{xe(0,u.h1.tex,r.uTex),e.uniform2f(r.uDir,1/u.h1.w,0)}),Pe(u.blur,u.h1,r=>{xe(0,u.h2.tex,r.uTex),e.uniform2f(r.uDir,0,1/u.h1.h)}),Pe(u.bright,u.q1,r=>{xe(0,u.h1.tex,r.uTex),e.uniform2f(r.uTexel,1/u.h1.w,1/u.h1.h),e.uniform1f(r.uThresh,0)});for(let r=0;r<2;r++)Pe(u.blur,u.q2,c=>{xe(0,u.q1.tex,c.uTex),e.uniform2f(c.uDir,1.5/u.q1.w,0)}),Pe(u.blur,u.q1,c=>{xe(0,u.q2.tex,c.uTex),e.uniform2f(c.uDir,0,1.5/u.q1.h)});let a=Le;Pe(u.comp,null,r=>{xe(0,u.scene.tex,r.uScene),xe(1,u.h1.tex,r.uB1),xe(2,u.q1.tex,r.uB2),e.uniform1f(r.uBloom,.5+a.find*.3+a.carry*.05),e.uniform2f(r.uRes,t,o),e.uniform2f(r.uCenter,x()?.5:.5+a.dx*.5,.48),e.uniform1f(r.uTime,ye)}),e.bindVertexArray(null),At(a)}let Gt=st.map(()=>({o:-1}));function At(t){let o=i.clientWidth,n=i.clientHeight;if(st.length){let s=t.find>.02&&!x()&&Z>.8;for(let l=0;l<st.length&&l<te.length;l++){let A=st[l],R=0;if(s){let p=lt(bt[l]);if(p){let Y=S(o*.44,o*.52,p[0])*(1-S(o-40,o,p[0]+180))*S(90,160,p[1]);R=S(.55,.95,t.find)*Y,A.style.transform=`translate3d(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px, 0)`}}Math.abs(R-Gt[l].o)>.01&&(A.style.opacity=R.toFixed(3),Gt[l].o=R)}}let a=We&&!x()&&Z>.9?1-S(.15,.6,t.find):0;for(let s=0;s<ct.length;s++){let l=0;if(a>0){let A=X[s],R=lt([A.p[0],A.top+.05,A.p[2]]);R&&(l=a*(1-A.hov)*S(o*.46,o*.54,R[0])*(1-S(o-30,o,R[0]+60))*S(96,150,R[1])*(1-S(n-90,n-40,R[1])),l>.01&&(ct[s].style.transform=`translate3d(${R[0].toFixed(1)}px, ${R[1].toFixed(1)}px, 0)`))}Math.abs(l-Ot[s])>.01&&(ct[s].style.opacity=l.toFixed(3),Ot[s]=l)}let r=t.hovIdx===void 0?-1:t.hovIdx,c=0;if(r>=0&&We){let s=X[r],l=lt([s.p[0],s.top+.12,s.p[2]]);l&&(c=s.hov,(kt!==r||K.dataset.ci!==String(t.ci))&&(kt=r,K.dataset.ci=String(t.ci),Ho.textContent=`${me[r].id} \xB7 ${String(r+1).padStart(2,"0")} / 06`,Vo.textContent=me[r].name,zo.textContent=me[r].note,Yo.textContent=Mt[t.ci]||Mt[0]),K.style.transform=`translate3d(${l[0].toFixed(1)}px, ${l[1].toFixed(1)}px, 0)`)}Math.abs(c-Bt)>.01&&(K.style.opacity=c.toFixed(3),Bt=c),f.classList.toggle("is-inspecting",c>.4)}let wt=0,We=!1,Wt=/[?&]wsdebug\b/.test(location.search);Wt&&(window.__wsScene={step(t,o=1){for(let n=0;n<o;n++)Ye(t);return Ge(),{stage:le,intro:Z}},hover(t,o){I.px=t,I.py=o,I.x=t/window.innerWidth*2-1,I.y=o/window.innerHeight*2-1,I.active=t>=0}});function $t(t){if(Wt)return;wt=requestAnimationFrame($t);let o=t/1e3,n=Ve?o-Ve:0,a=Ve?Math.min(.05,n):1/60;Ve=o,jo(n),Ye(a),Ge()}function $e(t){t!==We&&(We=t,t?(Ve=0,wt=requestAnimationFrame($t)):(cancelAnimationFrame(wt),At(Object.assign({},Le,{hovIdx:-1,find:0}))))}let Xe=Array.from(document.querySelectorAll("[data-canvas]")),ut=new Map,Et=new IntersectionObserver(t=>{t.forEach(o=>ut.set(o.target,o.isIntersecting)),$e(!document.hidden&&Array.from(ut.values()).some(Boolean))},{rootMargin:"80px 0px"});Xe.forEach(t=>Et.observe(t)),document.addEventListener("visibilitychange",()=>{$e(!document.hidden&&Array.from(ut.values()).some(Boolean))}),document.addEventListener("ws:route",()=>{Et.disconnect(),ut.clear(),Xe=Array.from(document.querySelectorAll("[data-canvas]")),Xe.forEach(o=>Et.observe(o));let t=Ct(Le);at(),le=pt(),gt=-1,w.matches||(ue={from:t,t:0},Te=Math.min(Te,.4)),Ye(0),Ge(),Xe.length||$e(!1)}),window.addEventListener("resize",()=>{at(),We||(Ye(0),Ge())},{passive:!0}),i.addEventListener("webglcontextlost",t=>{t.preventDefault(),$e(!1),f.classList.add("no-webgl")}),at(),le=pt(),Vt=le<.5?2.6:2,Nt=le<.5?5.5:1.4;let Xt="ws-cam";if(!E&&!w.matches)try{let t=JSON.parse(sessionStorage.getItem(Xt)||"null");t&&Date.now()-t.at<8e3&&t.st&&t.st.eye&&(ue={from:t.st,t:0})}catch{}window.addEventListener("pagehide",()=>{try{sessionStorage.setItem(Xt,JSON.stringify({at:Date.now(),st:Ct(Le)}))}catch{}}),ze=!0;for(let t=0;t<90;t++)Ye(1/30);ze=!1,Ge(),f.classList.add("scene-ready"),Xe.length||$e(!0)}var ee=document.documentElement,no=ee.dataset.bundle==="1",Ue=window.matchMedia("(prefers-reduced-motion: reduce)").matches;ee.classList.add("js-ready");location.protocol==="file:"&&!no&&document.querySelectorAll("a[href]").forEach(i=>{let f=i.getAttribute("href");if(/^(https?:|mailto:|tel:|#)/.test(f))return;let[E,x]=f.split("#");E&&E.endsWith("/")&&i.setAttribute("href",`${E}index.html${x?`#${x}`:""}`)});var H=document.getElementById("nav"),Je=document.getElementById("menu-btn"),fe=H&&H.querySelector(".drop-btn"),Ze=document.getElementById("mega"),ro=[],St=!1;function ft(){if(St=!1,!H)return;let i=36,f=window.innerHeight-44,E="dark",x=!1;for(let e of ro){let w=e.getBoundingClientRect();w.top<=i&&w.bottom>i&&(E=e.dataset.tone),w.top<=f&&w.bottom>f&&(x=e.hasAttribute("data-canvas")&&!e.hasAttribute("data-no-hud"))}let y=H.classList.contains("is-open")||H.classList.contains("is-drop");H.classList.toggle("is-paper",E==="paper"&&!y),H.classList.toggle("is-scrolled",window.scrollY>24),ee.classList.toggle("hud-on",x)}var ao=()=>{St||(St=!0,requestAnimationFrame(ft))};window.addEventListener("scroll",ao,{passive:!0});window.addEventListener("resize",ao,{passive:!0});var Qe=window.matchMedia("(min-width: 1061px)"),to=window.matchMedia("(hover: hover)"),oo=0;function we(i){!fe||!Ze||(fe.setAttribute("aria-expanded",String(i)),Ze.hidden=!i,H.classList.toggle("is-drop",i&&Qe.matches),ft())}if(fe&&Ze){let i=fe.parentElement;fe.addEventListener("click",()=>we(fe.getAttribute("aria-expanded")!=="true")),i.addEventListener("mouseenter",()=>{to.matches&&Qe.matches&&(clearTimeout(oo),we(!0))}),i.addEventListener("mouseleave",()=>{to.matches&&Qe.matches&&(oo=setTimeout(()=>we(!1),160))}),i.addEventListener("focusout",f=>{Qe.matches&&!i.contains(f.relatedTarget)&&we(!1)}),document.addEventListener("click",f=>{Qe.matches&&!i.contains(f.target)&&we(!1)})}function dt(i){!H||!Je||(H.classList.toggle("is-open",i),Je.setAttribute("aria-expanded",String(i)),i||we(!1),ft())}Je&&Je.addEventListener("click",()=>dt(!H.classList.contains("is-open")));H&&H.addEventListener("click",i=>{i.target.closest(".nav-links a")&&(dt(!1),we(!1))});document.addEventListener("keydown",i=>{i.key==="Escape"&&(fe&&fe.getAttribute("aria-expanded")==="true"?(we(!1),fe.focus()):H&&H.classList.contains("is-open")&&(dt(!1),Je.focus()))});function $o(i){let f=Array.from(i.querySelectorAll(".svc"));f.forEach(y=>{let e=y.querySelector(".svc-row"),w=y.querySelector(".svc-body");e.addEventListener("click",()=>{let F=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!F)),w.hidden=F,y.classList.toggle("is-open",!F)})});let E=Array.from(i.querySelectorAll(".filters [data-filter]")),x=y=>{E.forEach(w=>w.setAttribute("aria-pressed",String(w.dataset.filter===y)));let e=null;f.forEach(w=>{let F=y==="all"||w.dataset.v===y;w.hidden=!F,F&&!e&&(e=w)}),y!=="all"&&e&&!e.classList.contains("is-open")&&e.querySelector(".svc-row").click()};E.forEach(y=>y.addEventListener("click",()=>x(y.dataset.filter)))}function Xo(i){let f=i.querySelector("[data-brief]");if(!f)return;let E=f.querySelector("[data-status]"),x=f.dataset.to,y=(e,w)=>{E.textContent=e,E.classList.toggle("is-error",w==="error"),E.classList.toggle("is-ok",w==="ok")};f.addEventListener("submit",async e=>{e.preventDefault();let w=new FormData(f),F=String(w.get("name")||"").trim(),g=String(w.get("email")||"").trim(),h=String(w.get("company")||"").trim(),T=String(w.get("message")||"").trim(),S=[];if(F||S.push("your name"),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g)||S.push("a work email we can reply to"),S.length){y(`Add ${S.join(" and ")}, then send again.`,"error"),(F?f.elements.email:f.elements.name).focus();return}if(f.elements.consent&&!f.elements.consent.checked){y("Tick the consent box so we can reply, then send again.","error"),f.elements.consent.focus();return}if(f.dataset.endpoint){try{y("Sending\u2026");let Re=await fetch(f.dataset.endpoint,{method:"POST",body:w,headers:{Accept:"application/json"}});if(!Re.ok)throw new Error(String(Re.status));f.reset(),y("Received. We reply within two working days.","ok")}catch{y(`That did not go through. Write to ${x} and we will pick it up.`,"error")}return}let de=[`Name: ${F}`,`Company: ${h||"\u2014"}`,`Email: ${g}`];T&&de.push("","Your thoughts:",T);let Fe=`Scoping conversation${h?` \u2014 ${h}`:""}`;y(`Your email app should open with the request filled in. If it doesn\u2019t, write to ${x}.`,"ok"),window.location.href=`mailto:${x}?subject=${encodeURIComponent(Fe)}&body=${encodeURIComponent(de.join(`
`))}`})}function Ko(i){let f=i.querySelector("[data-ledger]");if(!f)return;if(Ue||!("IntersectionObserver"in window)){f.classList.add("is-run");return}let E=new IntersectionObserver(([x])=>{x.isIntersecting&&(f.classList.add("is-run"),E.disconnect())},{threshold:.3});E.observe(f)}function Qo(i){let f=Array.from(i.querySelectorAll(".h2, .v-title, .h-limits, .display-2, .tl-body h2")).filter(y=>!y.dataset.split&&y.children.length===0);if(Ue||!("IntersectionObserver"in window))return;let E=window.innerHeight,x=new IntersectionObserver(y=>{y.forEach(e=>{e.isIntersecting&&(e.target.classList.add("is-in"),x.unobserve(e.target))})},{rootMargin:"0px 0px -12% 0px"});f.forEach(y=>{let e=y.textContent.trim().split(/\s+/);if(y.dataset.split="1",y.setAttribute("aria-label",y.textContent.trim()),y.innerHTML=e.map((w,F)=>`<span class="rw" aria-hidden="true"><span style="--i:${F}">${w.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span></span>`).join(" "),y.classList.add("rise"),y.getBoundingClientRect().top<E*.9){let w=()=>ee.classList.contains("js-loading")?setTimeout(w,120):requestAnimationFrame(()=>y.classList.add("is-in"));w()}else x.observe(y)})}function Jo(i){let f=i.querySelector(".lg-toc");if(!f||!("IntersectionObserver"in window))return;let E=new Map(Array.from(f.querySelectorAll('a[href^="#"]')).map(e=>[e.getAttribute("href").slice(1),e])),x=new Set,y=new IntersectionObserver(e=>{e.forEach(F=>F.isIntersecting?x.add(F.target.id):x.delete(F.target.id));let w=Array.from(E.keys()).find(F=>x.has(F));w&&E.forEach((F,g)=>g===w?F.setAttribute("aria-current","true"):F.removeAttribute("aria-current"))},{rootMargin:"-20% 0px -55% 0px"});i.querySelectorAll(".lg-sec").forEach(e=>y.observe(e))}function Zo(i){let f=Array.from(i.querySelectorAll("[data-count]"));if(!f.length||Ue||!("IntersectionObserver"in window))return;let E=new IntersectionObserver(x=>{x.forEach(y=>{if(!y.isIntersecting)return;E.unobserve(y.target);let e=y.target,w=+e.dataset.count,F=performance.now(),g=h=>{let T=Math.min(1,(h-F)/1300);e.textContent=String(Math.round(w*(1-Math.pow(1-T,4)))),T<1&&requestAnimationFrame(g)};e.textContent="0",requestAnimationFrame(g)})},{threshold:.4});f.forEach(x=>E.observe(x))}function io(i=document){ro=Array.from(document.querySelectorAll("[data-tone]")),$o(i),Xo(i),Ko(i),Qo(i),Zo(i),Jo(i),document.querySelectorAll("[data-year]").forEach(f=>{f.textContent=String(new Date().getFullYear())}),ft()}io();document.addEventListener("keydown",i=>{if(i.key!=="ArrowLeft"&&i.key!=="ArrowRight"||i.defaultPrevented||i.altKey||i.ctrlKey||i.metaKey||i.shiftKey||i.target.closest&&i.target.closest("input, textarea, select, button, [contenteditable], .spec-scroll, .nav-links")||H&&H.classList.contains("is-open")||Ze&&!Ze.hidden)return;let f=document.querySelector(i.key==="ArrowRight"?'.pager a[rel="next"], .pager a[rel="first"]':'.pager a[rel="prev"]');f&&(i.preventDefault(),f.click())});(function(){if(!ee.classList.contains("js-loading"))return;let f=document.querySelector(".curtain");if(!f){ee.classList.remove("js-loading");return}let E=f.querySelector(".c-count"),x=f.querySelector(".c-bar i"),y=performance.now(),e=1250,w=F=>{let g=ee.classList.contains("scene-ready")||ee.classList.contains("no-webgl"),h=Math.min(1,(F-y)/e),T=g?h:Math.min(h,.86),S=Math.round(100*(1-Math.pow(1-T,2.2)));if(E.textContent=String(S).padStart(2,"0"),x.style.transform=`scaleX(${S/100})`,T<1){requestAnimationFrame(w);return}ee.classList.add("curtain-lift"),setTimeout(()=>ee.classList.remove("js-loading"),380),setTimeout(()=>ee.classList.remove("curtain-lift"),1100);try{sessionStorage.setItem("ws-seen","1")}catch{}};requestAnimationFrame(w)})();document.addEventListener("ws:stage",i=>{document.querySelectorAll(".scrub [data-stage-link]").forEach(f=>{+f.dataset.stageLink===i.detail?f.setAttribute("aria-current","step"):f.removeAttribute("aria-current")})});window.matchMedia("(hover: hover) and (pointer: fine)").matches&&!Ue&&(document.addEventListener("pointermove",i=>{let f=i.target.closest&&i.target.closest(".spot");if(f){let x=f.getBoundingClientRect();f.style.setProperty("--mx",`${i.clientX-x.left}px`),f.style.setProperty("--my",`${i.clientY-x.top}px`)}let E=i.target.closest&&i.target.closest('.btn-ember:not([type="submit"])');if(E){let x=E.getBoundingClientRect(),y=(i.clientX-(x.left+x.width/2))/x.width,e=(i.clientY-(x.top+x.height/2))/x.height;E.style.transform=`translate(${(y*8).toFixed(1)}px, ${(e*6).toFixed(1)}px)`}},{passive:!0}),document.addEventListener("pointerout",i=>{let f=i.target.closest&&i.target.closest(".btn-ember");f&&!f.contains(i.relatedTarget)&&(f.style.transform="")}));(function(){let f=()=>document.querySelectorAll("[data-clock]"),E;try{E=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return}let x=()=>f().forEach(y=>{y.textContent=`Hyderabad \xB7 ${E.format(new Date)} IST`});x(),setInterval(x,2e4)})();eo();if(no){let i=document.getElementById("page"),f=new Map(Array.from(document.querySelectorAll("template[data-route]")).map(h=>[h.dataset.route,h])),E=h=>h&&h.startsWith("#/")?h.slice(1).split("#")[0]:"/",x=h=>requestAnimationFrame(()=>{let T=h&&document.getElementById(h);T&&T.scrollIntoView({block:"start"})}),y="/",e=h=>{H.querySelectorAll(".nav-links > a[data-key]").forEach(T=>{let S=E(T.getAttribute("href"));S!=="/"&&h.startsWith(S)?T.setAttribute("aria-current","page"):T.removeAttribute("aria-current")}),fe&&fe.toggleAttribute("data-current",/^\/(services|verticals)\//.test(h))},w=(h,{scroll:T=!0}={})=>{let S=f.get(h)||f.get("/404/");y=f.has(h)?h:"/404/",i.replaceChildren(S.content.cloneNode(!0)),document.title=S.dataset.title,e(y),T&&(ee.style.scrollBehavior="auto",window.scrollTo(0,0),ee.style.scrollBehavior=""),io(i),document.dispatchEvent(new Event("ws:route"))},F=(h,T)=>{if(h===y){window.scrollTo({top:0,behavior:Ue?"auto":"smooth"});return}if(dt(!1),we(!1),y=f.has(h)?h:"/404/",T)try{history.pushState({route:h},"",`#${h}`)}catch{}w(h),!Ue&&i.animate&&i.animate([{opacity:0},{opacity:1}],{duration:380,easing:"cubic-bezier(0.2, 0.7, 0.1, 1)"})};document.addEventListener("click",h=>{let T=h.target.closest('a[href^="#"]');if(!T||h.defaultPrevented||h.metaKey||h.ctrlKey||h.shiftKey)return;let S=T.getAttribute("href");if(h.preventDefault(),S.startsWith("#/")){F(E(S),!0),x(S.slice(2).split("#")[1]);return}let de=S.length>1&&document.getElementById(S.slice(1));de&&de.scrollIntoView({behavior:Ue?"auto":"smooth",block:"start"})}),window.addEventListener("popstate",()=>F(E(location.hash),!1)),window.addEventListener("hashchange",()=>{let h=E(location.hash);h!==y&&F(h,!1)});let g=E(location.hash);g!=="/"?w(g,{scroll:!1}):e("/")}})();
