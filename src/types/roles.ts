
import { harvester } from "../roles/harvester"
import { mule } from "../roles/mule"
import { builder } from "../roles/builder"

export type BodyPlan = Partial<Record<BodyPartConstant, number>>
export type RoleBodyPlan = Record<RoleName, BodyPlan>
export type RoleName = "harvester" | "mule" | "builder"
export type RolePlan = {
  desired: number,
  minEnergy?: number,
  body: BodyPlan
}
export type RoleModule = { run: (c: Creep) => void }
export const roles = { harvester, mule, builder } satisfies Record<RoleName, RoleModule>


