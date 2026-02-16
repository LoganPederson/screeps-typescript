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
  let plan: RoomPlan
  switch (getGamePhase(r)) {
    case "BOOT": {
      plan = {
        harvester: { desired: 8, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: 1, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader },
        miner: { desired: 2, body: bodyPlan.miner }

      }
      break
    }
    case "EARLY": {
      const roomSourcesCount: number = r.find(FIND_SOURCES).length
      let harvesterDesired
      if (counts?.mule === 0 || counts?.miner === 0) {
        harvesterDesired = 2
      }
      else {
        harvesterDesired = 0
      }
      let mulesDesired = Math.max(r.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER).length, 2)
      plan = {
        harvester: { desired: harvesterDesired, minEnergy: 300, body: { work: 1, carry: 1, move: 2 } },
        mule: { desired: mulesDesired, minEnergy: 300, body: bodyPlan.mule },
        builder: { desired: (r.find(FIND_CONSTRUCTION_SITES).length > 0) ? 3 : 1, minEnergy: 250, body: bodyPlan.builder },
        upgrader: { desired: 2, body: bodyPlan.upgrader },
        miner: { desired: roomSourcesCount, body: bodyPlan.miner }
      }
      break
    }
    case "MID": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader },
        miner: { desired: 2, body: bodyPlan.miner }

      }
      break
    }
    case "LATE": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader },
        miner: { desired: 2, body: bodyPlan.miner }

      }
      break
    }
  }

  return plan
}
