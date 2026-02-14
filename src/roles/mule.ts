import { FlagType } from "types/flags"
import { RoleName } from "types/roles"
import { getTask, setTask } from "utility/memory"
import { getTarget, setTarget, TargetType } from "utility/memory"

export const mule = {

  run(c: Creep) {
    let task = getTask(c)
    let target = getTarget(c)
    const spawn = c.pos.findClosestByPath(FIND_MY_SPAWNS)
    const closestSource = c.pos.findClosestByPath(FIND_SOURCES)
    const closestContainer: StructureContainer | null = c.pos.findClosestByPath(c.room.find(FIND_STRUCTURES).filter((s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER))
    const spawns: StructureSpawn[] = c.room.find(FIND_MY_SPAWNS)
    const extensions: StructureExtension[] = c.room.find(FIND_MY_STRUCTURES).filter((s): s is StructureExtension => s.structureType === STRUCTURE_EXTENSION)
    const towers: StructureTower[] = c.room.find(FIND_MY_STRUCTURES).filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER)
    const containers: StructureContainer[] = c.room.find(FIND_STRUCTURES).filter((s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER)
    const storages: StructureStorage[] = c.room.find(FIND_STRUCTURES).filter((s): s is StructureStorage => s.structureType === STRUCTURE_STORAGE)
    const containersNeedingFilling = containers.filter(s => (s.pos.findInRange(FIND_SOURCES, 3).length === 0))
    const storageNeedingFilling = storages.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.2)
    const containerProviders = containers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) != 0 && s.pos.findInRange(FIND_SOURCES, 3).length > 0))
    const storageProviders = storages.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) >= 0.8)
    const spawnsNeedingFilling = spawns.filter(s => (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    const extensionsNeedingFilling = extensions.filter(s => (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    const towersNeedingFilling = towers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.2)
    const closestTowerNeedingFilling = c.pos.findClosestByPath(towersNeedingFilling)
    const closestContainerProvider = c.pos.findClosestByPath(containerProviders)
    const closestContainerNeedingFilling = c.pos.findClosestByPath(containersNeedingFilling)
    const closestStorageProvider = c.pos.findClosestByPath(storageProviders)
    const closestStorageNeedingFilling = c.pos.findClosestByPath(storageNeedingFilling)
    const spawnsAndExtensionsNeedingFilling = [...extensionsNeedingFilling, ...spawnsNeedingFilling]
    const closestSpawnOrExtensionNeedingFilling = c.pos.findClosestByPath(spawnsAndExtensionsNeedingFilling)
    if (!task) { c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? setTask(c, "refillEnergy") : setTask(c, "work") }

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
          else {
            setTarget(c, closestContainer)
          }
        }
        else {
          if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            task = "work"
            target = null
            setTask(c, task)
            setTarget(c, target)
          }
          else if (c.withdraw(target as AnyStoreStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            c.moveTo(target as AnyStoreStructure)
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
          const idleLocation = c.room.find(FIND_FLAGS).filter((f) => f.name as FlagType === "muleIdle")
          if (c.pos.findClosestByPath(idleLocation)) {
            if (idleLocation.length > 0) {
              let closest = c.pos.findClosestByPath(idleLocation)
              if (closest) {
                c.moveTo(closest)
              }
            }
          }
        }
      }
      else if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        setTask(c, "refillEnergy")
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
