export const tower = {
  run(t: StructureTower) {
    // attack, destroy, heal, repair
    const enemyCreeps = t.room.find(FIND_HOSTILE_CREEPS)
    const closestEnemyCreep = t.pos.findClosestByPath(enemyCreeps)
    const hurtFriendlyCreeps = t.room.find(FIND_MY_CREEPS).filter(c => c.hits < c.hitsMax)
    const closestHurtFriendlyCreep = t.pos.findClosestByPath(hurtFriendlyCreeps)
    const friendlyBuildingsToRepair = t.room.find(FIND_MY_STRUCTURES).filter(s => s.hits < s.hitsMax)
    const neutralBuildingToRepair = t.room.find(FIND_STRUCTURES).filter(s => s.hits < s.hitsMax)

    const closestFriendlyBuildingToRepair = t.pos.findClosestByPath(friendlyBuildingsToRepair)
    const closestNeutralBuildingToRepair = t.pos.findClosestByPath(neutralBuildingToRepair)

    if (closestEnemyCreep) {
      t.attack(closestEnemyCreep)
    }
    if (closestHurtFriendlyCreep) {
      t.heal(closestHurtFriendlyCreep)
    }
    if (closestFriendlyBuildingToRepair) {
      t.repair(closestFriendlyBuildingToRepair)
    }
    if (closestNeutralBuildingToRepair) {
      t.repair(closestNeutralBuildingToRepair)
    }
  }
}
