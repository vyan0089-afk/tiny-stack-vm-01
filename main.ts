// Tiny Stack VM: faithful interpreter of make.fun's tiny stack ISA v1.
// Node 22 (type stripping). Reads /input/<id>/{program.bin,input.bin},
// writes /output/<id>/{stdout.bin,exit.txt}. Env overrides for local runs.
import {readdirSync,readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {join} from 'node:path';
const IN=process.env.MAKEFUN_INPUT_DIR||'/input',OUT=process.env.MAKEFUN_OUTPUT_DIR||'/output';
// opcode table: [byte, immBytes, pops, pushes]
const I=new Uint8Array(256),P=new Uint8Array(256),U=new Uint8Array(256),K=new Uint8Array(256);
[[0,0,0,0],[1,1,0,1],[2,4,0,1],[3,0,1,0],[4,0,1,2],[5,0,2,2],[6,0,2,3],[7,0,3,3],[16,0,2,1],[17,0,2,1],[18,0,2,1],[19,0,2,1],[20,0,2,1],[21,0,2,1],[22,0,2,1],[23,0,1,1],[24,0,2,1],[25,0,2,1],[26,0,1,1],[27,0,1,1],[28,0,2,1],[29,0,2,1],[30,0,2,1],[32,0,2,1],[33,0,2,1],[34,0,2,1],[48,2,0,0],[49,2,1,0],[50,2,1,0],[51,2,0,0],[52,0,0,0],[64,0,1,1],[65,0,2,0],[80,0,1,0],[81,0,1,0],[82,0,0,1],[83,0,1,0]].forEach(([o,i,p,u])=>{I[o]=i;P[o]=p;U[o]=u;K[o]=1;});
function run(pg,inp){
  const n=pg.length,D=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
  let sp=0,cp=0,ol=0,ip=0,pc=0,st=0;
  const done=c=>[o.subarray(0,ol),c];
  for(;;){
    if(st===1e6)return done(10);
    if(pc<0||pc>=n)return done(9);
    const op=pg[pc];
    if(!K[op])return done(5);
    const im=I[op],po=P[op],pu=U[op];
    if(pc+im>=n)return done(9);
    st++;const nx=pc+1+im;
    if(sp<po)return done(2);
    if(sp-po+pu>256)return done(3);
    pc=nx;
    switch(op){
      case 0:return done(0);
      case 1:D[sp++]=(pg[nx-1]<<24)>>24;break;
      case 2:D[sp++]=pg[nx-4]|pg[nx-3]<<8|pg[nx-2]<<16|pg[nx-1]<<24;break;
      case 3:sp--;break;
      case 4:D[sp]=D[sp-1];sp++;break;
      case 5:{const t=D[sp-1];D[sp-1]=D[sp-2];D[sp-2]=t;}break;
      case 6:D[sp]=D[sp-2];sp++;break;
      case 7:{const a=D[sp-3];D[sp-3]=D[sp-2];D[sp-2]=D[sp-1];D[sp-1]=a;}break;
      case 23:D[sp-1]=-D[sp-1]|0;break;
      case 27:D[sp-1]=~D[sp-1];break;
      case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
        const b=D[sp-1],a=D[sp-2];let r=0;
        if(op===16)r=a+b|0;else if(op===17)r=a-b|0;else if(op===18)r=Math.imul(a,b);
        else if(op===19){if(!b)return done(4);r=a===-2147483648&&b===-1?a:(a/b)|0;}
        else if(op===20){if(!b)return done(4);r=b===-1?0:a%b|0;}
        else if(op===21){if(!b)return done(4);r=Math.floor((a>>>0)/(b>>>0))|0;}
        else if(op===22){if(!b)return done(4);r=(a>>>0)%(b>>>0)|0;}
        else if(op===24)r=a&b;else if(op===25)r=a|b;else if(op===26)r=a^b;
        else if(op===28)r=a<<(b&31);else if(op===29)r=a>>(b&31);else if(op===30)r=(a>>>(b&31))|0;
        else if(op===32)r=a===b?1:0;else if(op===33)r=a<b?1:0;else r=(a>>>0)<(b>>>0)?1:0;
        sp-=2;D[sp++]=r;break;}
      case 48:case 49:case 50:{
        const rel=((pg[nx-2]|pg[nx-1]<<8)<<16)>>16;let take=true;
        if(op!==48){const v=D[--sp];take=op===49?v===0:v!==0;}
        if(take)pc=nx+rel;break;}
      case 51:if(cp===64)return done(7);C[cp++]=nx;pc=pg[nx-2]|pg[nx-1]<<8;break;
      case 52:if(!cp)return done(8);pc=C[--cp];break;
      case 64:{const a=D[sp-1];if(a<0||a>255)return done(6);D[sp-1]=M[a];}break;
      case 65:{const a=D[sp-1],v=D[sp-2];if(a<0||a>255)return done(6);sp-=2;M[a]=v;}break;
      case 80:{const s=String(D[sp-1]);if(ol+s.length>65536)return done(11);sp--;for(let i=0;i<s.length;i++)o[ol++]=s.charCodeAt(i);}break;
      case 81:if(ol+1>65536)return done(11);o[ol++]=D[--sp]&255;break;
      case 82:D[sp++]=ip<inp.length?inp[ip++]:-1;break;
      case 83:return done(D[--sp]&255);
    }
  }
}
for(const id of readdirSync(IN).sort()){
  let pg,inp;
  try{pg=readFileSync(join(IN,id,'program.bin'));inp=readFileSync(join(IN,id,'input.bin'));}catch{continue;}
  const [o,e]=run(pg,inp),od=join(OUT,id);
  mkdirSync(od,{recursive:true});
  writeFileSync(join(od,'stdout.bin'),o);
  writeFileSync(join(od,'exit.txt'),String(e)+'\n');
}
