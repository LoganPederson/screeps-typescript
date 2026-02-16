export type BodyPlan = Partial<Record<BodyPartConstant, number>>
export type RoleBodyPlan = Record<RoleName, BodyPlan>
export type RoleName = "harvester" | "mule" | "builder" | "upgrader" | "miner"
export type RoleModule = { run: (c: Creep) => void }
export type RolePlan = {
  desired: number,
  minEnergy?: number,
  body: BodyPlan
}


export type RoleCount = Partial<Record<RoleName, number>>
export type RoomRoleCounts = Partial<Record<string, RoleCount>>

// Count Creep
export function getRoleCounts(): RoomRoleCounts {
  let allRoleCounts: RoomRoleCounts = {}
  for (const roomName in Game.rooms) {
    const r: Room = Game.rooms[roomName]
    const counts: Partial<Record<RoleName, number>> = {}
    for (const c of r.find(FIND_MY_CREEPS)) {
      const role = c.memory.role as RoleName | undefined // Pipe means it can be either Type, union Type
      if (role) counts[role] = (counts[role] ?? 0) + 1
    }
    allRoleCounts[roomName] = counts
  }
  return allRoleCounts
}

