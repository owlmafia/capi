import Modal from "../modal/Modal"
import React, { useContext } from "react"
import { AppContext } from "../context/AppContext"
import { ToastContainer } from "react-toastify"
import OpenWalletModal from "../wallet/OpenWalletModal"

export const AppContainer = ({ children }: { children: JSX.Element }) => {
  const { deps } = useContext(AppContext)

  return (
    <div>
      <div id="container">
        {children}
        {/* TODO is this used - also deps.modal and deps.setModal - maybe delete */}
        {deps.modal && (
          <Modal title={deps.modal.title} onClose={() => deps.setModal(null)}>
            {deps.modal.body}
          </Modal>
        )}
        {deps.wcShowOpenWalletModal && (
          <OpenWalletModal setShowModal={deps.setWcShowOpenWalletModal} />
        )}
        <ToastContainer />
      </div>
    </div>
  )
}
