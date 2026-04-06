import{c as o,u as M,a as O,r as s,B as G,j as e,S as L,I as D,o as Y,D as R,E as U}from"./index-BQrEPIzm.js";import{c as X}from"./clsx-B-dksMZM.js";import{C as $}from"./ConfirmModal-CmI3xK-U.js";import{L as q}from"./lock-Me7Bw3Hg.js";import{E as F,a as H}from"./eye-DnuoD6Cr.js";import{C as w}from"./check-C_Lpu8Ny.js";import{T as V}from"./trash-2-BAeJWy5t.js";import{T as B}from"./terminal-BuuIQYE-.js";import{E as J}from"./external-link-DkzJ9z4g.js";import{f as A}from"./format-CBpsKyOP.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=o("CodeXml",[["path",{d:"m18 16 4-4-4-4",key:"1inbqp"}],["path",{d:"m6 8-4 4 4 4",key:"15zrgr"}],["path",{d:"m14.5 4-5 16",key:"e7oirm"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=o("Copy",[["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=o("Key",[["path",{d:"m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4",key:"g0fldk"}],["path",{d:"m21 2-9.6 9.6",key:"1j0ho8"}],["circle",{cx:"7.5",cy:"15.5",r:"5.5",key:"yqb3hr"}]]);/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=o("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);function de(){const{token:l}=M(),r=O(),[n,d]=s.useState([]),[k,h]=s.useState(!0),[c,y]=s.useState(""),[x,u]=s.useState(!1),[K,m]=s.useState(!1),[i,b]=s.useState(null),[j,f]=s.useState(null),[g,P]=s.useState({});s.useEffect(()=>{C()},[l]);const C=async()=>{h(!0);try{const t=await G(l);d(t)}catch{r.error("Failed to load API keys.")}finally{h(!1)}},S=async t=>{if(t.preventDefault(),!!c.trim()){u(!0);try{const a=await R(c,l);d([a,...n]),y(""),r.success("API key generated successfully.")}catch{r.error("Failed to generate API key.")}finally{u(!1)}}},z=async()=>{if(i)try{await U(i.id,l),d(n.filter(t=>t.id!==i.id)),r.success("API key revoked.")}catch{r.error("Failed to revoke API key.")}finally{m(!1),b(null)}},v=(t,a)=>{navigator.clipboard.writeText(t),f(a),setTimeout(()=>f(null),2e3),r.success("Copied to clipboard")},T=t=>{P(a=>({...a,[t]:!a[t]}))},_=t=>`${t.slice(0,8)}••••••••••••••••••••${t.slice(-4)}`,N={curl:`curl -X POST "${window.location.origin}/api/detect/single" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "features": {
      "duration": 0,
      "src_bytes": 491,
      "dst_bytes": 0,
      "serror_rate": 0.0,
      "count": 2
    }
  }'`,python:`import requests

url = "${window.location.origin}/api/detect/single"
headers = {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "features": {
        "duration": 0,
        "src_bytes": 491,
        "dst_bytes": 0,
        "serror_rate": 0.0,
        "count": 2
    }
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`,javascript:`const response = await fetch("${window.location.origin}/api/detect/single", {
  method: "POST",
  headers: {
    "X-API-Key": "YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    features: {
      duration: 0,
      src_bytes: 491,
      dst_bytes: 0,
      serror_rate: 0.0,
      count: 2
    }
  })
});

const result = await response.json();
console.log(result);`},[p,E]=s.useState("curl");return e.jsxs("div",{className:"space-y-6 animate-fade-in pb-12",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row sm:items-center justify-between gap-4",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"page-title",children:"API Key Management"}),e.jsx("p",{className:"section-subtitle mt-1",children:"Generate and manage API keys to integrate ThreatGuardAI into your own applications."})]}),e.jsx("div",{className:"flex items-center gap-2",children:e.jsxs("div",{className:"bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl flex items-center gap-2",children:[e.jsx(L,{size:14,className:"text-amber-600"}),e.jsx("span",{className:"text-[10px] font-bold text-amber-700 uppercase tracking-wider",children:"Developer Mode Active"})]})})]}),e.jsxs("div",{className:"grid lg:grid-cols-3 gap-6",children:[e.jsxs("div",{className:"lg:col-span-2 space-y-6",children:[e.jsxs("div",{className:"card p-6 border-l-4 border-l-brand-blue",children:[e.jsxs("h3",{className:"font-bold text-navy-900 mb-4 flex items-center gap-2",children:[e.jsx(Z,{size:18,className:"text-brand-blue"})," Generate New API Key"]}),e.jsxs("form",{onSubmit:S,className:"flex gap-3",children:[e.jsxs("div",{className:"flex-1 relative group",children:[e.jsx(W,{size:16,className:"absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400 group-focus-within:text-brand-blue transition-colors"}),e.jsx("input",{type:"text",placeholder:"e.g., Production Server, Local Script...",className:"input-field pl-10 h-11 text-sm",value:c,onChange:t=>y(t.target.value),disabled:x})]}),e.jsx("button",{type:"submit",disabled:x||!c.trim(),className:"btn-primary px-6 h-11 text-sm whitespace-nowrap shadow-glow-sm",children:x?"Generating...":"Generate Key"})]}),e.jsxs("p",{className:"text-[10px] text-navy-400 mt-3 flex items-center gap-1.5",children:[e.jsx(D,{size:12})," API keys grant full access to your detection history and scanning capabilities. Never share them."]})]}),e.jsxs("div",{className:"card p-0 overflow-hidden",children:[e.jsxs("div",{className:"px-6 py-4 border-b border-navy-50 flex items-center justify-between bg-navy-50/30",children:[e.jsx("h3",{className:"font-bold text-navy-900 text-sm",children:"Your Active API Keys"}),e.jsxs("span",{className:"px-2 py-0.5 bg-white border border-navy-100 rounded-lg text-[10px] font-bold text-navy-500",children:[n.length," Keys"]})]}),e.jsx("div",{className:"overflow-x-auto",children:e.jsxs("table",{className:"data-table",children:[e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"Key Name"}),e.jsx("th",{children:"API Key"}),e.jsx("th",{children:"Created"}),e.jsx("th",{children:"Last Used"}),e.jsx("th",{className:"text-right",children:"Actions"})]})}),e.jsx("tbody",{children:k?Array.from({length:3}).map((t,a)=>e.jsx("tr",{className:"animate-pulse",children:e.jsx("td",{colSpan:"5",className:"py-6",children:e.jsx("div",{className:"h-4 bg-navy-50 rounded-full w-full"})})},a)):n.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:"5",className:"py-12 text-center",children:e.jsxs("div",{className:"flex flex-col items-center text-navy-300",children:[e.jsx(q,{size:32,className:"mb-3 opacity-20"}),e.jsx("p",{className:"font-bold text-navy-900",children:"No API keys generated"}),e.jsx("p",{className:"text-xs mt-1",children:"Generate a key above to start using the API."})]})})}):n.map(t=>e.jsxs("tr",{className:"group hover:bg-navy-50/50 transition-colors",children:[e.jsx("td",{children:e.jsx("p",{className:"text-sm font-bold text-navy-900",children:t.keyName})}),e.jsx("td",{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("code",{className:"text-[11px] font-mono bg-navy-50 px-2 py-1 rounded border border-navy-100 text-navy-600",children:g[t.id]?t.apiKey:_(t.apiKey)}),e.jsx("button",{onClick:()=>T(t.id),className:"p-1.5 text-navy-400 hover:text-navy-900 transition-colors",children:g[t.id]?e.jsx(F,{size:14}):e.jsx(H,{size:14})}),e.jsx("button",{onClick:()=>v(t.apiKey,t.id),className:"p-1.5 text-navy-400 hover:text-brand-blue transition-colors",children:j===t.id?e.jsx(w,{size:14,className:"text-emerald-500"}):e.jsx(I,{size:14})})]})}),e.jsx("td",{children:e.jsx("p",{className:"text-xs text-navy-500",children:t.createdAt?A(new Date(t.createdAt),"MMM d, yyyy"):"—"})}),e.jsx("td",{children:e.jsx("p",{className:"text-xs text-navy-500",children:t.lastUsed?A(new Date(t.lastUsed),"MMM d, HH:mm"):"Never"})}),e.jsx("td",{className:"text-right",children:e.jsx("button",{onClick:()=>{b(t),m(!0)},className:"p-2 text-navy-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all",children:e.jsx(V,{size:16})})})]},t.id))})]})})]})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"card p-6 bg-navy-900 text-white border-none shadow-2xl relative overflow-hidden",children:[e.jsx("div",{className:"absolute top-0 right-0 p-8 opacity-5",children:e.jsx(B,{size:120})}),e.jsxs("h3",{className:"font-bold text-white mb-6 flex items-center gap-2 relative z-10",children:[e.jsx(Q,{size:18,className:"text-brand-blue"})," Quick Integration"]}),e.jsx("div",{className:"flex gap-1 mb-4 relative z-10",children:["curl","python","javascript"].map(t=>e.jsx("button",{onClick:()=>E(t),className:X("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",p===t?"bg-brand-blue text-white shadow-glow-sm":"text-white/40 hover:text-white/60 hover:bg-white/5"),children:t},t))}),e.jsx("div",{className:"relative z-10",children:e.jsxs("div",{className:"bg-black/40 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-blue-100 overflow-x-auto border border-white/10 group",children:[e.jsx("button",{onClick:()=>v(N[p],"snippet"),className:"absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-all",children:j==="snippet"?e.jsx(w,{size:14,className:"text-emerald-400"}):e.jsx(I,{size:14})}),e.jsx("pre",{className:"whitespace-pre-wrap",children:N[p]})]})}),e.jsxs("div",{className:"mt-6 pt-6 border-t border-white/10 relative z-10",children:[e.jsx("h4",{className:"text-[10px] font-black text-navy-400 uppercase tracking-widest mb-3",children:"API Endpoints"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between text-[11px]",children:[e.jsx("span",{className:"text-emerald-400 font-bold",children:"POST"}),e.jsx("span",{className:"text-white/60",children:"/api/detect/single"})]}),e.jsxs("div",{className:"flex items-center justify-between text-[11px]",children:[e.jsx("span",{className:"text-emerald-400 font-bold",children:"POST"}),e.jsx("span",{className:"text-white/60",children:"/api/detect/batch"})]}),e.jsxs("div",{className:"flex items-center justify-between text-[11px]",children:[e.jsx("span",{className:"text-blue-400 font-bold",children:"GET"}),e.jsx("span",{className:"text-white/60",children:"/api/detect/history"})]})]}),e.jsxs("button",{className:"w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",children:["Full API Documentation ",e.jsx(J,{size:12})]})]})]}),e.jsxs("div",{className:"card p-6 border-l-4 border-l-amber-400 bg-amber-50/30",children:[e.jsxs("h3",{className:"font-bold text-navy-900 text-sm mb-2 flex items-center gap-2",children:[e.jsx(Y,{size:16,className:"text-amber-500"})," Security Warning"]}),e.jsx("p",{className:"text-xs text-navy-600 leading-relaxed",children:"API keys provide full access to your account's detection engine. If a key is compromised, revoke it immediately and generate a new one."})]})]})]}),e.jsx($,{isOpen:K,onClose:()=>m(!1),onConfirm:z,title:"Revoke API Key",message:`Are you sure you want to revoke the API key "${i==null?void 0:i.keyName}"? Any applications using this key will immediately lose access to the ThreatGuardAI API.`,confirmText:"Revoke Key",type:"danger"})]})}export{de as default};
