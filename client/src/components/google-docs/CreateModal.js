import React from "react";
import { Button, Modal, Form } from "react-bootstrap";


export default function CreateModal({open, docName, closeModal, handleCreate, setDocName}) {
    
   return (
      <>
         <Modal show={open} onHide={closeModal}>
            <Form onSubmit={handleCreate}>
               <Modal.Body>
                  <Form.Group>
                     <Form.Label>Document Name</Form.Label>
                     <Form.Control
                        type="text"
                        required
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                     />
                  </Form.Group>
               </Modal.Body>
               <Modal.Footer>
                  <Button variant="secondary" onClick={closeModal}>
                     Close
                  </Button>
                  <Button variant="success" type="submit">
                     Create Document
                  </Button>
               </Modal.Footer>
            </Form>
         </Modal>
      </>
   );
}
