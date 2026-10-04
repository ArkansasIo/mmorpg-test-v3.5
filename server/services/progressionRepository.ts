import { pool } from "../db";
import { BUILDINGS } from "./buildingService";
import { TECHNOLOGIES } from "./researchService";
import { SHIPS } from "./fleetService";
import { scaleCost } from "./gameProgressionService";

const resourceMap:Record<string,string>={metal:"metal",crystal:"crystal",naquadah:"naquadah",energy:"energy",dark_matter:"dark_matter",food:"food",water:"water",population:"population"};

export async function getColonyResources(userId:string,colonyId:string){
 const r=await pool.query("SELECT r.resource_type,r.current_amount,r.capacity FROM resources r JOIN colonies c ON c.id=r.colony_id WHERE c.id=$1 AND c.user_id=$2 ORDER BY r.resource_type",[colonyId,userId]);
 return r.rows;
}
export async function debitResources(userId:string,colonyId:string,cost:Record<string,number>,referenceId:string,source:string){
 const client=await pool.connect();
 try{
  await client.query("BEGIN");
  const owned=await client.query("SELECT id FROM colonies WHERE id=$1 AND user_id=$2 FOR UPDATE",[colonyId,userId]);
  if(!owned.rowCount) throw new Error("Colony ownership violation");
  for(const [key,value] of Object.entries(cost)){
   if(!value) continue;
   const type=resourceMap[key]??key;
   const row=await client.query("SELECT current_amount FROM resources WHERE colony_id=$1 AND resource_type=$2 FOR UPDATE",[colonyId,type]);
   const amount=Number(row.rows[0]?.current_amount??0);
   if(amount<value) throw new Error("Insufficient "+type);
   await client.query("UPDATE resources SET current_amount=current_amount-$1,updated_at=NOW() WHERE colony_id=$2 AND resource_type=$3",[value,colonyId,type]);
   await client.query("INSERT INTO resource_transactions(user_id,colony_id,resource_type,amount,transaction_type,source,reference_id) VALUES($1,$2,$3,$4,'debit',$5,$6)",[userId,colonyId,type,-value,source,referenceId]);
  }
  await client.query("COMMIT");
 }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
}
export async function startBuilding(userId:string,colonyId:string,buildingId:string,targetLevel:number,endTime:Date){
 const def=BUILDINGS.find((x)=>x.id===buildingId);if(!def)throw new Error("Unknown building");
 if(targetLevel<1||targetLevel>def.levelMax)throw new Error("Invalid building level");
 const client=await pool.connect();try{await client.query("BEGIN");
 const owned=await client.query("SELECT id FROM colonies WHERE id=$1 AND user_id=$2 FOR UPDATE",[colonyId,userId]);if(!owned.rowCount)throw new Error("Colony ownership violation");
 const b=await client.query("SELECT level FROM buildings WHERE colony_id=$1 AND building_type=$2 FOR UPDATE",[colonyId,buildingId]);const current=Number(b.rows[0]?.level??0);if(targetLevel!==current+1)throw new Error("Building must upgrade one level at a time");
 const id=(await client.query("SELECT uuid_generate_v4() id")).rows[0].id;const cost=scaleCost(def.cost,targetLevel);
 for(const [resource,value] of Object.entries(cost)){if(!value)continue;const rr=await client.query("SELECT current_amount FROM resources WHERE colony_id=$1 AND resource_type=$2 FOR UPDATE",[colonyId,resource]);if(Number(rr.rows[0]?.current_amount??0)<value)throw new Error("Insufficient "+resource);await client.query("UPDATE resources SET current_amount=current_amount-$1,updated_at=NOW() WHERE colony_id=$2 AND resource_type=$3",[value,colonyId,resource]);await client.query("INSERT INTO resource_transactions(user_id,colony_id,resource_type,amount,transaction_type,source,reference_id) VALUES($1,$2,$3,$4,'debit','building',$5)",[userId,colonyId,resource,-value,id]);}
 const q=await client.query("INSERT INTO building_queues(colony_id,user_id,building_type,target_level,start_time,end_time,metal_cost,crystal_cost,deuterium_cost) VALUES($1,$2,$3,$4,NOW(),$5,$6,$7,$8) RETURNING *",[colonyId,userId,buildingId,targetLevel,endTime,cost.metal??0,cost.crystal??0,cost.naquadah??0]);await client.query("COMMIT");return q.rows[0];
 }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
}
export async function startFleetBuild(userId:string,colonyId:string,shipId:string,quantity:number,endTime:Date){
 const def=SHIPS.find((x)=>x.id===shipId);if(!def)throw new Error("Unknown ship");if(!Number.isInteger(quantity)||quantity<1)throw new Error("Invalid quantity");
 const client=await pool.connect();try{await client.query("BEGIN");const owned=await client.query("SELECT id FROM colonies WHERE id=$1 AND user_id=$2 FOR UPDATE",[colonyId,userId]);if(!owned.rowCount)throw new Error("Colony ownership violation");
 const id=(await client.query("SELECT uuid_generate_v4() id")).rows[0].id;const cost: Record<string, number> = {}; for (const k of Object.keys(def.cost)) cost[k] = Number(def.cost[k as keyof typeof def.cost]) * quantity;
 for(const [resource,value] of Object.entries(cost)){const rr=await client.query("SELECT current_amount FROM resources WHERE colony_id=$1 AND resource_type=$2 FOR UPDATE",[colonyId,resource]);if(Number(rr.rows[0]?.current_amount??0)<value)throw new Error("Insufficient "+resource);await client.query("UPDATE resources SET current_amount=current_amount-$1,updated_at=NOW() WHERE colony_id=$2 AND resource_type=$3",[value,colonyId,resource]);await client.query("INSERT INTO resource_transactions(user_id,colony_id,resource_type,amount,transaction_type,source,reference_id) VALUES($1,$2,$3,$4,'debit','fleet_build',$5)",[userId,colonyId,resource,-value,id]);}
 const q=await client.query("INSERT INTO fleet_build_queues(user_id,colony_id,ship_class,quantity,start_time,end_time) VALUES($1,$2,$3,$4,NOW(),$5) RETURNING *",[userId,colonyId,shipId,quantity,endTime]);await client.query("COMMIT");return q.rows[0];
 }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
}
export function technologyDefinition(id:string){return TECHNOLOGIES.find((x)=>x.id===id);}
export async function processProgressionQueues(){ const r=await pool.query("UPDATE building_queues SET processed=TRUE WHERE processed=FALSE AND cancelled=FALSE AND end_time<=NOW() RETURNING id"); const f=await pool.query("UPDATE fleet_build_queues SET processed=TRUE WHERE processed=FALSE AND cancelled=FALSE AND end_time<=NOW() RETURNING id"); return {buildings:r.rowCount,fleets:f.rowCount}; }
