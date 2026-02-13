import { ErrorMapper } from "utils/ErrorMapper";
import { harvester } from "roles/harvester"
import { builder } from "roles/builder";
import { miner } from "roles/miner";
import { mule } from "roles/mule";
import { upgrader } from "roles/upgrader";
import { getRoomSpawnPlan } from "spawn/plan";
import { RoleName, RolePlan } from "types/roles";
import { getBodyPlan } from "spawn/body";
import { receiveMessageOnPort } from "worker_threads";
import { each } from "lodash";

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

  // Count Creep
  const counts: Partial<Record<RoleName, number>> = {}
  for (const c in Game.creeps) {
    const creep = Game.creeps[c]
    const role = creep.memory.role as RoleName | undefined // Pipe means it can be either Type, union Type
    if (role) counts[role] = (counts[role] ?? 0) + 1
  }


  // Per Room
  for (const roomHash in Game.rooms) {
    // spawn
    console.log(`Processing ${roomHash}`)

    const r: Room = Game.rooms[roomHash]
    const plan = getRoomSpawnPlan(r)
    const spawn = r.find(FIND_MY_SPAWNS)[0]
    for (const [roleName, rolePlan] of Object.entries(plan) as [RoleName, RolePlan][]) {
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
      }
    }
  }


  // Assign work t)

});
