import { RoleName } from "types/roles"
import { getTask, setTask } from "utility/memory"
import { getTarget, setTarget, TargetType } from "utility/memory"

export const mule = {

  run(c: Creep) {
    let task = getTask(c)
    let target = getTarget(c)
    const spawn = c.pos.findClosestByPath(FIND_MY_SPAWNS)
    const closestSource = c.pos.findClosestByPath(FIND_SOURCES)
    const closestContainer: AnyStructure | null = c.pos.findClosestByPath(c.room.find(FIND_STRUCTURES).filter(s => s.structureType === STRUCTURE_CONTAINER))
    const spawns: StructureSpawn[] = c.room.find(FIND_MY_SPAWNS)
    const extensions: StructureExtension[] = c.room.find(FIND_MY_STRUCTURES).filter((s): s is StructureExtension => s.structureType === STRUCTURE_EXTENSION)
    const towers: StructureTower[] = c.room.find(FIND_MY_STRUCTURES).filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER)
    const containers: StructureContainer[] = c.room.find(FIND_STRUCTURES).filter((s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER)
    const storages: StructureStorage[] = c.room.find(FIND_STRUCTURES).filter((s): s is StructureStorage => s.structureType === STRUCTURE_STORAGE)
    const containersNeedingFilling = containers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.4)
    const storageNeedingFilling = storages.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.4)
    const containerProviders = containers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) >= 0.8)
    const storageProviders = storages.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) >= 0.8)
    const spawnsNeedingFilling = spawns.filter(s => (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    const extensionsNeedingFilling = extensions.filter(s => (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    const towersNeedingFilling = towers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.4)
    const closestTowerNeedingFilling = c.pos.findClosestByPath(towersNeedingFilling)
    const closestContainerProvider = c.pos.findClosestByPath(containerProviders)
    const closestContainerNeedingFilling = c.pos.findClosestByPath(containersNeedingFilling)
    const closestStorageProvider = c.pos.findClosestByPath(storageProviders)
    const closestStorageNeedingFilling = c.pos.findClosestByPath(storageNeedingFilling)
    const spawnsAndExtensionsNeedingFilling = [...extensionsNeedingFilling, ...spawnsNeedingFilling]
    const closestSpawnOrExtensionNeedingFilling = c.pos.findClosestByPath(spawnsAndExtensionsNeedingFilling)


    if (!task) { c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? task = "refillEnergy" : task = "work" }

    if (task === "refillEnergy") {
      // set target
      if (true) {
        if (!target) {
          if (closestStorageProvider) {
            setTarget(c, closestStorageProvider, "storage")
          }
          if (closestContainerProvider) {
            setTarget(c, closestContainerProvider, "container")
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


        if (closestSpawnOrExtensionNeedingFilling) {
          if (closestSpawnOrExtensionNeedingFilling.structureType === STRUCTURE_SPAWN) {
            setTarget(c, closestSpawnOrExtensionNeedingFilling, "spawn")
          }
          if (closestSpawnOrExtensionNeedingFilling.structureType === STRUCTURE_EXTENSION) {
            setTarget(c, closestSpawnOrExtensionNeedingFilling, "extension")
          }
        }
        else if (closestTowerNeedingFilling) {
          setTarget(c, closestTowerNeedingFilling, "tower")
        }
        else if (closestContainerNeedingFilling) {
          setTarget(c, closestContainerNeedingFilling, "container")
        }
        else if (closestStorageNeedingFilling) {
          setTarget(c, closestStorageNeedingFilling, "storage")
        }
        else {
          c.say("Nothing to do!")
        }
      }
      else if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        setTask(c, "harvest")
        setTarget(c, null)
      }
      else if ((target as AnyStoreStructure).store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
        setTarget(c, null)
      }
      else if (c.transfer(target as AnyStoreStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        c.moveTo(target as AnyStoreStructure)
      }
    }
  }
}
