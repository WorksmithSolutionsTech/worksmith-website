(()=>{function no(){let i=document.getElementById("scene");if(!i)return;let f=document.documentElement,F=f.classList.contains("js-loading"),A=()=>window.innerWidth<860,y=A(),e=null;try{e=i.getContext("webgl2",{antialias:y,alpha:!1,depth:!0,stencil:!1,powerPreference:"high-performance"})}catch{e=null}if(!e){f.classList.add("no-webgl");return}let w=window.matchMedia("(prefers-reduced-motion: reduce)"),M=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],g={bg:M("#171412"),ivory:M("#ebe5d9"),plinth:M("#2a2521"),curve:M("#978b80"),cream:M("#f3eee6"),ember:M("#e5602f"),dot:M("#6a6058"),black:[.02,.016,.014]},p=(t,o,n)=>t+(o-t)*n,T=(t,o,n)=>Math.min(n,Math.max(o,t)),E=(t,o,n)=>{let r=T((n-t)/(o-t),0,1);return r*r*(3-2*r)},de=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Me=t=>1-Math.pow(1-t,3),Re=()=>new Float32Array(16);function uo(t,o,n,r,a){let s=1/Math.tan(o/2),c=1/(r-a);return t.fill(0),t[0]=s/n,t[5]=s,t[10]=(a+r)*c,t[11]=-1,t[14]=2*a*r*c,t}function fo(t,o,n,r){let a=o[0]-n[0],s=o[1]-n[1],c=o[2]-n[2],u=Math.hypot(a,s,c);a/=u,s/=u,c/=u;let x=r[1]*c-r[2]*s,L=r[2]*a-r[0]*c,d=r[0]*s-r[1]*a;u=Math.hypot(x,L,d),x/=u,L/=u,d/=u;let O=s*d-c*L,P=c*x-a*d,m=a*L-s*x;return t[0]=x,t[1]=O,t[2]=a,t[3]=0,t[4]=L,t[5]=P,t[6]=s,t[7]=0,t[8]=d,t[9]=m,t[10]=c,t[11]=0,t[12]=-(x*o[0]+L*o[1]+d*o[2]),t[13]=-(O*o[0]+P*o[1]+m*o[2]),t[14]=-(a*o[0]+s*o[1]+c*o[2]),t[15]=1,t}function ie(t,o,n,r,a,s,c,u){let x=Math.cos(a),L=Math.sin(a);return t.fill(0),t[0]=x*s,t[2]=-L*s,t[5]=c,t[8]=L*u,t[10]=x*u,t[12]=o,t[13]=n,t[14]=r,t[15]=1,t}let mo=`#version 300 es
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
}`;function Rt(t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"shader");return n}function pe(t,o){let n=e.createProgram();if(e.attachShader(n,Rt(e.VERTEX_SHADER,t)),e.attachShader(n,Rt(e.FRAGMENT_SHADER,o)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n)||"link");let r={},a=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let s=0;s<a;s++){let c=e.getActiveUniform(n,s);r[c.name]=e.getUniformLocation(n,c.name)}return{p:n,u:r}}let Ee=[2.4,.03,1.56],Ue=5,me=[{id:"SYS-01",name:"ERP",note:"orders \xB7 dispatch",a:[-4.4,.7,-1.6],ay:.28,b:[-2.62,0,-.89]},{id:"SYS-02",name:"Ledger",note:"books \xB7 GST returns",a:[.3,1.5,-3.8],ay:-.16,b:[0,0,-.89]},{id:"SYS-03",name:"Stock",note:"inventory \xB7 3 sites",a:[4.6,.35,-1.1],ay:.38,b:[2.62,0,-.89]},{id:"SYS-04",name:"WhatsApp",note:"vendors \xB7 customers",a:[3.5,1.15,3],ay:-.32,b:[2.62,0,.89]},{id:"SYS-05",name:"Sheets",note:"final_v2.xlsx",a:[-.6,-.05,3.4],ay:.18,b:[0,0,.89]},{id:"SYS-06",name:"Bank",note:"receipts \xB7 payments",a:[-4.7,1.25,2.2],ay:-.22,b:[-2.62,0,.89]}],$=[[0,1,1],[1,2,.25],[2,3,1],[3,4,.25],[4,5,1],[5,0,.25],[0,2,.2],[1,4,1],[5,3,.2]],oe=[0,2,4,7],se=$.length,j=64,X=-1.4,et=[{eye:[17.7,13,22.2],tgt:[0,.3,0],dx:.56,leak:.45,find:0,carry:0,ground:0,flow:1},{eye:[14.5,5.4,17.5],tgt:[0,.5,0],dx:.6,leak:.95,find:0,carry:0,ground:0,flow:.7},{eye:[-12.65,10.45,14.85],tgt:[0,.4,0],dx:.5,leak:.6,find:1,carry:0,ground:0,flow:.5},{eye:[1.98,24.4,15.8],tgt:[0,-.2,.4],dx:.5,leak:0,find:0,carry:1,ground:0,flow:1.7},{eye:[10.45,3.96,11.55],tgt:[0,-.2,0],dx:.56,leak:0,find:0,carry:.3,ground:1,flow:1},{eye:[13.2,11,16.5],tgt:[0,-.2,0],dx:.48,leak:0,find:0,carry:.7,ground:1,flow:1.2},{eye:[-14.3,11,18.7],tgt:[0,-.3,0],dx:.6,leak:0,find:0,carry:.5,ground:1,flow:1}],Tt=["Six systems, each individually correct.","Value leaving between systems \u2014 not inside any one of them.","Vertical I \u2014 the gaps located and put on record.","Vertical II \u2014 work carried end to end, nothing dropped.","Vertical III \u2014 the record layer everything stands on.","Diagnose, ground, then automate.","Measured against the baseline agreed at the start."],Lt=["Status \xB7 0 errors \xB7 every record valid","Correct inside \xB7 value leaving at its edges","Correct inside \xB7 gaps now on record","Work carried in and out \xB7 every step logged","Standing on the shared record layer","Grounded first \xB7 then automated","Measured against the agreed baseline"];function ne(t,o,n){let r=e.createVertexArray(),a=e.createBuffer();e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,o,n||e.STATIC_DRAW);let s=t.reduce((u,x)=>u+x,0),c=0;return t.forEach((u,x)=>{e.enableVertexAttribArray(x),e.vertexAttribPointer(x,u,e.FLOAT,!1,s*4,c*4),c+=u}),e.bindVertexArray(null),{v:r,b:a,data:o}}function To(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],o=[],n=(r,a,s,c,u)=>[0,1,2].map(x=>r[x]*.5+a[x]*c*.5+s[x]*u*.5);return t.forEach(([r,a,s])=>{[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([u,x])=>{o.push(...n(r,a,s,u,x),...r,0,0)})}),new Float32Array(o)}function Lo(){let t=[-.5,.5],o=[];for(let n of t)for(let r of t)o.push(-.5,n,r,.5,.5,n,r,.5),o.push(n,-.5,r,.5,n,.5,r,.5),o.push(n,r,-.5,.5,n,r,.5,.5);return new Float32Array(o)}function _o(t,o){let n=[];for(let a=1;a<t;a++){let s=-.5+a/t;n.push(s,.52,-.5,.5,s,.52,.5,.5)}for(let a=1;a<o;a++){let s=-.5+a/o;n.push(-.5,.52,s,.5,.5,.52,s,.5)}return new Float32Array(n)}function Po(){let t=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]],o=[];return t.forEach(([n,r])=>o.push(n,0,r,n+.5,r+.5)),new Float32Array(o)}function Co(){let t=[[0,-.5],[1,-.5],[1,.5],[0,-.5],[1,.5],[0,.5]],o=[];return t.forEach(([n,r])=>o.push(0,n,r,r+.5,n)),new Float32Array(o)}function Do(){let t=[];for(let r=-22;r<=22+1e-6;r+=.55)for(let a=-22;a<=22+1e-6;a+=.55){let s=Math.hypot(r,a),c=.75*(1-E(6,21,s));c<=.01||t.push(r,X,a,g.dot[0],g.dot[1],g.dot[2],c,.034)}return new Float32Array(t)}let No=()=>ne([2],new Float32Array([-1,-1,3,-1,-1,3])),v,C,W=y?760:1600,_t=se+oe.length,Pt=se+oe.length*3;try{v={mesh:pe(mo,ho),line:pe(go,yo),point:pe(Ao,wo),decal:pe(Eo,So),glass:pe(vo,po),ribbon:pe(bo,xo)},C={box:ne([3,3,2],To()),edges:ne([3,1],Lo()),plinthGrid:ne([3,1],_o(19,9)),floor:ne([3,2],Po()),sheet:ne([3,2],Co()),dots:ne([3,4,1],Do()),curves:ne([3,1],new Float32Array(se*j*4),e.DYNAMIC_DRAW),ribbons:ne([3,3,3,1,1],new Float32Array(se*j*2*11),e.DYNAMIC_DRAW),particles:ne([3,4,1],new Float32Array((W+_t)*8),e.DYNAMIC_DRAW),markers:ne([3,4,1],new Float32Array(Pt*8),e.DYNAMIC_DRAW),pins:ne([3,1],new Float32Array((oe.length*2+2)*4),e.DYNAMIC_DRAW)},C.dots.count=C.dots.data.length/8}catch(t){console.warn("[scene] WebGL init failed:",t),f.classList.add("no-webgl");return}let l={on:!1,w:0,h:0};function Io(){if(!y)try{l.hdr=!!e.getExtension("EXT_color_buffer_float"),l.fmt=l.hdr?e.RGBA16F:e.RGBA8,l.type=l.hdr?e.HALF_FLOAT:e.UNSIGNED_BYTE,l.samples=Math.min(4,e.getParameter(e.MAX_SAMPLES)||0),l.bright=pe(ht,Fo),l.blur=pe(ht,Mo),l.comp=pe(ht,Ro),l.tri=No(),l.on=!0}catch(t){console.warn("[scene] post-processing off:",t),l.on=!1}}function Uo(t,o){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,l.fmt,t,o,0,e.RGBA,l.type,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}function Be(t,o,n){let r={w:t,h:o,tex:Uo(t,o),fbo:e.createFramebuffer()};return e.bindFramebuffer(e.FRAMEBUFFER,r.fbo),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r.tex,0),n&&(r.depth=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,r.depth)),r.ok=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,r}function ko(t){t&&(e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo),t.depth&&e.deleteRenderbuffer(t.depth))}function Bo(t,o){if(!l.on||l.w===t&&l.h===o)return;l.w=t,l.h=o,[l.scene,l.h1,l.h2,l.q1,l.q2].forEach(ko),l.ms&&(e.deleteFramebuffer(l.ms.fbo),e.deleteRenderbuffer(l.ms.color),e.deleteRenderbuffer(l.ms.depth),l.ms=null),l.scene=Be(t,o,l.samples===0);let n=Math.max(1,t>>1),r=Math.max(1,o>>1),a=Math.max(1,t>>3),s=Math.max(1,o>>3);l.h1=Be(n,r),l.h2=Be(n,r),l.q1=Be(a,s),l.q2=Be(a,s);let c=l.scene.ok&&l.h1.ok&&l.h2.ok&&l.q1.ok&&l.q2.ok;if(c&&l.samples>0){let u={fbo:e.createFramebuffer(),color:e.createRenderbuffer(),depth:e.createRenderbuffer()};e.bindFramebuffer(e.FRAMEBUFFER,u.fbo),e.bindRenderbuffer(e.RENDERBUFFER,u.color),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,l.fmt,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.color),e.bindRenderbuffer(e.RENDERBUFFER,u.depth),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,u.depth),c=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,l.ms=u}e.bindFramebuffer(e.FRAMEBUFFER,null),c||(console.warn("[scene] render targets incomplete; drawing direct"),l.on=!1)}Io();let vt=new Uint8Array(W),Se=new Uint8Array(W),tt=new Float32Array(W),Ct=new Float32Array(W),ot=new Float32Array(W),nt=new Float32Array(W),pt=new Float32Array(W),ae=new Float32Array(W*3),ce=new Float32Array(W*3);for(let t=0;t<W;t++)vt[t]=t%se,tt[t]=Math.random(),Ct[t]=.09+Math.random()*.06,Se[t]=Math.random()<.45*$[vt[t]][2]?1:0,ot[t]=.38+Math.random()*.24;let ge=[],he=-1,at=null;function rt(){ge=Array.from(document.querySelectorAll("[data-stage]")).map(n=>({i:+n.dataset.stage,top:n.getBoundingClientRect().top+window.scrollY})).sort((n,r)=>n.top-r.top);let t=document.querySelector("[data-focus]");he=t?+t.dataset.focus:-1;let o=document.querySelector("[data-caption]");at=o?{stage:+o.dataset.stage,text:o.dataset.caption}:null}function gt(){if(!ge.length)return 0;let t=window.scrollY+window.innerHeight*.5,o=0;for(let s=0;s<ge.length;s++)ge[s].top<=t&&(o=s);if(o>=ge.length-1||t<ge[0].top)return ge[o].i;let n=ge[o],r=ge[o+1],a=(t-n.top)/Math.max(1,r.top-n.top);return n.i+(r.i-n.i)*E(.55,1,a)}let Oo=["dx","leak","find","carry","ground","flow"];function Dt(t,o){let n=t[0]-o[0],r=t[1]-o[1],a=t[2]-o[2],s=Math.hypot(n,r,a)||1;return[s,Math.atan2(n,a),Math.asin(T(r/s,-1,1))]}function qo(t,o,n){let r=o-t;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;return t+r*n}function it(t,o,n){let r={};for(let L of Oo)r[L]=p(t[L],o[L],n);if(r.tgt=[0,1,2].map(L=>p(t.tgt[L],o.tgt[L],n)),n<=0)return r.eye=t.eye.slice(),r;if(n>=1)return r.eye=o.eye.slice(),r;let a=Dt(t.eye,t.tgt),s=Dt(o.eye,o.tgt),c=Math.exp(p(Math.log(a[0]),Math.log(s[0]),n)),u=qo(a[1],s[1],n),x=p(a[2],s[2],n);return r.eye=[r.tgt[0]+c*Math.cos(x)*Math.sin(u),r.tgt[1]+c*Math.sin(x),r.tgt[2]+c*Math.cos(x)*Math.cos(u)],r}let Nt=t=>it(t,t,0);function It(t){let o=T(Math.floor(t),0,et.length-1),n=Math.min(o+1,et.length-1);return it(et[o],et[n],T(t-o,0,1))}let K=me.map(()=>({p:[0,0,0],base:0,ry:0,hov:0,foc:0,pulse:0,gap:.085,h:.37,top:0})),Ut=new Float32Array($.length),ke=[];for(let t=0;t<me.length;t++)for(let o=0;o<Ue;o++)ke.push({i:t,k:o,x:0,y:0,z:0,ry:0,d:0});let kt=5.5,U=C.curves.data;function Ho(t){for(let o=0;o<se;o++){let n=K[$[o][0]],r=K[$[o][1]],a=n.p,s=r.p,c=[a[0],n.top+.02,a[2]],u=[s[0],r.top+.02,s[2]],x=u[0]-c[0],L=u[1]-c[1],d=u[2]-c[2],O=Math.hypot(x,L,d),P=p(1.1+.17*O,.6+.13*O,t),m=[c[0]+x*.14,c[1]+P,c[2]+d*.14],S=[u[0]-x*.14,u[1]+P,u[2]-d*.14];for(let _=0;_<j;_++){let D=_/(j-1),q=1-D,Fe=q*q*q,De=3*q*q*D,$e=3*q*D*D,Xe=D*D*D,Ke=(o*j+_)*4;U[Ke]=Fe*c[0]+De*m[0]+$e*S[0]+Xe*u[0],U[Ke+1]=Fe*c[1]+De*m[1]+$e*S[1]+Xe*u[1],U[Ke+2]=Fe*c[2]+De*m[2]+$e*S[2]+Xe*u[2],U[Ke+3]=D}}}function Vo(){let t=C.ribbons.data;for(let o=0;o<se;o++)for(let n=0;n<j;n++){let r=(o*j+n)*4,a=(o*j+Math.max(0,n-1))*4,s=(o*j+Math.min(j-1,n+1))*4;for(let c=0;c<2;c++){let u=((o*j+n)*2+c)*11;t[u]=U[r],t[u+1]=U[r+1],t[u+2]=U[r+2],t[u+3]=U[a],t[u+4]=U[a+1],t[u+5]=U[a+2],t[u+6]=U[s],t[u+7]=U[s+1],t[u+8]=U[s+2],t[u+9]=c?1:-1,t[u+10]=U[r+3]}}}function Oe(t,o,n){let r=T(o,0,1)*(j-1),a=Math.min(j-2,Math.floor(r)),s=r-a,c=(t*j+a)*4,u=c+4;return n[0]=U[c]+(U[u]-U[c])*s,n[1]=U[c+1]+(U[u+1]-U[c+1])*s,n[2]=U[c+2]+(U[u+2]-U[c+2])*s,n}let zo=document.getElementById("fig-no"),Bt=document.getElementById("fig-text"),st=Array.from(document.querySelectorAll(".findings .tag")),yt=-1,Q=document.querySelector(".inspect");Q||(Q=document.createElement("div"),Q.className="inspect",Q.setAttribute("aria-hidden","true"),Q.innerHTML='<div class="inspect-in"><p class="i-id"></p><p class="i-name"></p><p class="i-note"></p><p class="i-status"></p></div>',document.body.appendChild(Q));let Yo=Q.querySelector(".i-id"),jo=Q.querySelector(".i-name"),Go=Q.querySelector(".i-note"),Wo=Q.querySelector(".i-status"),Ot=-1,qt=-1,Te=document.querySelector(".sys-tags");Te||(Te=document.createElement("div"),Te.className="sys-tags",Te.setAttribute("aria-hidden","true"),Te.innerHTML=me.map((t,o)=>`<div class="sys-tag"><span><b>${String(o+1).padStart(2,"0")}</b>${t.name}</span></div>`).join(""),document.body.appendChild(Te));let ct=Array.from(Te.children),Ht=ct.map(()=>-1),ye=Re(),J=Re(),k=Re(),le=0,ve=0,qe=0,Vt=0,zt=0,bt=1,ee=w.matches||!F?1:0,Yt=2.6,He=!1,Le=w.matches?1:0,ue=null,jt=-1,I={x:0,y:0,sx:0,sy:0,px:-1,py:-1,active:!1};window.addEventListener("pointermove",t=>{I.x=t.clientX/window.innerWidth*2-1,I.y=t.clientY/window.innerHeight*2-1,I.px=t.clientX,I.py=t.clientY,I.active=t.pointerType==="mouse"},{passive:!0}),window.addEventListener("mouseout",t=>{t.relatedTarget||(I.active=!1)}),window.addEventListener("blur",()=>{I.active=!1});let Gt=[1.75,1.35,1],Z={acc:0,n:0,slow:0,level:0};function $o(t){if(Z.level>=Gt.length-1||t<=0||t>.25||(Z.acc+=t,Z.n++,Z.n<90))return;let o=Z.acc/Z.n;Z.acc=0,Z.n=0,Z.slow=o>.026?Z.slow+1:0,Z.slow>=2&&(Z.level++,Z.slow=0)}function Xo(){let t=Math.min(window.devicePixelRatio||1,A()?1.5:Gt[Z.level]),o=Math.max(1,Math.round(i.clientWidth*t)),n=Math.max(1,Math.round(i.clientHeight*t));(i.width!==o||i.height!==n)&&(i.width=o,i.height=n),Bo(o,n)}let Y=[0,0,0],xt=[0,0,0],At=oe.map(()=>[0,0,0]),_e=It(0),Pe=[0,0,0],wt=0;function lt(t){let o=J[0]*t[0]+J[4]*t[1]+J[8]*t[2]+J[12],n=J[1]*t[0]+J[5]*t[1]+J[9]*t[2]+J[13],r=J[2]*t[0]+J[6]*t[1]+J[10]*t[2]+J[14],a=ye[0]*o+ye[8]*r,s=ye[5]*n+ye[9]*r,c=-r;return c<.1?null:[(a/c*.5+.5)*i.clientWidth,(1-(s/c*.5+.5))*i.clientHeight,c]}function Ko(){if(!I.active||A()||ee<.9||I.px<i.clientWidth*.42)return-1;let t=-1,o=1e9;for(let n=0;n<me.length;n++){let r=K[n],a=lt([r.p[0],r.base-.09+r.h*.5,r.p[2]]);if(!a)continue;let s=ye[5]*i.clientHeight*.5*(n===jt?1.45:1.15)/a[2],c=Math.hypot(I.px-a[0],(I.py-a[1])*1.4);c<s&&c<o&&(o=c,t=n)}return t}function Ve(t){let o=w.matches;ve+=t*(o?.2:1);let n=!He&&!f.classList.contains("js-loading");n&&ee<1&&(ee=Math.min(1,ee+t/Yt)),n&&Le<1&&(Le=Math.min(1,Le+t/1.6)),Vt%30===0&&rt(),Vt++;let r=gt();le+=(r-le)*(1-Math.exp(-t*(o?12:2.4))),Math.abs(r-le)<5e-4&&(le=r);let a=It(le);ue&&!He?(ue.t=Math.min(1,ue.t+t/1.5),a=it(ue.from,a,de(ue.t)),ue.t>=1&&(ue=null)):ue&&(a=it(ue.from,a,0)),_e=a;let s=A(),c=He?-1:Ko();jt=c;let u=de(T(a.ground,0,1));for(let h=0;h<me.length;h++){let R=me[h],b=K[h];b.hov+=((c===h?1:0)-b.hov)*(1-Math.exp(-t*9)),b.foc+=((he===h?1:0)-b.foc)*(1-Math.exp(-t*3));let B=Me(T(ee*1.55-h*.09,0,1)),N=b.hov*.32+b.foc*.22*(1-u*.6);b.p[0]=p(R.a[0],R.b[0],u),b.base=p(R.a[1],R.b[1],u),b.p[1]=b.base+N+(1-B)*kt,b.p[2]=p(R.a[2],R.b[2],u),b.ry=p(R.ay,0,u)+(1-B)*.5*(h%2?1:-1),b.pulse=Math.max(0,b.pulse-t*1.3);let re=p(.085+b.hov*.14+(1-B)*.12,.05+b.hov*.06,u);b.gap+=(re-b.gap)*(1-Math.exp(-t*6)),b.h=(Ue-1)*b.gap+Ee[1],b.top=b.p[1]-.09+b.h;for(let H=0;H<Ue;H++){let G=ke[h*Ue+H],V=(1-u)*a.leak;G.x=b.p[0]+V*.07*Math.sin(H*2.1+h*1.3),G.z=b.p[2]+V*.055*Math.cos(H*1.7+h*.9),G.y=b.p[1]-.09+Ee[1]*.5+H*b.gap,G.ry=b.ry+V*.05*Math.sin(H*1.3+h)}}Ho(u),Vo();let x=a.flow*(o?.25:1),L=a.leak,d=C.particles.data,O=E(.45,.95,ee);for(let h=0;h<W;h++){let R=vt[h],b=h*8;if(Se[h]!==2){let H=tt[h],G=H+Ct[h]*t*x;if(G>=1?(G-=1,Se[h]=Math.random()<L*$[R][2]?1:0,ot[h]=.38+Math.random()*.24):Se[h]===1&&L<.02&&(Se[h]=0),tt[h]=G,Se[h]===1&&H<ot[h]&&G>=ot[h]){Oe(R,G,Y),Oe(R,Math.min(1,G+.02),xt);let V=xt[0]-Y[0],Ae=xt[2]-Y[2],to=Math.hypot(V,Ae)||1;V/=to,Ae/=to;let oo=(Math.random()-.5)*1.8;ce[h*3]=V*.45-Ae*oo,ce[h*3+1]=.1+Math.random()*.5,ce[h*3+2]=Ae*.45+V*oo,ae[h*3]=Y[0],ae[h*3+1]=Y[1],ae[h*3+2]=Y[2],nt[h]=0,pt[h]=2.8+Math.random()*1.2,Se[h]=2}else{Oe(R,G,Y);let V=E(0,.07,G)*(1-E(.93,1,G)),Ae=he>=0&&($[R][0]===he||$[R][1]===he)?K[he].foc:0;d[b]=Y[0],d[b+1]=Y[1],d[b+2]=Y[2],d[b+3]=p(g.cream[0],1,Ae*.3),d[b+4]=p(g.cream[1],.8,Ae*.3),d[b+5]=p(g.cream[2],.65,Ae*.3),d[b+6]=V*(.62+.38*a.carry+Ae*.3)*O,d[b+7]=.05+.014*a.carry;continue}}let B=t*(o?.3:1);nt[h]+=B;let N=h*3;if(ae[N+1]>X+.02){ce[N+1]-=1.15*B;let H=Math.pow(.55,B);ce[N]*=H,ce[N+2]*=H,ae[N]+=ce[N]*B,ae[N+1]+=ce[N+1]*B,ae[N+2]+=ce[N+2]*B,ae[N+1]<=X+.02&&(ae[N+1]=X+.02,ce[N]*=.15,ce[N+2]*=.15)}if(nt[h]>=pt[h]){Se[h]=0,tt[h]=0,d[b+6]=0;continue}let re=1-nt[h]/pt[h];d[b]=ae[N],d[b+1]=ae[N+1],d[b+2]=ae[N+2],d[b+3]=g.ember[0]*1.15,d[b+4]=g.ember[1]*1.1,d[b+5]=g.ember[2],d[b+6]=Math.pow(re,1.2)*.95*O,d[b+7]=.072}zt+=t*.1*x;let P=C.markers.data;for(let h=0;h<se;h++){let R=(zt+h*.37)%1;Ut[h]<.93&&R>=.93&&a.carry>.05&&(K[$[h][1]].pulse=1),Ut[h]=R,Oe(h,R,Y);let b=E(0,.08,R)*(1-E(.92,1,R)),B=(W+h)*8;d[B]=Y[0],d[B+1]=Y[1],d[B+2]=Y[2],d[B+3]=1.18,d[B+4]=1.12,d[B+5]=1.06,d[B+6]=a.carry*b*O,d[B+7]=.14;let N=h*8;P[N]=Y[0],P[N+1]=Y[1],P[N+2]=Y[2],P[N+3]=g.cream[0],P[N+4]=g.cream[1],P[N+5]=g.cream[2],P[N+6]=a.carry*b*.55*O,P[N+7]=.46}let m=C.pins.data;for(let h=0;h<oe.length;h++){let R=Oe(oe[h],.5,At[h]),b=(W+se+h)*8;d[b]=R[0],d[b+1]=R[1],d[b+2]=R[2],d[b+3]=g.ember[0]*1.5,d[b+4]=g.ember[1]*1.4,d[b+5]=g.ember[2]*1.2,d[b+6]=a.find*O,d[b+7]=.12;let B=o?.5:(ve*.5+h*.25)%1;[[R[0],R[1],R[2],a.find,.62+(o?0:.05*Math.sin(ve*2.4+h))],[R[0],R[1],R[2],a.find*(1-B)*.8,.6+B*1.6],[R[0],X+.01,R[2],a.find*.6,.55]].forEach((H,G)=>{let V=(se+h*3+G)*8;P[V]=H[0],P[V+1]=H[1],P[V+2]=H[2],P[V+3]=g.ember[0],P[V+4]=g.ember[1],P[V+5]=g.ember[2],P[V+6]=H[3]*O,P[V+7]=H[4]});let re=h*8;m[re]=R[0],m[re+1]=R[1]-.12,m[re+2]=R[2],m[re+3]=.5,m[re+4]=R[0],m[re+5]=X+.01,m[re+6]=R[2],m[re+7]=.5}let S=o?0:-7.5+ve/3.8%1*15,_=oe.length*8;m[_]=S,m[_+1]=X+.01,m[_+2]=-5,m[_+3]=.5,m[_+4]=S,m[_+5]=X+.01,m[_+6]=5,m[_+7]=.5,a.scanX=S,a.sweep=o?0:-5.2+ve/5.5%1*10.4,wt+=(L*.55+a.find*.35-wt)*(1-Math.exp(-t*2)),I.sx+=(I.x-I.sx)*(1-Math.exp(-t*2)),I.sy+=(I.y-I.sy)*(1-Math.exp(-t*2));let D=a.tgt.slice(),q=a.eye[0]-D[0],Fe=a.eye[1]-D[1],De=a.eye[2]-D[2],$e=1+(1-Me(ee))*.28+(1-Me(Le))*.045,Xe=window.innerWidth/Math.max(1,window.innerHeight),ft=(s?Math.min(3.1,Math.max(1.6,1.35/Xe)):1)*$e;bt=ft,q*=ft,Fe*=ft,De*=ft;let Jt=o?0:Math.sin(ve*.07)*.07+I.sx*.05+(1-Me(ee))*.35+(1-Me(Le))*.05,Zt=Math.cos(Jt),eo=Math.sin(Jt);Pe=[D[0]+q*Zt+De*eo,D[1]+Fe-I.sy*.5,D[2]-q*eo+De*Zt];let Ne=T(Math.round(le),0,Tt.length-1);Ne!==yt&&Bt&&(yt=Ne,zo.textContent="Fig. "+String(Ne+1).padStart(2,"0"),Bt.textContent=at&&at.stage===Ne?at.text:Tt[Ne],document.dispatchEvent(new CustomEvent("ws:stage",{detail:Ne}))),a.hovIdx=c,a.ci=Ne}function be(t){e.useProgram(t.p),t.u.uProj&&e.uniformMatrix4fv(t.u.uProj,!1,ye),t.u.uView&&e.uniformMatrix4fv(t.u.uView,!1,J),t.u.uFog&&e.uniform3fv(t.u.uFog,g.bg),t.u.uFogRange&&e.uniform2f(t.u.uFogRange,17*bt,54*bt),t.u.uEmber&&e.uniform3fv(t.u.uEmber,g.ember)}function ze(t,o,n,r,a,s){let c=v.line.u;e.uniform3fv(c.uColor,t),e.uniform1f(c.uAlpha,o),e.uniform1f(c.uDash,n||0),e.uniform1f(c.uEnds,r||0),e.uniform1f(c.uDraw,a===void 0?2:a),e.uniform1f(c.uSweepAmt,s||0)}function Wt(t,o){let n=_e;e.viewport(0,0,t,o),uo(ye,34*Math.PI/180,t/o,.1,140),ye[8]-=A()?0:n.dx,fo(J,Pe,n.tgt,[0,1,0]);let r=o*.5*ye[5],a=E(0,.5,ee);e.clearColor(g.bg[0],g.bg[1],g.bg[2],1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.enable(e.BLEND);let s=de(T(n.ground,0,1));be(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanX,n.scanX||0),e.uniform1f(v.point.u.uScanAmt,n.find*.9),e.uniform1f(v.point.u.uFade,a),e.uniform1f(v.point.u.uGain,1),e.uniform1i(v.point.u.uMode,0),e.depthMask(!1),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(C.dots.v),e.drawArrays(e.POINTS,0,C.dots.count),be(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.uniform1i(v.decal.u.uMode,1),e.uniform3fv(v.decal.u.uColor,g.black),e.bindVertexArray(C.floor.v);for(let m=0;m<me.length;m++){let S=K[m],_=S.p[1]-X;ie(k,S.p[0],X+.005,S.p[2],S.ry,3.4+_*.4,1,2.4+_*.3),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,.78*(1-s)/(1+_*.35)*a),e.drawArrays(e.TRIANGLES,0,6)}s>.01&&(ie(k,0,X+.005,0,0,12.5,1,7.5),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,.8*s),e.drawArrays(e.TRIANGLES,0,6)),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.cream),ie(k,0,X+.002,.2,0,17,1,12),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,.035*a),e.drawArrays(e.TRIANGLES,0,6),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.ember);for(let m=0;m<oe.length;m++){let S=At[m];ie(k,S[0],X+.01,S[2],0,3.2,1,3.2),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.uniform1f(v.decal.u.uAlpha,(n.leak*$[oe[m]][2]*.16+n.find*.12)*a),e.drawArrays(e.TRIANGLES,0,6)}e.depthMask(!0),be(v.mesh),e.uniform3fv(v.mesh.u.uCam,Pe),e.uniform1f(v.mesh.u.uBounce,0),e.uniform1f(v.mesh.u.uHi,0),e.uniform1f(v.mesh.u.uSheets,0);let c=E(0,.5,s),u=p(-3.4,-.37,1-Math.pow(1-s,3)),x=[8.44,.5,4.14];c>.005&&(e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),ie(k,0,u,0,0,x[0],x[1],x[2]),e.uniformMatrix4fv(v.mesh.u.uModel,!1,k),e.uniform3fv(v.mesh.u.uColor,g.plinth),e.uniform1f(v.mesh.u.uAlpha,c),e.uniform1f(v.mesh.u.uUseTex,0),e.bindVertexArray(C.box.v),e.drawArrays(e.TRIANGLES,0,36));for(let m of ke){let S=K[m.i];m.d=(S.p[0]-Pe[0])**2+(S.p[1]-Pe[1])**2+(S.p[2]-Pe[2])**2}ke.sort((m,S)=>S.d-m.d||m.k-S.k),be(v.glass),e.uniform3fv(v.glass.u.uCam,Pe),e.uniform3fv(v.glass.u.uCream,g.cream),e.uniform1f(v.glass.u.uAlpha,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindVertexArray(C.box.v);let L=T(n.leak*.7+n.find,0,1)*(1-s);for(let m of ke){let S=K[m.i],_=m.k===Ue-1;ie(k,m.x,m.y,m.z,m.ry,Ee[0],Ee[1],Ee[2]),e.uniformMatrix4fv(v.glass.u.uModel,!1,k),e.uniform1f(v.glass.u.uSeed,m.i+1+m.k*.37),e.uniform1f(v.glass.u.uLevel,_?1:.3+.45*S.hov),e.uniform1f(v.glass.u.uHi,Math.max(S.hov,S.foc*.8)),e.uniform1f(v.glass.u.uGlow,T(S.pulse*n.carry+S.foc*.45+S.hov*.55+n.find*.15,0,1.4)),e.uniform1f(v.glass.u.uBad,L),e.uniform1f(v.glass.u.uBounce,m.k===0?wt*(1-s):0),e.drawArrays(e.TRIANGLES,0,36)}e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.CULL_FACE),be(v.line),e.uniform1f(v.line.u.uTime,ve),e.uniform1f(v.line.u.uSweep,n.sweep||0),e.depthMask(!1),e.blendFunc(e.SRC_ALPHA,e.ONE),e.bindVertexArray(C.edges.v);for(let m of ke){let S=K[m.i],_=Math.max(S.hov,S.foc*.85),D=m.k===Ue-1?1:.4;ie(k,m.x,m.y,m.z,m.ry,Ee[0],Ee[1],Ee[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,k),ze(_>.02?[p(g.cream[0],g.ember[0],_),p(g.cream[1],g.ember[1],_),p(g.cream[2],g.ember[2],_)]:g.cream,D*(.75+.35*S.pulse*n.carry)+_*.35),e.drawArrays(e.LINES,0,24)}e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),c>.005&&(ie(k,0,u,0,0,x[0],x[1],x[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,k),ze(g.ivory,.26*c),e.drawArrays(e.LINES,0,24),e.bindVertexArray(C.plinthGrid.v),ze(g.ivory,.09*c,0,0,2,.9*c),e.drawArrays(e.LINES,0,C.plinthGrid.data.length/4)),ie(k,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,k),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),be(v.ribbon);let d=v.ribbon.u,O=t/Math.max(1,i.clientWidth),P=(.75+.35*n.carry)*O;e.uniform2f(d.uHalf,t*.5,o*.5),e.uniform1f(d.uWidth,P),e.uniform1f(d.uFeather,T(1.3/Math.max(P,.5),.2,1)),e.uniform1f(d.uTime,ve),e.uniform1f(d.uDash,n.carry),e.uniform1f(d.uEnds,1),e.uniform1f(d.uDraw,E(.2,.9,ee)*1.02),e.bindVertexArray(C.ribbons.v),e.bindBuffer(e.ARRAY_BUFFER,C.ribbons.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.ribbons.data);for(let m=0;m<se;m++){let S=he>=0&&($[m][0]===he||$[m][1]===he)?K[he].foc:0,_=n.hovIdx>=0&&($[m][0]===n.hovIdx||$[m][1]===n.hovIdx)?K[n.hovIdx].hov:0,D=Math.max(S,_),q=D>.01?[p(g.curve[0],g.ember[0],D*.7),p(g.curve[1],g.ember[1],D*.7),p(g.curve[2],g.ember[2],D*.7)]:g.curve;e.uniform3fv(d.uColor,q),e.uniform1f(d.uAlpha,.3+.22*n.carry+.06*n.find+D*.35),e.drawArrays(e.TRIANGLE_STRIP,m*j*2,j*2)}be(v.line),ie(k,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,k),n.find>.01&&(e.bindVertexArray(C.pins.v),e.bindBuffer(e.ARRAY_BUFFER,C.pins.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.pins.data),ze(g.ember,.5*n.find),e.drawArrays(e.LINES,0,oe.length*2),ze(g.ember,.85*n.find),e.drawArrays(e.LINES,oe.length*2,2),be(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform1i(v.decal.u.uMode,0),e.uniform3fv(v.decal.u.uColor,g.ember),e.uniform1f(v.decal.u.uAlpha,.14*n.find),ie(k,n.scanX||0,X,0,0,1,3.8,10),e.uniformMatrix4fv(v.decal.u.uModel,!1,k),e.bindVertexArray(C.sheet.v),e.drawArrays(e.TRIANGLES,0,6)),be(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanAmt,0),e.uniform1f(v.point.u.uFade,1),e.uniform1f(v.point.u.uGain,l.on?1.35:1),e.blendFunc(e.ONE,e.ONE),e.uniform1i(v.point.u.uMode,1),e.bindVertexArray(C.particles.v),e.bindBuffer(e.ARRAY_BUFFER,C.particles.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.particles.data),e.drawArrays(e.POINTS,0,W+_t),(n.find>.01||n.carry>.01)&&(e.uniform1i(v.point.u.uMode,2),e.bindVertexArray(C.markers.v),e.bindBuffer(e.ARRAY_BUFFER,C.markers.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.markers.data),e.drawArrays(e.POINTS,0,Pt)),e.depthMask(!0),e.bindVertexArray(null)}function Ce(t,o,n){e.bindFramebuffer(e.FRAMEBUFFER,o?o.fbo:null),e.viewport(0,0,o?o.w:i.width,o?o.h:i.height),e.useProgram(t.p),n(t.u),e.bindVertexArray(l.tri.v),e.drawArrays(e.TRIANGLES,0,3)}function xe(t,o,n){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(n,t)}function Ye(){Xo();let t=i.width,o=i.height;if(!l.on){e.bindFramebuffer(e.FRAMEBUFFER,null),Wt(t,o),Et(_e);return}e.bindFramebuffer(e.FRAMEBUFFER,l.ms?l.ms.fbo:l.scene.fbo),Wt(t,o),l.ms&&(e.bindFramebuffer(e.READ_FRAMEBUFFER,l.ms.fbo),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.scene.fbo),e.blitFramebuffer(0,0,t,o,0,0,t,o,e.COLOR_BUFFER_BIT,e.NEAREST)),e.disable(e.DEPTH_TEST),e.disable(e.BLEND);let n=l.hdr?.58:.46;Ce(l.bright,l.h1,a=>{xe(0,l.scene.tex,a.uTex),e.uniform2f(a.uTexel,1/t,1/o),e.uniform1f(a.uThresh,n)}),Ce(l.blur,l.h2,a=>{xe(0,l.h1.tex,a.uTex),e.uniform2f(a.uDir,1/l.h1.w,0)}),Ce(l.blur,l.h1,a=>{xe(0,l.h2.tex,a.uTex),e.uniform2f(a.uDir,0,1/l.h1.h)}),Ce(l.bright,l.q1,a=>{xe(0,l.h1.tex,a.uTex),e.uniform2f(a.uTexel,1/l.h1.w,1/l.h1.h),e.uniform1f(a.uThresh,0)});for(let a=0;a<2;a++)Ce(l.blur,l.q2,s=>{xe(0,l.q1.tex,s.uTex),e.uniform2f(s.uDir,1.5/l.q1.w,0)}),Ce(l.blur,l.q1,s=>{xe(0,l.q2.tex,s.uTex),e.uniform2f(s.uDir,0,1.5/l.q1.h)});let r=_e;Ce(l.comp,null,a=>{xe(0,l.scene.tex,a.uScene),xe(1,l.h1.tex,a.uB1),xe(2,l.q1.tex,a.uB2),e.uniform1f(a.uBloom,1.85+r.find*.45+r.carry*.12),e.uniform2f(a.uRes,t,o),e.uniform2f(a.uCenter,A()?.5:.5+r.dx*.5,.48),e.uniform1f(a.uTime,ve)}),e.bindVertexArray(null),Et(r)}let $t=st.map(()=>({o:-1}));function Et(t){let o=i.clientWidth,n=i.clientHeight;if(st.length){let u=t.find>.02&&ee>.8,x=A(),L=Math.min(st.length,oe.length),d=x?(ve/3.8%L+L)%L:0,O=Math.floor(d),P=d-O,m=P<.18?P/.18:P>.82?(1-P)/.18:1;for(let S=0;S<L;S++){let _=st[S],D=0;if(u&&x)S===O&&(_.style.transform=`translate3d(${(o*.5).toFixed(1)}px, ${(n*.4).toFixed(1)}px, 0)`,D=E(.55,.95,t.find)*m);else if(u){let q=lt(At[S]);if(q){let Fe=E(o*.44,o*.52,q[0])*(1-E(o-40,o,q[0]+180))*E(90,160,q[1]);D=E(.55,.95,t.find)*Fe,_.style.transform=`translate3d(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px, 0)`}}Math.abs(D-$t[S].o)>.01&&(_.style.opacity=D.toFixed(3),$t[S].o=D)}}let r=je&&ee>.9?1-E(.15,.6,t.find):0,a=A();for(let u=0;u<ct.length;u++){let x=0;if(r>0){let L=K[u],d=lt([L.p[0],L.top+.05,L.p[2]]);if(d){let O=a?E(8,24,d[0])*(1-E(o-24,o-8,d[0])):E(o*.46,o*.54,d[0])*(1-E(o-30,o,d[0]+60));x=r*(1-L.hov)*O*E(96,150,d[1])*(1-E(n-90,n-40,d[1])),x>.01&&(ct[u].style.transform=`translate3d(${d[0].toFixed(1)}px, ${d[1].toFixed(1)}px, 0)`)}}Math.abs(x-Ht[u])>.01&&(ct[u].style.opacity=x.toFixed(3),Ht[u]=x)}let s=t.hovIdx===void 0?-1:t.hovIdx,c=0;if(s>=0&&je){let u=K[s],x=lt([u.p[0],u.top+.12,u.p[2]]);x&&(c=u.hov,(Ot!==s||Q.dataset.ci!==String(t.ci))&&(Ot=s,Q.dataset.ci=String(t.ci),Yo.textContent=`${me[s].id} \xB7 ${String(s+1).padStart(2,"0")} / 06`,jo.textContent=me[s].name,Go.textContent=me[s].note,Wo.textContent=Lt[t.ci]||Lt[0]),Q.style.transform=`translate3d(${x[0].toFixed(1)}px, ${x[1].toFixed(1)}px, 0)`)}Math.abs(c-qt)>.01&&(Q.style.opacity=c.toFixed(3),qt=c),f.classList.toggle("is-inspecting",c>.4)}let St=0,je=!1,Xt=/[?&]wsdebug\b/.test(location.search);Xt&&(window.__wsScene={step(t,o=1){for(let n=0;n<o;n++)Ve(t);return Ye(),{stage:le,intro:ee}},hover(t,o){I.px=t,I.py=o,I.x=t/window.innerWidth*2-1,I.y=o/window.innerHeight*2-1,I.active=t>=0}});function Kt(t){if(Xt)return;St=requestAnimationFrame(Kt);let o=t/1e3,n=qe?o-qe:0,r=qe?Math.min(.05,n):1/60;qe=o,$o(n),Ve(r),Ye()}function Ge(t){t!==je&&(je=t,t?(qe=0,St=requestAnimationFrame(Kt)):(cancelAnimationFrame(St),Et(Object.assign({},_e,{hovIdx:-1,find:0}))))}let We=Array.from(document.querySelectorAll("[data-canvas]")),ut=new Map,Ft=new IntersectionObserver(t=>{t.forEach(o=>ut.set(o.target,o.isIntersecting)),Ge(!document.hidden&&Array.from(ut.values()).some(Boolean))},{rootMargin:"80px 0px"});We.forEach(t=>Ft.observe(t)),document.addEventListener("visibilitychange",()=>{Ge(!document.hidden&&Array.from(ut.values()).some(Boolean))}),document.addEventListener("ws:route",()=>{Ft.disconnect(),ut.clear(),We=Array.from(document.querySelectorAll("[data-canvas]")),We.forEach(o=>Ft.observe(o));let t=Nt(_e);rt(),le=gt(),yt=-1,w.matches||(ue={from:t,t:0},Le=Math.min(Le,.4)),Ve(0),Ye(),We.length||Ge(!1)}),window.addEventListener("resize",()=>{rt(),je||(Ve(0),Ye())},{passive:!0}),i.addEventListener("webglcontextlost",t=>{t.preventDefault(),Ge(!1),f.classList.add("no-webgl")}),rt(),le=gt(),Yt=le<.5?2.6:2,kt=le<.5?5.5:1.4;let Qt="ws-cam";if(!F&&!w.matches)try{let t=JSON.parse(sessionStorage.getItem(Qt)||"null");t&&Date.now()-t.at<8e3&&t.st&&t.st.eye&&(ue={from:t.st,t:0})}catch{}window.addEventListener("pagehide",()=>{try{sessionStorage.setItem(Qt,JSON.stringify({at:Date.now(),st:Nt(_e)}))}catch{}}),He=!0;for(let t=0;t<90;t++)Ve(1/30);He=!1,Ye(),f.classList.add("scene-ready"),We.length||Ge(!0)}var te=document.documentElement,io=te.dataset.bundle==="1",Ie=window.matchMedia("(prefers-reduced-motion: reduce)").matches;te.classList.add("js-ready");location.protocol==="file:"&&!io&&document.querySelectorAll("a[href]").forEach(i=>{let f=i.getAttribute("href");if(/^(https?:|mailto:|tel:|#)/.test(f))return;let[F,A]=f.split("#");F&&F.endsWith("/")&&i.setAttribute("href",`${F}index.html${A?`#${A}`:""}`)});var z=document.getElementById("nav"),Je=document.getElementById("menu-btn"),fe=z&&z.querySelector(".drop-btn"),Ze=document.getElementById("mega"),so=[],Mt=!1;function dt(){if(Mt=!1,!z)return;let i=36,f=window.innerHeight-44,F="dark",A=!1;for(let e of so){let w=e.getBoundingClientRect();w.top<=i&&w.bottom>i&&(F=e.dataset.tone),w.top<=f&&w.bottom>f&&(A=e.hasAttribute("data-canvas")&&!e.hasAttribute("data-no-hud"))}let y=z.classList.contains("is-open")||z.classList.contains("is-drop");z.classList.toggle("is-paper",F==="paper"&&!y),z.classList.toggle("is-scrolled",window.scrollY>24),te.classList.toggle("hud-on",A)}var co=()=>{Mt||(Mt=!0,requestAnimationFrame(dt))};window.addEventListener("scroll",co,{passive:!0});window.addEventListener("resize",co,{passive:!0});var Qe=window.matchMedia("(min-width: 1061px)"),ao=window.matchMedia("(hover: hover)"),ro=0;function we(i){!fe||!Ze||(fe.setAttribute("aria-expanded",String(i)),Ze.hidden=!i,z.classList.toggle("is-drop",i&&Qe.matches),dt())}if(fe&&Ze){let i=fe.parentElement;fe.addEventListener("click",()=>we(fe.getAttribute("aria-expanded")!=="true")),i.addEventListener("mouseenter",()=>{ao.matches&&Qe.matches&&(clearTimeout(ro),we(!0))}),i.addEventListener("mouseleave",()=>{ao.matches&&Qe.matches&&(ro=setTimeout(()=>we(!1),160))}),i.addEventListener("focusout",f=>{Qe.matches&&!i.contains(f.relatedTarget)&&we(!1)}),document.addEventListener("click",f=>{Qe.matches&&!i.contains(f.target)&&we(!1)})}function mt(i){!z||!Je||(z.classList.toggle("is-open",i),Je.setAttribute("aria-expanded",String(i)),i||we(!1),dt())}Je&&Je.addEventListener("click",()=>mt(!z.classList.contains("is-open")));z&&z.addEventListener("click",i=>{i.target.closest(".nav-links a")&&(mt(!1),we(!1))});document.addEventListener("keydown",i=>{i.key==="Escape"&&(fe&&fe.getAttribute("aria-expanded")==="true"?(we(!1),fe.focus()):z&&z.classList.contains("is-open")&&(mt(!1),Je.focus()))});function Qo(i){let f=Array.from(i.querySelectorAll(".svc"));f.forEach(y=>{let e=y.querySelector(".svc-row"),w=y.querySelector(".svc-body");e.addEventListener("click",()=>{let M=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!M)),w.hidden=M,y.classList.toggle("is-open",!M)})});let F=Array.from(i.querySelectorAll(".filters [data-filter]")),A=y=>{F.forEach(w=>w.setAttribute("aria-pressed",String(w.dataset.filter===y)));let e=null;f.forEach(w=>{let M=y==="all"||w.dataset.v===y;w.hidden=!M,M&&!e&&(e=w)}),y!=="all"&&e&&!e.classList.contains("is-open")&&e.querySelector(".svc-row").click()};F.forEach(y=>y.addEventListener("click",()=>A(y.dataset.filter)))}function Jo(i){let f=i.querySelector("[data-brief]");if(!f)return;let F=f.querySelector("[data-status]"),A=f.dataset.to,y=(e,w)=>{F.textContent=e,F.classList.toggle("is-error",w==="error"),F.classList.toggle("is-ok",w==="ok")};f.addEventListener("submit",async e=>{e.preventDefault();let w=new FormData(f),M=String(w.get("name")||"").trim(),g=String(w.get("email")||"").trim(),p=String(w.get("company")||"").trim(),T=String(w.get("message")||"").trim(),E=[];if(M||E.push("your name"),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g)||E.push("a work email we can reply to"),E.length){y(`Add ${E.join(" and ")}, then send again.`,"error"),(M?f.elements.email:f.elements.name).focus();return}if(f.elements.consent&&!f.elements.consent.checked){y("Tick the consent box so we can reply, then send again.","error"),f.elements.consent.focus();return}if(f.dataset.endpoint){try{y("Sending\u2026");let Re=await fetch(f.dataset.endpoint,{method:"POST",body:w,headers:{Accept:"application/json"}});if(!Re.ok)throw new Error(String(Re.status));f.reset(),y("Received. We reply within two working days.","ok")}catch{y(`That did not go through. Write to ${A} and we will pick it up.`,"error")}return}let de=[`Name: ${M}`,`Company: ${p||"\u2014"}`,`Email: ${g}`];T&&de.push("","Your thoughts:",T);let Me=`Scoping conversation${p?` \u2014 ${p}`:""}`;y(`Your email app should open with the request filled in. If it doesn\u2019t, write to ${A}.`,"ok"),window.location.href=`mailto:${A}?subject=${encodeURIComponent(Me)}&body=${encodeURIComponent(de.join(`
`))}`})}function Zo(i){let f=i.querySelector("[data-ledger]");if(!f)return;if(Ie||!("IntersectionObserver"in window)){f.classList.add("is-run");return}let F=new IntersectionObserver(([A])=>{A.isIntersecting&&(f.classList.add("is-run"),F.disconnect())},{threshold:.3});F.observe(f)}function en(i){let f=Array.from(i.querySelectorAll(".h2, .v-title, .h-limits, .display-2, .tl-body h2")).filter(y=>!y.dataset.split&&y.children.length===0);if(Ie||!("IntersectionObserver"in window))return;let F=window.innerHeight,A=new IntersectionObserver(y=>{y.forEach(e=>{e.isIntersecting&&(e.target.classList.add("is-in"),A.unobserve(e.target))})},{rootMargin:"0px 0px -12% 0px"});f.forEach(y=>{let e=y.textContent.trim().split(/\s+/);if(y.dataset.split="1",y.setAttribute("aria-label",y.textContent.trim()),y.innerHTML=e.map((w,M)=>`<span class="rw" aria-hidden="true"><span style="--i:${M}">${w.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span></span>`).join(" "),y.classList.add("rise"),y.getBoundingClientRect().top<F*.9){let w=()=>te.classList.contains("js-loading")?setTimeout(w,120):requestAnimationFrame(()=>y.classList.add("is-in"));w()}else A.observe(y)})}function tn(i){let f=i.querySelector(".lg-toc");if(!f||!("IntersectionObserver"in window))return;let F=new Map(Array.from(f.querySelectorAll('a[href^="#"]')).map(e=>[e.getAttribute("href").slice(1),e])),A=new Set,y=new IntersectionObserver(e=>{e.forEach(M=>M.isIntersecting?A.add(M.target.id):A.delete(M.target.id));let w=Array.from(F.keys()).find(M=>A.has(M));w&&F.forEach((M,g)=>g===w?M.setAttribute("aria-current","true"):M.removeAttribute("aria-current"))},{rootMargin:"-20% 0px -55% 0px"});i.querySelectorAll(".lg-sec").forEach(e=>y.observe(e))}function on(i){let f=Array.from(i.querySelectorAll("[data-count]"));if(!f.length||Ie||!("IntersectionObserver"in window))return;let F=new IntersectionObserver(A=>{A.forEach(y=>{if(!y.isIntersecting)return;F.unobserve(y.target);let e=y.target,w=+e.dataset.count,M=performance.now(),g=p=>{let T=Math.min(1,(p-M)/1300);e.textContent=String(Math.round(w*(1-Math.pow(1-T,4)))),T<1&&requestAnimationFrame(g)};e.textContent="0",requestAnimationFrame(g)})},{threshold:.4});f.forEach(A=>F.observe(A))}function lo(i=document){so=Array.from(document.querySelectorAll("[data-tone]")),Qo(i),Jo(i),Zo(i),en(i),on(i),tn(i),document.querySelectorAll("[data-year]").forEach(f=>{f.textContent=String(new Date().getFullYear())}),dt()}lo();document.addEventListener("keydown",i=>{if(i.key!=="ArrowLeft"&&i.key!=="ArrowRight"||i.defaultPrevented||i.altKey||i.ctrlKey||i.metaKey||i.shiftKey||i.target.closest&&i.target.closest("input, textarea, select, button, [contenteditable], .spec-scroll, .nav-links")||z&&z.classList.contains("is-open")||Ze&&!Ze.hidden)return;let f=document.querySelector(i.key==="ArrowRight"?'.pager a[rel="next"], .pager a[rel="first"]':'.pager a[rel="prev"]');f&&(i.preventDefault(),f.click())});(function(){if(!te.classList.contains("js-loading"))return;let f=document.querySelector(".curtain");if(!f){te.classList.remove("js-loading");return}let F=f.querySelector(".c-count"),A=f.querySelector(".c-bar i"),y=performance.now(),e=1250,w=M=>{let g=te.classList.contains("scene-ready")||te.classList.contains("no-webgl"),p=Math.min(1,(M-y)/e),T=g?p:Math.min(p,.86),E=Math.round(100*(1-Math.pow(1-T,2.2)));if(F.textContent=String(E).padStart(2,"0"),A.style.transform=`scaleX(${E/100})`,T<1){requestAnimationFrame(w);return}te.classList.add("curtain-lift"),setTimeout(()=>te.classList.remove("js-loading"),380),setTimeout(()=>te.classList.remove("curtain-lift"),1100);try{sessionStorage.setItem("ws-seen","1")}catch{}};requestAnimationFrame(w)})();document.addEventListener("ws:stage",i=>{document.querySelectorAll(".scrub [data-stage-link]").forEach(f=>{+f.dataset.stageLink===i.detail?f.setAttribute("aria-current","step"):f.removeAttribute("aria-current")})});window.matchMedia("(hover: hover) and (pointer: fine)").matches&&!Ie&&(document.addEventListener("pointermove",i=>{let f=i.target.closest&&i.target.closest(".spot");if(f){let A=f.getBoundingClientRect();f.style.setProperty("--mx",`${i.clientX-A.left}px`),f.style.setProperty("--my",`${i.clientY-A.top}px`)}let F=i.target.closest&&i.target.closest('.btn-ember:not([type="submit"])');if(F){let A=F.getBoundingClientRect(),y=(i.clientX-(A.left+A.width/2))/A.width,e=(i.clientY-(A.top+A.height/2))/A.height;F.style.transform=`translate(${(y*8).toFixed(1)}px, ${(e*6).toFixed(1)}px)`}},{passive:!0}),document.addEventListener("pointerout",i=>{let f=i.target.closest&&i.target.closest(".btn-ember");f&&!f.contains(i.relatedTarget)&&(f.style.transform="")}));(function(){let f=()=>document.querySelectorAll("[data-clock]"),F;try{F=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return}let A=()=>f().forEach(y=>{y.textContent=`Hyderabad \xB7 ${F.format(new Date)} IST`});A(),setInterval(A,2e4)})();no();if(io){let i=document.getElementById("page"),f=new Map(Array.from(document.querySelectorAll("template[data-route]")).map(p=>[p.dataset.route,p])),F=p=>p&&p.startsWith("#/")?p.slice(1).split("#")[0]:"/",A=p=>requestAnimationFrame(()=>{let T=p&&document.getElementById(p);T&&T.scrollIntoView({block:"start"})}),y="/",e=p=>{z.querySelectorAll(".nav-links > a[data-key]").forEach(T=>{let E=F(T.getAttribute("href"));E!=="/"&&p.startsWith(E)?T.setAttribute("aria-current","page"):T.removeAttribute("aria-current")}),fe&&fe.toggleAttribute("data-current",/^\/(services|verticals)\//.test(p))},w=(p,{scroll:T=!0}={})=>{let E=f.get(p)||f.get("/404/");y=f.has(p)?p:"/404/",i.replaceChildren(E.content.cloneNode(!0)),document.title=E.dataset.title,e(y),T&&(te.style.scrollBehavior="auto",window.scrollTo(0,0),te.style.scrollBehavior=""),lo(i),document.dispatchEvent(new Event("ws:route"))},M=(p,T)=>{if(p===y){window.scrollTo({top:0,behavior:Ie?"auto":"smooth"});return}if(mt(!1),we(!1),y=f.has(p)?p:"/404/",T)try{history.pushState({route:p},"",`#${p}`)}catch{}w(p),!Ie&&i.animate&&i.animate([{opacity:0},{opacity:1}],{duration:380,easing:"cubic-bezier(0.2, 0.7, 0.1, 1)"})};document.addEventListener("click",p=>{let T=p.target.closest('a[href^="#"]');if(!T||p.defaultPrevented||p.metaKey||p.ctrlKey||p.shiftKey)return;let E=T.getAttribute("href");if(p.preventDefault(),E.startsWith("#/")){M(F(E),!0),A(E.slice(2).split("#")[1]);return}let de=E.length>1&&document.getElementById(E.slice(1));de&&de.scrollIntoView({behavior:Ie?"auto":"smooth",block:"start"})}),window.addEventListener("popstate",()=>M(F(location.hash),!1)),window.addEventListener("hashchange",()=>{let p=F(location.hash);p!==y&&M(p,!1)});let g=F(location.hash);g!=="/"?w(g,{scroll:!1}):e("/")}})();
