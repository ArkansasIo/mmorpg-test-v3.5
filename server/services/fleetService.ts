export type ShipClass="fighter"|"corvette"|"frigate"|"cruiser"|"battleship"|"carrier"|"mothership";
export interface ShipDefinition{id:string;name:string;class:ShipClass;hull:number;shield:number;attack:number;speed:number;cost:Record<string,number>};
export const SHIPS:ShipDefinition[]=[
{id:"interceptor",name:"Interceptor",class:"fighter",hull:400,shield:100,attack:50,speed:12000,cost:{metal:3000,crystal:1000}},
{id:"frigate",name:"Frigate",class:"frigate",hull:5000,shield:1200,attack:500,speed:8000,cost:{metal:20000,crystal:8000,naquadah:1000}},
{id:"cruiser",name:"Cruiser",class:"cruiser",hull:18000,shield:4000,attack:1500,speed:6000,cost:{metal:45000,crystal:20000,naquadah:5000}},
{id:"battleship",name:"Battleship",class:"battleship",hull:60000,shield:12000,attack:5000,speed:4000,cost:{metal:120000,crystal:50000,naquadah:15000}},
{id:"mothership",name:"Mothership",class:"mothership",hull:500000,shield:100000,attack:25000,speed:1500,cost:{metal:450000,crystal:250000,naquadah:450000}}];
export function getShip(id:string){return SHIPS.find(s=>s.id===id);}