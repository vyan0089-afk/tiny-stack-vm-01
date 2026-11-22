// Tiny Stack VM: a faithful interpreter of make.fun's tiny stack ISA v1
// (kit: generator/subject/ISA.md; reference: generator/subject/vm.mjs).
// For each /input/<id>/{program.bin,input.bin} writes /output/<id>/{stdout.bin,exit.txt}.
import{readdirSync as R,readFileSync as r,mkdirSync as m,writeFileSync as w}from"node:fs";
const I=process.env.MAKEFUN_INPUT_DIR||"/input",O=process.env.MAKEFUN_OUTPUT_DIR||"/output";
function run(p,q){
 const n=p.length,D=new Int32Array(256);let s=0;const C=new Int32Array(64);let c=0;const M=new Int32Array(256),o=new Uint8Array(65536);let l=0,g=0,x=0,t=0;
 const e=v=>({o:o.slice(0,l),c:v});
 for(;;){
  if(t===1e6)return e(10);
  if(x<0||x>=n)return e(9);
  const h=p[x],y=h===1?1:h===2?4:h>=48&&h<=51?2:0;
  if(x+y>=n)return e(9);
  t++;const z=x+1+y;x=z;
  if(h>=16&&h<=34&&h!==23&&h!==27&&h!==31){
   if(s<2)return e(2);
   const b=D[s-1],a=D[s-2];let v;
   if(h===16)v=a+b|0;
   else if(h===17)v=a-b|0;
   else if(h===18)v=Math.imul(a,b);
   else if(h===19){if(!b)return e(4);v=a/b|0;}
   else if(h===20){if(!b)return e(4);v=a%b|0;}
   else if(h===21){if(!b)return e(4);v=Math.floor((a>>>0)/(b>>>0))|0;}
   else if(h===22){if(!b)return e(4);v=(a>>>0)%(b>>>0)|0;}
   else if(h===24)v=a&b;
   else if(h===25)v=a|b;
   else if(h===26)v=a^b;
   else if(h===28)v=a<<b;
   else if(h===29)v=a>>b;
   else if(h===30)v=a>>>b|0;
   else if(h===32)v=a===b?1:0;
   else if(h===33)v=a<b?1:0;
   else v=(a>>>0)<(b>>>0)?1:0;
   D[s-2]=v;s--;continue;
  }
  switch(h){
   case 0:return{o:o.slice(0,l),c:0};
   case 1:if(s===256)return e(3);D[s++]=(p[z-1]<<24)>>24;break;
   case 2:if(s===256)return e(3);D[s++]=p[z-4]|p[z-3]<<8|p[z-2]<<16|p[z-1]<<24;break;
   case 3:if(!s)return e(2);s--;break;
   case 4:if(!s)return e(2);if(s===256)return e(3);D[s]=D[s-1];s++;break;
   case 5:if(s<2)return e(2);{const t=D[s-1];D[s-1]=D[s-2];D[s-2]=t;}break;
   case 6:if(s<2)return e(2);if(s===256)return e(3);D[s]=D[s-2];s++;break;
   case 7:if(s<3)return e(2);{const t=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=t;}break;
   case 23:if(!s)return e(2);D[s-1]=-D[s-1]|0;break;
   case 27:if(!s)return e(2);D[s-1]=~D[s-1];break;
   case 48:{const v=(p[z-2]|p[z-1]<<8)<<16>>16;x=z+v;break;}
   case 49:case 50:{if(!s)return e(2);const v=D[--s],u=(p[z-2]|p[z-1]<<8)<<16>>16;if((h===49)===(v===0))x=z+u;break;}
   case 51:if(c===64)return e(7);C[c++]=z;x=p[z-2]|p[z-1]<<8;break;
   case 52:if(!c)return e(8);x=C[--c];break;
   case 64:if(!s)return e(2);{const a=D[s-1];if(a<0||a>255)return e(6);D[s-1]=M[a];}break;
   case 65:if(s<2)return e(2);{const a=D[s-1];if(a<0||a>255)return e(6);M[a]=D[s-2];s-=2;}break;
   case 80:if(!s)return e(2);{const v=String(D[s-1]);if(l+v.length>65536)return e(11);for(let i=0;i<v.length;i++)o[l++]=v.charCodeAt(i);s--;}break;
   case 81:if(!s)return e(2);if(l>=65536)return e(11);o[l++]=D[--s]&255;break;
   case 82:if(s===256)return e(3);D[s++]=g<q.length?q[g++]:-1;break;
   case 83:if(!s)return e(2);return{o:o.slice(0,l),c:D[--s]&255};
   default:return e(5);
  }
 }
}
for(const d of R(I).sort()){
 let v;try{v=run(new Uint8Array(r(I+"/"+d+"/program.bin")),new Uint8Array(r(I+"/"+d+"/input.bin")))}catch{v={o:new Uint8Array(0),c:0}}
 m(O+"/"+d,{recursive:true});w(O+"/"+d+"/stdout.bin",v.o);w(O+"/"+d+"/exit.txt",v.c+"\n");
}
