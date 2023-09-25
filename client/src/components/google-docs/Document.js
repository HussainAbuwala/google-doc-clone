import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
   faFileWord,
   faPerson,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import ShareModal from "./ShareModal";
import { useAuth } from "../../contexts/AuthContext";
import { Tooltip } from "react-tooltip";
import RenameModal from "./RenameModal";

function getDate(dateString) {
   const date = new Date(dateString);

   const year = date.getFullYear(); // Get the year (e.g., 2023)
   const month = date.getMonth() + 1; // Get the month (0-based, so add 1) (e.g., 9 for September)
   const day = date.getDate(); // Get the day of the month (e.g., 22)

   // Create a formatted date string with day, month, and year
   const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

   return formattedDate;
}

export default function Document({ document, uid, socket, rename }) {
   const navigate = useNavigate();
   const [openShare, setOpenShare] = useState(false);
   const [openRename, setOpenRename] = useState(false);

   const [email, setEmail] = useState("");
   const [docName, setDocName] = useState("");
   const { currentUser } = useAuth();

   function openShareModal() {
      setEmail("");
      setOpenShare(true);
   }

   function closeShareModal() {
      setOpenShare(false);
   }

   function openRenameModal() {
      setDocName("");
      setOpenRename(true);
   }

   function closeRenameModal() {
      setOpenRename(false);
   }

   function handleDocOpen() {
      navigate(`/document/${document.docId}`);
   }

   function handleShare(e) {
      e.stopPropagation();
      openShareModal();
   }

   function shareDoc(e) {
      e.preventDefault();
      socket.emit("share-document", { docId: document.docId, uid, email });
      closeShareModal();
   }

   function renameDoc(e){
      e.preventDefault();
      socket.emit("rename-document", { docId: document.docId, docName, oldName: document.docName});
      closeRenameModal();
   }

   function handleContribution(e) {
      e.preventDefault();
      navigate(`/stats/document/${document.docId}`);
   }

   function handleRename(e){
      e.stopPropagation();
      openRenameModal();
   }

   function handleDelete(e){
      e.preventDefault();
      socket.emit("remove-document", { docId: document.docId, uid, email: currentUser.email});
   }

   return (
      <>
         <div className="individual-doc-container" onClick={handleDocOpen}>
            <div className="doc-container-icons">
               <DropdownButton
                  id="dropdown-basic-button"
                  title=""
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                     e.stopPropagation();
                  }}
               >
                  {uid === document.uid && (
                     <>
                        <Dropdown.Item as="button" onClick={handleShare}>
                           Share
                        </Dropdown.Item>
                     </>
                  )}
                  <Dropdown.Item as="button" onClick={handleRename}>
                     Rename
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={handleDelete}>
                     Remove
                  </Dropdown.Item>
                  <Dropdown.Item as="button" onClick={handleContribution}>
                     Contribution Stats
                  </Dropdown.Item>
               </DropdownButton>
            </div>
            <div className="doc-info">
               <FontAwesomeIcon
                  className="fa-6x metadata-icons"
                  icon={faFileWord}
                  style={{ color: "#125fe2" }}
               />
               <h4 className="d-inline-block text-truncate">{document.docName}</h4>
               <span>Created at {getDate(document.createdAt)}</span>
               <div>
               {document.sharedUsers
                  .filter((email) => email !== currentUser.email)
                  .map((email) => {
                     return (
                     <>
                        <FontAwesomeIcon
                           className="fa-lg metadata-icons"
                           icon={faPerson}
                           style={{ color: "#24385c" }}
                           data-tooltip-id={email}
                           data-tooltip-content={email}
                           data-tooltip-place="bottom"
                        />
                        <Tooltip id={email} />
                     </>)
                  })}
               </div>
            </div>
         </div>
         <ShareModal
            open={openShare}
            email={email}
            closeModal={closeShareModal}
            shareDoc={shareDoc}
            setEmail={setEmail}
         />
         <RenameModal
            open={openRename}
            docName={docName}
            closeModal={closeRenameModal}
            renameDoc={renameDoc}
            setDocName={setDocName}
         />
      </>
   );
}
