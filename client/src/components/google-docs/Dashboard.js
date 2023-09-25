import React, { useState, useEffect } from "react";
import Template from "./Template";
import "./Document.css";
import Document from "./Document";
import { io } from "socket.io-client";
import { useAuth } from "../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "./Dashboard.css";
import Button from "react-bootstrap/Button";


const customStyle = {
   backgroundColor: "#000000", // Change this to your desired color
   color: "white", // Text color for contrast
};


let renameToggle = false;
let removeToggle = false;

export default function Dashboard() {
   const [socket, setSocket] = useState();
   const [documents, setDocuments] = useState([]);
   const { currentUser } = useAuth();

   // Connect to server socket
   useEffect(() => {
      const s = io(process.env.REACT_APP_SERVER_URL);
      setSocket(s);

      return () => {
         s.disconnect();
      };
   }, []);

   // fetch new document created
   useEffect(() => {
      if (socket == null) return;

      function newDocHandler(document) {
         setDocuments((prevDocuments) => {
            return [...prevDocuments, document];
         });
      }

      socket.on("new-document", newDocHandler);

      return () => {
         socket.off("new-document", newDocHandler);
      };
   }, [socket]);

   // fetch existing documents created

   useEffect(() => {
      if (socket == null) return;

      currentUser
         .getIdToken(true)
         .then(function (idToken) {
            socket.emit("load-all-existing-user-documents", idToken);
         })
         .catch(function (error) {
         });

      socket.on("existing-documents", setDocuments);

      return () => {
         socket.off("existing-documents", setDocuments);
      };
   }, [socket]);

   // rename document
   useEffect(() => {
      if (socket == null) return;

      function renameHandler({ docId, docName, oldName }) {
         setDocuments((prevDocuments) => {
            return prevDocuments.map((doc) => {
               if (doc.docId === docId) {
                  return { ...doc, docName };
               }
               return doc;
            });
         });

         if (!renameToggle) {
            toast(
               <div className="undo-toast">
                  Renamed
                  <Button
                     type="button"
                     className=""
                     variant="outline-light"
                     size="sm"
                     onClick={() => socket.emit("rename-document", { docId, docName: oldName, oldName: docName})}
                  >
                     Undo
                  </Button>
               </div>,
               {
                  position: toast.POSITION.BOTTOM_RIGHT,
                  autoClose: 5000,
                  style: customStyle,
               }
            );
         } else {
            toast("Name Restored !", {
               position: toast.POSITION.BOTTOM_RIGHT,
               autoClose: 5000,
               style: customStyle,
            });
         }
         renameToggle = !renameToggle;
      }

      socket.on("change-document-name", renameHandler);

      return () => {
         socket.off("change-document-name", renameHandler);
      };
   }, [socket]);


   // document removed

   useEffect(() => {
      if (socket == null) return;

      function removeUndoHandler({userStatDoc, email, docId}){
         removeToggle = !removeToggle
         socket.emit("add-user-back", { docId, email, userStatDoc})
      }

      function restoreHandler(){
         removeToggle = !removeToggle
         toast("Document Restored !", {
            position: toast.POSITION.BOTTOM_RIGHT,
            autoClose: 5000,
            style: customStyle,
         });
      }

      function removeHandler({userStatDoc, email, docId}){
         setDocuments((prevDocuments) => {
            return prevDocuments.filter((doc) => (doc.docId !== docId));
         });
         toast(
            <div className="undo-toast">
               Moved to Trash
               <Button
                  type="button"
                  className=""
                  variant="outline-light"
                  size="sm"
                  onClick={() => removeUndoHandler({userStatDoc, email, docId})}
               >
                  Undo
               </Button>
            </div>,
            {
               position: toast.POSITION.BOTTOM_RIGHT,
               autoClose: 5000,
               style: customStyle,
            }
         )
      }

      socket.on("user-restored", restoreHandler)
      socket.on("document-removed", removeHandler);

      return () => {
         socket.off("document-removed", removeHandler);
         socket.off("user-restored", restoreHandler)

      };
   }, [socket]);

   return (
      <>
         <Template socket={socket} />
         <div className="documents-container">
            <h5>Recent Documents</h5>
            <div className="documents-row">
               {documents.map((doc) => {
                  return (
                     <Document
                        key={doc.docId}
                        document={doc}
                        uid={currentUser.uid}
                        socket={socket}
                     />
                  );
               })}
            </div>
         </div>
         <ToastContainer />
      </>
   );
}
