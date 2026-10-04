import crypto from "node:crypto";
import { pool } from "../db";

export type ResourceKey="metal"|"crystal"|"naquadah"|"energy"|"darkMatter"|"food"|"water"|"population";
export type Resources=Record<ResourceKey,number>;
export interface GameState{version:1;playerId:string;turn:number;level:number;experience:number;resources:Resources;buildings:Record<string,number>;research:Record<string,number>;fleet:Record<string,{count:number;hp:number}>;population:{total:number;capacity:number;growth:number};missions:any[];cooldowns:Record<string,number>;updatedAt:number}

const R:ResourceKey[]=["metal","crystal","naquadah","energy","darkMatter","food","water","population"];
export const BUILDINGS=Object.freeze({
 metalMine:{metal:60,crystal:15,naquadah:0,max:100},crystalMine:{metal:48,crystal:24,naquadah:0,max:100},
 naquadahRefinery:{metal:250,crystal:125,naquadah:0,max:100},solarPlant:{metal:75,crystal:30,naquadah:0,max:100},
 foodHydroponics:{metal:180,crystal:90,naquadah:20,max:100},waterPurifier:{metal:150,crystal:100,naquadah:20,max:100},
 roboticsFactory:{metal:400,crystal:120,naquadah:200,max:50},shipyard:{metal:400,crystal:200,naquadah:100,max:50},
 researchLab:{metal:200,crystal:400,naquadah:100,max:50},populationHabitat:{metal:500,crystal:250,naquadah:50,max:100}
});
export const RESEARCH=Object.freeze({
 mining:{metal:500,crystal:250,naquadah:50,max:50},naquadah:{metal:700,crystal:400,naquadah:100,max:50},
 weapons:{metal:800,crystal:400,naquadah:100,max:50},shielding:{metal:600,crystal:600,naquadah:150,max:50},
 armour:{metal:1000,crystal:300,naquadah:100,max:50},propulsion:{metal:1200,crystal:800,naquadah:400,max:50},
 hyperspace:{metal:2500,crystal:2500,naquadah:1500,max:30},energy:{metal:500,crystal:1000,naquadah:250,max:50},
 espionage:{metal:700,crystal:900,naquadah:300,max:50}
});
export const SHIPS=Object.freeze({
 scout:{attack:20,hull:100,shield:20,speed:12000,capacity:100,metal:3000,crystal:1000,naquadah:0},
 interceptor:{attack:50,hull:400,shield:100,speed:11000,capacity:150,metal:3000,crystal:1000,naquadah:50},
 frigate:{attack:500,hull:5000,shield:1200,speed:8000,capacity:500,metal:20000,crystal:8000,naquadah:1000},
 cruiser:{attack:1500,hull:18000,shield:4000,speed:6000,capacity:1200,metal:45000,crystal:20000,naquadah:5000},
 battleship:{attack:5000,hull:60000,shield:12000,speed:4000,capacity:2500,metal:120000,crystal:50000,naquadah:15000},
 carrier:{attack:3500,hull:90000,shield:20000,speed:3500,capacity:5000,metal:180000,crystal:90000,naquadah:30000},
 mothership:{attack:25000,hull:500000,shield:100000,speed:1500,capacity:25000,metal:450000,crystal:250000,naquadah:450000}
});

export async function ensureCoreGameSchema(){
 await pool.query(`CREATE TABLE IF NOT EXISTS game_runtime_states(player_id uuid PRIMARY KEY,state jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`);
 await pool.query(`CREATE TABLE IF NOT EXISTS game_market_orders(id uuid PRIMARY KEY,seller_id uuid NOT NULL,resource varchar(32) NOT NULL,amount bigint NOT NULL CHECK(amount>0),unit_price numeric(20,6) NOT NULL CHECK(unit_price>0),status varchar(16) NOT NULL DEFAULT 'open',created_at timestamptz NOT NULL DEFAULT now())`);
 await pool.query(`CREATE TABLE IF NOT EXISTS game_fleet_missions(id uuid PRIMARY KEY,owner_id uuid NOT NULL,target_id uuid,type varchar(32) NOT NULL,payload jsonb NOT NULL,status varchar(16) NOT NULL DEFAULT 'traveling',created_at timestamptz NOT NULL DEFAULT now(),completes_at timestamptz NOT NULL)`);
 await pool.query(`CREATE TABLE IF NOT EXISTS game_battles(id uuid PRIMARY KEY,attacker_id uuid NOT NULL,defender_id uuid,mode varchar(16) NOT NULL,result jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`);
}
const defaults=(id:string):GameState=>({version:1,playerId:id,turn:0,level:1,experience:0,resources:{metal:10000,crystal:5000,naquadah:25000,energy:100,darkMatter:2500,food:1000,water:1000,population:100},buildings:{metalMine:1,crystalMine:1,solarPlant:1,foodHydroponics:1,waterPurifier:1,populationHabitat:1},research:{},fleet:{scout:{count:3,hp:100}},population:{total:100,capacity:500,growth:2},missions:[],cooldowns:{},updatedAt:Date.now()});
const cost=(d:any,l:number)=>{const f=Math.pow(1.5,Math.max(0,l-1));return{metal:Math.ceil(d.metal*f),crystal:Math.ceil(d.crystal*f),naquadah:Math.ceil(d.naquadah*f)}};
const afford=(r:Resources,c:any)=>R.every(k=>r[k]>=(c[k]??0));
const spend=(r:Resources,c:any)=>R.forEach(k=>r[k]=Math.max(0,r[k]-(c[k]??0)));

export async function getState(id:string):Promise<GameState>{const q=await pool.query("SELECT state FROM game_runtime_states WHERE player_id=$1",[id]);if(q.rowCount)return q.rows[0].state;const s=defaults(id);await pool.query("INSERT INTO game_runtime_states(player_id,state) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING",[id,JSON.stringify(s)]);return s}
async function save(s:GameState){s.updatedAt=Date.now();await pool.query("UPDATE game_runtime_states SET state=$2::jsonb,updated_at=now() WHERE player_id=$1",[s.playerId,JSON.stringify(s)]);return s}
export function tickState(s:GameState,seconds:number){const h=Math.max(0,seconds)/3600,b=s.buildings,r=s.resources;const mining=1+(s.research.mining||0)*.05;r.metal+=(b.metalMine||0)*30*mining*h;r.crystal+=(b.crystalMine||0)*15*mining*h;r.naquadah+=(b.naquadahRefinery||0)*8*(1+(s.research.naquadah||0)*.05)*h;const food=(b.foodHydroponics||0)*20,water=(b.waterPurifier||0)*20,consume=s.population.total*.5;r.food+=Math.max(0,food-consume)*h;r.water+=Math.max(0,water-consume)*h;s.population.total=Math.min(s.population.capacity,s.population.total+s.population.growth*h);r.population=s.population.total;for(const k of R)r[k]=Math.max(0,r[k]);s.turn+=Math.floor(seconds/1800);return s}
export async function tick(id:string){const s=await getState(id);const elapsed=Math.max(0,(Date.now()-s.updatedAt)/1000);tickState(s,elapsed);return save(s)}
export async function upgradeBuilding(id:string,key:string){const s=await tick(id),d=(BUILDINGS as any)[key];if(!d)throw new Error("Unknown building");const l=s.buildings[key]||0;if(l>=d.max)throw new Error("Building level cap reached");const c=cost(d,l+1);if(!afford(s.resources,c))throw new Error("Insufficient resources");spend(s.resources,c);s.buildings[key]=l+1;s.experience+=Math.ceil((c.metal+c.crystal+c.naquadah)/100);s.level=1+Math.floor(s.experience/1000);return save(s)}
export async function researchTech(id:string,key:string){const s=await tick(id),d=(RESEARCH as any)[key];if(!d)throw new Error("Unknown research");const l=s.research[key]||0;if(l>=d.max)throw new Error("Research level cap reached");const c=cost(d,l+1);if(!afford(s.resources,c))throw new Error("Insufficient resources");spend(s.resources,c);s.research[key]=l+1;s.experience+=Math.ceil((c.metal+c.crystal+c.naquadah)/100);s.level=1+Math.floor(s.experience/1000);return save(s)}
export async function buildShips(id:string,key:string,quantity:number){const s=await tick(id),d=(SHIPS as any)[key],q=Math.floor(quantity);if(!d||q<1||q>100000)throw new Error("Invalid ship or quantity");const c={metal:d.metal*q,crystal:d.crystal*q,naquadah:d.naquadah*q};if(!afford(s.resources,c))throw new Error("Insufficient resources");spend(s.resources,c);const u=s.fleet[key]||{count:0,hp:d.hull};u.count+=q;u.hp=d.hull;s.fleet[key]=u;return save(s)}
function power(s:GameState){let attack=0,hull=0,shield=0,count=0;for(const [k,u] of Object.entries(s.fleet)){const d=(SHIPS as any)[k];if(!d)continue;count+=u.count;attack+=d.attack*u.count;hull+=d.hull*u.count;shield+=d.shield*u.count}return{attack:attack*(1+(s.research.weapons||0)*.05),hull:hull*(1+(s.research.armour||0)*.03),shield:shield*(1+(s.research.shielding||0)*.05),count}}
export async function battle(attackerId:string,defenderId:string,mode:"pvp"|"pve"="pvp"){const a=await tick(attackerId),d=mode==="pve"?defaults("npc"):await tick(defenderId),ap=power(a),dp=power(d);if(!ap.count)throw new Error("Attacker has no fleet");const as=ap.attack+ap.shield*.15+ap.hull*.05,ds=dp.attack+dp.shield*.15+dp.hull*.05,winner=as>=ds?"attacker":"defender",aRate=Math.min(.95,ds/Math.max(1,as)*.65),dRate=Math.min(.95,as/Math.max(1,ds)*.65);if(mode==="pvp"){if(winner==="attacker")for(const u of Object.values(d.fleet))u.count=Math.floor(u.count*(1-dRate));else for(const u of Object.values(a.fleet))u.count=Math.floor(u.count*(1-aRate));await save(winner==="attacker"?d:a)}const result={winner,attackerPower:Math.round(as),defenderPower:Math.round(ds),attackerCasualtyRate:aRate,defenderCasualtyRate:dRate};const battleId=crypto.randomUUID();await pool.query("INSERT INTO game_battles(id,attacker_id,defender_id,mode,result) VALUES($1,$2,$3,$4,$5::jsonb)",[battleId,attackerId,mode==="pve"?null:defenderId,mode,JSON.stringify(result)]);return{battleId,result,attacker:a,defender:d}}
export async function explore(id:string,type="deep_space"){const s=await tick(id),now=Date.now();if((s.cooldowns.exploration||0)>now)throw new Error("Exploration cooldown active");const reward=Math.random()<.15?{darkMatter:500,naquadah:5000}:Math.random()<.5?{metal:5000,crystal:3000}:{naquadah:1500,food:500,water:500};for(const [k,v] of Object.entries(reward))s.resources[k as ResourceKey]+=v;s.cooldowns.exploration=now+(type==="deep_space"?86400000:21600000);s.missions.push({id:crypto.randomUUID(),type,status:"completed",startedAt:now,completesAt:now,reward});return save(s)}
export async function createMarketOrder(id:string,resource:string,amount:number,unitPrice:number){if(!R.includes(resource as ResourceKey)||resource==="population"||resource==="energy"||resource==="darkMatter")throw new Error("Resource cannot be traded");const s=await tick(id),q=Math.floor(amount);if(q<1||unitPrice<=0||s.resources[resource as ResourceKey]<q)throw new Error("Invalid market order");s.resources[resource as ResourceKey]-=q;await save(s);const orderId=crypto.randomUUID();await pool.query("INSERT INTO game_market_orders(id,seller_id,resource,amount,unit_price) VALUES($1,$2,$3,$4,$5)",[orderId,id,resource,q,unitPrice]);return{id:orderId,resource,amount:q,unitPrice,status:"open"}}
export async function listMarket(){return (await pool.query("SELECT id,seller_id,resource,amount,unit_price,status,created_at FROM game_market_orders WHERE status='open' ORDER BY created_at DESC LIMIT 100")).rows}
export async function buyMarketOrder(id:string,orderId:string){const c=await pool.connect();try{await c.query("BEGIN");const q=await c.query("SELECT * FROM game_market_orders WHERE id=$1 AND status='open' FOR UPDATE",[orderId]);if(!q.rowCount)throw new Error("Market order not found");const o=q.rows[0];if(o.seller_id===id)throw new Error("Cannot buy your own order");const buyer=await getState(id),price=Number(o.amount)*Number(o.unit_price);if(buyer.resources.darkMatter<price)throw new Error("Insufficient dark matter");buyer.resources.darkMatter-=price;const seller=await getState(o.seller_id);seller.resources[o.resource as ResourceKey]+=Number(o.amount);await save(buyer);await save(seller);await c.query("UPDATE game_market_orders SET status='filled' WHERE id=$1",[orderId]);await c.query("COMMIT");return{ok:true,orderId,resource:o.resource,amount:Number(o.amount),cost:price}}catch(e){await c.query("ROLLBACK");throw e}finally{c.release()}}
export const getCatalog=()=>({resources:R,buildings:BUILDINGS,research:RESEARCH,ships:SHIPS});
