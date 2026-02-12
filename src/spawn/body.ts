import { RoleName, RoleBodyPlan } from "types/roles"
import { GamePhase, getGamePhase } from "types/gamePhase"


function buildEfficientMiner(r: Room) {

}



export function getBodyPlan(r: Room) {
  const rcl = getGamePhase(r)
  let plan: RoleBodyPlan
  switch (getGamePhase(r)) {
    case "BOOT": {
      plan = {
        harvester: { work: 1, move: 1, carry: 1 },
        mule: { work: 1, move: 1, carry: 1 },
        builder: { work: 1, move: 1, carry: 1 }
      }
    }
    case "EARLY": {
      plan = {
        harvester: { work: 1, move: 1, carry: 1 },
        mule: { work: 1, move: 1, carry: 1 },
        builder: { work: 1, move: 1, carry: 1 }
      }
    }
    case "MID": {
      plan = {
        harvester: { work: 1, move: 1, carry: 1 },
        mule: { work: 1, move: 1, carry: 1 },
        builder: { work: 1, move: 1, carry: 1 }
      }
    }
    case "LATE": {
      plan = {
        harvester: { work: 1, move: 1, carry: 1 },
        mule: { work: 1, move: 1, carry: 1 },
        builder: { work: 1, move: 1, carry: 1 }
      }
    }
  }
  return plan
}
