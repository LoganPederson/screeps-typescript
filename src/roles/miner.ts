
import { RoleName } from "types/roles"
import { getTask, setTask } from "utility/memory"
import { getTarget, setTarget, TargetType } from "utility/memory"
import { getRoleCounts } from "types/roles"


export const miner = {

  run(c: Creep) {
    let spawn = c.pos.findClosestByPath(FIND_MY_SPAWNS)
    const roleCounts = getRoleCounts()

    function findHarvestTarget(c: Creep) {
      if (c.memory.sourceID) {
        setTarget(c, Game.getObjectById(c.memory.sourceID), "source")
      }
      else {
        c.say("No sourceID!")
      }
    }

    function findWorkTarget(c: Creep) {
      let source: Source | null
      if (c.memory.sourceID) {
        source = Game.getObjectById(c.memory.sourceID)
        if (source) {
          let bestContainers: StructureContainer[] = source.pos.findInRange(FIND_STRUCTURES, 2).filter((s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER)
          let bestContainer = c.pos.findClosestByPath(bestContainers)
          if (bestContainer) {
            setTarget(c, bestContainer, "container")
          }
          else {
            setTarget(c, spawn, "spawn")
          }
        }
      }
    }

    function doHarvest(c: Creep) {
      // set target
      if (c.memory.sourceID) {
        if (!c.memory.targetID) {
          findHarvestTarget(c)
        }
        if (c.memory.targetID) {
          if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            setTask(c, "work")
            findWorkTarget(c)
            doWork(c)
          }
          const type = c.memory.targetType
          if (type === "source") {
            let t = Game.getObjectById(c.memory.targetID) as Source
            if (c.harvest(t) == ERR_NOT_IN_RANGE) {
              c.moveTo(t)
            }
          }
        }
      }
    }
    function doWork(c: Creep) {
      if (!c.memory.targetID) {
        findWorkTarget(c)
      }
      if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        setTask(c, "harvest")
        findHarvestTarget(c)
        doHarvest(c)
      }
      else if (c.memory.targetType === "spawn" && spawn) {
        if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          let extensionsNotFull = c.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === "extension" && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          if (extensionsNotFull.length > 0) {
            let closestExtension = c.pos.findClosestByPath(extensionsNotFull)
            if (closestExtension) {
              setTarget(c, closestExtension, "extension")
              doWork(c)
            }
          }
        }
        else if (c.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(spawn)
        }
      }
      else if (c.memory.targetType === "container" && c.memory.targetID) {
        let container = Game.getObjectById(c.memory.targetID) as StructureContainer
        if (container.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          c.say("Container full!")
        }
        else if (c.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(container)
        }
      }
    }

    if (!c.memory.sourceID) {
      const sources = c.room.find(FIND_SOURCES)
      const assigned: Partial<Record<Id<Source>, number>> = {}
      for (let creep of c.room.find(FIND_MY_CREEPS)) {
        let sid = creep.memory.sourceID as Id<Source>
        if (sid && creep.memory.role === "miner") {
          assigned[sid] = (assigned[sid] ?? 0) + 1
        }
      }
      for (let src of sources) {
        if ((assigned[src.id] ?? 0) < 1) {
          c.memory.sourceID = src.id
          break
        }
      }
    }
    if (!c.memory.task) { setTask(c, "harvest") }

    if (c.memory.task === "harvest") {
      doHarvest(c)
    }
    else if (c.memory.task === "work") {
      doWork(c)
    }
  }
}
