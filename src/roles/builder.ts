import { TaskName } from "types/tasks"
import { getTask, setTask } from "utility/memory"
import { getTarget, setTarget, TargetType } from "utility/memory"

export const builder = {
  run(c: Creep): void {
    let task = getTask(c)
    let target = getTarget(c)
    let spawn = c.pos.findClosestByPath(FIND_MY_SPAWNS)
    let closestSource = c.pos.findClosestByPath(FIND_SOURCES)

    if (!task) { task = "harvest" }

    if (task == "harvest") {
      // set target
      if (spawn && closestSource) {
        if (!target) {
          if (spawn.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            setTarget(c, spawn, "spawn")
          }
          else {
            setTarget(c, closestSource, "source")
          }
        }
        else {
          if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            task = "work"
            target = null
            setTask(c, task)
            setTarget(c, target)
          }
          const type = c.memory.targetType
          if (type === "source") {
            let t = target as Source
            if (c.harvest(t) == ERR_NOT_IN_RANGE) {
              c.moveTo(t)
            }
          }
          else if (type === "spawn") {
            let t = target as StructureSpawn
            if (c.withdraw(t, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
              c.moveTo(t)
            }
          }
        }
      }
    }
    else if (task === "work") {
      if (!target) {
        const extensionSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_EXTENSION)
        const storageSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_STORAGE)
        const towerSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_STORAGE)
        const allSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES)
        if (spawn) {
          if (extensionSites.length > 0) {
            let closest = spawn.pos.findClosestByPath(extensionSites)
            if (closest) {
              target = closest
              setTarget(c, target, "site")
            }
          }
          else if (storageSites.length > 0) {
            let closest = spawn.pos.findClosestByPath(storageSites)
            if (closest) {
              target = closest
              setTarget(c, target, "site")
            }
          }
          else if (towerSites.length > 0) {
            let closest = spawn.pos.findClosestByPath(towerSites)
            if (closest) {
              target = closest
              setTarget(c, target, "site")
            }
          }
          else if (allSites.length > 0) {
            let closest = spawn.pos.findClosestByPath(allSites)
            console.log(allSites)
            if (closest) {
              target = closest
              setTarget(c, target, "site")
            }
          }
        }
      }
      // Base Case
      else if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        task = "harvest"
        target = null
        setTask(c, task)
        setTarget(c, target)
      }
      else if (target) {
        console.log('builder working')
        if (c.memory.targetType === "site") {
          let t = target as ConstructionSite
          if (c.build(t) === ERR_NOT_IN_RANGE) {
            c.moveTo(t)
          }
        }
      }
    }

    // 
  }
}
