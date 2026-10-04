export interface NpcArchetype{id:string;name:string;tier:number;hull:number;shield:number;attack:number;reward:Record<string,number>};
export const NPC_ARCHETYPES:NpcArchetype[]=[
{id:"pirate_raider",name:"Pirate Raider",tier:1,hull:500,shield:100,attack:80,reward:{metal:500,crystal:200}},
{id:"goauld_patrol",name:"Goa'uld Patrol",tier:2,hull:3000,shield:800,attack:400,reward:{metal:2500,crystal:1200,naquadah:500}},
{id:"replicator_swarm",name:"Replicator Swarm",tier:4,hull:15000,shield:5000,attack:1800,reward:{metal:12000,crystal:8000,naquadah:4000}}];
export function encounter(id:string){return NPC_ARCHETYPES.find(x=>x.id===id);}