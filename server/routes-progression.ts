import type {Express} from "express";
import {requireUserId} from "./services/ownershipService";
import {getColonyResources,startBuilding,startFleetBuild,processProgressionQueues} from "./services/progressionRepository";
export function registerProgressionRoutes(app:Express){
 app.get("/api/progression/resources/:colonyId",async(req,res)=>{try{res.json({ok:true,resources:await getColonyResources(requireUserId(req),String(req.params.colonyId))})}catch(e){res.status(403).json({ok:false,error:(e as Error).message})}});
 app.post("/api/progression/buildings/start",async(req,res)=>{try{res.status(201).json({ok:true,queue:await startBuilding(requireUserId(req),String(req.body.colonyId),String(req.body.buildingId),Number(req.body.targetLevel),new Date(req.body.endTime))})}catch(e){res.status(400).json({ok:false,error:(e as Error).message})}});
 app.post("/api/progression/fleet-build/start",async(req,res)=>{try{res.status(201).json({ok:true,queue:await startFleetBuild(requireUserId(req),String(req.body.colonyId),String(req.body.shipId),Number(req.body.quantity),new Date(req.body.endTime))})}catch(e){res.status(400).json({ok:false,error:(e as Error).message})}});
 app.post("/api/progression/process",async(_req,res)=>{try{res.json({ok:true,...await processProgressionQueues()})}catch(e){res.status(500).json({ok:false,error:(e as Error).message})}});
}