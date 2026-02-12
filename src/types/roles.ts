
import { harvester } from "../roles/harvester"
import { mule } from "../roles/mule"
import { builder } from "../roles/builder"
import { upgrader } from "roles/upgrader"

export type BodyPlan = Partial<Record<BodyPartConstant, number>>
export type RoleBodyPlan = Record<RoleName, BodyPlan>
export type RoleName = "harvester" | "mule" | "builder" | "upgrader"
export type RolePlan = {
  desired: number,
  minEnergy?: number,
  body: BodyPlan
}
export type RoleModule = { run: (c: Creep) => void }
export const roles = { harvester, mule, builder, upgrader } satisfies Record<RoleName, RoleModule>


