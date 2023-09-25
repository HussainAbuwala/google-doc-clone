import React, { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "./TextEditor.css";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";
import QuillCursors from "quill-cursors";
import { useAuth } from "../../contexts/AuthContext";
import { Tooltip } from "react-tooltip";


Quill.register("modules/cursors", QuillCursors);
const SAVE_INTERVAL_MS = 5000;
const TOOLBAR_OPTIONS = [
   [{ header: [1, 2, 3, 4, 5, 6, false] }],
   [{ font: [] }],
   [{ list: "ordered" }, { list: "bullet" }],
   ["bold", "italic", "underline"],
   [{ color: [] }, { background: [] }],
   [{ script: "sub" }, { script: "super" }],
   [{ align: [] }],
   ["image", "blockquote", "code-block"],
   ["clean"],
];


const CURSOR_LATENCY = 1;

// Constant to simulate a high-latency connection when sending
// text changes.

/*
function debounce(func, wait) {
   let timeout;
   return function (...args) {
      const context = this;
      const later = function () {
         timeout = null;
         func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
   };
}*/

function updateCursor(range, cursorModule, cursorID) {
   // Use a timeout to simulate a high latency connection.
   setTimeout(() => cursorModule.moveCursor(cursorID, range), CURSOR_LATENCY);
}



let stat = {};

export default function TextEditor() {
   const { id: documentId } = useParams();
   const [socket, setSocket] = useState();
   const [quill, setQuill] = useState();
   const [allUsers, setAllUsers] = useState([]);
   const { currentUser } = useAuth();


   // initialize a quill editor with cursors module, disable at start, set quill editor state.
   const wrapperRef = useCallback((wrapper) => {
      if (wrapper == null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      const q = new Quill(editor, {
         theme: "snow",
         modules: {
            cursors: {
               transformOnTextChange: true,
            },
            toolbar: TOOLBAR_OPTIONS,
         },
      });

      q.disable();
      q.setText("Loading...");
      setQuill(q);
   }, []);

   // Connect to server socket
   useEffect(() => {
      const s = io(process.env.REACT_APP_SERVER_URL);
      setSocket(s);

      return () => {
         s.disconnect();
      };
   }, []);

   // get document from server with documentId, enable the quill text editor once document is loaded,
   useEffect(() => {
      if (socket == null || quill == null) return;

      /*const catchUpUserHandler = ({ userID, stats }) => {
         setUsersStats((prevUserStats) => ({
            ...prevUserStats,
            [userID]: { ...stats },
         }));
      };*/

      socket.once("load-document", ({ documentData, userStat }) => {

         quill.setContents(documentData);
         quill.enable();
         stat = { ...userStat };
         //socket.on("catch-up-user", catchUpUserHandler);
      });

      socket.emit("get-document", {
         documentId,
         uid: currentUser.uid,
         email: currentUser.email,
      });

      return () => {
         //socket.off("catch-up-user", catchUpUserHandler);
      };
   }, [socket, quill, documentId]);

   // send save document event every SAVE_INTERVAL_MS
   useEffect(() => {
      if (socket == null || quill == null) return;

      const interval = setInterval(() => {
         socket.emit("save-document", { data: quill.getContents(), stat });
      }, SAVE_INTERVAL_MS);

      return () => {
         clearInterval(interval);
      };
   }, [socket, quill]);

   // listen for text-change and selection change. On text change, update current user stats (insert, delete, formats) and send text change delta to others.
   // On selection change, send range to others
   useEffect(() => {
      if (socket == null || quill == null) return;

      const textChangeHandler = (delta, oldContents, source) => {
         if (source !== "user") return;

         let currrentContents = quill.getContents();
         let deltaDiffs = oldContents.diff(currrentContents);

         deltaDiffs.ops.forEach((op) => {
            if ("retain" in op && "attributes" in op) {
               stat["formats"] += 1;
            }
            if ("insert" in op) {
               stat["inserts"] += op["insert"].length;
            }
            if ("delete" in op) {
               stat["deletes"] += op["delete"];
            }
         });

         socket.emit("send-text-changes", delta);
      };

      const selectionChangeHandler = (range, oldRange, source) => {
         if (source !== "user") return;
         socket.emit("send-selection-changes", { email: currentUser.email, range });
      };

      quill.on("text-change", textChangeHandler);
      quill.on("selection-change", selectionChangeHandler);

      return () => {
         quill.off("text-change", textChangeHandler);
         quill.off("selection-change", selectionChangeHandler);
      };
   }, [socket, quill]);

   // handles text change and selection change events. When text is changed by another user, content is updated
   // when selection is changed by another user, the cursor is updated.
   useEffect(() => {
      if (socket == null || quill == null) return;

      const rtcHandler = (delta) => {
         quill.updateContents(delta);
      };

      const rscHandler = ({ email, range }) => {
         const cursorModule = quill.getModule("cursors");
         updateCursor(range, cursorModule, email);
      };

      socket.on("receive-text-changes", rtcHandler);
      socket.on("receive-selection-changes", rscHandler);

      return () => {
         socket.off("receive-text-changes", rtcHandler);
         socket.off("receive-selection-changes", rscHandler);
      };
   }, [socket, quill]);

   // handles key down / typing event. Whenever user types, its typing stat is updated.
   useEffect(() => {
      if (socket == null || quill == null) return;

      function handleKeyDown(event) {
         var allowedChars = /^[a-zA-Z0-9,.\'"()\[\]{}=\-+]+$/;
         var key = event.key;
         if (key.match(allowedChars)) {
            stat["types"] += 1;
         }
      }
      // Listen for keydown event to start tracking typing
      quill.root.addEventListener("keydown", handleKeyDown);

      return () => {
         quill.root.removeEventListener("keydown", handleKeyDown);
      };
   }, [socket, quill]);

   //Listen for new users including current users in the document
   useEffect(() => {
      if (socket == null || quill == null) return;

      const currentUserHandler = (emails) => {
      
         emails.forEach(em => {
            const cursorModule = quill.getModule("cursors");
            cursorModule.createCursor(em, em, "#3457D5");
         })
         setAllUsers(emails);
      };

      socket.on("current-users", currentUserHandler);

      return () => {
         socket.off("current-users", currentUserHandler);
      };
   }, [socket, quill]);

   // Listen for when a user leaves the document.
   useEffect(() => {
      if (socket == null || quill == null) return;

      const deleteHandler = (email) => {
         setAllUsers(prevUsers => {
            return prevUsers.filter(e => e !== email)
         })
         const cursorModule = quill.getModule("cursors");
         cursorModule.removeCursor(email);
      };

      socket.on("delete-user", deleteHandler);

      return () => {
         socket.off("delete-user", deleteHandler);
      };
   }, [socket, quill]);


   return (
      <>
         <div className="user-icon-container">
            {allUsers
               .filter((email) => email !== currentUser.email)
               .map((email) => {
                  return (
                     <>
                     <span
                        className="user-icon"
                        data-tooltip-id={email}
                        data-tooltip-content={email}
                        data-tooltip-place="top"
                     >
                        {email[0].toUpperCase()}
                     </span>
                     <Tooltip id={email} />
                     </>
                  );
               })}
         </div>
         <div className="container" ref={wrapperRef}></div>
      </>
   );
}
