import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Deduction } from "../../../types";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deduction: Deduction | null;
}

const DeleteDeductionModal: React.FC<Props> = (props) => {
  return props.deduction ? (
    <Modal
      show={props.isOpen}
      onHide={props.onClose}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          Are you sure you want to delete this {props.deduction.deductionType}{" "}
          deduction?
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>This can not be undone</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={props.onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  ) : null;
};

export default DeleteDeductionModal;
