(()=>{function ao(){let i=document.getElementById("scene");if(!i)return;let f=document.documentElement,S=f.classList.contains("js-loading"),w=()=>window.innerWidth<860,b=w(),e=null;try{e=i.getContext("webgl2",{antialias:b,alpha:!1,depth:!0,stencil:!1,powerPreference:"high-performance"})}catch{e=null}if(!e){f.classList.add("no-webgl");return}let E=window.matchMedia("(prefers-reduced-motion: reduce)"),T=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],g={bg:T("#171412"),ivory:T("#ebe5d9"),plinth:T("#2a2521"),curve:T("#978b80"),cream:T("#f3eee6"),ember:T("#e5602f"),dot:T("#6a6058"),black:[.02,.016,.014]},p=(t,o,n)=>t+(o-t)*n,R=(t,o,n)=>Math.min(n,Math.max(o,t)),A=(t,o,n)=>{let r=R((n-t)/(o-t),0,1);return r*r*(3-2*r)},me=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Le=t=>1-Math.pow(1-t,3),_e=()=>new Float32Array(16);function fo(t,o,n,r,a){let c=1/Math.tan(o/2),s=1/(r-a);return t.fill(0),t[0]=c/n,t[5]=c,t[10]=(a+r)*s,t[11]=-1,t[14]=2*a*r*s,t}function mo(t,o,n,r){let a=o[0]-n[0],c=o[1]-n[1],s=o[2]-n[2],u=Math.hypot(a,c,s);a/=u,c/=u,s/=u;let x=r[1]*s-r[2]*c,L=r[2]*a-r[0]*s,m=r[0]*c-r[1]*a;u=Math.hypot(x,L,m),x/=u,L/=u,m/=u;let O=c*m-s*L,P=s*x-a*m,d=a*L-c*x;return t[0]=x,t[1]=O,t[2]=a,t[3]=0,t[4]=L,t[5]=P,t[6]=c,t[7]=0,t[8]=m,t[9]=d,t[10]=s,t[11]=0,t[12]=-(x*o[0]+L*o[1]+m*o[2]),t[13]=-(O*o[0]+P*o[1]+d*o[2]),t[14]=-(a*o[0]+c*o[1]+s*o[2]),t[15]=1,t}function se(t,o,n,r,a,c,s,u){let x=Math.cos(a),L=Math.sin(a);return t.fill(0),t[0]=x*c,t[2]=-L*c,t[5]=s,t[8]=L*u,t[10]=x*u,t[12]=o,t[13]=n,t[14]=r,t[15]=1,t}let ho=`#version 300 es
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
}`,vo=`#version 300 es
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
}`,po=`#version 300 es
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
}`,go=`#version 300 es
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
}`,yo=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in float aT;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out float vDepth; out float vT; out float vX;
void main(){
  vec4 w = uModel * vec4(aPos, 1.0);
  vec4 v = uView * w;
  vDepth = -v.z; vT = aT; vX = w.x;
  gl_Position = uProj * v;
}`,bo=`#version 300 es
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
}`,xo=`#version 300 es
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
}`,wo=`#version 300 es
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
}`,Eo=`#version 300 es
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
}`,So=`#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec2 aUv;
uniform mat4 uProj; uniform mat4 uView; uniform mat4 uModel;
out vec2 vUv; out float vDepth;
void main(){
  vec4 v = uView * uModel * vec4(aPos, 1.0);
  vUv = aUv; vDepth = -v.z;
  gl_Position = uProj * v;
}`,Fo=`#version 300 es
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
void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`,Mo=`#version 300 es
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
}`,Ro=`#version 300 es
precision highp float;
in vec2 vUv; uniform sampler2D uTex; uniform vec2 uDir;
out vec4 o;
void main(){
  vec3 c = texture(uTex, vUv).rgb * 0.2270270270;
  c += (texture(uTex, vUv + uDir * 1.3846153846).rgb + texture(uTex, vUv - uDir * 1.3846153846).rgb) * 0.3162162162;
  c += (texture(uTex, vUv + uDir * 3.2307692308).rgb + texture(uTex, vUv - uDir * 3.2307692308).rgb) * 0.0702702703;
  o = vec4(c, 1.0);
}`,To=`#version 300 es
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
}`;function Rt(t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"shader");return n}function pe(t,o){let n=e.createProgram();if(e.attachShader(n,Rt(e.VERTEX_SHADER,t)),e.attachShader(n,Rt(e.FRAGMENT_SHADER,o)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n)||"link");let r={},a=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let c=0;c<a;c++){let s=e.getActiveUniform(n,c);r[s.name]=e.getUniformLocation(n,s.name)}return{p:n,u:r}}let Me=[2.4,.03,1.56],Be=5,he=[{id:"SYS-01",name:"ERP",note:"orders \xB7 dispatch",a:[-4.4,.7,-1.6],ay:.28,b:[-2.62,0,-.89]},{id:"SYS-02",name:"Ledger",note:"books \xB7 GST returns",a:[.3,1.5,-3.8],ay:-.16,b:[0,0,-.89]},{id:"SYS-03",name:"Stock",note:"inventory \xB7 3 sites",a:[4.6,.35,-1.1],ay:.38,b:[2.62,0,-.89]},{id:"SYS-04",name:"WhatsApp",note:"vendors \xB7 customers",a:[3.5,1.15,3],ay:-.32,b:[2.62,0,.89]},{id:"SYS-05",name:"Sheets",note:"final_v2.xlsx",a:[-.6,-.05,3.4],ay:.18,b:[0,0,.89]},{id:"SYS-06",name:"Bank",note:"receipts \xB7 payments",a:[-4.7,1.25,2.2],ay:-.22,b:[-2.62,0,.89]}],$=[[0,1,1],[1,2,.25],[2,3,1],[3,4,.25],[4,5,1],[5,0,.25],[0,2,.2],[1,4,1],[5,3,.2]],ne=[0,2,4,7],ce=$.length,W=64,X=-1.4,et=[{eye:[17.7,13,22.2],tgt:[0,.3,0],dx:.56,leak:.45,find:0,carry:0,ground:0,flow:1},{eye:[14.5,5.4,17.5],tgt:[0,.5,0],dx:.6,leak:.95,find:0,carry:0,ground:0,flow:.7},{eye:[-12.65,10.45,14.85],tgt:[0,.4,0],dx:.5,leak:.6,find:1,carry:0,ground:0,flow:.5},{eye:[1.98,24.4,15.8],tgt:[0,-.2,.4],dx:.5,leak:0,find:0,carry:1,ground:0,flow:1.7},{eye:[10.45,3.96,11.55],tgt:[0,-.2,0],dx:.56,leak:0,find:0,carry:.3,ground:1,flow:1},{eye:[13.2,11,16.5],tgt:[0,-.2,0],dx:.48,leak:0,find:0,carry:.7,ground:1,flow:1.2},{eye:[-14.3,11,18.7],tgt:[0,-.3,0],dx:.6,leak:0,find:0,carry:.5,ground:1,flow:1}],Tt=["Six systems, each individually correct.","Value leaving between systems \u2014 not inside any one of them.","Vertical I \u2014 the gaps located and put on record.","Vertical II \u2014 work carried end to end, nothing dropped.","Vertical III \u2014 the record layer everything stands on.","Diagnose, ground, then automate.","Measured against the baseline agreed at the start."],Lt=["Status \xB7 0 errors \xB7 every record valid","Correct inside \xB7 value leaving at its edges","Correct inside \xB7 gaps now on record","Work carried in and out \xB7 every step logged","Standing on the shared record layer","Grounded first \xB7 then automated","Measured against the agreed baseline"];function ae(t,o,n){let r=e.createVertexArray(),a=e.createBuffer();e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,o,n||e.STATIC_DRAW);let c=t.reduce((u,x)=>u+x,0),s=0;return t.forEach((u,x)=>{e.enableVertexAttribArray(x),e.vertexAttribPointer(x,u,e.FLOAT,!1,c*4,s*4),s+=u}),e.bindVertexArray(null),{v:r,b:a,data:o}}function Lo(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],o=[],n=(r,a,c,s,u)=>[0,1,2].map(x=>r[x]*.5+a[x]*s*.5+c[x]*u*.5);return t.forEach(([r,a,c])=>{[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([u,x])=>{o.push(...n(r,a,c,u,x),...r,0,0)})}),new Float32Array(o)}function _o(){let t=[-.5,.5],o=[];for(let n of t)for(let r of t)o.push(-.5,n,r,.5,.5,n,r,.5),o.push(n,-.5,r,.5,n,.5,r,.5),o.push(n,r,-.5,.5,n,r,.5,.5);return new Float32Array(o)}function Po(t,o){let n=[];for(let a=1;a<t;a++){let c=-.5+a/t;n.push(c,.52,-.5,.5,c,.52,.5,.5)}for(let a=1;a<o;a++){let c=-.5+a/o;n.push(-.5,.52,c,.5,.5,.52,c,.5)}return new Float32Array(n)}function Co(){let t=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]],o=[];return t.forEach(([n,r])=>o.push(n,0,r,n+.5,r+.5)),new Float32Array(o)}function Do(){let t=[[0,-.5],[1,-.5],[1,.5],[0,-.5],[1,.5],[0,.5]],o=[];return t.forEach(([n,r])=>o.push(0,n,r,r+.5,n)),new Float32Array(o)}function Io(){let t=[];for(let r=-22;r<=22+1e-6;r+=.55)for(let a=-22;a<=22+1e-6;a+=.55){let c=Math.hypot(r,a),s=.75*(1-A(6,21,c));s<=.01||t.push(r,X,a,g.dot[0],g.dot[1],g.dot[2],s,.034)}return new Float32Array(t)}let No=()=>ae([2],new Float32Array([-1,-1,3,-1,-1,3])),v,C,j=b?760:1600,_t=ce+ne.length,Pt=ce+ne.length*3;try{v={mesh:pe(ho,vo),line:pe(yo,bo),point:pe(Ao,Eo),decal:pe(So,Fo),glass:pe(po,go),ribbon:pe(xo,wo)},C={box:ae([3,3,2],Lo()),edges:ae([3,1],_o()),plinthGrid:ae([3,1],Po(19,9)),floor:ae([3,2],Co()),sheet:ae([3,2],Do()),dots:ae([3,4,1],Io()),curves:ae([3,1],new Float32Array(ce*W*4),e.DYNAMIC_DRAW),ribbons:ae([3,3,3,1,1],new Float32Array(ce*W*2*11),e.DYNAMIC_DRAW),particles:ae([3,4,1],new Float32Array((j+_t)*8),e.DYNAMIC_DRAW),markers:ae([3,4,1],new Float32Array(Pt*8),e.DYNAMIC_DRAW),pins:ae([3,1],new Float32Array((ne.length*2+2)*4),e.DYNAMIC_DRAW)},C.dots.count=C.dots.data.length/8}catch(t){console.warn("[scene] WebGL init failed:",t),f.classList.add("no-webgl");return}let l={on:!1,w:0,h:0};function ko(){if(!b)try{l.hdr=!!e.getExtension("EXT_color_buffer_float"),l.fmt=l.hdr?e.RGBA16F:e.RGBA8,l.type=l.hdr?e.HALF_FLOAT:e.UNSIGNED_BYTE,l.samples=Math.min(4,e.getParameter(e.MAX_SAMPLES)||0),l.bright=pe(ht,Mo),l.blur=pe(ht,Ro),l.comp=pe(ht,To),l.tri=No(),l.on=!0}catch(t){console.warn("[scene] post-processing off:",t),l.on=!1}}function Uo(t,o){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,l.fmt,t,o,0,e.RGBA,l.type,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}function He(t,o,n){let r={w:t,h:o,tex:Uo(t,o),fbo:e.createFramebuffer()};return e.bindFramebuffer(e.FRAMEBUFFER,r.fbo),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r.tex,0),n&&(r.depth=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,r.depth)),r.ok=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,r}function Bo(t){t&&(e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo),t.depth&&e.deleteRenderbuffer(t.depth))}function Oo(t,o){if(!l.on||l.w===t&&l.h===o)return;l.w=t,l.h=o,[l.scene,l.h1,l.h2,l.q1,l.q2].forEach(Bo),l.ms&&(e.deleteFramebuffer(l.ms.fbo),e.deleteRenderbuffer(l.ms.color),e.deleteRenderbuffer(l.ms.depth),l.ms=null),l.scene=He(t,o,l.samples===0);let n=Math.max(1,t>>1),r=Math.max(1,o>>1),a=Math.max(1,t>>3),c=Math.max(1,o>>3);l.h1=He(n,r),l.h2=He(n,r),l.q1=He(a,c),l.q2=He(a,c);let s=l.scene.ok&&l.h1.ok&&l.h2.ok&&l.q1.ok&&l.q2.ok;if(s&&l.samples>0){let u={fbo:e.createFramebuffer(),color:e.createRenderbuffer(),depth:e.createRenderbuffer()};e.bindFramebuffer(e.FRAMEBUFFER,u.fbo),e.bindRenderbuffer(e.RENDERBUFFER,u.color),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,l.fmt,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.color),e.bindRenderbuffer(e.RENDERBUFFER,u.depth),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,u.depth),s=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,l.ms=u}e.bindFramebuffer(e.FRAMEBUFFER,null),s||(console.warn("[scene] render targets incomplete; drawing direct"),l.on=!1)}ko();let vt=new Uint8Array(j),Re=new Uint8Array(j),tt=new Float32Array(j),Ct=new Float32Array(j),ot=new Float32Array(j),nt=new Float32Array(j),pt=new Float32Array(j),re=new Float32Array(j*3),le=new Float32Array(j*3);for(let t=0;t<j;t++)vt[t]=t%ce,tt[t]=Math.random(),Ct[t]=.09+Math.random()*.06,Re[t]=Math.random()<.45*$[vt[t]][2]?1:0,ot[t]=.38+Math.random()*.24;let ge=[],ve=-1,at=null;function rt(){ge=Array.from(document.querySelectorAll("[data-stage]")).map(n=>({i:+n.dataset.stage,top:n.getBoundingClientRect().top+window.scrollY})).sort((n,r)=>n.top-r.top);let t=document.querySelector("[data-focus]");ve=t?+t.dataset.focus:-1;let o=document.querySelector("[data-caption]");at=o?{stage:+o.dataset.stage,text:o.dataset.caption}:null}function gt(){if(!ge.length)return 0;let t=window.scrollY+window.innerHeight*.5,o=0;for(let c=0;c<ge.length;c++)ge[c].top<=t&&(o=c);if(o>=ge.length-1||t<ge[0].top)return ge[o].i;let n=ge[o],r=ge[o+1],a=(t-n.top)/Math.max(1,r.top-n.top);return n.i+(r.i-n.i)*A(.55,1,a)}let qo=["dx","leak","find","carry","ground","flow"];function Dt(t,o){let n=t[0]-o[0],r=t[1]-o[1],a=t[2]-o[2],c=Math.hypot(n,r,a)||1;return[c,Math.atan2(n,a),Math.asin(R(r/c,-1,1))]}function Ho(t,o,n){let r=o-t;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;return t+r*n}function it(t,o,n){let r={};for(let L of qo)r[L]=p(t[L],o[L],n);if(r.tgt=[0,1,2].map(L=>p(t.tgt[L],o.tgt[L],n)),n<=0)return r.eye=t.eye.slice(),r;if(n>=1)return r.eye=o.eye.slice(),r;let a=Dt(t.eye,t.tgt),c=Dt(o.eye,o.tgt),s=Math.exp(p(Math.log(a[0]),Math.log(c[0]),n)),u=Ho(a[1],c[1],n),x=p(a[2],c[2],n);return r.eye=[r.tgt[0]+s*Math.cos(x)*Math.sin(u),r.tgt[1]+s*Math.sin(x),r.tgt[2]+s*Math.cos(x)*Math.cos(u)],r}let It=t=>it(t,t,0);function Nt(t){let o=R(Math.floor(t),0,et.length-1),n=Math.min(o+1,et.length-1);return it(et[o],et[n],R(t-o,0,1))}let K=he.map(()=>({p:[0,0,0],base:0,ry:0,hov:0,foc:0,pulse:0,gap:.085,h:.37,top:0})),kt=new Float32Array($.length),Oe=[];for(let t=0;t<he.length;t++)for(let o=0;o<Be;o++)Oe.push({i:t,k:o,x:0,y:0,z:0,ry:0,d:0});let Ut=5.5,k=C.curves.data;function Vo(t){for(let o=0;o<ce;o++){let n=K[$[o][0]],r=K[$[o][1]],a=n.p,c=r.p,s=[a[0],n.top+.02,a[2]],u=[c[0],r.top+.02,c[2]],x=u[0]-s[0],L=u[1]-s[1],m=u[2]-s[2],O=Math.hypot(x,L,m),P=p(1.1+.17*O,.6+.13*O,t),d=[s[0]+x*.14,s[1]+P,s[2]+m*.14],F=[u[0]-x*.14,u[1]+P,u[2]-m*.14];for(let _=0;_<W;_++){let I=_/(W-1),G=1-I,Ae=G*G*G,fe=3*G*G*I,Te=3*G*I*I,Ee=I*I*I,qe=(o*W+_)*4;k[qe]=Ae*s[0]+fe*d[0]+Te*F[0]+Ee*u[0],k[qe+1]=Ae*s[1]+fe*d[1]+Te*F[1]+Ee*u[1],k[qe+2]=Ae*s[2]+fe*d[2]+Te*F[2]+Ee*u[2],k[qe+3]=I}}}function zo(){let t=C.ribbons.data;for(let o=0;o<ce;o++)for(let n=0;n<W;n++){let r=(o*W+n)*4,a=(o*W+Math.max(0,n-1))*4,c=(o*W+Math.min(W-1,n+1))*4;for(let s=0;s<2;s++){let u=((o*W+n)*2+s)*11;t[u]=k[r],t[u+1]=k[r+1],t[u+2]=k[r+2],t[u+3]=k[a],t[u+4]=k[a+1],t[u+5]=k[a+2],t[u+6]=k[c],t[u+7]=k[c+1],t[u+8]=k[c+2],t[u+9]=s?1:-1,t[u+10]=k[r+3]}}}function Ve(t,o,n){let r=R(o,0,1)*(W-1),a=Math.min(W-2,Math.floor(r)),c=r-a,s=(t*W+a)*4,u=s+4;return n[0]=k[s]+(k[u]-k[s])*c,n[1]=k[s+1]+(k[u+1]-k[s+1])*c,n[2]=k[s+2]+(k[u+2]-k[s+2])*c,n}let Wo=document.getElementById("fig-no"),Bt=document.getElementById("fig-text"),st=Array.from(document.querySelectorAll(".findings .tag")),yt=-1,Q=document.querySelector(".inspect");Q||(Q=document.createElement("div"),Q.className="inspect",Q.setAttribute("aria-hidden","true"),Q.innerHTML='<div class="inspect-in"><p class="i-id"></p><p class="i-name"></p><p class="i-note"></p><p class="i-status"></p></div>',document.body.appendChild(Q));let Yo=Q.querySelector(".i-id"),jo=Q.querySelector(".i-name"),Go=Q.querySelector(".i-note"),$o=Q.querySelector(".i-status"),Ot=-1,qt=-1,Pe=document.querySelector(".sys-tags");Pe||(Pe=document.createElement("div"),Pe.className="sys-tags",Pe.setAttribute("aria-hidden","true"),Pe.innerHTML=he.map((t,o)=>`<div class="sys-tag"><span><b>${String(o+1).padStart(2,"0")}</b>${t.name}</span></div>`).join(""),document.body.appendChild(Pe));let ct=Array.from(Pe.children),Ht=ct.map(()=>-1),ye=_e(),J=_e(),U=_e(),ee=0,be=0,ze=0,Vt=0,zt=0,bt=1,te=E.matches||!S?1:0,Wt=2.6,We=!1,Ce=E.matches?1:0,ue=null,Yt=-1,N={x:0,y:0,sx:0,sy:0,px:-1,py:-1,active:!1};window.addEventListener("pointermove",t=>{N.x=t.clientX/window.innerWidth*2-1,N.y=t.clientY/window.innerHeight*2-1,N.px=t.clientX,N.py=t.clientY,N.active=t.pointerType==="mouse"},{passive:!0}),window.addEventListener("mouseout",t=>{t.relatedTarget||(N.active=!1)}),window.addEventListener("blur",()=>{N.active=!1});let jt=[1.75,1.35,1],Z={acc:0,n:0,slow:0,level:0};function Xo(t){if(Z.level>=jt.length-1||t<=0||t>.25||(Z.acc+=t,Z.n++,Z.n<90))return;let o=Z.acc/Z.n;Z.acc=0,Z.n=0,Z.slow=o>.026?Z.slow+1:0,Z.slow>=2&&(Z.level++,Z.slow=0)}function Ko(){let t=Math.min(window.devicePixelRatio||1,w()?1.5:jt[Z.level]),o=Math.max(1,Math.round(i.clientWidth*t)),n=Math.max(1,Math.round(i.clientHeight*t));(i.width!==o||i.height!==n)&&(i.width=o,i.height=n),Oo(o,n)}let z=[0,0,0],xt=[0,0,0],wt=ne.map(()=>[0,0,0]),De=Nt(0),Ie=[0,0,0],At=0;function lt(t){let o=J[0]*t[0]+J[4]*t[1]+J[8]*t[2]+J[12],n=J[1]*t[0]+J[5]*t[1]+J[9]*t[2]+J[13],r=J[2]*t[0]+J[6]*t[1]+J[10]*t[2]+J[14],a=ye[0]*o+ye[8]*r,c=ye[5]*n+ye[9]*r,s=-r;return s<.1?null:[(a/s*.5+.5)*i.clientWidth,(1-(c/s*.5+.5))*i.clientHeight,s]}function Qo(){if(!N.active||w()||te<.9||N.px<i.clientWidth*.42)return-1;let t=-1,o=1e9;for(let n=0;n<he.length;n++){let r=K[n],a=lt([r.p[0],r.base-.09+r.h*.5,r.p[2]]);if(!a)continue;let c=ye[5]*i.clientHeight*.5*(n===Yt?1.45:1.15)/a[2],s=Math.hypot(N.px-a[0],(N.py-a[1])*1.4);s<c&&s<o&&(o=s,t=n)}return t}function Ye(t){let o=E.matches;be+=t*(o?.2:1);let n=!We&&!f.classList.contains("js-loading");n&&te<1&&(te=Math.min(1,te+t/Wt)),n&&Ce<1&&(Ce=Math.min(1,Ce+t/1.6)),Vt%30===0&&rt(),Vt++;let r=gt();ee+=(r-ee)*(1-Math.exp(-t*(o?12:2.4))),Math.abs(r-ee)<5e-4&&(ee=r);let a=Nt(ee);ue&&!We?(ue.t=Math.min(1,ue.t+t/1.5),a=it(ue.from,a,me(ue.t)),ue.t>=1&&(ue=null)):ue&&(a=it(ue.from,a,0)),De=a;let c=w(),s=We?-1:Qo();Yt=s;let u=me(R(a.ground,0,1));for(let h=0;h<he.length;h++){let M=he[h],y=K[h];y.hov+=((s===h?1:0)-y.hov)*(1-Math.exp(-t*9)),y.foc+=((ve===h?1:0)-y.foc)*(1-Math.exp(-t*3));let B=Le(R(te*1.55-h*.09,0,1)),D=y.hov*.32+y.foc*.22*(1-u*.6);y.p[0]=p(M.a[0],M.b[0],u),y.base=p(M.a[1],M.b[1],u),y.p[1]=y.base+D+(1-B)*Ut,y.p[2]=p(M.a[2],M.b[2],u),y.ry=p(M.ay,0,u)+(1-B)*.5*(h%2?1:-1),y.pulse=Math.max(0,y.pulse-t*1.3);let ie=p(.085+y.hov*.14+(1-B)*.12,.05+y.hov*.06,u);y.gap+=(ie-y.gap)*(1-Math.exp(-t*6)),y.h=(Be-1)*y.gap+Me[1],y.top=y.p[1]-.09+y.h;for(let q=0;q<Be;q++){let Y=Oe[h*Be+q],H=(1-u)*a.leak;Y.x=y.p[0]+H*.07*Math.sin(q*2.1+h*1.3),Y.z=y.p[2]+H*.055*Math.cos(q*1.7+h*.9),Y.y=y.p[1]-.09+Me[1]*.5+q*y.gap,Y.ry=y.ry+H*.05*Math.sin(q*1.3+h)}}Vo(u),zo();let x=a.flow*(o?.25:1),L=a.leak,m=C.particles.data,O=A(.45,.95,te);for(let h=0;h<j;h++){let M=vt[h],y=h*8;if(Re[h]!==2){let q=tt[h],Y=q+Ct[h]*t*x;if(Y>=1?(Y-=1,Re[h]=Math.random()<L*$[M][2]?1:0,ot[h]=.38+Math.random()*.24):Re[h]===1&&L<.02&&(Re[h]=0),tt[h]=Y,Re[h]===1&&q<ot[h]&&Y>=ot[h]){Ve(M,Y,z),Ve(M,Math.min(1,Y+.02),xt);let H=xt[0]-z[0],Se=xt[2]-z[2],oo=Math.hypot(H,Se)||1;H/=oo,Se/=oo;let no=(Math.random()-.5)*1.8;le[h*3]=H*.45-Se*no,le[h*3+1]=.1+Math.random()*.5,le[h*3+2]=Se*.45+H*no,re[h*3]=z[0],re[h*3+1]=z[1],re[h*3+2]=z[2],nt[h]=0,pt[h]=2.8+Math.random()*1.2,Re[h]=2}else{Ve(M,Y,z);let H=A(0,.07,Y)*(1-A(.93,1,Y)),Se=ve>=0&&($[M][0]===ve||$[M][1]===ve)?K[ve].foc:0;m[y]=z[0],m[y+1]=z[1],m[y+2]=z[2],m[y+3]=p(g.cream[0],1,Se*.3),m[y+4]=p(g.cream[1],.8,Se*.3),m[y+5]=p(g.cream[2],.65,Se*.3),m[y+6]=H*(.62+.38*a.carry+Se*.3)*O,m[y+7]=.05+.014*a.carry;continue}}let B=t*(o?.3:1);nt[h]+=B;let D=h*3;if(re[D+1]>X+.02){le[D+1]-=1.15*B;let q=Math.pow(.55,B);le[D]*=q,le[D+2]*=q,re[D]+=le[D]*B,re[D+1]+=le[D+1]*B,re[D+2]+=le[D+2]*B,re[D+1]<=X+.02&&(re[D+1]=X+.02,le[D]*=.15,le[D+2]*=.15)}if(nt[h]>=pt[h]){Re[h]=0,tt[h]=0,m[y+6]=0;continue}let ie=1-nt[h]/pt[h];m[y]=re[D],m[y+1]=re[D+1],m[y+2]=re[D+2],m[y+3]=g.ember[0]*1.15,m[y+4]=g.ember[1]*1.1,m[y+5]=g.ember[2],m[y+6]=Math.pow(ie,1.2)*.95*O,m[y+7]=.072}zt+=t*.1*x;let P=C.markers.data;for(let h=0;h<ce;h++){let M=(zt+h*.37)%1;kt[h]<.93&&M>=.93&&a.carry>.05&&(K[$[h][1]].pulse=1),kt[h]=M,Ve(h,M,z);let y=A(0,.08,M)*(1-A(.92,1,M)),B=(j+h)*8;m[B]=z[0],m[B+1]=z[1],m[B+2]=z[2],m[B+3]=1.18,m[B+4]=1.12,m[B+5]=1.06,m[B+6]=a.carry*y*O,m[B+7]=.14;let D=h*8;P[D]=z[0],P[D+1]=z[1],P[D+2]=z[2],P[D+3]=g.cream[0],P[D+4]=g.cream[1],P[D+5]=g.cream[2],P[D+6]=a.carry*y*.55*O,P[D+7]=.46}let d=C.pins.data;for(let h=0;h<ne.length;h++){let M=Ve(ne[h],.5,wt[h]),y=(j+ce+h)*8;m[y]=M[0],m[y+1]=M[1],m[y+2]=M[2],m[y+3]=g.ember[0]*1.5,m[y+4]=g.ember[1]*1.4,m[y+5]=g.ember[2]*1.2,m[y+6]=a.find*O,m[y+7]=.12;let B=o?.5:(be*.5+h*.25)%1;[[M[0],M[1],M[2],a.find,.62+(o?0:.05*Math.sin(be*2.4+h))],[M[0],M[1],M[2],a.find*(1-B)*.8,.6+B*1.6],[M[0],X+.01,M[2],a.find*.6,.55]].forEach((q,Y)=>{let H=(ce+h*3+Y)*8;P[H]=q[0],P[H+1]=q[1],P[H+2]=q[2],P[H+3]=g.ember[0],P[H+4]=g.ember[1],P[H+5]=g.ember[2],P[H+6]=q[3]*O,P[H+7]=q[4]});let ie=h*8;d[ie]=M[0],d[ie+1]=M[1]-.12,d[ie+2]=M[2],d[ie+3]=.5,d[ie+4]=M[0],d[ie+5]=X+.01,d[ie+6]=M[2],d[ie+7]=.5}let F=o?0:-7.5+be/3.8%1*15,_=ne.length*8;d[_]=F,d[_+1]=X+.01,d[_+2]=-5,d[_+3]=.5,d[_+4]=F,d[_+5]=X+.01,d[_+6]=5,d[_+7]=.5,a.scanX=F,a.sweep=o?0:-5.2+be/5.5%1*10.4,At+=(L*.55+a.find*.35-At)*(1-Math.exp(-t*2)),N.sx+=(N.x-N.sx)*(1-Math.exp(-t*2)),N.sy+=(N.y-N.sy)*(1-Math.exp(-t*2));let I=a.tgt.slice(),G=a.eye[0]-I[0],Ae=a.eye[1]-I[1],fe=a.eye[2]-I[2],Te=1+(1-Le(te))*.28+(1-Le(Ce))*.045,Ee=[.67,.888,.947,.752,1.269,.876,.807],qe=window.innerWidth/Math.max(1,window.innerHeight),Jt=1;if(window.innerWidth<1060){let h=R(Math.floor(ee),0,Ee.length-1),M=R(ee-h,0,1),y=Ee[h]+(Ee[Math.min(h+1,Ee.length-1)]-Ee[h])*M;Jt=R(y/qe,.45,3.4)}let ft=Jt*Te;bt=ft,G*=ft,Ae*=ft,fe*=ft;let Zt=o?0:Math.sin(be*.07)*.07+N.sx*.05+(1-Le(te))*.35+(1-Le(Ce))*.05,eo=Math.cos(Zt),to=Math.sin(Zt);Ie=[I[0]+G*eo+fe*to,I[1]+Ae-N.sy*.5,I[2]-G*to+fe*eo];let ke=R(Math.round(ee),0,Tt.length-1);ke!==yt&&Bt&&(yt=ke,Wo.textContent="Fig. "+String(ke+1).padStart(2,"0"),Bt.textContent=at&&at.stage===ke?at.text:Tt[ke],document.dispatchEvent(new CustomEvent("ws:stage",{detail:ke}))),a.hovIdx=s,a.ci=ke}function xe(t){e.useProgram(t.p),t.u.uProj&&e.uniformMatrix4fv(t.u.uProj,!1,ye),t.u.uView&&e.uniformMatrix4fv(t.u.uView,!1,J),t.u.uFog&&e.uniform3fv(t.u.uFog,g.bg),t.u.uFogRange&&e.uniform2f(t.u.uFogRange,17*bt,54*bt),t.u.uEmber&&e.uniform3fv(t.u.uEmber,g.ember)}function je(t,o,n,r,a,c){let s=v.line.u;e.uniform3fv(s.uColor,t),e.uniform1f(s.uAlpha,o),e.uniform1f(s.uDash,n||0),e.uniform1f(s.uEnds,r||0),e.uniform1f(s.uDraw,a===void 0?2:a),e.uniform1f(s.uSweepAmt,c||0)}function Gt(t,o){let n=De;e.viewport(0,0,t,o),fo(ye,34*Math.PI/180,t/o,.1,140),ye[8]-=w()?0:n.dx,mo(J,Ie,n.tgt,[0,1,0]);let r=o*.5*ye[5],a=A(0,.5,te);e.clearColor(g.bg[0],g.bg[1],g.bg[2],1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.enable(e.BLEND);let c=me(R(n.ground,0,1));xe(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanX,n.scanX||0),e.uniform1f(v.point.u.uScanAmt,n.find*.9),e.uniform1f(v.point.u.uFade,a),e.uniform1f(v.point.u.uGain,1),e.uniform1i(v.point.u.uMode,0),e.depthMask(!1),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(C.dots.v),e.drawArrays(e.POINTS,0,C.dots.count),xe(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.uniform1i(v.decal.u.uMode,1),e.uniform3fv(v.decal.u.uColor,g.black),e.bindVertexArray(C.floor.v);for(let d=0;d<he.length;d++){let F=K[d],_=F.p[1]-X;se(U,F.p[0],X+.005,F.p[2],F.ry,3.4+_*.4,1,2.4+_*.3),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,.78*(1-c)/(1+_*.35)*a),e.drawArrays(e.TRIANGLES,0,6)}c>.01&&(se(U,0,X+.005,0,0,12.5,1,7.5),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,.8*c),e.drawArrays(e.TRIANGLES,0,6)),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.cream),se(U,0,X+.002,.2,0,17,1,12),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,.035*a),e.drawArrays(e.TRIANGLES,0,6),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.ember);for(let d=0;d<ne.length;d++){let F=wt[d];se(U,F[0],X+.01,F[2],0,3.2,1,3.2),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,(n.leak*$[ne[d]][2]*.16+n.find*.12)*a),e.drawArrays(e.TRIANGLES,0,6)}e.depthMask(!0),xe(v.mesh),e.uniform3fv(v.mesh.u.uCam,Ie),e.uniform1f(v.mesh.u.uBounce,0),e.uniform1f(v.mesh.u.uHi,0),e.uniform1f(v.mesh.u.uSheets,0);let s=A(0,.5,c),u=p(-3.4,-.37,1-Math.pow(1-c,3)),x=[8.44,.5,4.14];s>.005&&(e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),se(U,0,u,0,0,x[0],x[1],x[2]),e.uniformMatrix4fv(v.mesh.u.uModel,!1,U),e.uniform3fv(v.mesh.u.uColor,g.plinth),e.uniform1f(v.mesh.u.uAlpha,s),e.uniform1f(v.mesh.u.uUseTex,0),e.bindVertexArray(C.box.v),e.drawArrays(e.TRIANGLES,0,36));for(let d of Oe){let F=K[d.i];d.d=(F.p[0]-Ie[0])**2+(F.p[1]-Ie[1])**2+(F.p[2]-Ie[2])**2}Oe.sort((d,F)=>F.d-d.d||d.k-F.k),xe(v.glass),e.uniform3fv(v.glass.u.uCam,Ie),e.uniform3fv(v.glass.u.uCream,g.cream),e.uniform1f(v.glass.u.uAlpha,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindVertexArray(C.box.v);let L=R(n.leak*.7+n.find,0,1)*(1-c);for(let d of Oe){let F=K[d.i],_=d.k===Be-1;se(U,d.x,d.y,d.z,d.ry,Me[0],Me[1],Me[2]),e.uniformMatrix4fv(v.glass.u.uModel,!1,U),e.uniform1f(v.glass.u.uSeed,d.i+1+d.k*.37),e.uniform1f(v.glass.u.uLevel,_?1:.3+.45*F.hov),e.uniform1f(v.glass.u.uHi,Math.max(F.hov,F.foc*.8)),e.uniform1f(v.glass.u.uGlow,R(F.pulse*n.carry+F.foc*.45+F.hov*.55+n.find*.15,0,1.4)),e.uniform1f(v.glass.u.uBad,L),e.uniform1f(v.glass.u.uBounce,d.k===0?At*(1-c):0),e.drawArrays(e.TRIANGLES,0,36)}e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.CULL_FACE),xe(v.line),e.uniform1f(v.line.u.uTime,be),e.uniform1f(v.line.u.uSweep,n.sweep||0),e.depthMask(!1),e.blendFunc(e.SRC_ALPHA,e.ONE),e.bindVertexArray(C.edges.v);for(let d of Oe){let F=K[d.i],_=Math.max(F.hov,F.foc*.85),I=d.k===Be-1?1:.4;se(U,d.x,d.y,d.z,d.ry,Me[0],Me[1],Me[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,U),je(_>.02?[p(g.cream[0],g.ember[0],_),p(g.cream[1],g.ember[1],_),p(g.cream[2],g.ember[2],_)]:g.cream,I*(.75+.35*F.pulse*n.carry)+_*.35),e.drawArrays(e.LINES,0,24)}e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),s>.005&&(se(U,0,u,0,0,x[0],x[1],x[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,U),je(g.ivory,.26*s),e.drawArrays(e.LINES,0,24),e.bindVertexArray(C.plinthGrid.v),je(g.ivory,.09*s,0,0,2,.9*s),e.drawArrays(e.LINES,0,C.plinthGrid.data.length/4)),se(U,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,U),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),xe(v.ribbon);let m=v.ribbon.u,O=t/Math.max(1,i.clientWidth),P=(.75+.35*n.carry)*O;e.uniform2f(m.uHalf,t*.5,o*.5),e.uniform1f(m.uWidth,P),e.uniform1f(m.uFeather,R(1.3/Math.max(P,.5),.2,1)),e.uniform1f(m.uTime,be),e.uniform1f(m.uDash,n.carry),e.uniform1f(m.uEnds,1),e.uniform1f(m.uDraw,A(.2,.9,te)*1.02),e.bindVertexArray(C.ribbons.v),e.bindBuffer(e.ARRAY_BUFFER,C.ribbons.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.ribbons.data);for(let d=0;d<ce;d++){let F=ve>=0&&($[d][0]===ve||$[d][1]===ve)?K[ve].foc:0,_=n.hovIdx>=0&&($[d][0]===n.hovIdx||$[d][1]===n.hovIdx)?K[n.hovIdx].hov:0,I=Math.max(F,_),G=I>.01?[p(g.curve[0],g.ember[0],I*.7),p(g.curve[1],g.ember[1],I*.7),p(g.curve[2],g.ember[2],I*.7)]:g.curve;e.uniform3fv(m.uColor,G),e.uniform1f(m.uAlpha,.3+.22*n.carry+.06*n.find+I*.35),e.drawArrays(e.TRIANGLE_STRIP,d*W*2,W*2)}xe(v.line),se(U,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,U),n.find>.01&&(e.bindVertexArray(C.pins.v),e.bindBuffer(e.ARRAY_BUFFER,C.pins.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.pins.data),je(g.ember,.5*n.find),e.drawArrays(e.LINES,0,ne.length*2),je(g.ember,.85*n.find),e.drawArrays(e.LINES,ne.length*2,2),xe(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform1i(v.decal.u.uMode,0),e.uniform3fv(v.decal.u.uColor,g.ember),e.uniform1f(v.decal.u.uAlpha,.14*n.find),se(U,n.scanX||0,X,0,0,1,3.8,10),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.bindVertexArray(C.sheet.v),e.drawArrays(e.TRIANGLES,0,6)),xe(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanAmt,0),e.uniform1f(v.point.u.uFade,1),e.uniform1f(v.point.u.uGain,l.on?1.35:1),e.blendFunc(e.ONE,e.ONE),e.uniform1i(v.point.u.uMode,1),e.bindVertexArray(C.particles.v),e.bindBuffer(e.ARRAY_BUFFER,C.particles.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.particles.data),e.drawArrays(e.POINTS,0,j+_t),(n.find>.01||n.carry>.01)&&(e.uniform1i(v.point.u.uMode,2),e.bindVertexArray(C.markers.v),e.bindBuffer(e.ARRAY_BUFFER,C.markers.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.markers.data),e.drawArrays(e.POINTS,0,Pt)),e.depthMask(!0),e.bindVertexArray(null)}function Ne(t,o,n){e.bindFramebuffer(e.FRAMEBUFFER,o?o.fbo:null),e.viewport(0,0,o?o.w:i.width,o?o.h:i.height),e.useProgram(t.p),n(t.u),e.bindVertexArray(l.tri.v),e.drawArrays(e.TRIANGLES,0,3)}function we(t,o,n){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(n,t)}function Ge(){Ko();let t=i.width,o=i.height;if(!l.on){e.bindFramebuffer(e.FRAMEBUFFER,null),Gt(t,o),Et(De);return}e.bindFramebuffer(e.FRAMEBUFFER,l.ms?l.ms.fbo:l.scene.fbo),Gt(t,o),l.ms&&(e.bindFramebuffer(e.READ_FRAMEBUFFER,l.ms.fbo),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.scene.fbo),e.blitFramebuffer(0,0,t,o,0,0,t,o,e.COLOR_BUFFER_BIT,e.NEAREST)),e.disable(e.DEPTH_TEST),e.disable(e.BLEND);let n=l.hdr?.58:.46;Ne(l.bright,l.h1,a=>{we(0,l.scene.tex,a.uTex),e.uniform2f(a.uTexel,1/t,1/o),e.uniform1f(a.uThresh,n)}),Ne(l.blur,l.h2,a=>{we(0,l.h1.tex,a.uTex),e.uniform2f(a.uDir,1/l.h1.w,0)}),Ne(l.blur,l.h1,a=>{we(0,l.h2.tex,a.uTex),e.uniform2f(a.uDir,0,1/l.h1.h)}),Ne(l.bright,l.q1,a=>{we(0,l.h1.tex,a.uTex),e.uniform2f(a.uTexel,1/l.h1.w,1/l.h1.h),e.uniform1f(a.uThresh,0)});for(let a=0;a<2;a++)Ne(l.blur,l.q2,c=>{we(0,l.q1.tex,c.uTex),e.uniform2f(c.uDir,1.5/l.q1.w,0)}),Ne(l.blur,l.q1,c=>{we(0,l.q2.tex,c.uTex),e.uniform2f(c.uDir,0,1.5/l.q1.h)});let r=De;Ne(l.comp,null,a=>{we(0,l.scene.tex,a.uScene),we(1,l.h1.tex,a.uB1),we(2,l.q1.tex,a.uB2),e.uniform1f(a.uBloom,1.85+r.find*.45+r.carry*.12),e.uniform2f(a.uRes,t,o),e.uniform2f(a.uCenter,w()?.5:.5+r.dx*.5,.48),e.uniform1f(a.uTime,be)}),e.bindVertexArray(null),Et(r)}let $t=st.map(()=>({o:-1}));function Et(t){let o=i.clientWidth,n=i.clientHeight;if(st.length){let u=t.find>.02&&te>.8,x=window.innerWidth<1060,L=Math.min(st.length,ne.length);for(let m=0;m<L;m++){let O=st[m],P=0;if(u){let d=lt(wt[m]);if(d){let F=d[0],_=d[1];if(x){let G=F-o*.5,Ae=_-n*.46,fe=Math.hypot(G,Ae)||1,Te=Math.max(fe,Math.min(o,n)*.34);F=o*.5+G/fe*Te,_=n*.46+Ae/fe*Te*.72}let I=x?A(4,16,d[0])*(1-A(o-16,o-4,d[0]))*A(56,100,d[1])*(1-A(n-56,n-16,d[1])):A(o*.44,o*.52,d[0])*(1-A(o-40,o,d[0]+180))*A(90,160,d[1]);P=A(.55,.95,t.find)*I,O.classList.toggle("is-flip",x&&F>o*.56),O.style.transform=`translate3d(${F.toFixed(1)}px, ${_.toFixed(1)}px, 0)`}}else O.classList.remove("is-flip");Math.abs(P-$t[m].o)>.01&&(O.style.opacity=P.toFixed(3),$t[m].o=P)}}let r=$e&&te>.9?1-A(.15,.6,t.find):0,a=w();for(let u=0;u<ct.length;u++){let x=0;if(r>0){let L=K[u],m=lt([L.p[0],L.top+.05,L.p[2]]);if(m){let O=a?A(8,24,m[0])*(1-A(o-24,o-8,m[0])):A(o*.46,o*.54,m[0])*(1-A(o-30,o,m[0]+60));x=r*(1-L.hov)*O*A(96,150,m[1])*(1-A(n-90,n-40,m[1])),x>.01&&(ct[u].style.transform=`translate3d(${m[0].toFixed(1)}px, ${m[1].toFixed(1)}px, 0)`)}}Math.abs(x-Ht[u])>.01&&(ct[u].style.opacity=x.toFixed(3),Ht[u]=x)}let c=t.hovIdx===void 0?-1:t.hovIdx,s=0;if(c>=0&&$e){let u=K[c],x=lt([u.p[0],u.top+.12,u.p[2]]);x&&(s=u.hov,(Ot!==c||Q.dataset.ci!==String(t.ci))&&(Ot=c,Q.dataset.ci=String(t.ci),Yo.textContent=`${he[c].id} \xB7 ${String(c+1).padStart(2,"0")} / 06`,jo.textContent=he[c].name,Go.textContent=he[c].note,$o.textContent=Lt[t.ci]||Lt[0]),Q.style.transform=`translate3d(${x[0].toFixed(1)}px, ${x[1].toFixed(1)}px, 0)`)}Math.abs(s-qt)>.01&&(Q.style.opacity=s.toFixed(3),qt=s),f.classList.toggle("is-inspecting",s>.4)}let St=0,$e=!1,Xt=/[?&]wsdebug\b/.test(location.search);Xt&&(window.__wsScene={step(t,o=1){for(let n=0;n<o;n++)Ye(t);return Ge(),{stage:ee,intro:te}},hover(t,o){N.px=t,N.py=o,N.x=t/window.innerWidth*2-1,N.y=o/window.innerHeight*2-1,N.active=t>=0}});function Kt(t){if(Xt)return;St=requestAnimationFrame(Kt);let o=t/1e3,n=ze?o-ze:0,r=ze?Math.min(.05,n):1/60;ze=o,Xo(n),Ye(r),Ge()}function Xe(t){t!==$e&&($e=t,t?(ze=0,St=requestAnimationFrame(Kt)):(cancelAnimationFrame(St),Et(Object.assign({},De,{hovIdx:-1,find:0}))))}let Ke=Array.from(document.querySelectorAll("[data-canvas]")),ut=new Map,Ft=new IntersectionObserver(t=>{t.forEach(o=>ut.set(o.target,o.isIntersecting)),Xe(!document.hidden&&Array.from(ut.values()).some(Boolean))},{rootMargin:"80px 0px"});Ke.forEach(t=>Ft.observe(t)),document.addEventListener("visibilitychange",()=>{Xe(!document.hidden&&Array.from(ut.values()).some(Boolean))}),document.addEventListener("ws:route",()=>{Ft.disconnect(),ut.clear(),Ke=Array.from(document.querySelectorAll("[data-canvas]")),Ke.forEach(o=>Ft.observe(o));let t=It(De);rt(),ee=gt(),yt=-1,E.matches||(ue={from:t,t:0},Ce=Math.min(Ce,.4)),Ye(0),Ge(),Ke.length||Xe(!1)}),window.addEventListener("resize",()=>{rt(),$e||(Ye(0),Ge())},{passive:!0}),i.addEventListener("webglcontextlost",t=>{t.preventDefault(),Xe(!1),f.classList.add("no-webgl")}),rt(),ee=gt(),Wt=ee<.5?2.6:2,Ut=ee<.5?5.5:1.4;let Qt="ws-cam";if(!S&&!E.matches)try{let t=JSON.parse(sessionStorage.getItem(Qt)||"null");t&&Date.now()-t.at<8e3&&t.st&&t.st.eye&&(ue={from:t.st,t:0})}catch{}window.addEventListener("pagehide",()=>{try{sessionStorage.setItem(Qt,JSON.stringify({at:Date.now(),st:It(De)}))}catch{}}),We=!0;for(let t=0;t<90;t++)Ye(1/30);We=!1,Ge(),f.classList.add("scene-ready"),Ke.length||Xe(!0)}var oe=document.documentElement,so=oe.dataset.bundle==="1",Ue=window.matchMedia("(prefers-reduced-motion: reduce)").matches;oe.classList.add("js-ready");location.protocol==="file:"&&!so&&document.querySelectorAll("a[href]").forEach(i=>{let f=i.getAttribute("href");if(/^(https?:|mailto:|tel:|#)/.test(f))return;let[S,w]=f.split("#");S&&S.endsWith("/")&&i.setAttribute("href",`${S}index.html${w?`#${w}`:""}`)});var V=document.getElementById("nav"),Je=document.getElementById("menu-btn"),de=V&&V.querySelector(".drop-btn"),Ze=document.getElementById("mega"),co=[],Mt=!1;function dt(){if(Mt=!1,!V)return;let i=36,f=window.innerHeight-44,S="dark",w=!1;for(let e of co){let E=e.getBoundingClientRect();E.top<=i&&E.bottom>i&&(S=e.dataset.tone),E.top<=f&&E.bottom>f&&(w=e.hasAttribute("data-canvas")&&!e.hasAttribute("data-no-hud"))}let b=V.classList.contains("is-open")||V.classList.contains("is-drop");V.classList.toggle("is-paper",S==="paper"&&!b),V.classList.toggle("is-scrolled",window.scrollY>24),oe.classList.toggle("hud-on",w)}var lo=()=>{Mt||(Mt=!0,requestAnimationFrame(dt))};window.addEventListener("scroll",lo,{passive:!0});window.addEventListener("resize",lo,{passive:!0});var Qe=window.matchMedia("(min-width: 1061px)"),ro=window.matchMedia("(hover: hover)"),io=0;function Fe(i){!de||!Ze||(de.setAttribute("aria-expanded",String(i)),Ze.hidden=!i,V.classList.toggle("is-drop",i&&Qe.matches),dt())}if(de&&Ze){let i=de.parentElement;de.addEventListener("click",()=>Fe(de.getAttribute("aria-expanded")!=="true")),i.addEventListener("mouseenter",()=>{ro.matches&&Qe.matches&&(clearTimeout(io),Fe(!0))}),i.addEventListener("mouseleave",()=>{ro.matches&&Qe.matches&&(io=setTimeout(()=>Fe(!1),160))}),i.addEventListener("focusout",f=>{Qe.matches&&!i.contains(f.relatedTarget)&&Fe(!1)}),document.addEventListener("click",f=>{Qe.matches&&!i.contains(f.target)&&Fe(!1)})}function mt(i){!V||!Je||(V.classList.toggle("is-open",i),Je.setAttribute("aria-expanded",String(i)),i||Fe(!1),dt())}Je&&Je.addEventListener("click",()=>mt(!V.classList.contains("is-open")));V&&V.addEventListener("click",i=>{i.target.closest(".nav-links a")&&(mt(!1),Fe(!1))});document.addEventListener("keydown",i=>{i.key==="Escape"&&(de&&de.getAttribute("aria-expanded")==="true"?(Fe(!1),de.focus()):V&&V.classList.contains("is-open")&&(mt(!1),Je.focus()))});function Jo(i){let f=Array.from(i.querySelectorAll(".svc"));f.forEach(b=>{let e=b.querySelector(".svc-row"),E=b.querySelector(".svc-body");e.addEventListener("click",()=>{let T=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!T)),E.hidden=T,b.classList.toggle("is-open",!T)})});let S=Array.from(i.querySelectorAll(".filters [data-filter]")),w=b=>{S.forEach(E=>E.setAttribute("aria-pressed",String(E.dataset.filter===b)));let e=null;f.forEach(E=>{let T=b==="all"||E.dataset.v===b;E.hidden=!T,T&&!e&&(e=E)}),b!=="all"&&e&&!e.classList.contains("is-open")&&e.querySelector(".svc-row").click()};S.forEach(b=>b.addEventListener("click",()=>w(b.dataset.filter)))}function Zo(i){let f=i.querySelector("[data-brief]");if(!f)return;let S=f.querySelector("[data-status]"),w=f.dataset.to,b=(e,E)=>{S.textContent=e,S.classList.toggle("is-error",E==="error"),S.classList.toggle("is-ok",E==="ok")};f.addEventListener("submit",async e=>{e.preventDefault();let E=new FormData(f),T=String(E.get("name")||"").trim(),g=String(E.get("email")||"").trim(),p=String(E.get("company")||"").trim(),R=String(E.get("message")||"").trim(),A=[];if(T||A.push("your name"),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g)||A.push("a work email we can reply to"),A.length){b(`Add ${A.join(" and ")}, then send again.`,"error"),(T?f.elements.email:f.elements.name).focus();return}if(f.elements.consent&&!f.elements.consent.checked){b("Tick the consent box so we can reply, then send again.","error"),f.elements.consent.focus();return}if(f.dataset.endpoint){try{b("Sending\u2026");let _e=await fetch(f.dataset.endpoint,{method:"POST",body:E,headers:{Accept:"application/json"}});if(!_e.ok)throw new Error(String(_e.status));f.reset(),b("Received. We reply within two working days.","ok")}catch{b(`That did not go through. Write to ${w} and we will pick it up.`,"error")}return}let me=[`Name: ${T}`,`Company: ${p||"\u2014"}`,`Email: ${g}`];R&&me.push("","Your thoughts:",R);let Le=`Scoping conversation${p?` \u2014 ${p}`:""}`;b(`Your email app should open with the request filled in. If it doesn\u2019t, write to ${w}.`,"ok"),window.location.href=`mailto:${w}?subject=${encodeURIComponent(Le)}&body=${encodeURIComponent(me.join(`
`))}`})}function en(i){let f=i.querySelector("[data-ledger]");if(!f)return;if(Ue||!("IntersectionObserver"in window)){f.classList.add("is-run");return}let S=new IntersectionObserver(([w])=>{w.isIntersecting&&(f.classList.add("is-run"),S.disconnect())},{threshold:.3});S.observe(f)}function tn(i){let f=Array.from(i.querySelectorAll(".h2, .v-title, .h-limits, .display-2, .tl-body h2")).filter(b=>!b.dataset.split&&b.children.length===0);if(Ue||!("IntersectionObserver"in window))return;let S=window.innerHeight,w=new IntersectionObserver(b=>{b.forEach(e=>{e.isIntersecting&&(e.target.classList.add("is-in"),w.unobserve(e.target))})},{rootMargin:"0px 0px -12% 0px"});f.forEach(b=>{let e=b.textContent.trim().split(/\s+/);if(b.dataset.split="1",b.setAttribute("aria-label",b.textContent.trim()),b.innerHTML=e.map((E,T)=>`<span class="rw" aria-hidden="true"><span style="--i:${T}">${E.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span></span>`).join(" "),b.classList.add("rise"),b.getBoundingClientRect().top<S*.9){let E=()=>oe.classList.contains("js-loading")?setTimeout(E,120):requestAnimationFrame(()=>b.classList.add("is-in"));E()}else w.observe(b)})}function on(i){let f=i.querySelector(".lg-toc");if(!f||!("IntersectionObserver"in window))return;let S=new Map(Array.from(f.querySelectorAll('a[href^="#"]')).map(e=>[e.getAttribute("href").slice(1),e])),w=new Set,b=new IntersectionObserver(e=>{e.forEach(T=>T.isIntersecting?w.add(T.target.id):w.delete(T.target.id));let E=Array.from(S.keys()).find(T=>w.has(T));E&&S.forEach((T,g)=>g===E?T.setAttribute("aria-current","true"):T.removeAttribute("aria-current"))},{rootMargin:"-20% 0px -55% 0px"});i.querySelectorAll(".lg-sec").forEach(e=>b.observe(e))}function nn(i){let f=Array.from(i.querySelectorAll("[data-count]"));if(!f.length||Ue||!("IntersectionObserver"in window))return;let S=new IntersectionObserver(w=>{w.forEach(b=>{if(!b.isIntersecting)return;S.unobserve(b.target);let e=b.target,E=+e.dataset.count,T=performance.now(),g=p=>{let R=Math.min(1,(p-T)/1300);e.textContent=String(Math.round(E*(1-Math.pow(1-R,4)))),R<1&&requestAnimationFrame(g)};e.textContent="0",requestAnimationFrame(g)})},{threshold:.4});f.forEach(w=>S.observe(w))}function uo(i=document){co=Array.from(document.querySelectorAll("[data-tone]")),Jo(i),Zo(i),en(i),tn(i),nn(i),on(i),document.querySelectorAll("[data-year]").forEach(f=>{f.textContent=String(new Date().getFullYear())}),dt()}uo();document.addEventListener("keydown",i=>{if(i.key!=="ArrowLeft"&&i.key!=="ArrowRight"||i.defaultPrevented||i.altKey||i.ctrlKey||i.metaKey||i.shiftKey||i.target.closest&&i.target.closest("input, textarea, select, button, [contenteditable], .spec-scroll, .nav-links")||V&&V.classList.contains("is-open")||Ze&&!Ze.hidden)return;let f=document.querySelector(i.key==="ArrowRight"?'.pager a[rel="next"], .pager a[rel="first"]':'.pager a[rel="prev"]');f&&(i.preventDefault(),f.click())});(function(){if(!oe.classList.contains("js-loading"))return;let f=document.querySelector(".curtain");if(!f){oe.classList.remove("js-loading");return}let S=f.querySelector(".c-count"),w=f.querySelector(".c-bar i"),b=performance.now(),e=1250,E=T=>{let g=oe.classList.contains("scene-ready")||oe.classList.contains("no-webgl"),p=Math.min(1,(T-b)/e),R=g?p:Math.min(p,.86),A=Math.round(100*(1-Math.pow(1-R,2.2)));if(S.textContent=String(A).padStart(2,"0"),w.style.transform=`scaleX(${A/100})`,R<1){requestAnimationFrame(E);return}oe.classList.add("curtain-lift"),setTimeout(()=>oe.classList.remove("js-loading"),380),setTimeout(()=>oe.classList.remove("curtain-lift"),1100);try{sessionStorage.setItem("ws-seen","1")}catch{}};requestAnimationFrame(E)})();document.addEventListener("ws:stage",i=>{document.querySelectorAll(".scrub [data-stage-link]").forEach(f=>{+f.dataset.stageLink===i.detail?f.setAttribute("aria-current","step"):f.removeAttribute("aria-current")})});window.matchMedia("(hover: hover) and (pointer: fine)").matches&&!Ue&&(document.addEventListener("pointermove",i=>{let f=i.target.closest&&i.target.closest(".spot");if(f){let w=f.getBoundingClientRect();f.style.setProperty("--mx",`${i.clientX-w.left}px`),f.style.setProperty("--my",`${i.clientY-w.top}px`)}let S=i.target.closest&&i.target.closest('.btn-ember:not([type="submit"])');if(S){let w=S.getBoundingClientRect(),b=(i.clientX-(w.left+w.width/2))/w.width,e=(i.clientY-(w.top+w.height/2))/w.height;S.style.transform=`translate(${(b*8).toFixed(1)}px, ${(e*6).toFixed(1)}px)`}},{passive:!0}),document.addEventListener("pointerout",i=>{let f=i.target.closest&&i.target.closest(".btn-ember");f&&!f.contains(i.relatedTarget)&&(f.style.transform="")}));(function(){let f=()=>document.querySelectorAll("[data-clock]"),S;try{S=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return}let w=()=>f().forEach(b=>{b.textContent=`Hyderabad \xB7 ${S.format(new Date)} IST`});w(),setInterval(w,2e4)})();ao();if(so){let i=document.getElementById("page"),f=new Map(Array.from(document.querySelectorAll("template[data-route]")).map(p=>[p.dataset.route,p])),S=p=>p&&p.startsWith("#/")?p.slice(1).split("#")[0]:"/",w=p=>requestAnimationFrame(()=>{let R=p&&document.getElementById(p);R&&R.scrollIntoView({block:"start"})}),b="/",e=p=>{V.querySelectorAll(".nav-links > a[data-key]").forEach(R=>{let A=S(R.getAttribute("href"));A!=="/"&&p.startsWith(A)?R.setAttribute("aria-current","page"):R.removeAttribute("aria-current")}),de&&de.toggleAttribute("data-current",/^\/(services|verticals)\//.test(p))},E=(p,{scroll:R=!0}={})=>{let A=f.get(p)||f.get("/404/");b=f.has(p)?p:"/404/",i.replaceChildren(A.content.cloneNode(!0)),document.title=A.dataset.title,e(b),R&&(oe.style.scrollBehavior="auto",window.scrollTo(0,0),oe.style.scrollBehavior=""),uo(i),document.dispatchEvent(new Event("ws:route"))},T=(p,R)=>{if(p===b){window.scrollTo({top:0,behavior:Ue?"auto":"smooth"});return}if(mt(!1),Fe(!1),b=f.has(p)?p:"/404/",R)try{history.pushState({route:p},"",`#${p}`)}catch{}E(p),!Ue&&i.animate&&i.animate([{opacity:0},{opacity:1}],{duration:380,easing:"cubic-bezier(0.2, 0.7, 0.1, 1)"})};document.addEventListener("click",p=>{let R=p.target.closest('a[href^="#"]');if(!R||p.defaultPrevented||p.metaKey||p.ctrlKey||p.shiftKey)return;let A=R.getAttribute("href");if(p.preventDefault(),A.startsWith("#/")){T(S(A),!0),w(A.slice(2).split("#")[1]);return}let me=A.length>1&&document.getElementById(A.slice(1));me&&me.scrollIntoView({behavior:Ue?"auto":"smooth",block:"start"})}),window.addEventListener("popstate",()=>T(S(location.hash),!1)),window.addEventListener("hashchange",()=>{let p=S(location.hash);p!==b&&T(p,!1)});let g=S(location.hash);g!=="/"?E(g,{scroll:!1}):e("/")}})();
