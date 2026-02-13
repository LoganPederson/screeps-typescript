import { harvester } from "roles/harvester"
import { getBodyPlan } from "./body"
import { BodyPlan, RoleName, RolePlan } from '../types/roles'
import { GamePhase, getGamePhase } from "types/gamePhase"

type RoomPlan = Record<RoleName, RolePlan>

export function getRoomSpawnPlan(r: Room) {
  const sites = r.find(FIND_CONSTRUCTION_SITES).length
  const hasStorage = !!r.storage
  const bodyPlan = getBodyPlan(r)
  let plan: RoomPlan
  switch (getGamePhase(r)) {
    case "BOOT": {
      plan = {
        harvester: { desired: 8, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: 1, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader }
      }
    }
    case "EARLY": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader }
      }
    }
    case "MID": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader }
      }
    }
    case "LATE": {
      plan = {
        harvester: { desired: 5, body: bodyPlan.harvester },
        mule: { desired: 1, minEnergy: 100, body: bodyPlan.mule },
        builder: { desired: sites > 0 ? 1 : 0, minEnergy: 100, body: bodyPlan.builder },
        upgrader: { desired: 1, body: bodyPlan.upgrader }
      }
    }
  }

  return plan
}
