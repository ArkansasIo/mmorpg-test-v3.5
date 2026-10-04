export type AdminMenuNode={id:string;label:string;description:string;permission:string;children?:AdminMenuNode[];commands?:string[]};
export type AdminTerminalResult={ok:boolean;command:string;result?:unknown;message?:string};
export async function getAdminTerminalMenu():Promise<{role:string;menu:AdminMenuNode[]}>{
 const r=await fetch("/api/admin/terminal/menu",{credentials:"include"});const d=await r.json();if(!r.ok)throw new Error(d.message||"Admin access denied");return d;
}
export async function executeAdminTerminal(command:string,args:Record<string,unknown>={}):Promise<AdminTerminalResult>{
 const r=await fetch("/api/admin/terminal/execute",{method:"POST",credentials:"include",headers:{"Content-Type":"application/json"},body:JSON.stringify({command,args})});const d=await r.json();if(!r.ok)throw new Error(d.message||"Admin command failed");return d;
}
export async function getAdminTerminalHistory(limit=50){const r=await fetch("/api/admin/terminal/history?limit="+encodeURIComponent(limit),{credentials:"include"});const d=await r.json();if(!r.ok)throw new Error(d.message||"Unable to load terminal history");return d.history;}
