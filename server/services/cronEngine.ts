import { db } from "../db";
import { users } from "../../shared/schema";
import { sql } from "drizzle-orm";
import { tick } from "./coreGameService";

type Job = { id:string; name:string; intervalMs:number; enabled:boolean; lastRunAt:string|null; lastStatus:string; lastError:string|null; runCount:number; };

const jobs = new Map<string, Job>([
  ["resource_tick",{id:"resource_tick",name:"Resource & Population Tick",intervalMs:60_000,enabled:true,lastRunAt:null,lastStatus:"never",lastError:null,runCount:0}],
  ["turn_tick",{id:"turn_tick",name:"Turn Processing Tick",intervalMs:60_000,enabled:true,lastRunAt:null,lastStatus:"never",lastError:null,runCount:0}],
  ["maintenance",{id:"maintenance",name:"Database Maintenance",intervalMs:3_600_000,enabled:true,lastRunAt:null,lastStatus:"never",lastError:null,runCount:0}],
]);
let timer:ReturnType<typeof setInterval>|null=null;

async function runJob(id:string){
  const job=jobs.get(id); if(!job) throw new Error("Unknown cron job: "+id);
  const started=Date.now(); job.lastRunAt=new Date().toISOString(); job.lastStatus="running"; job.lastError=null;
  try {
    if(id==="resource_tick" || id==="turn_tick") {
      const all=await db.select({id:users.id}).from(users);
      for(const user of all) { try { await tick(user.id); } catch(error) { console.error("cron player tick failed",user.id,error); } }
    } else if(id==="maintenance") {
      await db.execute(sql.raw("SELECT 1"));
    }
    job.lastStatus="success"; job.runCount++;
    return {ok:true,jobId:id,durationMs:Date.now()-started,processedAt:job.lastRunAt};
  } catch(error) {
    job.lastStatus="failed"; job.lastError=error instanceof Error?error.message:String(error); job.runCount++;
    throw error;
  }
}

export function listCronJobs(){ return [...jobs.values()].map(j=>({...j})); }
export function setCronEnabled(id:string,enabled:boolean){ const j=jobs.get(id); if(!j) throw new Error("Unknown cron job: "+id); j.enabled=enabled; return {...j}; }
export async function runCronJob(id:string){ return runJob(id); }
export function startCronEngine(){
  if(timer) return;
  timer=setInterval(async()=>{
    const now=Date.now();
    for(const job of jobs.values()) if(job.enabled && (!job.lastRunAt || now-Date.parse(job.lastRunAt)>=job.intervalMs)) { try { await runJob(job.id); } catch(error){ console.error("[CRON]",job.id,error); } }
  },5_000);
  timer.unref?.();
}
export function stopCronEngine(){ if(timer){clearInterval(timer);timer=null;} }
