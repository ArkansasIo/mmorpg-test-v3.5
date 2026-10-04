import type { Express, Request, Response } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { executeAdminCommand, getAdminMenu, requireTerminalAdmin } from "./services/adminTerminalService";

function fail(res:Response,error:unknown){const e=error as {status?:number;message?:string};res.status(e.status||500).json({ok:false,message:e.message||"Admin terminal request failed"});}

export function registerAdminTerminalRoutes(app:Express){
  app.get("/api/admin/dashboard",async(req:Request,res:Response)=>{try{const auth=await requireTerminalAdmin(req,"view_only");const status=await executeAdminCommand(auth.userId,"status",{});res.json({ok:true,role:auth.role,permissions:auth.permissions,menu:getAdminMenu(auth.permissions),status});}catch(e){fail(res,e);}});
 app.get("/api/admin/terminal/menu",async(req:Request,res:Response)=>{
  try{const auth=await requireTerminalAdmin(req,"view_only");res.json({ok:true,role:auth.role,menu:getAdminMenu(auth.permissions)});}
  catch(e){fail(res,e);}
 });
 app.post("/api/admin/terminal/execute",async(req:Request,res:Response)=>{
  try{const auth=await requireTerminalAdmin(req,"view_only");const command=String(req.body?.command||"");const args=req.body?.args&&typeof req.body.args==="object"?req.body.args:{};const result=await executeAdminCommand(auth.userId,command,args);res.json({ok:true,command,result});}
  catch(e){fail(res,e);}
 });
 app.get("/api/admin/terminal/history",async(req:Request,res:Response)=>{
  try{
   const auth=await requireTerminalAdmin(req,"moderate");
   const limit=Math.min(Math.max(Number(req.query.limit||50),1),200);
   const rows=await db.execute(sql`SELECT id,command,arguments,result,created_at FROM admin_terminal_history WHERE admin_id=${auth.userId} ORDER BY created_at DESC LIMIT ${limit}`);
   res.json({ok:true,history:rows.rows});
  }catch(e){fail(res,e);}
 });
}
