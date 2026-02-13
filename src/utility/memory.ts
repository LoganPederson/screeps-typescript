import { TaskName } from "types/tasks"

export const getTask = (c: Creep): TaskName => (c.memory.task as TaskName ?? "harvest")
export const setTask = (c: Creep, t: TaskName) => { c.memory.task = t }

export const getTarget = (c: Creep): _HasId | null => {
  const id = c.memory.targetID as Id<_HasId> | undefined
  return id ? Game.getObjectById(id) : null
}

export type TargetType = "source" | "spawn" | "creep" | "controller" | "site" | "container" | "storage" | "extension" | "repair"
export function setTarget(c: Creep, target: _HasId | null, type?: TargetType) {
  if (!target) {
    delete c.memory.targetID;
    delete c.memory.targetType
    return;
  }
  c.memory.targetID = target.id as Id<_HasId>
  c.memory.targetType = type
}
