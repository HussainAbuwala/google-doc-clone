import React, { useState} from "react";
import "./Template.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import CreateModal from "./CreateModal";
import { v4 as uuidV4 } from "uuid";
import { useAuth } from "../../contexts/AuthContext";



export default function BlankT({socket}) {
   const [open, setOpen] = useState(false);
   const [docName, setDocName] = useState("");
   const { currentUser} = useAuth()

   
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
        socket.emit("create-document", { docName, docId: uuidV4(), idToken, data: ""});
      }).catch(function(error) {
      });
      closeModal();
   }

   return (
      <div className="individual-template">
         <div className="blankt-container" onClick={openModal}>
            <FontAwesomeIcon
               className="fa-4x"
               icon={faPlus}
               style={{ color: "#0096FF" }}
            />
         </div>
         <em>Blank</em>
         <CreateModal
            open={open}
            docName={docName}
            closeModal={closeModal}
            handleCreate={handleCreate}
            setDocName={setDocName}
         />
      </div>
   );
}
