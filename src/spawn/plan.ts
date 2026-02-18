import { harvester } from "roles/harvester"
import { getBodyPlan } from "./body"
import { BodyPlan, getRoleCounts, RoleName, RolePlan } from '../types/roles'
import { GamePhase, getGamePhase } from "types/gamePhase"

type RoomPlan = Record<RoleName, RolePlan>

export function getRoomSpawnPlan(r: Room) {
  const sites = r.find(FIND_CONSTRUCTION_SITES).length
  const hasStorage = !!r.storage
  const bodyPlan = getBodyPlan(r)
  const counts = getRoleCounts()[r.name]
  const expandFlagsAndCreep = (Game.flags["expand"] && Object.values(Game.creeps).filter(c => c.memory.role === "claimer").length === 0) ? true : false
  const expandFlagExists = Game.flags["expand"]

  let plan: RoomPlan
  switch (getGamePhase(r)) {
    case "BOOT": {
      plan = {
        harvester: { desired: 8, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: 1, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader },
        miner: { desired: 2, body: bodyPlan.miner },
        claimer: { desired: expandFlagExists && expandFlagsAndCreep ? 1 : 0, minEnergy: 1000, body: { work: 1, carry: 1, move: 3, claim: 1 } },

      }
      break
    }
    case "EARLY": {
      const roomSourcesCount: number = r.find(FIND_SOURCES).length
      let harvesterDesired
      if (counts?.mule === 0 || counts?.miner === 0) {
        harvesterDesired = 3
      }
      else {
        harvesterDesired = 0
      }

      let minerDesired
      if (counts?.mule === 0 || r.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER).length === 0) {
        minerDesired = 0
      }
      else {
        minerDesired = roomSourcesCount
      }

      let mulesDesired = Math.max(r.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER).length, 1)
      plan = {
        harvester: { desired: harvesterDesired, minEnergy: 300, body: { work: 1, carry: 1, move: 2 } },
        miner: { desired: minerDesired, body: bodyPlan.miner },
        mule: { desired: mulesDesired, minEnergy: 300, body: bodyPlan.mule },
        builder: { desired: (r.find(FIND_CONSTRUCTION_SITES).length > 0) ? 2 : 0, minEnergy: (counts?.builder ?? 0) > 0 ? 750 : 250, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader, minEnergy: (counts?.upgrader ?? 0) > 0 ? 600 : 300, },
        claimer: { desired: expandFlagExists && expandFlagsAndCreep ? 1 : 0, minEnergy: 1000, body: { work: 1, carry: 1, move: 3, claim: 1 } },
      }
      break
    }
    case "MID": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        miner: { desired: 2, body: bodyPlan.miner },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader },
        claimer: { desired: expandFlagExists && expandFlagsAndCreep ? 1 : 0, minEnergy: 1000, body: { work: 1, carry: 1, move: 3, claim: 1 } },

      }
      break
    }
    case "LATE": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        miner: { desired: 2, body: bodyPlan.miner },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader },
        claimer: { desired: expandFlagExists && expandFlagsAndCreep ? 1 : 0, minEnergy: 1000, body: { work: 1, carry: 1, move: 3, claim: 1 } },

      }
      break
    }
  }

  return plan
}
