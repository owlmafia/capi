import { CancelButton, SubmitButton } from "../components/SubmitButton"
import Modal from "./Modal"

export const OkCancelModal = ({
  title,
  closeModal,
  children,
  onSubmit,
  okLabel,
  cancelLabel,
}: {
  title: string
  closeModal: () => void
  children: JSX.Element
  onSubmit: () => void
  okLabel?: string
  cancelLabel?: string
}) => {
  return (
    <Modal title={title} onClose={() => closeModal()}>
      <div>
        {children}
        <div className="d-flex gap-40">
          <SubmitButton
            label={okLabel ?? "Continue"}
            onClick={async () => onSubmit()}
          />
          <CancelButton
            label={cancelLabel ?? "Cancel"}
            onClick={async () => closeModal()}
          />
        </div>
      </div>
    </Modal>
  )
}
