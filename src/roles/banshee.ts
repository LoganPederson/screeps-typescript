
import { FlagType } from "types/flags"
import { RoleName } from "types/roles"
import { getTarget, getTask, setTask, setTarget, TargetType, Target } from "utility/memory"
export const banshee = {

  /*
    The banshee role is intended to be a offensive combat unit
    specalizing in harassment of enemy workers

    TASKS
    travel
    scout - log to Memory for analysis
    harrass - attack >20 tiles from tower for minimum dmg
    retreat - don't feed enemy
   
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

    if (!task) { setTask(c, "travel"); task = "travel" }

    if (task === "travel") {
      // set target
      if (!target) {
        target = bansheeFlag
        setTarget(c, bansheeFlag, "flag")
      }
      else {
        if (c.room.name === (target as Flag).pos.roomName) {
          task = "scout"
          target = null
          setTask(c, "scout")
          setTarget(c, null)
        }
        if (nudgeOffEdge(c)) { return }
        c.moveTo(target as Flag)
      }
    }
    if (task === "scout") {
      c.say("ADD SCOUTING!")
      task = "harass"
      setTask(c, "harass")
    }

    if (task === "harass") {
      const enemyTowers: StructureTower[] = c.room.find(FIND_HOSTILE_STRUCTURES).filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER)
      const enemyCreepsSafeDistance: Creep[] = c.room.find(FIND_HOSTILE_CREEPS).filter(h => !enemyTowers.some(t => h.pos.getRangeTo(t) <= 20))
      const closestEnemyCreep_Over20 = c.pos.findClosestByPath(enemyCreepsSafeDistance)
      const hostileContainers: StructureContainer[] = c.room.find(FIND_STRUCTURES).filter((s): s is StructureContainer => s.structureType === STRUCTURE_CONTAINER)
      const hostileTowers: StructureTower[] = c.room.find(FIND_HOSTILE_STRUCTURES).filter((s): s is StructureTower => s.structureType === STRUCTURE_TOWER)
      const hostileExtensions: StructureExtension[] = c.room.find(FIND_HOSTILE_STRUCTURES).filter((s): s is StructureExtension => s.structureType === STRUCTURE_EXTENSION)
      const hostileSpawns: StructureSpawn[] = c.room.find(FIND_HOSTILE_STRUCTURES).filter((s): s is StructureSpawn => s.structureType === STRUCTURE_SPAWN)
      function creepRangedAttack(c: Creep, t: Target): void {
        if (c.rangedAttack(t as AnyCreep) === ERR_NOT_IN_RANGE) {
          c.moveTo(t as AnyCreep)
        }
      }
      if (!target) {
        if (closestEnemyCreep_Over20) {
          target = closestEnemyCreep_Over20
          setTarget(c, closestEnemyCreep_Over20, "creep")
        }
        else if (c.pos.findClosestByPath(FIND_HOSTILE_CREEPS)) {
          target = c.pos.findClosestByPath(FIND_HOSTILE_CREEPS)
          setTarget(c, target, "creep")
        }
        else if (hostileTowers.length > 0) {
          target = c.pos.findClosestByPath(hostileTowers)
          setTarget(c, target, "tower")
        }
        else if (hostileExtensions.length > 0) {
          target = c.pos.findClosestByPath(hostileExtensions)
          setTarget(c, target, "extension")
        }
        else if (hostileContainers.length > 0) {
          target = c.pos.findClosestByPath(hostileContainers)
          setTarget(c, target, "container")
        }
        else if (hostileSpawns.length > 0) {
          target = c.pos.findClosestByPath(hostileSpawns)
          setTarget(c, target, "spawn")
        }
      }

      if (target) {
        if (c.hits / c.hitsMax < 0.3) {
          task = "retreat"
          target = null
          setTask(c, "retreat")
          setTarget(c, null)
        }
        else if (enemyCreepsSafeDistance.length > 0 && !enemyCreepsSafeDistance.includes(target as Creep)) {
          target = null
          setTarget(c, null)
        }
        else if (c.rangedAttack(target as Creep) === ERR_NOT_IN_RANGE) {
          c.moveTo(target as Creep)
        }
      }
    }
  }
}
