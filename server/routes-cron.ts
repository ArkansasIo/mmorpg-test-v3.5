import type { Express, Request, Response } from "express";
import { db } from "./db";
import { adminUsers } from "../shared/schema";
import { eq } from "drizzle-orm";
import { listCronJobs, setCronEnabled, runCronJob } from "./services/cronEngine";

async function requireAdmin(req:Request,res:Response){
  if(!req.session.userId){res.status(401).json({ok:false,message:"Authentication required"});return false;}
  const [admin]=await db.select({id:adminUsers.id}).from(adminUsers).where(eq(adminUsers.userId,req.session.userId)).limit(1);
  if(!admin){res.status(403).json({ok:false,message:"Administrator clearance required"});return false;}
  return true;
}
export function registerCronRoutes(app:Express){
  app.get("/api/cron/jobs",async(req,res)=>{if(!await requireAdmin(req,res))return;res.json({ok:true,jobs:listCronJobs()});});
  app.post("/api/cron/jobs/:id/toggle",async(req,res)=>{if(!await requireAdmin(req,res))return;try{res.json({ok:true,job:setCronEnabled(req.params.id,Boolean(req.body?.enabled))});}catch(e){res.status(400).json({ok:false,message:e instanceof Error?e.message:String(e)});}});
  app.post("/api/cron/jobs/:id/run",async(req,res)=>{if(!await requireAdmin(req,res))return;try{res.json(await runCronJob(req.params.id));}catch(e){res.status(500).json({ok:false,message:e instanceof Error?e.message:String(e)});}});
}
