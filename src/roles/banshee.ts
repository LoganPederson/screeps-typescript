
import { FlagType } from "types/flags"
import { RoleName } from "types/roles"
import { getTarget, getTask, setTask, setTarget, TargetType } from "utility/memory"
export const banshee = {

  /*
    The banshee role is intended to be a offensive combat unit
    specalizing in harassment of enemy workers

    TASKS
    moveToRally
    Scout - log to Memory for analysis
    Harass - attack >20 tiles from tower for minimum dmg
    Heal/Retreat - don't feed enemy
   
  */
  run(c: Creep): void {
    const bansheeFlag: Flag = Game.flags["bansheeAttack"]
    const r: Room = c.room
    let task = getTask(c)
    let target = getTarget(c)

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
        if (c.room.name === bansheeFlag.pos.roomName) {
          const targetController: StructureController | undefined = Game.rooms[bansheeFlag.pos.roomName].controller
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
          c.moveTo(bansheeFlag)
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
            bansheeFlag.remove()
            Game.notify(`Claimed room ${c.room}`)
          }
        }
      }
    }
  }
}
