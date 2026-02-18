import { ErrorMapper } from "utils/ErrorMapper";
import { harvester } from "roles/harvester"
import { builder } from "roles/builder";
import { miner } from "roles/miner";
import { mule } from "roles/mule";
import { upgrader } from "roles/upgrader";
import { getRoomSpawnPlan } from "spawn/plan";
import { RoleName, RolePlan, getRoleCounts } from "types/roles";
import { getBodyPlan } from "spawn/body";
import { receiveMessageOnPort } from "worker_threads";
import { each } from "lodash";
import { tower } from "roles/tower";
import { claimer } from "roles/claimer";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
    task?: string;
    targetID?: string;
    targetType?: string;
    sourceID?: string;
  }

}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: any;
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {

  console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  // Build RoleName Counts one time
  const allRoleCounts = getRoleCounts()


  // Per Room
  for (const roomHash in Game.rooms) {
    console.log(`Processing ${roomHash}`)

    const r: Room = Game.rooms[roomHash]
    const plan = getRoomSpawnPlan(r)
    const spawn = r.find(FIND_MY_SPAWNS)[0]
    const counts = allRoleCounts[r.name] ?? {}
    console.log(`Room: ${r} has ${r.energyAvailable} energy available`)

    // spawn
    for (const [roleName, rolePlan] of Object.entries(plan) as [RoleName, RolePlan][]) {
      if (!spawn) { break }
      if (roleName === "miner") { console.log(rolePlan.desired) }
      if ((counts[roleName] ?? 0) < rolePlan.desired && !spawn.spawning && (spawn.store.getUsedCapacity(RESOURCE_ENERGY) > rolePlan.desired)) {
        // spawn creep matching plan
        let builtBody: BodyPartConstant[] = []
        for (const [part, count] of Object.entries(rolePlan.body) as [BodyPartConstant, number][]) {
          for (let i = 0; i < count; i++) { builtBody.push(part) }
        }
        if (spawn.spawnCreep(builtBody, roleName + Game.time, { memory: { role: roleName, room: r.name, working: false } }) == ERR_NOT_ENOUGH_ENERGY) { break }
        break
      }
    }
    // creeps
    for (let c of r.find(FIND_MY_CREEPS)) {
      if (c.memory.role) {
        if (c.memory.role == "harvester") {
          harvester.run(c)
        }
        else if (c.memory.role === "builder") {
          builder.run(c)
        }
        else if (c.memory.role === "upgrader") {
          upgrader.run(c)
        }
        else if (c.memory.role === "mule") {
          mule.run(c)
        }
        else if (c.memory.role === "miner") {
          miner.run(c)
        }
        else if (c.memory.role === "claimer") {
          claimer.run(c)
        }
      }
    }


    // Emergency make everyone a harvester
    // if (true) {
    //   for (let c of r.find(FIND_MY_CREEPS)) {
    //     c.memory.role = "harvester"
    //     c.memory.task = "harvest"
    //     delete c.memory.targetID
    //     delete c.memory.targetType
    //     console.log("nuclear option acting")
    //   }
    // }
    // tower
    const towers: StructureTower[] = r.find(FIND_MY_STRUCTURES).filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER)
    for (let t of towers) {
      tower.run(t)
    }
  }


  // Assign work t)

});
