import { TaskName } from "types/tasks"

export const getTask = (c: Creep): TaskName => (c.memory.task as TaskName)
export const setTask = (c: Creep, t: TaskName) => { c.memory.task = t }

export type Target = _HasId | Flag

export const getTarget = (c: Creep): Target | null => {
  if (c.memory.targetType === "flag") {
    const name = c.memory.targetFlagName
    return name ? Game.flags[name] ?? null : null
  }
  const id = c.memory.targetID as Id<_HasId> | undefined
  return id ? Game.getObjectById(id) : null
}

export type TargetType = "source" | "spawn" | "creep" | "controller" | "site" | "container" | "storage" | "extension" | "repair" | "tower" | "wall" | "flag"
export function setTarget(c: Creep, target: Target | null, type?: TargetType) {
  if (!target) {
    delete c.memory.targetID
    delete c.memory.targetType
    delete c.memory.targetFlagName
    return;
  }
  else if (target instanceof Flag) {
    c.memory.targetType = "flag"
    c.memory.targetFlagName = target.name
    delete c.memory.targetID
    return
  }
  else {
    c.memory.targetID = target.id as Id<_HasId>
    c.memory.targetType = type
  }
}
