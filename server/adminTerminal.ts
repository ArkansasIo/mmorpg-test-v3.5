import readline from "readline";
import { executeAdminCommand } from "./services/adminTerminalService";

const cyan="\x1b[36m",reset="\x1b[0m",bold="\x1b[1m",yellow="\x1b[33m";
const menus=[["1","SYSTEM DASHBOARD","status"],["2","PLAYER OPERATIONS","users search"],["3","SECURITY & AUDIT","audit recent"],["4","UNIVERSE CONTROL","config get"],["5","MAINTENANCE","queues"],["6","DATABASE HEALTH","db health"],["7","HELP","help"]];
export async function startAdminTerminal(adminId:string){
 const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});
 const ask=(q:string)=>new Promise<string>(resolve=>rl.question(cyan+q+reset,a=>resolve(a.trim())));
 let running=true;
 while(running){
  console.clear();console.log(bold+cyan+"╔══════════════════════════════════════════════════════════╗"+reset);
  console.log(bold+cyan+"║  UNIVERSE CIVILIZATION — ADMIN SYSTEMS TERMINAL         ║"+reset);
  console.log(bold+cyan+"╚══════════════════════════════════════════════════════════╝"+reset+"\n");
  menus.forEach(m=>console.log("  "+m[0]+") "+m[1]));console.log("  0) EXIT\n");
  const choice=await ask("ADMIN> ");
  try{
   if(choice==="0"){running=false;continue;}
   if(choice==="1")console.dir(await executeAdminCommand(adminId,"status"),{depth:5});
   else if(choice==="2"){const query=await ask("Player search> ");console.table((await executeAdminCommand(adminId,"users search",{query})).users);}
   else if(choice==="3")console.table((await executeAdminCommand(adminId,"audit recent",{limit:25})).entries);
   else if(choice==="4"){const key=await ask("Config key> ");console.dir(await executeAdminCommand(adminId,"config get",{key}),{depth:5});}
   else if(choice==="5")console.dir(await executeAdminCommand(adminId,"queues"),{depth:5});
   else if(choice==="6")console.dir(await executeAdminCommand(adminId,"db health"),{depth:5});
   else if(choice==="7")console.log((await executeAdminCommand(adminId,"help")).commands.join("\n"));
   else console.log(yellow+"Invalid menu selection"+reset);
  }catch(error){console.error(error instanceof Error?error.message:error);}
  if(running)await ask("\nPress Enter to continue...");
 }
 rl.close();
}
