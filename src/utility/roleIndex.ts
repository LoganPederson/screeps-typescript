import { RoleName, RoleModule } from "types/roles";
import { harvester } from "../roles/harvester"
import { mule } from "../roles/mule"
import { builder } from "../roles/builder"
import { upgrader } from "roles/upgrader"

export const roles = { harvester, mule, builder, upgrader } satisfies Record<RoleName, RoleModule>
