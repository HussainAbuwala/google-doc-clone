import React from "react";
import { Button, Modal, Form } from "react-bootstrap";


export default function ShareModal({open, email, closeModal, shareDoc, setEmail}) {
    
   return (
      <>
         <Modal show={open} onHide={closeModal}>
            <Form onSubmit={shareDoc}>
               <Modal.Body>
                  <Form.Group>
                     <Form.Label>Email Address</Form.Label>
                     <Form.Control
                        type="text"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                  </Form.Group>
               </Modal.Body>
               <Modal.Footer>
                  <Button variant="secondary" onClick={closeModal}>
                     Close
                  </Button>
                  <Button variant="success" type="submit">
                     Share Document
                  </Button>
               </Modal.Footer>
            </Form>
         </Modal>
      </>
   );
}
