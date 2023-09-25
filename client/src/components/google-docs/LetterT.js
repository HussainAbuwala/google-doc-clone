import React, { useState } from "react";
import "./Template.css";
import CreateModal from "./CreateModal";
import { v4 as uuidV4 } from "uuid";
import { useAuth } from "../../contexts/AuthContext";
import {letterTemplate} from "./docTemplates.js"


export default function LetterT({socket}) {

  const [open, setOpen] = useState(false);
   const [docName, setDocName] = useState("");
   const { currentUser } = useAuth();

   function openModal() {
      setDocName("");
      setOpen(true);
   }

   function closeModal() {
      setOpen(false);
   }

   function handleCreate(e) {
      e.preventDefault();
      currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {
        socket.emit("create-document", { docName, docId: uuidV4(), idToken, data: letterTemplate});
      }).catch(function(error) {
      });
      closeModal();
   }

  return (
    <div className='individual-template'>
    <div className='t-container letter' onClick={openModal}>
    </div>
    <em>Letter</em>
    <CreateModal
            open={open}
            docName={docName}
            closeModal={closeModal}
            handleCreate={handleCreate}
            setDocName={setDocName}
         />
    </div>
  )
}
