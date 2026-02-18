import { RoleName, RoleBodyPlan, BodyPlan } from "types/roles"
import { GamePhase, getGamePhase } from "types/gamePhase"

const costs: Partial<Record<BodyPartConstant, number>> = {
  work: 100,
  move: 50,
  carry: 50,
  attack: 80,
  ranged_attack: 150,
  heal: 250,
  claim: 600,
  tough: 10
}

const optimalMuleBodyParts = 12 // Move,Carry * 6
const optimalMinerBodyPart = 8// Move, Carry, Work*6
const optimalBuilderBodyParts = 8 // Move*2, Carry, Work,
const optimalHarvesterBodyParts = 4 // Movex2, carry, work


function buildEfficientMiner(r: Room): BodyPlan {
  const eAvail = r.energyAvailable
  let baseCost = 200
  let body: BodyPartConstant[] = [CARRY, MOVE, WORK]
  let workToAdd: number = Math.min(Math.floor((eAvail - baseCost) / BODYPART_COST[WORK]), optimalMinerBodyPart - 3) // stop at optimal size
  for (let i = 0; i < workToAdd; i++) {
    body.push(WORK)
  }
  let bodyWithCount: Partial<Record<BodyPartConstant, number>> = {}
  for (const bodypart of body) {
    bodyWithCount[bodypart] = (bodyWithCount[bodypart] ?? 0) + 1
  }
  return bodyWithCount
}

function buildEfficientMule(r: Room): BodyPlan {
  const eAvail = r.energyAvailable
  let baseCost = 250
  let body: BodyPartConstant[] = [CARRY, MOVE, WORK, MOVE]
  let carryToAdd: number = Math.floor((eAvail - baseCost) / BODYPART_COST[CARRY])
  for (let i = 0; i < Math.min((Math.floor(carryToAdd / 2)), (optimalMuleBodyParts - 4) / 2); i++) {
    body.push(CARRY)
    body.push(MOVE)
  }
  let bodyWithCount: Partial<Record<BodyPartConstant, number>> = {}
  for (const bodypart of body) {
    bodyWithCount[bodypart] = (bodyWithCount[bodypart] ?? 0) + 1
  }
  return bodyWithCount
}
function buildEfficientBuilder(r: Room): BodyPlan {
  const eAvail = r.energyAvailable
  let baseCost = 250
  let body: BodyPartConstant[] = []
  for (let i = 0; i < Math.min((Math.floor(eAvail / 250)), optimalBuilderBodyParts / 4); i++) {
    body.push(CARRY)
    body.push(MOVE)
    body.push(WORK)
    body.push(MOVE)
  }
  let bodyWithCount: Partial<Record<BodyPartConstant, number>> = {}
  for (const bodypart of body) {
    bodyWithCount[bodypart] = (bodyWithCount[bodypart] ?? 0) + 1
  }
  return bodyWithCount
}

export function getBodyPlan(r: Room) {
  const rcl = getGamePhase(r)
  let plan: RoleBodyPlan
  let hasContainer = r.find(FIND_STRUCTURES).find(s => s.structureType === STRUCTURE_CONTAINER)
  switch (getGamePhase(r)) {
    case "BOOT": {
      plan = {
        harvester: hasContainer ? buildEfficientMiner(r) : { work: 1, move: 1, carry: 1 },
        mule: { work: 1, move: 1, carry: 1 },
        builder: { work: 1, move: 1, carry: 1 },
        upgrader: { work: 1, move: 1, carry: 1 },
        miner: { work: 1, move: 1, carry: 1 },
        claimer: { work: 1, carry: 1, move: 3, claim: 1 }
      }
      break
    }
    case "EARLY": {
      plan = {
        harvester: { work: 1, move: 2, carry: 1 },
        mule: buildEfficientMule(r),
        builder: buildEfficientBuilder(r),
        upgrader: buildEfficientMiner(r),
        miner: buildEfficientMiner(r),
        claimer: { work: 1, carry: 1, move: 3, claim: 1 }

      }
      break
    }
    case "MID": {
      plan = {
        harvester: { work: 1, move: 2, carry: 1 },
        mule: buildEfficientMule(r),
        builder: buildEfficientBuilder(r),
        upgrader: buildEfficientMiner(r),
        miner: buildEfficientMiner(r),
        claimer: { work: 1, carry: 1, move: 3, claim: 1 }

      }
      break
    }
    case "LATE": {
      plan = {
        harvester: { work: 1, move: 1, carry: 1 },
        mule: { work: 1, move: 1, carry: 1 },
        builder: { work: 1, move: 1, carry: 1 },
        upgrader: { work: 1, move: 1, carry: 1 },
        miner: { work: 7, move: 1, carry: 1 },
        claimer: { work: 1, carry: 1, move: 3, claim: 1 }

      }
      break
    }
  }
  return plan
}
