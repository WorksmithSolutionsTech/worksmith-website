(()=>{function ao(){let i=document.getElementById("scene");if(!i)return;let f=document.documentElement,F=f.classList.contains("js-loading"),A=()=>window.innerWidth<860,b=A(),e=null;try{e=i.getContext("webgl2",{antialias:b,alpha:!1,depth:!0,stencil:!1,powerPreference:"high-performance"})}catch{e=null}if(!e){f.classList.add("no-webgl");return}let w=window.matchMedia("(prefers-reduced-motion: reduce)"),T=t=>[parseInt(t.slice(1,3),16)/255,parseInt(t.slice(3,5),16)/255,parseInt(t.slice(5,7),16)/255],g={bg:T("#171412"),ivory:T("#ebe5d9"),plinth:T("#2a2521"),curve:T("#978b80"),cream:T("#f3eee6"),ember:T("#e5602f"),dot:T("#6a6058"),black:[.02,.016,.014]},p=(t,o,n)=>t+(o-t)*n,R=(t,o,n)=>Math.min(n,Math.max(o,t)),E=(t,o,n)=>{let r=R((n-t)/(o-t),0,1);return r*r*(3-2*r)},de=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,Re=t=>1-Math.pow(1-t,3),Te=()=>new Float32Array(16);function fo(t,o,n,r,a){let c=1/Math.tan(o/2),s=1/(r-a);return t.fill(0),t[0]=c/n,t[5]=c,t[10]=(a+r)*s,t[11]=-1,t[14]=2*a*r*s,t}function mo(t,o,n,r){let a=o[0]-n[0],c=o[1]-n[1],s=o[2]-n[2],u=Math.hypot(a,c,s);a/=u,c/=u,s/=u;let x=r[1]*s-r[2]*c,L=r[2]*a-r[0]*s,m=r[0]*c-r[1]*a;u=Math.hypot(x,L,m),x/=u,L/=u,m/=u;let O=c*m-s*L,P=s*x-a*m,h=a*L-c*x;return t[0]=x,t[1]=O,t[2]=a,t[3]=0,t[4]=L,t[5]=P,t[6]=c,t[7]=0,t[8]=m,t[9]=h,t[10]=s,t[11]=0,t[12]=-(x*o[0]+L*o[1]+m*o[2]),t[13]=-(O*o[0]+P*o[1]+h*o[2]),t[14]=-(a*o[0]+c*o[1]+s*o[2]),t[15]=1,t}function se(t,o,n,r,a,c,s,u){let x=Math.cos(a),L=Math.sin(a);return t.fill(0),t[0]=x*c,t[2]=-L*c,t[5]=s,t[8]=L*u,t[10]=x*u,t[12]=o,t[13]=n,t[14]=r,t[15]=1,t}let ho=`#version 300 es
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
}`,Ao=`#version 300 es
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
}`,wo=`#version 300 es
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
}`;function Rt(t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n)||"shader");return n}function pe(t,o){let n=e.createProgram();if(e.attachShader(n,Rt(e.VERTEX_SHADER,t)),e.attachShader(n,Rt(e.FRAGMENT_SHADER,o)),e.linkProgram(n),!e.getProgramParameter(n,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(n)||"link");let r={},a=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let c=0;c<a;c++){let s=e.getActiveUniform(n,c);r[s.name]=e.getUniformLocation(n,s.name)}return{p:n,u:r}}let Se=[2.4,.03,1.56],Ue=5,me=[{id:"SYS-01",name:"ERP",note:"orders \xB7 dispatch",a:[-4.4,.7,-1.6],ay:.28,b:[-2.62,0,-.89]},{id:"SYS-02",name:"Ledger",note:"books \xB7 GST returns",a:[.3,1.5,-3.8],ay:-.16,b:[0,0,-.89]},{id:"SYS-03",name:"Stock",note:"inventory \xB7 3 sites",a:[4.6,.35,-1.1],ay:.38,b:[2.62,0,-.89]},{id:"SYS-04",name:"WhatsApp",note:"vendors \xB7 customers",a:[3.5,1.15,3],ay:-.32,b:[2.62,0,.89]},{id:"SYS-05",name:"Sheets",note:"final_v2.xlsx",a:[-.6,-.05,3.4],ay:.18,b:[0,0,.89]},{id:"SYS-06",name:"Bank",note:"receipts \xB7 payments",a:[-4.7,1.25,2.2],ay:-.22,b:[-2.62,0,.89]}],$=[[0,1,1],[1,2,.25],[2,3,1],[3,4,.25],[4,5,1],[5,0,.25],[0,2,.2],[1,4,1],[5,3,.2]],ne=[0,2,4,7],ce=$.length,Y=64,X=-1.4,et=[{eye:[17.7,13,22.2],tgt:[0,.3,0],dx:.56,leak:.45,find:0,carry:0,ground:0,flow:1},{eye:[14.5,5.4,17.5],tgt:[0,.5,0],dx:.6,leak:.95,find:0,carry:0,ground:0,flow:.7},{eye:[-12.65,10.45,14.85],tgt:[0,.4,0],dx:.5,leak:.6,find:1,carry:0,ground:0,flow:.5},{eye:[1.98,24.4,15.8],tgt:[0,-.2,.4],dx:.5,leak:0,find:0,carry:1,ground:0,flow:1.7},{eye:[10.45,3.96,11.55],tgt:[0,-.2,0],dx:.56,leak:0,find:0,carry:.3,ground:1,flow:1},{eye:[13.2,11,16.5],tgt:[0,-.2,0],dx:.48,leak:0,find:0,carry:.7,ground:1,flow:1.2},{eye:[-14.3,11,18.7],tgt:[0,-.3,0],dx:.6,leak:0,find:0,carry:.5,ground:1,flow:1}],Tt=["Six systems, each individually correct.","Value leaving between systems \u2014 not inside any one of them.","Vertical I \u2014 the gaps located and put on record.","Vertical II \u2014 work carried end to end, nothing dropped.","Vertical III \u2014 the record layer everything stands on.","Diagnose, ground, then automate.","Measured against the baseline agreed at the start."],Lt=["Status \xB7 0 errors \xB7 every record valid","Correct inside \xB7 value leaving at its edges","Correct inside \xB7 gaps now on record","Work carried in and out \xB7 every step logged","Standing on the shared record layer","Grounded first \xB7 then automated","Measured against the agreed baseline"];function ae(t,o,n){let r=e.createVertexArray(),a=e.createBuffer();e.bindVertexArray(r),e.bindBuffer(e.ARRAY_BUFFER,a),e.bufferData(e.ARRAY_BUFFER,o,n||e.STATIC_DRAW);let c=t.reduce((u,x)=>u+x,0),s=0;return t.forEach((u,x)=>{e.enableVertexAttribArray(x),e.vertexAttribPointer(x,u,e.FLOAT,!1,c*4,s*4),s+=u}),e.bindVertexArray(null),{v:r,b:a,data:o}}function Lo(){let t=[[[1,0,0],[0,1,0],[0,0,1]],[[-1,0,0],[0,0,1],[0,1,0]],[[0,1,0],[0,0,1],[1,0,0]],[[0,-1,0],[1,0,0],[0,0,1]],[[0,0,1],[1,0,0],[0,1,0]],[[0,0,-1],[0,1,0],[1,0,0]]],o=[],n=(r,a,c,s,u)=>[0,1,2].map(x=>r[x]*.5+a[x]*s*.5+c[x]*u*.5);return t.forEach(([r,a,c])=>{[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]].forEach(([u,x])=>{o.push(...n(r,a,c,u,x),...r,0,0)})}),new Float32Array(o)}function _o(){let t=[-.5,.5],o=[];for(let n of t)for(let r of t)o.push(-.5,n,r,.5,.5,n,r,.5),o.push(n,-.5,r,.5,n,.5,r,.5),o.push(n,r,-.5,.5,n,r,.5,.5);return new Float32Array(o)}function Po(t,o){let n=[];for(let a=1;a<t;a++){let c=-.5+a/t;n.push(c,.52,-.5,.5,c,.52,.5,.5)}for(let a=1;a<o;a++){let c=-.5+a/o;n.push(-.5,.52,c,.5,.5,.52,c,.5)}return new Float32Array(n)}function Co(){let t=[[-.5,-.5],[.5,-.5],[.5,.5],[-.5,-.5],[.5,.5],[-.5,.5]],o=[];return t.forEach(([n,r])=>o.push(n,0,r,n+.5,r+.5)),new Float32Array(o)}function Do(){let t=[[0,-.5],[1,-.5],[1,.5],[0,-.5],[1,.5],[0,.5]],o=[];return t.forEach(([n,r])=>o.push(0,n,r,r+.5,n)),new Float32Array(o)}function Io(){let t=[];for(let r=-22;r<=22+1e-6;r+=.55)for(let a=-22;a<=22+1e-6;a+=.55){let c=Math.hypot(r,a),s=.75*(1-E(6,21,c));s<=.01||t.push(r,X,a,g.dot[0],g.dot[1],g.dot[2],s,.034)}return new Float32Array(t)}let No=()=>ae([2],new Float32Array([-1,-1,3,-1,-1,3])),v,C,G=b?760:1600,_t=ce+ne.length,Pt=ce+ne.length*3;try{v={mesh:pe(ho,vo),line:pe(yo,bo),point:pe(wo,Eo),decal:pe(So,Fo),glass:pe(po,go),ribbon:pe(xo,Ao)},C={box:ae([3,3,2],Lo()),edges:ae([3,1],_o()),plinthGrid:ae([3,1],Po(19,9)),floor:ae([3,2],Co()),sheet:ae([3,2],Do()),dots:ae([3,4,1],Io()),curves:ae([3,1],new Float32Array(ce*Y*4),e.DYNAMIC_DRAW),ribbons:ae([3,3,3,1,1],new Float32Array(ce*Y*2*11),e.DYNAMIC_DRAW),particles:ae([3,4,1],new Float32Array((G+_t)*8),e.DYNAMIC_DRAW),markers:ae([3,4,1],new Float32Array(Pt*8),e.DYNAMIC_DRAW),pins:ae([3,1],new Float32Array((ne.length*2+2)*4),e.DYNAMIC_DRAW)},C.dots.count=C.dots.data.length/8}catch(t){console.warn("[scene] WebGL init failed:",t),f.classList.add("no-webgl");return}let l={on:!1,w:0,h:0};function ko(){if(!b)try{l.hdr=!!e.getExtension("EXT_color_buffer_float"),l.fmt=l.hdr?e.RGBA16F:e.RGBA8,l.type=l.hdr?e.HALF_FLOAT:e.UNSIGNED_BYTE,l.samples=Math.min(4,e.getParameter(e.MAX_SAMPLES)||0),l.bright=pe(ht,Mo),l.blur=pe(ht,Ro),l.comp=pe(ht,To),l.tri=No(),l.on=!0}catch(t){console.warn("[scene] post-processing off:",t),l.on=!1}}function Uo(t,o){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texImage2D(e.TEXTURE_2D,0,l.fmt,t,o,0,e.RGBA,l.type,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}function qe(t,o,n){let r={w:t,h:o,tex:Uo(t,o),fbo:e.createFramebuffer()};return e.bindFramebuffer(e.FRAMEBUFFER,r.fbo),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r.tex,0),n&&(r.depth=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,r.depth),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,r.depth)),r.ok=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,r}function Bo(t){t&&(e.deleteTexture(t.tex),e.deleteFramebuffer(t.fbo),t.depth&&e.deleteRenderbuffer(t.depth))}function Oo(t,o){if(!l.on||l.w===t&&l.h===o)return;l.w=t,l.h=o,[l.scene,l.h1,l.h2,l.q1,l.q2].forEach(Bo),l.ms&&(e.deleteFramebuffer(l.ms.fbo),e.deleteRenderbuffer(l.ms.color),e.deleteRenderbuffer(l.ms.depth),l.ms=null),l.scene=qe(t,o,l.samples===0);let n=Math.max(1,t>>1),r=Math.max(1,o>>1),a=Math.max(1,t>>3),c=Math.max(1,o>>3);l.h1=qe(n,r),l.h2=qe(n,r),l.q1=qe(a,c),l.q2=qe(a,c);let s=l.scene.ok&&l.h1.ok&&l.h2.ok&&l.q1.ok&&l.q2.ok;if(s&&l.samples>0){let u={fbo:e.createFramebuffer(),color:e.createRenderbuffer(),depth:e.createRenderbuffer()};e.bindFramebuffer(e.FRAMEBUFFER,u.fbo),e.bindRenderbuffer(e.RENDERBUFFER,u.color),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,l.fmt,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.color),e.bindRenderbuffer(e.RENDERBUFFER,u.depth),e.renderbufferStorageMultisample(e.RENDERBUFFER,l.samples,e.DEPTH_COMPONENT24,t,o),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,u.depth),s=e.checkFramebufferStatus(e.FRAMEBUFFER)===e.FRAMEBUFFER_COMPLETE,l.ms=u}e.bindFramebuffer(e.FRAMEBUFFER,null),s||(console.warn("[scene] render targets incomplete; drawing direct"),l.on=!1)}ko();let vt=new Uint8Array(G),Fe=new Uint8Array(G),tt=new Float32Array(G),Ct=new Float32Array(G),ot=new Float32Array(G),nt=new Float32Array(G),pt=new Float32Array(G),re=new Float32Array(G*3),le=new Float32Array(G*3);for(let t=0;t<G;t++)vt[t]=t%ce,tt[t]=Math.random(),Ct[t]=.09+Math.random()*.06,Fe[t]=Math.random()<.45*$[vt[t]][2]?1:0,ot[t]=.38+Math.random()*.24;let ge=[],he=-1,at=null;function rt(){ge=Array.from(document.querySelectorAll("[data-stage]")).map(n=>({i:+n.dataset.stage,top:n.getBoundingClientRect().top+window.scrollY})).sort((n,r)=>n.top-r.top);let t=document.querySelector("[data-focus]");he=t?+t.dataset.focus:-1;let o=document.querySelector("[data-caption]");at=o?{stage:+o.dataset.stage,text:o.dataset.caption}:null}function gt(){if(!ge.length)return 0;let t=window.scrollY+window.innerHeight*.5,o=0;for(let c=0;c<ge.length;c++)ge[c].top<=t&&(o=c);if(o>=ge.length-1||t<ge[0].top)return ge[o].i;let n=ge[o],r=ge[o+1],a=(t-n.top)/Math.max(1,r.top-n.top);return n.i+(r.i-n.i)*E(.55,1,a)}let qo=["dx","leak","find","carry","ground","flow"];function Dt(t,o){let n=t[0]-o[0],r=t[1]-o[1],a=t[2]-o[2],c=Math.hypot(n,r,a)||1;return[c,Math.atan2(n,a),Math.asin(R(r/c,-1,1))]}function Ho(t,o,n){let r=o-t;for(;r>Math.PI;)r-=Math.PI*2;for(;r<-Math.PI;)r+=Math.PI*2;return t+r*n}function it(t,o,n){let r={};for(let L of qo)r[L]=p(t[L],o[L],n);if(r.tgt=[0,1,2].map(L=>p(t.tgt[L],o.tgt[L],n)),n<=0)return r.eye=t.eye.slice(),r;if(n>=1)return r.eye=o.eye.slice(),r;let a=Dt(t.eye,t.tgt),c=Dt(o.eye,o.tgt),s=Math.exp(p(Math.log(a[0]),Math.log(c[0]),n)),u=Ho(a[1],c[1],n),x=p(a[2],c[2],n);return r.eye=[r.tgt[0]+s*Math.cos(x)*Math.sin(u),r.tgt[1]+s*Math.sin(x),r.tgt[2]+s*Math.cos(x)*Math.cos(u)],r}let It=t=>it(t,t,0);function Nt(t){let o=R(Math.floor(t),0,et.length-1),n=Math.min(o+1,et.length-1);return it(et[o],et[n],R(t-o,0,1))}let K=me.map(()=>({p:[0,0,0],base:0,ry:0,hov:0,foc:0,pulse:0,gap:.085,h:.37,top:0})),kt=new Float32Array($.length),Be=[];for(let t=0;t<me.length;t++)for(let o=0;o<Ue;o++)Be.push({i:t,k:o,x:0,y:0,z:0,ry:0,d:0});let Ut=5.5,k=C.curves.data;function Vo(t){for(let o=0;o<ce;o++){let n=K[$[o][0]],r=K[$[o][1]],a=n.p,c=r.p,s=[a[0],n.top+.02,a[2]],u=[c[0],r.top+.02,c[2]],x=u[0]-s[0],L=u[1]-s[1],m=u[2]-s[2],O=Math.hypot(x,L,m),P=p(1.1+.17*O,.6+.13*O,t),h=[s[0]+x*.14,s[1]+P,s[2]+m*.14],S=[u[0]-x*.14,u[1]+P,u[2]-m*.14];for(let _=0;_<Y;_++){let D=_/(Y-1),q=1-D,Me=q*q*q,Ie=3*q*q*D,Ke=3*q*D*D,Ae=D*D*D,Oe=(o*Y+_)*4;k[Oe]=Me*s[0]+Ie*h[0]+Ke*S[0]+Ae*u[0],k[Oe+1]=Me*s[1]+Ie*h[1]+Ke*S[1]+Ae*u[1],k[Oe+2]=Me*s[2]+Ie*h[2]+Ke*S[2]+Ae*u[2],k[Oe+3]=D}}}function zo(){let t=C.ribbons.data;for(let o=0;o<ce;o++)for(let n=0;n<Y;n++){let r=(o*Y+n)*4,a=(o*Y+Math.max(0,n-1))*4,c=(o*Y+Math.min(Y-1,n+1))*4;for(let s=0;s<2;s++){let u=((o*Y+n)*2+s)*11;t[u]=k[r],t[u+1]=k[r+1],t[u+2]=k[r+2],t[u+3]=k[a],t[u+4]=k[a+1],t[u+5]=k[a+2],t[u+6]=k[c],t[u+7]=k[c+1],t[u+8]=k[c+2],t[u+9]=s?1:-1,t[u+10]=k[r+3]}}}function He(t,o,n){let r=R(o,0,1)*(Y-1),a=Math.min(Y-2,Math.floor(r)),c=r-a,s=(t*Y+a)*4,u=s+4;return n[0]=k[s]+(k[u]-k[s])*c,n[1]=k[s+1]+(k[u+1]-k[s+1])*c,n[2]=k[s+2]+(k[u+2]-k[s+2])*c,n}let Wo=document.getElementById("fig-no"),Bt=document.getElementById("fig-text"),st=Array.from(document.querySelectorAll(".findings .tag")),yt=-1,Q=document.querySelector(".inspect");Q||(Q=document.createElement("div"),Q.className="inspect",Q.setAttribute("aria-hidden","true"),Q.innerHTML='<div class="inspect-in"><p class="i-id"></p><p class="i-name"></p><p class="i-note"></p><p class="i-status"></p></div>',document.body.appendChild(Q));let Yo=Q.querySelector(".i-id"),jo=Q.querySelector(".i-name"),Go=Q.querySelector(".i-note"),$o=Q.querySelector(".i-status"),Ot=-1,qt=-1,Le=document.querySelector(".sys-tags");Le||(Le=document.createElement("div"),Le.className="sys-tags",Le.setAttribute("aria-hidden","true"),Le.innerHTML=me.map((t,o)=>`<div class="sys-tag"><span><b>${String(o+1).padStart(2,"0")}</b>${t.name}</span></div>`).join(""),document.body.appendChild(Le));let ct=Array.from(Le.children),Ht=ct.map(()=>-1),ye=Te(),J=Te(),U=Te(),ee=0,ve=0,Ve=0,Vt=0,zt=0,bt=1,te=w.matches||!F?1:0,Wt=2.6,ze=!1,_e=w.matches?1:0,ue=null,Yt=-1,N={x:0,y:0,sx:0,sy:0,px:-1,py:-1,active:!1};window.addEventListener("pointermove",t=>{N.x=t.clientX/window.innerWidth*2-1,N.y=t.clientY/window.innerHeight*2-1,N.px=t.clientX,N.py=t.clientY,N.active=t.pointerType==="mouse"},{passive:!0}),window.addEventListener("mouseout",t=>{t.relatedTarget||(N.active=!1)}),window.addEventListener("blur",()=>{N.active=!1});let jt=[1.75,1.35,1],Z={acc:0,n:0,slow:0,level:0};function Xo(t){if(Z.level>=jt.length-1||t<=0||t>.25||(Z.acc+=t,Z.n++,Z.n<90))return;let o=Z.acc/Z.n;Z.acc=0,Z.n=0,Z.slow=o>.026?Z.slow+1:0,Z.slow>=2&&(Z.level++,Z.slow=0)}function Ko(){let t=Math.min(window.devicePixelRatio||1,A()?1.5:jt[Z.level]),o=Math.max(1,Math.round(i.clientWidth*t)),n=Math.max(1,Math.round(i.clientHeight*t));(i.width!==o||i.height!==n)&&(i.width=o,i.height=n),Oo(o,n)}let W=[0,0,0],xt=[0,0,0],At=ne.map(()=>[0,0,0]),Pe=Nt(0),Ce=[0,0,0],wt=0;function lt(t){let o=J[0]*t[0]+J[4]*t[1]+J[8]*t[2]+J[12],n=J[1]*t[0]+J[5]*t[1]+J[9]*t[2]+J[13],r=J[2]*t[0]+J[6]*t[1]+J[10]*t[2]+J[14],a=ye[0]*o+ye[8]*r,c=ye[5]*n+ye[9]*r,s=-r;return s<.1?null:[(a/s*.5+.5)*i.clientWidth,(1-(c/s*.5+.5))*i.clientHeight,s]}function Qo(){if(!N.active||A()||te<.9||N.px<i.clientWidth*.42)return-1;let t=-1,o=1e9;for(let n=0;n<me.length;n++){let r=K[n],a=lt([r.p[0],r.base-.09+r.h*.5,r.p[2]]);if(!a)continue;let c=ye[5]*i.clientHeight*.5*(n===Yt?1.45:1.15)/a[2],s=Math.hypot(N.px-a[0],(N.py-a[1])*1.4);s<c&&s<o&&(o=s,t=n)}return t}function We(t){let o=w.matches;ve+=t*(o?.2:1);let n=!ze&&!f.classList.contains("js-loading");n&&te<1&&(te=Math.min(1,te+t/Wt)),n&&_e<1&&(_e=Math.min(1,_e+t/1.6)),Vt%30===0&&rt(),Vt++;let r=gt();ee+=(r-ee)*(1-Math.exp(-t*(o?12:2.4))),Math.abs(r-ee)<5e-4&&(ee=r);let a=Nt(ee);ue&&!ze?(ue.t=Math.min(1,ue.t+t/1.5),a=it(ue.from,a,de(ue.t)),ue.t>=1&&(ue=null)):ue&&(a=it(ue.from,a,0)),Pe=a;let c=A(),s=ze?-1:Qo();Yt=s;let u=de(R(a.ground,0,1));for(let d=0;d<me.length;d++){let M=me[d],y=K[d];y.hov+=((s===d?1:0)-y.hov)*(1-Math.exp(-t*9)),y.foc+=((he===d?1:0)-y.foc)*(1-Math.exp(-t*3));let B=Re(R(te*1.55-d*.09,0,1)),I=y.hov*.32+y.foc*.22*(1-u*.6);y.p[0]=p(M.a[0],M.b[0],u),y.base=p(M.a[1],M.b[1],u),y.p[1]=y.base+I+(1-B)*Ut,y.p[2]=p(M.a[2],M.b[2],u),y.ry=p(M.ay,0,u)+(1-B)*.5*(d%2?1:-1),y.pulse=Math.max(0,y.pulse-t*1.3);let ie=p(.085+y.hov*.14+(1-B)*.12,.05+y.hov*.06,u);y.gap+=(ie-y.gap)*(1-Math.exp(-t*6)),y.h=(Ue-1)*y.gap+Se[1],y.top=y.p[1]-.09+y.h;for(let H=0;H<Ue;H++){let j=Be[d*Ue+H],V=(1-u)*a.leak;j.x=y.p[0]+V*.07*Math.sin(H*2.1+d*1.3),j.z=y.p[2]+V*.055*Math.cos(H*1.7+d*.9),j.y=y.p[1]-.09+Se[1]*.5+H*y.gap,j.ry=y.ry+V*.05*Math.sin(H*1.3+d)}}Vo(u),zo();let x=a.flow*(o?.25:1),L=a.leak,m=C.particles.data,O=E(.45,.95,te);for(let d=0;d<G;d++){let M=vt[d],y=d*8;if(Fe[d]!==2){let H=tt[d],j=H+Ct[d]*t*x;if(j>=1?(j-=1,Fe[d]=Math.random()<L*$[M][2]?1:0,ot[d]=.38+Math.random()*.24):Fe[d]===1&&L<.02&&(Fe[d]=0),tt[d]=j,Fe[d]===1&&H<ot[d]&&j>=ot[d]){He(M,j,W),He(M,Math.min(1,j+.02),xt);let V=xt[0]-W[0],we=xt[2]-W[2],oo=Math.hypot(V,we)||1;V/=oo,we/=oo;let no=(Math.random()-.5)*1.8;le[d*3]=V*.45-we*no,le[d*3+1]=.1+Math.random()*.5,le[d*3+2]=we*.45+V*no,re[d*3]=W[0],re[d*3+1]=W[1],re[d*3+2]=W[2],nt[d]=0,pt[d]=2.8+Math.random()*1.2,Fe[d]=2}else{He(M,j,W);let V=E(0,.07,j)*(1-E(.93,1,j)),we=he>=0&&($[M][0]===he||$[M][1]===he)?K[he].foc:0;m[y]=W[0],m[y+1]=W[1],m[y+2]=W[2],m[y+3]=p(g.cream[0],1,we*.3),m[y+4]=p(g.cream[1],.8,we*.3),m[y+5]=p(g.cream[2],.65,we*.3),m[y+6]=V*(.62+.38*a.carry+we*.3)*O,m[y+7]=.05+.014*a.carry;continue}}let B=t*(o?.3:1);nt[d]+=B;let I=d*3;if(re[I+1]>X+.02){le[I+1]-=1.15*B;let H=Math.pow(.55,B);le[I]*=H,le[I+2]*=H,re[I]+=le[I]*B,re[I+1]+=le[I+1]*B,re[I+2]+=le[I+2]*B,re[I+1]<=X+.02&&(re[I+1]=X+.02,le[I]*=.15,le[I+2]*=.15)}if(nt[d]>=pt[d]){Fe[d]=0,tt[d]=0,m[y+6]=0;continue}let ie=1-nt[d]/pt[d];m[y]=re[I],m[y+1]=re[I+1],m[y+2]=re[I+2],m[y+3]=g.ember[0]*1.15,m[y+4]=g.ember[1]*1.1,m[y+5]=g.ember[2],m[y+6]=Math.pow(ie,1.2)*.95*O,m[y+7]=.072}zt+=t*.1*x;let P=C.markers.data;for(let d=0;d<ce;d++){let M=(zt+d*.37)%1;kt[d]<.93&&M>=.93&&a.carry>.05&&(K[$[d][1]].pulse=1),kt[d]=M,He(d,M,W);let y=E(0,.08,M)*(1-E(.92,1,M)),B=(G+d)*8;m[B]=W[0],m[B+1]=W[1],m[B+2]=W[2],m[B+3]=1.18,m[B+4]=1.12,m[B+5]=1.06,m[B+6]=a.carry*y*O,m[B+7]=.14;let I=d*8;P[I]=W[0],P[I+1]=W[1],P[I+2]=W[2],P[I+3]=g.cream[0],P[I+4]=g.cream[1],P[I+5]=g.cream[2],P[I+6]=a.carry*y*.55*O,P[I+7]=.46}let h=C.pins.data;for(let d=0;d<ne.length;d++){let M=He(ne[d],.5,At[d]),y=(G+ce+d)*8;m[y]=M[0],m[y+1]=M[1],m[y+2]=M[2],m[y+3]=g.ember[0]*1.5,m[y+4]=g.ember[1]*1.4,m[y+5]=g.ember[2]*1.2,m[y+6]=a.find*O,m[y+7]=.12;let B=o?.5:(ve*.5+d*.25)%1;[[M[0],M[1],M[2],a.find,.62+(o?0:.05*Math.sin(ve*2.4+d))],[M[0],M[1],M[2],a.find*(1-B)*.8,.6+B*1.6],[M[0],X+.01,M[2],a.find*.6,.55]].forEach((H,j)=>{let V=(ce+d*3+j)*8;P[V]=H[0],P[V+1]=H[1],P[V+2]=H[2],P[V+3]=g.ember[0],P[V+4]=g.ember[1],P[V+5]=g.ember[2],P[V+6]=H[3]*O,P[V+7]=H[4]});let ie=d*8;h[ie]=M[0],h[ie+1]=M[1]-.12,h[ie+2]=M[2],h[ie+3]=.5,h[ie+4]=M[0],h[ie+5]=X+.01,h[ie+6]=M[2],h[ie+7]=.5}let S=o?0:-7.5+ve/3.8%1*15,_=ne.length*8;h[_]=S,h[_+1]=X+.01,h[_+2]=-5,h[_+3]=.5,h[_+4]=S,h[_+5]=X+.01,h[_+6]=5,h[_+7]=.5,a.scanX=S,a.sweep=o?0:-5.2+ve/5.5%1*10.4,wt+=(L*.55+a.find*.35-wt)*(1-Math.exp(-t*2)),N.sx+=(N.x-N.sx)*(1-Math.exp(-t*2)),N.sy+=(N.y-N.sy)*(1-Math.exp(-t*2));let D=a.tgt.slice(),q=a.eye[0]-D[0],Me=a.eye[1]-D[1],Ie=a.eye[2]-D[2],Ke=1+(1-Re(te))*.28+(1-Re(_e))*.045,Ae=[.67,.888,.947,.752,1.269,.876,.807],Oe=window.innerWidth/Math.max(1,window.innerHeight),Jt=1;if(window.innerWidth<1060){let d=R(Math.floor(ee),0,Ae.length-1),M=R(ee-d,0,1),y=Ae[d]+(Ae[Math.min(d+1,Ae.length-1)]-Ae[d])*M;Jt=R(y/Oe,.45,3.4)}let ft=Jt*Ke;bt=ft,q*=ft,Me*=ft,Ie*=ft;let Zt=o?0:Math.sin(ve*.07)*.07+N.sx*.05+(1-Re(te))*.35+(1-Re(_e))*.05,eo=Math.cos(Zt),to=Math.sin(Zt);Ce=[D[0]+q*eo+Ie*to,D[1]+Me-N.sy*.5,D[2]-q*to+Ie*eo];let Ne=R(Math.round(ee),0,Tt.length-1);Ne!==yt&&Bt&&(yt=Ne,Wo.textContent="Fig. "+String(Ne+1).padStart(2,"0"),Bt.textContent=at&&at.stage===Ne?at.text:Tt[Ne],document.dispatchEvent(new CustomEvent("ws:stage",{detail:Ne}))),a.hovIdx=s,a.ci=Ne}function be(t){e.useProgram(t.p),t.u.uProj&&e.uniformMatrix4fv(t.u.uProj,!1,ye),t.u.uView&&e.uniformMatrix4fv(t.u.uView,!1,J),t.u.uFog&&e.uniform3fv(t.u.uFog,g.bg),t.u.uFogRange&&e.uniform2f(t.u.uFogRange,17*bt,54*bt),t.u.uEmber&&e.uniform3fv(t.u.uEmber,g.ember)}function Ye(t,o,n,r,a,c){let s=v.line.u;e.uniform3fv(s.uColor,t),e.uniform1f(s.uAlpha,o),e.uniform1f(s.uDash,n||0),e.uniform1f(s.uEnds,r||0),e.uniform1f(s.uDraw,a===void 0?2:a),e.uniform1f(s.uSweepAmt,c||0)}function Gt(t,o){let n=Pe;e.viewport(0,0,t,o),fo(ye,34*Math.PI/180,t/o,.1,140),ye[8]-=A()?0:n.dx,mo(J,Ce,n.tgt,[0,1,0]);let r=o*.5*ye[5],a=E(0,.5,te);e.clearColor(g.bg[0],g.bg[1],g.bg[2],1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.enable(e.BLEND);let c=de(R(n.ground,0,1));be(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanX,n.scanX||0),e.uniform1f(v.point.u.uScanAmt,n.find*.9),e.uniform1f(v.point.u.uFade,a),e.uniform1f(v.point.u.uGain,1),e.uniform1i(v.point.u.uMode,0),e.depthMask(!1),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA),e.bindVertexArray(C.dots.v),e.drawArrays(e.POINTS,0,C.dots.count),be(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.uniform1i(v.decal.u.uMode,1),e.uniform3fv(v.decal.u.uColor,g.black),e.bindVertexArray(C.floor.v);for(let h=0;h<me.length;h++){let S=K[h],_=S.p[1]-X;se(U,S.p[0],X+.005,S.p[2],S.ry,3.4+_*.4,1,2.4+_*.3),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,.78*(1-c)/(1+_*.35)*a),e.drawArrays(e.TRIANGLES,0,6)}c>.01&&(se(U,0,X+.005,0,0,12.5,1,7.5),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,.8*c),e.drawArrays(e.TRIANGLES,0,6)),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.cream),se(U,0,X+.002,.2,0,17,1,12),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,.035*a),e.drawArrays(e.TRIANGLES,0,6),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform3fv(v.decal.u.uColor,g.ember);for(let h=0;h<ne.length;h++){let S=At[h];se(U,S[0],X+.01,S[2],0,3.2,1,3.2),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.uniform1f(v.decal.u.uAlpha,(n.leak*$[ne[h]][2]*.16+n.find*.12)*a),e.drawArrays(e.TRIANGLES,0,6)}e.depthMask(!0),be(v.mesh),e.uniform3fv(v.mesh.u.uCam,Ce),e.uniform1f(v.mesh.u.uBounce,0),e.uniform1f(v.mesh.u.uHi,0),e.uniform1f(v.mesh.u.uSheets,0);let s=E(0,.5,c),u=p(-3.4,-.37,1-Math.pow(1-c,3)),x=[8.44,.5,4.14];s>.005&&(e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),se(U,0,u,0,0,x[0],x[1],x[2]),e.uniformMatrix4fv(v.mesh.u.uModel,!1,U),e.uniform3fv(v.mesh.u.uColor,g.plinth),e.uniform1f(v.mesh.u.uAlpha,s),e.uniform1f(v.mesh.u.uUseTex,0),e.bindVertexArray(C.box.v),e.drawArrays(e.TRIANGLES,0,36));for(let h of Be){let S=K[h.i];h.d=(S.p[0]-Ce[0])**2+(S.p[1]-Ce[1])**2+(S.p[2]-Ce[2])**2}Be.sort((h,S)=>S.d-h.d||h.k-S.k),be(v.glass),e.uniform3fv(v.glass.u.uCam,Ce),e.uniform3fv(v.glass.u.uCream,g.cream),e.uniform1f(v.glass.u.uAlpha,1),e.enable(e.BLEND),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),e.enable(e.CULL_FACE),e.cullFace(e.BACK),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindVertexArray(C.box.v);let L=R(n.leak*.7+n.find,0,1)*(1-c);for(let h of Be){let S=K[h.i],_=h.k===Ue-1;se(U,h.x,h.y,h.z,h.ry,Se[0],Se[1],Se[2]),e.uniformMatrix4fv(v.glass.u.uModel,!1,U),e.uniform1f(v.glass.u.uSeed,h.i+1+h.k*.37),e.uniform1f(v.glass.u.uLevel,_?1:.3+.45*S.hov),e.uniform1f(v.glass.u.uHi,Math.max(S.hov,S.foc*.8)),e.uniform1f(v.glass.u.uGlow,R(S.pulse*n.carry+S.foc*.45+S.hov*.55+n.find*.15,0,1.4)),e.uniform1f(v.glass.u.uBad,L),e.uniform1f(v.glass.u.uBounce,h.k===0?wt*(1-c):0),e.drawArrays(e.TRIANGLES,0,36)}e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.CULL_FACE),be(v.line),e.uniform1f(v.line.u.uTime,ve),e.uniform1f(v.line.u.uSweep,n.sweep||0),e.depthMask(!1),e.blendFunc(e.SRC_ALPHA,e.ONE),e.bindVertexArray(C.edges.v);for(let h of Be){let S=K[h.i],_=Math.max(S.hov,S.foc*.85),D=h.k===Ue-1?1:.4;se(U,h.x,h.y,h.z,h.ry,Se[0],Se[1],Se[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,U),Ye(_>.02?[p(g.cream[0],g.ember[0],_),p(g.cream[1],g.ember[1],_),p(g.cream[2],g.ember[2],_)]:g.cream,D*(.75+.35*S.pulse*n.carry)+_*.35),e.drawArrays(e.LINES,0,24)}e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),s>.005&&(se(U,0,u,0,0,x[0],x[1],x[2]),e.uniformMatrix4fv(v.line.u.uModel,!1,U),Ye(g.ivory,.26*s),e.drawArrays(e.LINES,0,24),e.bindVertexArray(C.plinthGrid.v),Ye(g.ivory,.09*s,0,0,2,.9*s),e.drawArrays(e.LINES,0,C.plinthGrid.data.length/4)),se(U,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,U),e.blendFunc(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA),be(v.ribbon);let m=v.ribbon.u,O=t/Math.max(1,i.clientWidth),P=(.75+.35*n.carry)*O;e.uniform2f(m.uHalf,t*.5,o*.5),e.uniform1f(m.uWidth,P),e.uniform1f(m.uFeather,R(1.3/Math.max(P,.5),.2,1)),e.uniform1f(m.uTime,ve),e.uniform1f(m.uDash,n.carry),e.uniform1f(m.uEnds,1),e.uniform1f(m.uDraw,E(.2,.9,te)*1.02),e.bindVertexArray(C.ribbons.v),e.bindBuffer(e.ARRAY_BUFFER,C.ribbons.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.ribbons.data);for(let h=0;h<ce;h++){let S=he>=0&&($[h][0]===he||$[h][1]===he)?K[he].foc:0,_=n.hovIdx>=0&&($[h][0]===n.hovIdx||$[h][1]===n.hovIdx)?K[n.hovIdx].hov:0,D=Math.max(S,_),q=D>.01?[p(g.curve[0],g.ember[0],D*.7),p(g.curve[1],g.ember[1],D*.7),p(g.curve[2],g.ember[2],D*.7)]:g.curve;e.uniform3fv(m.uColor,q),e.uniform1f(m.uAlpha,.3+.22*n.carry+.06*n.find+D*.35),e.drawArrays(e.TRIANGLE_STRIP,h*Y*2,Y*2)}be(v.line),se(U,0,0,0,0,1,1,1),e.uniformMatrix4fv(v.line.u.uModel,!1,U),n.find>.01&&(e.bindVertexArray(C.pins.v),e.bindBuffer(e.ARRAY_BUFFER,C.pins.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.pins.data),Ye(g.ember,.5*n.find),e.drawArrays(e.LINES,0,ne.length*2),Ye(g.ember,.85*n.find),e.drawArrays(e.LINES,ne.length*2,2),be(v.decal),e.blendFunc(e.SRC_ALPHA,e.ONE),e.uniform1i(v.decal.u.uMode,0),e.uniform3fv(v.decal.u.uColor,g.ember),e.uniform1f(v.decal.u.uAlpha,.14*n.find),se(U,n.scanX||0,X,0,0,1,3.8,10),e.uniformMatrix4fv(v.decal.u.uModel,!1,U),e.bindVertexArray(C.sheet.v),e.drawArrays(e.TRIANGLES,0,6)),be(v.point),e.uniform1f(v.point.u.uScale,r),e.uniform1f(v.point.u.uScanAmt,0),e.uniform1f(v.point.u.uFade,1),e.uniform1f(v.point.u.uGain,l.on?1.35:1),e.blendFunc(e.ONE,e.ONE),e.uniform1i(v.point.u.uMode,1),e.bindVertexArray(C.particles.v),e.bindBuffer(e.ARRAY_BUFFER,C.particles.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.particles.data),e.drawArrays(e.POINTS,0,G+_t),(n.find>.01||n.carry>.01)&&(e.uniform1i(v.point.u.uMode,2),e.bindVertexArray(C.markers.v),e.bindBuffer(e.ARRAY_BUFFER,C.markers.b),e.bufferSubData(e.ARRAY_BUFFER,0,C.markers.data),e.drawArrays(e.POINTS,0,Pt)),e.depthMask(!0),e.bindVertexArray(null)}function De(t,o,n){e.bindFramebuffer(e.FRAMEBUFFER,o?o.fbo:null),e.viewport(0,0,o?o.w:i.width,o?o.h:i.height),e.useProgram(t.p),n(t.u),e.bindVertexArray(l.tri.v),e.drawArrays(e.TRIANGLES,0,3)}function xe(t,o,n){e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,o),e.uniform1i(n,t)}function je(){Ko();let t=i.width,o=i.height;if(!l.on){e.bindFramebuffer(e.FRAMEBUFFER,null),Gt(t,o),Et(Pe);return}e.bindFramebuffer(e.FRAMEBUFFER,l.ms?l.ms.fbo:l.scene.fbo),Gt(t,o),l.ms&&(e.bindFramebuffer(e.READ_FRAMEBUFFER,l.ms.fbo),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.scene.fbo),e.blitFramebuffer(0,0,t,o,0,0,t,o,e.COLOR_BUFFER_BIT,e.NEAREST)),e.disable(e.DEPTH_TEST),e.disable(e.BLEND);let n=l.hdr?.58:.46;De(l.bright,l.h1,a=>{xe(0,l.scene.tex,a.uTex),e.uniform2f(a.uTexel,1/t,1/o),e.uniform1f(a.uThresh,n)}),De(l.blur,l.h2,a=>{xe(0,l.h1.tex,a.uTex),e.uniform2f(a.uDir,1/l.h1.w,0)}),De(l.blur,l.h1,a=>{xe(0,l.h2.tex,a.uTex),e.uniform2f(a.uDir,0,1/l.h1.h)}),De(l.bright,l.q1,a=>{xe(0,l.h1.tex,a.uTex),e.uniform2f(a.uTexel,1/l.h1.w,1/l.h1.h),e.uniform1f(a.uThresh,0)});for(let a=0;a<2;a++)De(l.blur,l.q2,c=>{xe(0,l.q1.tex,c.uTex),e.uniform2f(c.uDir,1.5/l.q1.w,0)}),De(l.blur,l.q1,c=>{xe(0,l.q2.tex,c.uTex),e.uniform2f(c.uDir,0,1.5/l.q1.h)});let r=Pe;De(l.comp,null,a=>{xe(0,l.scene.tex,a.uScene),xe(1,l.h1.tex,a.uB1),xe(2,l.q1.tex,a.uB2),e.uniform1f(a.uBloom,1.85+r.find*.45+r.carry*.12),e.uniform2f(a.uRes,t,o),e.uniform2f(a.uCenter,A()?.5:.5+r.dx*.5,.48),e.uniform1f(a.uTime,ve)}),e.bindVertexArray(null),Et(r)}let $t=st.map(()=>({o:-1}));function Et(t){let o=i.clientWidth,n=i.clientHeight;if(st.length){let u=t.find>.02&&te>.8,x=A(),L=Math.min(st.length,ne.length),m=x?(ve/3.8%L+L)%L:0,O=Math.floor(m),P=m-O,h=P<.18?P/.18:P>.82?(1-P)/.18:1;for(let S=0;S<L;S++){let _=st[S],D=0;if(u&&x)S===O&&(_.style.transform=`translate3d(${(o*.5).toFixed(1)}px, ${(n*.4).toFixed(1)}px, 0)`,D=E(.55,.95,t.find)*h);else if(u){let q=lt(At[S]);if(q){let Me=E(o*.44,o*.52,q[0])*(1-E(o-40,o,q[0]+180))*E(90,160,q[1]);D=E(.55,.95,t.find)*Me,_.style.transform=`translate3d(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px, 0)`}}Math.abs(D-$t[S].o)>.01&&(_.style.opacity=D.toFixed(3),$t[S].o=D)}}let r=Ge&&te>.9?1-E(.15,.6,t.find):0,a=A();for(let u=0;u<ct.length;u++){let x=0;if(r>0){let L=K[u],m=lt([L.p[0],L.top+.05,L.p[2]]);if(m){let O=a?E(8,24,m[0])*(1-E(o-24,o-8,m[0])):E(o*.46,o*.54,m[0])*(1-E(o-30,o,m[0]+60));x=r*(1-L.hov)*O*E(96,150,m[1])*(1-E(n-90,n-40,m[1])),x>.01&&(ct[u].style.transform=`translate3d(${m[0].toFixed(1)}px, ${m[1].toFixed(1)}px, 0)`)}}Math.abs(x-Ht[u])>.01&&(ct[u].style.opacity=x.toFixed(3),Ht[u]=x)}let c=t.hovIdx===void 0?-1:t.hovIdx,s=0;if(c>=0&&Ge){let u=K[c],x=lt([u.p[0],u.top+.12,u.p[2]]);x&&(s=u.hov,(Ot!==c||Q.dataset.ci!==String(t.ci))&&(Ot=c,Q.dataset.ci=String(t.ci),Yo.textContent=`${me[c].id} \xB7 ${String(c+1).padStart(2,"0")} / 06`,jo.textContent=me[c].name,Go.textContent=me[c].note,$o.textContent=Lt[t.ci]||Lt[0]),Q.style.transform=`translate3d(${x[0].toFixed(1)}px, ${x[1].toFixed(1)}px, 0)`)}Math.abs(s-qt)>.01&&(Q.style.opacity=s.toFixed(3),qt=s),f.classList.toggle("is-inspecting",s>.4)}let St=0,Ge=!1,Xt=/[?&]wsdebug\b/.test(location.search);Xt&&(window.__wsScene={step(t,o=1){for(let n=0;n<o;n++)We(t);return je(),{stage:ee,intro:te}},hover(t,o){N.px=t,N.py=o,N.x=t/window.innerWidth*2-1,N.y=o/window.innerHeight*2-1,N.active=t>=0}});function Kt(t){if(Xt)return;St=requestAnimationFrame(Kt);let o=t/1e3,n=Ve?o-Ve:0,r=Ve?Math.min(.05,n):1/60;Ve=o,Xo(n),We(r),je()}function $e(t){t!==Ge&&(Ge=t,t?(Ve=0,St=requestAnimationFrame(Kt)):(cancelAnimationFrame(St),Et(Object.assign({},Pe,{hovIdx:-1,find:0}))))}let Xe=Array.from(document.querySelectorAll("[data-canvas]")),ut=new Map,Ft=new IntersectionObserver(t=>{t.forEach(o=>ut.set(o.target,o.isIntersecting)),$e(!document.hidden&&Array.from(ut.values()).some(Boolean))},{rootMargin:"80px 0px"});Xe.forEach(t=>Ft.observe(t)),document.addEventListener("visibilitychange",()=>{$e(!document.hidden&&Array.from(ut.values()).some(Boolean))}),document.addEventListener("ws:route",()=>{Ft.disconnect(),ut.clear(),Xe=Array.from(document.querySelectorAll("[data-canvas]")),Xe.forEach(o=>Ft.observe(o));let t=It(Pe);rt(),ee=gt(),yt=-1,w.matches||(ue={from:t,t:0},_e=Math.min(_e,.4)),We(0),je(),Xe.length||$e(!1)}),window.addEventListener("resize",()=>{rt(),Ge||(We(0),je())},{passive:!0}),i.addEventListener("webglcontextlost",t=>{t.preventDefault(),$e(!1),f.classList.add("no-webgl")}),rt(),ee=gt(),Wt=ee<.5?2.6:2,Ut=ee<.5?5.5:1.4;let Qt="ws-cam";if(!F&&!w.matches)try{let t=JSON.parse(sessionStorage.getItem(Qt)||"null");t&&Date.now()-t.at<8e3&&t.st&&t.st.eye&&(ue={from:t.st,t:0})}catch{}window.addEventListener("pagehide",()=>{try{sessionStorage.setItem(Qt,JSON.stringify({at:Date.now(),st:It(Pe)}))}catch{}}),ze=!0;for(let t=0;t<90;t++)We(1/30);ze=!1,je(),f.classList.add("scene-ready"),Xe.length||$e(!0)}var oe=document.documentElement,so=oe.dataset.bundle==="1",ke=window.matchMedia("(prefers-reduced-motion: reduce)").matches;oe.classList.add("js-ready");location.protocol==="file:"&&!so&&document.querySelectorAll("a[href]").forEach(i=>{let f=i.getAttribute("href");if(/^(https?:|mailto:|tel:|#)/.test(f))return;let[F,A]=f.split("#");F&&F.endsWith("/")&&i.setAttribute("href",`${F}index.html${A?`#${A}`:""}`)});var z=document.getElementById("nav"),Je=document.getElementById("menu-btn"),fe=z&&z.querySelector(".drop-btn"),Ze=document.getElementById("mega"),co=[],Mt=!1;function dt(){if(Mt=!1,!z)return;let i=36,f=window.innerHeight-44,F="dark",A=!1;for(let e of co){let w=e.getBoundingClientRect();w.top<=i&&w.bottom>i&&(F=e.dataset.tone),w.top<=f&&w.bottom>f&&(A=e.hasAttribute("data-canvas")&&!e.hasAttribute("data-no-hud"))}let b=z.classList.contains("is-open")||z.classList.contains("is-drop");z.classList.toggle("is-paper",F==="paper"&&!b),z.classList.toggle("is-scrolled",window.scrollY>24),oe.classList.toggle("hud-on",A)}var lo=()=>{Mt||(Mt=!0,requestAnimationFrame(dt))};window.addEventListener("scroll",lo,{passive:!0});window.addEventListener("resize",lo,{passive:!0});var Qe=window.matchMedia("(min-width: 1061px)"),ro=window.matchMedia("(hover: hover)"),io=0;function Ee(i){!fe||!Ze||(fe.setAttribute("aria-expanded",String(i)),Ze.hidden=!i,z.classList.toggle("is-drop",i&&Qe.matches),dt())}if(fe&&Ze){let i=fe.parentElement;fe.addEventListener("click",()=>Ee(fe.getAttribute("aria-expanded")!=="true")),i.addEventListener("mouseenter",()=>{ro.matches&&Qe.matches&&(clearTimeout(io),Ee(!0))}),i.addEventListener("mouseleave",()=>{ro.matches&&Qe.matches&&(io=setTimeout(()=>Ee(!1),160))}),i.addEventListener("focusout",f=>{Qe.matches&&!i.contains(f.relatedTarget)&&Ee(!1)}),document.addEventListener("click",f=>{Qe.matches&&!i.contains(f.target)&&Ee(!1)})}function mt(i){!z||!Je||(z.classList.toggle("is-open",i),Je.setAttribute("aria-expanded",String(i)),i||Ee(!1),dt())}Je&&Je.addEventListener("click",()=>mt(!z.classList.contains("is-open")));z&&z.addEventListener("click",i=>{i.target.closest(".nav-links a")&&(mt(!1),Ee(!1))});document.addEventListener("keydown",i=>{i.key==="Escape"&&(fe&&fe.getAttribute("aria-expanded")==="true"?(Ee(!1),fe.focus()):z&&z.classList.contains("is-open")&&(mt(!1),Je.focus()))});function Jo(i){let f=Array.from(i.querySelectorAll(".svc"));f.forEach(b=>{let e=b.querySelector(".svc-row"),w=b.querySelector(".svc-body");e.addEventListener("click",()=>{let T=e.getAttribute("aria-expanded")==="true";e.setAttribute("aria-expanded",String(!T)),w.hidden=T,b.classList.toggle("is-open",!T)})});let F=Array.from(i.querySelectorAll(".filters [data-filter]")),A=b=>{F.forEach(w=>w.setAttribute("aria-pressed",String(w.dataset.filter===b)));let e=null;f.forEach(w=>{let T=b==="all"||w.dataset.v===b;w.hidden=!T,T&&!e&&(e=w)}),b!=="all"&&e&&!e.classList.contains("is-open")&&e.querySelector(".svc-row").click()};F.forEach(b=>b.addEventListener("click",()=>A(b.dataset.filter)))}function Zo(i){let f=i.querySelector("[data-brief]");if(!f)return;let F=f.querySelector("[data-status]"),A=f.dataset.to,b=(e,w)=>{F.textContent=e,F.classList.toggle("is-error",w==="error"),F.classList.toggle("is-ok",w==="ok")};f.addEventListener("submit",async e=>{e.preventDefault();let w=new FormData(f),T=String(w.get("name")||"").trim(),g=String(w.get("email")||"").trim(),p=String(w.get("company")||"").trim(),R=String(w.get("message")||"").trim(),E=[];if(T||E.push("your name"),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(g)||E.push("a work email we can reply to"),E.length){b(`Add ${E.join(" and ")}, then send again.`,"error"),(T?f.elements.email:f.elements.name).focus();return}if(f.elements.consent&&!f.elements.consent.checked){b("Tick the consent box so we can reply, then send again.","error"),f.elements.consent.focus();return}if(f.dataset.endpoint){try{b("Sending\u2026");let Te=await fetch(f.dataset.endpoint,{method:"POST",body:w,headers:{Accept:"application/json"}});if(!Te.ok)throw new Error(String(Te.status));f.reset(),b("Received. We reply within two working days.","ok")}catch{b(`That did not go through. Write to ${A} and we will pick it up.`,"error")}return}let de=[`Name: ${T}`,`Company: ${p||"\u2014"}`,`Email: ${g}`];R&&de.push("","Your thoughts:",R);let Re=`Scoping conversation${p?` \u2014 ${p}`:""}`;b(`Your email app should open with the request filled in. If it doesn\u2019t, write to ${A}.`,"ok"),window.location.href=`mailto:${A}?subject=${encodeURIComponent(Re)}&body=${encodeURIComponent(de.join(`
`))}`})}function en(i){let f=i.querySelector("[data-ledger]");if(!f)return;if(ke||!("IntersectionObserver"in window)){f.classList.add("is-run");return}let F=new IntersectionObserver(([A])=>{A.isIntersecting&&(f.classList.add("is-run"),F.disconnect())},{threshold:.3});F.observe(f)}function tn(i){let f=Array.from(i.querySelectorAll(".h2, .v-title, .h-limits, .display-2, .tl-body h2")).filter(b=>!b.dataset.split&&b.children.length===0);if(ke||!("IntersectionObserver"in window))return;let F=window.innerHeight,A=new IntersectionObserver(b=>{b.forEach(e=>{e.isIntersecting&&(e.target.classList.add("is-in"),A.unobserve(e.target))})},{rootMargin:"0px 0px -12% 0px"});f.forEach(b=>{let e=b.textContent.trim().split(/\s+/);if(b.dataset.split="1",b.setAttribute("aria-label",b.textContent.trim()),b.innerHTML=e.map((w,T)=>`<span class="rw" aria-hidden="true"><span style="--i:${T}">${w.replace(/&/g,"&amp;").replace(/</g,"&lt;")}</span></span>`).join(" "),b.classList.add("rise"),b.getBoundingClientRect().top<F*.9){let w=()=>oe.classList.contains("js-loading")?setTimeout(w,120):requestAnimationFrame(()=>b.classList.add("is-in"));w()}else A.observe(b)})}function on(i){let f=i.querySelector(".lg-toc");if(!f||!("IntersectionObserver"in window))return;let F=new Map(Array.from(f.querySelectorAll('a[href^="#"]')).map(e=>[e.getAttribute("href").slice(1),e])),A=new Set,b=new IntersectionObserver(e=>{e.forEach(T=>T.isIntersecting?A.add(T.target.id):A.delete(T.target.id));let w=Array.from(F.keys()).find(T=>A.has(T));w&&F.forEach((T,g)=>g===w?T.setAttribute("aria-current","true"):T.removeAttribute("aria-current"))},{rootMargin:"-20% 0px -55% 0px"});i.querySelectorAll(".lg-sec").forEach(e=>b.observe(e))}function nn(i){let f=Array.from(i.querySelectorAll("[data-count]"));if(!f.length||ke||!("IntersectionObserver"in window))return;let F=new IntersectionObserver(A=>{A.forEach(b=>{if(!b.isIntersecting)return;F.unobserve(b.target);let e=b.target,w=+e.dataset.count,T=performance.now(),g=p=>{let R=Math.min(1,(p-T)/1300);e.textContent=String(Math.round(w*(1-Math.pow(1-R,4)))),R<1&&requestAnimationFrame(g)};e.textContent="0",requestAnimationFrame(g)})},{threshold:.4});f.forEach(A=>F.observe(A))}function uo(i=document){co=Array.from(document.querySelectorAll("[data-tone]")),Jo(i),Zo(i),en(i),tn(i),nn(i),on(i),document.querySelectorAll("[data-year]").forEach(f=>{f.textContent=String(new Date().getFullYear())}),dt()}uo();document.addEventListener("keydown",i=>{if(i.key!=="ArrowLeft"&&i.key!=="ArrowRight"||i.defaultPrevented||i.altKey||i.ctrlKey||i.metaKey||i.shiftKey||i.target.closest&&i.target.closest("input, textarea, select, button, [contenteditable], .spec-scroll, .nav-links")||z&&z.classList.contains("is-open")||Ze&&!Ze.hidden)return;let f=document.querySelector(i.key==="ArrowRight"?'.pager a[rel="next"], .pager a[rel="first"]':'.pager a[rel="prev"]');f&&(i.preventDefault(),f.click())});(function(){if(!oe.classList.contains("js-loading"))return;let f=document.querySelector(".curtain");if(!f){oe.classList.remove("js-loading");return}let F=f.querySelector(".c-count"),A=f.querySelector(".c-bar i"),b=performance.now(),e=1250,w=T=>{let g=oe.classList.contains("scene-ready")||oe.classList.contains("no-webgl"),p=Math.min(1,(T-b)/e),R=g?p:Math.min(p,.86),E=Math.round(100*(1-Math.pow(1-R,2.2)));if(F.textContent=String(E).padStart(2,"0"),A.style.transform=`scaleX(${E/100})`,R<1){requestAnimationFrame(w);return}oe.classList.add("curtain-lift"),setTimeout(()=>oe.classList.remove("js-loading"),380),setTimeout(()=>oe.classList.remove("curtain-lift"),1100);try{sessionStorage.setItem("ws-seen","1")}catch{}};requestAnimationFrame(w)})();document.addEventListener("ws:stage",i=>{document.querySelectorAll(".scrub [data-stage-link]").forEach(f=>{+f.dataset.stageLink===i.detail?f.setAttribute("aria-current","step"):f.removeAttribute("aria-current")})});window.matchMedia("(hover: hover) and (pointer: fine)").matches&&!ke&&(document.addEventListener("pointermove",i=>{let f=i.target.closest&&i.target.closest(".spot");if(f){let A=f.getBoundingClientRect();f.style.setProperty("--mx",`${i.clientX-A.left}px`),f.style.setProperty("--my",`${i.clientY-A.top}px`)}let F=i.target.closest&&i.target.closest('.btn-ember:not([type="submit"])');if(F){let A=F.getBoundingClientRect(),b=(i.clientX-(A.left+A.width/2))/A.width,e=(i.clientY-(A.top+A.height/2))/A.height;F.style.transform=`translate(${(b*8).toFixed(1)}px, ${(e*6).toFixed(1)}px)`}},{passive:!0}),document.addEventListener("pointerout",i=>{let f=i.target.closest&&i.target.closest(".btn-ember");f&&!f.contains(i.relatedTarget)&&(f.style.transform="")}));(function(){let f=()=>document.querySelectorAll("[data-clock]"),F;try{F=new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"2-digit",minute:"2-digit",hour12:!1})}catch{return}let A=()=>f().forEach(b=>{b.textContent=`Hyderabad \xB7 ${F.format(new Date)} IST`});A(),setInterval(A,2e4)})();ao();if(so){let i=document.getElementById("page"),f=new Map(Array.from(document.querySelectorAll("template[data-route]")).map(p=>[p.dataset.route,p])),F=p=>p&&p.startsWith("#/")?p.slice(1).split("#")[0]:"/",A=p=>requestAnimationFrame(()=>{let R=p&&document.getElementById(p);R&&R.scrollIntoView({block:"start"})}),b="/",e=p=>{z.querySelectorAll(".nav-links > a[data-key]").forEach(R=>{let E=F(R.getAttribute("href"));E!=="/"&&p.startsWith(E)?R.setAttribute("aria-current","page"):R.removeAttribute("aria-current")}),fe&&fe.toggleAttribute("data-current",/^\/(services|verticals)\//.test(p))},w=(p,{scroll:R=!0}={})=>{let E=f.get(p)||f.get("/404/");b=f.has(p)?p:"/404/",i.replaceChildren(E.content.cloneNode(!0)),document.title=E.dataset.title,e(b),R&&(oe.style.scrollBehavior="auto",window.scrollTo(0,0),oe.style.scrollBehavior=""),uo(i),document.dispatchEvent(new Event("ws:route"))},T=(p,R)=>{if(p===b){window.scrollTo({top:0,behavior:ke?"auto":"smooth"});return}if(mt(!1),Ee(!1),b=f.has(p)?p:"/404/",R)try{history.pushState({route:p},"",`#${p}`)}catch{}w(p),!ke&&i.animate&&i.animate([{opacity:0},{opacity:1}],{duration:380,easing:"cubic-bezier(0.2, 0.7, 0.1, 1)"})};document.addEventListener("click",p=>{let R=p.target.closest('a[href^="#"]');if(!R||p.defaultPrevented||p.metaKey||p.ctrlKey||p.shiftKey)return;let E=R.getAttribute("href");if(p.preventDefault(),E.startsWith("#/")){T(F(E),!0),A(E.slice(2).split("#")[1]);return}let de=E.length>1&&document.getElementById(E.slice(1));de&&de.scrollIntoView({behavior:ke?"auto":"smooth",block:"start"})}),window.addEventListener("popstate",()=>T(F(location.hash),!1)),window.addEventListener("hashchange",()=>{let p=F(location.hash);p!==b&&T(p,!1)});let g=F(location.hash);g!=="/"?w(g,{scroll:!1}):e("/")}})();
