import type {Express,Request,Response} from "express";
import {ensureCoreGameSchema,getCatalog,tick,upgradeBuilding,researchTech,buildShips,battle,explore,createMarketOrder,listMarket,buyMarketOrder} from "./services/coreGameService";
function uid(req:Request){if(!req.session.userId)throw Object.assign(new Error("Authentication required"),{status:401});return req.session.userId}
function fail(res:Response,e:unknown){const s=typeof e==="object"&&e&&"status"in e?Number((e as any).status)||400:400;res.status(s).json({ok:false,message:e instanceof Error?e.message:String(e)})}
export async function registerCoreGameRoutes(app:Express){await ensureCoreGameSchema();
app.get("/api/game/catalog",(_q,r)=>r.json({ok:true,catalog:getCatalog()}));
app.get("/api/game/state",async(q,r)=>{try{r.json({ok:true,state:await tick(uid(q))})}catch(e){fail(r,e)}});
app.post("/api/game/tick",async(q,r)=>{try{r.json({ok:true,state:await tick(uid(q))})}catch(e){fail(r,e)}});
app.post("/api/game/buildings/:id/upgrade",async(q,r)=>{try{r.json({ok:true,state:await upgradeBuilding(uid(q),q.params.id)})}catch(e){fail(r,e)}});
app.post("/api/game/research/:id",async(q,r)=>{try{r.json({ok:true,state:await researchTech(uid(q),q.params.id)})}catch(e){fail(r,e)}});
app.post("/api/game/ships/:id/build",async(q,r)=>{try{r.json({ok:true,state:await buildShips(uid(q),q.params.id,Number(q.body?.quantity||0))})}catch(e){fail(r,e)}});
app.post("/api/game/battle",async(q,r)=>{try{const id=uid(q);r.json({ok:true,...await battle(id,String(q.body?.defenderId||""),q.body?.mode==="pve"?"pve":"pvp")})}catch(e){fail(r,e)}});
app.post("/api/game/exploration",async(q,r)=>{try{r.json({ok:true,state:await explore(uid(q),String(q.body?.type||"deep_space"))})}catch(e){fail(r,e)}});
app.get("/api/game/market",async(_q,r)=>{try{r.json({ok:true,orders:await listMarket()})}catch(e){fail(r,e)}});
app.post("/api/game/market/orders",async(q,r)=>{try{r.json({ok:true,order:await createMarketOrder(uid(q),String(q.body?.resource||""),Number(q.body?.amount||0),Number(q.body?.unitPrice||0))})}catch(e){fail(r,e)}});
app.post("/api/game/market/orders/:id/buy",async(q,r)=>{try{r.json(await buyMarketOrder(uid(q),q.params.id))}catch(e){fail(r,e)}});
}