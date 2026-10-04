import { db } from "../db";
import { adminUsers, users } from "../../shared/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { normalizeAdminRole, getRolePermissions, hasAdminPermission, type AdminPermission } from "../adminPermissions";

export type AdminMenuNode = { id:string; label:string; description:string; permission:AdminPermission; children?:AdminMenuNode[]; commands?:string[] };

export const ADMIN_TERMINAL_MENU:AdminMenuNode[]=[
 {id:"dashboard",label:"SYSTEM DASHBOARD",description:"Runtime, database and administration status.",permission:"view_only",commands:["status"]},
 {id:"players",label:"PLAYER OPERATIONS",description:"Search accounts and perform explicit account operations.",permission:"manage",commands:["users search","user ban","user unban"]},
 {id:"economy",label:"ECONOMY CONTROL",description:"Controlled resource grants.",permission:"manage",commands:["grant resources"]},
 {id:"universe",label:"UNIVERSE CONTROL",description:"Universe configuration and live operations.",permission:"world_tools",commands:["config get","config set"]},
 {id:"security",label:"SECURITY & AUDIT",description:"Administrative audit history.",permission:"moderate",commands:["audit recent"]},
 {id:"maintenance",label:"MAINTENANCE",description:"Queue and database health operations.",permission:"developer_tools",commands:["queues","db health"]},
 {id:"help",label:"COMMAND HELP",description:"Supported commands. Arbitrary SQL is unavailable.",permission:"view_only",commands:["help"]}
];

const COMMAND_PERMISSIONS:Record<string,AdminPermission>={
 status:"view_only",help:"view_only","users search":"manage","user ban":"manage","user unban":"manage",
 "grant resources":"manage","config get":"world_tools","config set":"world_tools","audit recent":"moderate",
 queues:"developer_tools","db health":"developer_tools"
};

export async function requireTerminalAdmin(req:any,permission:AdminPermission="view_only"){
 const userId=typeof req?.session?.userId==="string"?req.session.userId:null;
 if(!userId) throw Object.assign(new Error("Authentication required"),{status:401});
 const [record]=await db.select({userId:adminUsers.userId,role:adminUsers.role,permissions:adminUsers.permissions}).from(adminUsers).where(eq(adminUsers.userId,userId)).limit(1);
 if(!record) throw Object.assign(new Error("Administrator access required"),{status:403});
 const permissions=Array.isArray(record.permissions)?record.permissions:getRolePermissions(record.role);
 if(!hasAdminPermission(permissions,permission)) throw Object.assign(new Error("Insufficient administrator permission"),{status:403});
 return {userId,role:normalizeAdminRole(record.role),permissions};
}

export function getAdminMenu(permissions:unknown){return ADMIN_TERMINAL_MENU.filter(n=>hasAdminPermission(permissions,n.permission));}

export async function executeAdminCommand(adminId:string,command:string,args:Record<string,unknown>={}){
 const normalized=command.trim().toLowerCase().replace(/\s+/g," ");
 const permission=COMMAND_PERMISSIONS[normalized];
 if(!permission) throw Object.assign(new Error("Unsupported command"),{status:400});
 const [admin]=await db.select({role:adminUsers.role,permissions:adminUsers.permissions}).from(adminUsers).where(eq(adminUsers.userId,adminId)).limit(1);
 if(!admin) throw Object.assign(new Error("Administrator access required"),{status:403});
 const permissions=Array.isArray(admin.permissions)?admin.permissions:getRolePermissions(admin.role);
 if(!hasAdminPermission(permissions,permission)) throw Object.assign(new Error("Insufficient administrator permission"),{status:403});
 let result:Record<string,unknown>;
 switch(normalized){
  case "help": result={commands:Object.keys(COMMAND_PERMISSIONS)}; break;
  case "status":{
   const [u]=await db.select({count:sql<number>`count(*)`}).from(users);
   const [a]=await db.select({count:sql<number>`count(*)`}).from(adminUsers);
   result={status:"online",nodeEnv:process.env.NODE_ENV||"production",pid:process.pid,uptimeSeconds:Math.floor(process.uptime()),memoryMb:Math.round(process.memoryUsage().rss/1024/1024),users:Number(u.count),administrators:Number(a.count),timestamp:new Date().toISOString()}; break;
  }
  case "users search":{
   const query=String(args.query||"").trim(); if(!query) throw Object.assign(new Error("query is required"),{status:400});
   result={users:await db.select({id:users.id,username:users.username,email:users.email,banned:users.isBanned,createdAt:users.createdAt}).from(users).where(or(ilike(users.username,"%"+query+"%"),ilike(users.email,"%"+query+"%"))).limit(25)}; break;
  }
  case "user ban":{
   const userId=String(args.userId||""); if(!userId) throw Object.assign(new Error("userId is required"),{status:400});
   const reason=String(args.reason||"Administrative action").slice(0,500);
   const updated=await db.update(users).set({isBanned:true,banReason:reason,updatedAt:new Date()}).where(eq(users.id,userId)).returning({id:users.id,username:users.username,banned:users.isBanned});
   if(!updated.length) throw Object.assign(new Error("User not found"),{status:404}); result={user:updated[0]}; break;
  }
  case "user unban":{
   const userId=String(args.userId||""); if(!userId) throw Object.assign(new Error("userId is required"),{status:400});
   const updated=await db.update(users).set({isBanned:false,banReason:null,updatedAt:new Date()}).where(eq(users.id,userId)).returning({id:users.id,username:users.username,banned:users.isBanned});
   if(!updated.length) throw Object.assign(new Error("User not found"),{status:404}); result={user:updated[0]}; break;
  }
  case "grant resources": throw Object.assign(new Error("Resource grants must use the transactional economy service; generic terminal grants are disabled."),{status:501});
  case "config get":{
   const key=String(args.key||"").trim(); if(!key) throw Object.assign(new Error("key is required"),{status:400});
   const rows=await db.execute(sql`SELECT config_key, config_value, description, updated_at FROM game_config WHERE config_key = ${key} LIMIT 1`);
   result={config:rows.rows[0]||null}; break;
  }
  case "config set":{
   const key=String(args.key||"").trim(); if(!/^[a-zA-Z0-9_.:-]{1,100}$/.test(key)) throw Object.assign(new Error("Invalid config key"),{status:400});
   if(!Object.prototype.hasOwnProperty.call(args,"value")) throw Object.assign(new Error("value is required"),{status:400});
   await db.execute(sql`INSERT INTO game_config(config_key,config_value,updated_by) VALUES(${key},${JSON.stringify(args.value)}::jsonb,${adminId}) ON CONFLICT(config_key) DO UPDATE SET config_value=EXCLUDED.config_value,updated_by=EXCLUDED.updated_by,updated_at=NOW()`);
   result={key,value:args.value}; break;
  }
  case "audit recent":{
   const limit=Math.min(Math.max(Number(args.limit||25),1),100);
   result={entries:(await db.execute(sql`SELECT id,user_id,action,entity_type,entity_id,old_values,new_values,ip_address,user_agent,created_at FROM audit_logs ORDER BY created_at DESC LIMIT ${limit}`)).rows}; break;
  }
  case "queues":{
   const b=await db.execute(sql`SELECT count(*)::int AS count FROM building_queues WHERE processed=FALSE AND cancelled=FALSE`);
   const r=await db.execute(sql`SELECT count(*)::int AS count FROM research_queues WHERE processed=FALSE AND cancelled=FALSE`);
   const f=await db.execute(sql`SELECT count(*)::int AS count FROM fleet_build_queues WHERE processed=FALSE AND cancelled=FALSE`);
   result={building:b.rows[0]?.count||0,research:r.rows[0]?.count||0,fleet:f.rows[0]?.count||0}; break;
  }
  case "db health":{const started=Date.now();await db.execute(sql`SELECT 1`);result={database:"ok",latencyMs:Date.now()-started};break;}
  default: throw Object.assign(new Error("Unsupported command"),{status:400});
 }
 await db.execute(sql`INSERT INTO admin_terminal_history(admin_id,command,arguments,result) VALUES(${adminId},${normalized},${JSON.stringify(args)}::jsonb,${JSON.stringify(result)}::jsonb)`);
 await db.execute(sql`INSERT INTO admin_logs(admin_id,action,target_type,details) VALUES(${adminId},${normalized},'admin_terminal',${JSON.stringify(result)}::jsonb)`);
 return result;
}
