import React from "react";
import { Modal, Button } from "react-bootstrap";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CancellationModal: React.FC<Props> = (props) => {
  return (
    <Modal
      show={props.isOpen}
      onHide={props.onClose}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Are you sure you want to cancel?</Modal.Title>
      </Modal.Header>

      <Modal.Body>Any unsaved changes will be lost</Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={props.onClose}>
          Go Back
        </Button>
        <Button variant="danger" onClick={props.onConfirm}>
          Discard Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancellationModal;
