import React, { useEffect } from "react"
import { Wireframe } from "./Wireframe"
import { WireframeMobile } from "./WireframeMobile"
import { useDaoId } from "../hooks/useDaoId"

export const WireframeWrapper = ({ isGlobal, deps, nested }) => {
  const daoId = useDaoId()

  useEffect(() => {
    async function asyncInit() {
      if (daoId) {
        deps.updateDao.call(null, daoId)
        deps.updateDaoVersion.call(null, daoId)
      }
    }
    asyncInit()
  }, [daoId, deps.notification, deps.updateDaoVersion, deps.updateDao])

  return deps.size.s4 ? (
    <WireframeMobile isGlobal={isGlobal} deps={deps} nested={nested} />
  ) : (
    <Wireframe isGlobal={isGlobal} deps={deps} nested={nested} />
  )
}
