import {scaleCost,type Definition} from "./gameProgressionService";
export const TECHNOLOGIES:Definition[]=[
{id:"energy_tech",name:"Energy Technology",category:"science",levelMax:100,cost:{crystal:100,naquadah:50},durationSeconds:300},
{id:"weapons_tech",name:"Weapons Technology",category:"military",levelMax:100,cost:{metal:200,crystal:100},durationSeconds:360},
{id:"shield_tech",name:"Shield Technology",category:"military",levelMax:100,cost:{crystal:150,naquadah:75},durationSeconds:420},
{id:"hyperspace_tech",name:"Hyperspace Technology",category:"travel",levelMax:100,cost:{crystal:500,naquadah:250},durationSeconds:600}];
export function getTechnology(id:string){return TECHNOLOGIES.find(x=>x.id===id);}
export function researchCost(id:string,level:number){const d=getTechnology(id);if(!d)throw new Error("Unknown technology");return scaleCost(d.cost,level);}