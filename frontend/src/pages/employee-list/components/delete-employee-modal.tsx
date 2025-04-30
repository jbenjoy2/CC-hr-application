import React from "react";
import { Modal, Button } from "react-bootstrap";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employeeName?: string;
}

const DeleteEmployeeModal: React.FC<Props> = (props) => {
  return (
    <Modal
      show={props.isOpen}
      onHide={props.onClose}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Are you sure you want to delete{" "}
        <strong>{props.employeeName ?? "this employee"}</strong>? This action
        cannot be undone.
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={props.onConfirm}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteEmployeeModal;
