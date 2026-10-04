import type {Express} from "express";
import {BUILDINGS} from "./services/buildingService";
import {TECHNOLOGIES} from "./services/researchService";
import {SHIPS} from "./services/fleetService";
import {NPC_ARCHETYPES} from "./services/pveService";
export function registerDependencySystemRoutes(app:Express){
 app.get("/api/catalog/buildings",(_q,r)=>r.json({ok:true,items:BUILDINGS}));
 app.get("/api/catalog/research",(_q,r)=>r.json({ok:true,items:TECHNOLOGIES}));
 app.get("/api/catalog/ships",(_q,r)=>r.json({ok:true,items:SHIPS}));
 app.get("/api/catalog/npcs",(_q,r)=>r.json({ok:true,items:NPC_ARCHETYPES}));
}