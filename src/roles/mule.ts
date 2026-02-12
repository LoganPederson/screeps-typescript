export const mule = {
  run(c: Creep): void {
    let spawn = c.pos.findClosestByPath(FIND_MY_SPAWNS)
    let closestSource = c.pos.findClosestByPath(FIND_SOURCES)
    // return if full
    if (c.store.getFreeCapacity("energy") == 0) {
      if (spawn) {
        if (c.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          c.moveTo(spawn)
        }
      }
    }
    else {
      // mule should ferry from miners, and fill buildings
      // perhaps we have a squire system, allowing miners an efficient buddy Mule seperate from 
      // building workers
    }
  }
}
