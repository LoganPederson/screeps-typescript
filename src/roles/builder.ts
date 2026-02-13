import { TaskName } from "types/tasks"
import { getTask, setTask } from "utility/memory"
import { getTarget, setTarget, TargetType } from "utility/memory"

export const builder = {
  run(c: Creep): void {
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
    if (!task) { c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? setTask(c, "refillEnergy") : setTask(c, "work") }

    if (task === "refillEnergy") {
      // set target
      if (true) {
        if (!target) {
          if (closestStorageProvider) {
            setTarget(c, closestStorageProvider, "storage")
          }
          else if (closestContainerProvider) {
            setTarget(c, closestContainerProvider, "container")
          }
          else if (closestContainer) {
            setTarget(c, closestContainer, "container")
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
        const extensionSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_EXTENSION)
        const storageSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_STORAGE)
        const towerSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES).filter(s => s.structureType === STRUCTURE_STORAGE)
        const allSites: ConstructionSite[] = c.room.find(FIND_MY_CONSTRUCTION_SITES)
        const repairables: AnyStructure[] = c.room.find(FIND_STRUCTURES).filter(s => (s.hits / s.hitsMax) < 0.7)

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
            if (closest) {
              target = closest
              setTarget(c, target, "site")
            }
          }
          else if (repairables.length > 0) {
            let closest = c.pos.findClosestByPath(repairables)
            if (closest) {
              target = closest
              setTarget(c, target, "repair")
            }
          }
        }
      }
      // Base Case
      else if (c.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
        task = "refillEnergy"
        target = null
        setTask(c, task)
        setTarget(c, target)
      }
      else if (target) {
        if (c.memory.targetType === "site") {
          let t = target as ConstructionSite
          if (t.progressTotal === 0) {
            setTarget(c, null)
          }
          else if (c.build(t) === ERR_NOT_IN_RANGE) {
            c.moveTo(t)
          }
        }
        if (c.memory.targetType === "repair") {
          let t = target as AnyStructure
          if ((t.hits / t.hitsMax) >= 0.8) {
            setTarget(c, null)
          }
          else if (c.repair(t) === ERR_NOT_IN_RANGE) {
            c.moveTo(t)
          }
        }
      }
    }

    // 
  }
}
