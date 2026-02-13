import { RoleName } from "types/roles"
import { getTask, setTask } from "utility/memory"
import { getTarget, setTarget, TargetType } from "utility/memory"

export const harvester = {

  run(c: Creep) {
    let task = getTask(c)
    let target = getTarget(c)
    let spawn = c.pos.findClosestByPath(FIND_MY_SPAWNS)
    let closestSource = c.pos.findClosestByPath(FIND_SOURCES)

    if (!task) { task = "harvest" }

    if (task === "harvest") {
      // set target
      if (closestSource) {
        if (!target) {
          setTarget(c, closestSource, "source")
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
          if (type === "spawn") {
            let t = target as StructureSpawn
            task = "work"
            target = null
            setTask(c, task)
            setTarget(c, target)
          }
        }
      }
    }
    else if (task === "work") {
      if (!target) {
        const closestContainer: AnyStructure | null = c.pos.findClosestByPath(c.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER))

        if (closestContainer) {
          target = closestContainer as StructureContainer
          setTarget(c, target, "container")
        }
        else if (spawn && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          target = spawn as StructureSpawn
          setTarget(c, target, "spawn")
        }
        else {
          let controller = c.room.controller
          if (controller) {
            target = controller
            setTarget(c, target, "controller")
          }
        }
      }
      else if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        setTask(c, "harvest")
        setTarget(c, null)
      }
      else if (c.memory.targetType === "spawn" && spawn) {
        if (spawn.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          let extensionsNotFull = c.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === "extension" && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          if (extensionsNotFull.length > 0) {
            let closestExtension = c.pos.findClosestByPath(extensionsNotFull)
            if (closestExtension) {
              target = closestExtension
              setTarget(c, target, "extension")
            }
          }
        }
        else if (c.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(spawn)
        }
      }
      else if (c.memory.targetType === "container") {
        let container = Game.getObjectById(target.id) as StructureContainer
        if (container.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          setTarget(c, null)
        }
        else if (c.transfer(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(container)
        }
      }
      else if (c.memory.targetType === "controller") {
        let controller = Game.getObjectById(target.id) as StructureController
        if (c.transfer(controller, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(controller)
        }
      }
      else if (c.memory.targetType === "extension") {
        let extension = Game.getObjectById(target.id) as StructureExtension
        if (extension.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          let extensionsNotFull = c.room.find(FIND_MY_STRUCTURES).filter(s => s.structureType === "extension" && s.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
          if (extensionsNotFull.length > 0) {
            let closestExtension = c.pos.findClosestByPath(extensionsNotFull)
            if (closestExtension) {
              target = closestExtension
              setTarget(c, target, "extension")
            }
          }
          else {
            target = null
            setTarget(c, target)
          }
        }
        else if (c.transfer(extension, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(extension)
        }
      }
    }
  }
}
