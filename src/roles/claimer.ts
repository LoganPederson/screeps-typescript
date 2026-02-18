import { FlagType } from "types/flags"
import { RoleName } from "types/roles"
import { getTarget, getTask, setTask, setTarget, TargetType } from "utility/memory"
export const claimer = {

  /*
   
     The claimer role is responsible for starting a new colony.
     Mobile, Capable, a Hero unit of sorts*?
     

     Tasks:
     RefillEnergy -- copy mule logic
     work -- goto and claim
     ?
  */
  run(c: Creep): void {
    const expansionFlag: Flag = Game.flags["expand"]
    const r: Room = c.room
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
    const containersNeedingFilling = containers.filter(s => (s.pos.findInRange(FIND_SOURCES, 3).length === 0) && s.store.getFreeCapacity(RESOURCE_ENERGY) != 0)
    const storageNeedingFilling = storages.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.2)
    let containerProviders = containers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) > c.store.getCapacity(RESOURCE_ENERGY) && s.pos.findInRange(FIND_SOURCES, 3).length > 0))
    if (containerProviders.length === 0) {
      containerProviders = containers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && s.pos.findInRange(FIND_SOURCES, 3).length > 0))
    }
    const storageProviders = storages.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) >= 0.8)
    const spawnsNeedingFilling = spawns.filter(s => (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    const extensionsNeedingFilling = extensions.filter(s => (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0))
    const towersNeedingFilling = towers.filter(s => (s.store.getUsedCapacity(RESOURCE_ENERGY) / s.store.getCapacity(RESOURCE_ENERGY)) <= 0.8)
    const closestTowerNeedingFilling = c.pos.findClosestByPath(towersNeedingFilling)
    const closestContainerProvider = c.pos.findClosestByPath(containerProviders)
    const closestContainerNeedingFilling = c.pos.findClosestByPath(containersNeedingFilling)
    const closestStorageProvider = c.pos.findClosestByPath(storageProviders)
    const closestStorageNeedingFilling = c.pos.findClosestByPath(storageNeedingFilling)
    const spawnsAndExtensionsNeedingFilling = [...extensionsNeedingFilling, ...spawnsNeedingFilling]
    const closestSpawnOrExtensionNeedingFilling = c.pos.findClosestByPath(spawnsAndExtensionsNeedingFilling)
    function nudgeOffEdge(c: Creep): boolean {
      if (c.pos.x === 0) { c.move(RIGHT); return true }
      if (c.pos.x === 49) { c.move(LEFT); return true }
      if (c.pos.y === 0) { c.move(BOTTOM); return true }
      if (c.pos.y === 49) { c.move(TOP); return true }
      return false
    }
    if (!task) { c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 ? setTask(c, "refillEnergy") : setTask(c, "work") }

    if (task === "refillEnergy") {
      // set target
      if (!target) {
        if (closestStorageProvider) {
          setTarget(c, closestStorageProvider, "storage")
        }
        if (closestContainerProvider) {
          setTarget(c, closestContainerProvider, "container")
        }
        else if (closestContainer) {
          setTarget(c, closestContainer)
        }
        else {
          // If no valid targets, emergency fallback to harvester mode -- no work parts though?
          // c.memory.role = "harvester"
          // delete c.memory.task
          // delete c.memory.targetID
          // delete c.memory.targetType
          c.say("No valid pickup targets!")
        }
      }
      else {
        let t = target as AnyStoreStructure
        if (c.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
          task = "work"
          target = null
          setTask(c, task)
          setTarget(c, target)
        }
        else if ((t.store.getUsedCapacity(RESOURCE_ENERGY) < c.store.getCapacity(RESOURCE_ENERGY))) {
          target = null
          setTarget(c, target)
        }
        else if (c.withdraw(target as AnyStoreStructure, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          c.moveTo(target as AnyStoreStructure)
        }
      }
    }

    if (task === "work") {
      if (!target) {
        if (c.room.name === expansionFlag.pos.roomName) {
          const targetController: StructureController | undefined = Game.rooms[expansionFlag.pos.roomName].controller
          if (targetController) {
            target = targetController
            setTarget(c, targetController, "controller")
          }
          else {
            c.say("No controller!")
            console.log(`Creep ${c.name} has no target controller in flag room specified!`)
          }
        }
        else {
          if (nudgeOffEdge(c)) { console.log("nudging"); return }
          c.moveTo(expansionFlag)
        }
      }
      if (target) {
        if (nudgeOffEdge(c)) { return }
        console.log(c.claimController(target as StructureController))
        if (c.claimController(target as StructureController) === ERR_NOT_IN_RANGE) {
          c.moveTo(target as StructureController)
        }
        else if (c.claimController(target as StructureController) === ERR_INVALID_TARGET || (c.claimController(target as StructureController) === ERR_GCL_NOT_ENOUGH)) {
          console.log('test')
          if (c.room.controller?.owner === Game.rooms[0].controller?.owner) {
            c.memory.role = "upgrader"
            delete c.memory.task
            delete c.memory.targetID
            delete c.memory.targetType
            expansionFlag.remove()
            Game.notify(`Claimed room ${c.room}`)
          }
        }
      }
    }
  }
}
