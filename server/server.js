import { config as dotenvConfig } from "dotenv";
import { createServer } from "http";
import { auth} from "./firebase.js";
import { Server } from "socket.io";
import {getDocument, getDocuments,getAllUserStats, createDocument, updateDocument, createDocRef, addUserStat, deleteDocument} from "./firestore.js"
import {arrayUnion, arrayRemove, setDoc} from "firebase/firestore";

dotenvConfig();

const port = 5000;
const httpServer = createServer();
const io = new Server(httpServer, {
   cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
   },
});

//console.log(await getAllUserStats('97f528c8-ae72-480d-bc71-d9abc414d3df'))

function getAllEmails(docId){
   return Object.keys(connectedClients[docId])
}

const connectedClients = {}

io.on("connection", (socket) => {
   console.log("Client socket joined", socket.id);
   socket.on("create-document", ({ docName, docId, idToken, data }) => {

      console.log(
         `Create new document with id: ${docId} and name: ${docName} and token: ${idToken} `
      );

      auth
         .verifyIdToken(idToken)
         .then(async (decodedToken) => {
            const uid = decodedToken.uid;
            const email = decodedToken.email;
            console.log(`Token is valid, user id: ${uid}, email: ${email}`);
            const document = await createDocument({
               uid,
               email,
               docId,
               docName,
               data
            });
            if (document) {
               socket.emit("new-document", document);
            }
         })
         .catch((error) => {
            console.error("Error verifying token: ", error);
         });
   });

   socket.on("load-all-existing-user-documents", (idToken) => {
      auth
         .verifyIdToken(idToken)
         .then(async (decodedToken) => {
            const uid = decodedToken.uid;
            const email = decodedToken.email;
            const documents = await getDocuments(
               "sharedUsers",
               email,
               "array-contains"
            );
            if (documents) {
               delete documents["data"];
               socket.emit("existing-documents", documents);
            }
         })
         .catch((error) => {
            console.error("Error verifying token: ", error);
         });
   });

   socket.on("share-document",async ({ docId, uid, email }) => {

      console.log(`shared document with id: ${docId} with user with email: ${email}`)
      const docInfoRef = createDocRef('documents', docId)
      /*const userStatRef = createDocRef('documents', docId, 'users', uid)
      const userIdData = {
         uid,
         email,
         formats:0,
         deletes: 0,
         inserts: 0,
         types: 0
     } */ 

      updateDocument(docInfoRef, {sharedUsers: arrayUnion(email)});
      //updateDocument(userStatRef, userIdData)

   })

   socket.on("rename-document", async ({docId, docName, oldName}) => {
      console.log(`rename document with id: ${docId} with old name: ${oldName} and new name: ${docName}`)
      const docInfoRef = createDocRef('documents', docId)
      const result = await updateDocument(docInfoRef, {docName});
      if (result){
         socket.emit("change-document-name", {docId, docName, oldName})
      }

   })

   socket.on("remove-document", async ({docId, uid, email}) => {

      console.log(`Remove user with email: ${email}, document id: ${docId}`);

      const docInfoRef = createDocRef('documents', docId)
      const userStatRef = createDocRef('documents', docId, 'users', uid)
      const userStatDoc = await getDocument(userStatRef);
      const res1 = await deleteDocument(userStatRef)
      const res2 = await updateDocument(docInfoRef, {sharedUsers: arrayRemove(email)});
      if (!res1 || !res2){
         return
      }
      socket.emit('document-removed', {userStatDoc, email, docId})

   })

   socket.on("add-user-back", async ({docId, email, userStatDoc}) => {

      console.log(`add user back with email: ${email}, document id: ${docId}`);
      const docInfoRef = createDocRef('documents', docId)
      const userStatRef = createDocRef('documents', docId, 'users', userStatDoc.uid)

      const res1 = await updateDocument(docInfoRef, {sharedUsers: arrayUnion(email)});
      
      try {
         await setDoc(userStatRef, userStatDoc )
         console.log("Successfully restored user stat to document: ", userStatDoc);
         if (res1){
            socket.emit("user-restored", "")
         }
      } catch (error) {
         console.error("Error restoring stat to document: ", error);
      }
      
   })

   socket.on("get-document-stats", async (docId) => {

      const docInfoRef = createDocRef('documents', docId)
      const documentInfo = await getDocument(docInfoRef);
      const statInfo =  await getAllUserStats(docId)

      if (!documentInfo || !statInfo) {
         return;
      }
      documentInfo['createdAt'] = documentInfo['createdAt'].toDate()
      socket.emit("receive-document-stats", {documentInfo, statInfo});

   })



   socket.on("get-document", async ({ documentId, uid, email }) => {

      if (!(documentId in connectedClients)){
         connectedClients[documentId] = {}
      }

      console.log(`get document with id: ${documentId} and user stat with id: ${uid}`);
      
      const docInfoRef = createDocRef('documents', documentId)
      const userStatRef = createDocRef('documents', documentId, 'users', uid)

      const documentInfo = await getDocument(docInfoRef);
      let userStatInfo = await getDocument(userStatRef);

      if (!documentInfo) {
         return;
      }
      if (!userStatInfo){
         userStatInfo = await addUserStat(uid, email, documentId)
      }

      console.log(documentInfo)
      console.log(userStatInfo)

      socket.emit("load-document", {documentData: documentInfo.data, userStat: userStatInfo});

      socket.on("save-document", ({data, stat}) => {
         console.log(stat)
         updateDocument(docInfoRef, {data: data});
         updateDocument(userStatRef, stat)
      });

      socket.join(documentId)

      connectedClients[documentId][email] = socket
      console.log(connectedClients)
      console.log(getAllEmails(documentId))

      io.in(documentId).emit('current-users', getAllEmails(documentId))

      socket.on("send-text-changes", delta => {
         socket.broadcast.to(documentId).emit("receive-text-changes", delta)
     })

     socket.on("send-selection-changes", (selectionData) => {
      socket.broadcast.to(documentId).emit("receive-selection-changes", selectionData)
  })

     socket.on("disconnect", (reason) => {
      delete connectedClients[documentId][email]
      console.log(connectedClients)
      socket.broadcast.to(documentId).emit("delete-user", email)
    });


   });
});



httpServer.listen(process.env.PORT || port, (err) => {
   if (err) console.log(err);
   console.log(
      "Server running on Port ",
      process.env.port ? process.env.port : port
   );
});



      /*console.log('get-document called-doc-id ', documentId)
        const document = await findOrCreateDocument(documentId)
        if(!document){
            console.log("no document found or created")
        }

        socket.join(documentId)

        socket.broadcast.to(documentId).emit("new-user-joined", {uD: userData, sID: socket.id})

        socket.on("already-joined-user", ({userID, stats, sID}) => {
            //console.log('already joined user is: ', alreadyJoinedUserData)
            socket.broadcast.to(sID).emit("catch-up-user", {userID, stats})
        })

        socket.emit("load-document", document.data)

        socket.on("send-stat-changes", ({userID, stats}) => {
            socket.broadcast.to(documentId).emit("receive-stat-changes", {userID, stats})
        })

        socket.on("send-text-changes", delta => {
            socket.broadcast.to(documentId).emit("receive-text-changes", delta)
        })

        socket.on("send-selection-changes", (selectionData) => {
            socket.broadcast.to(documentId).emit("receive-selection-changes", selectionData)
        })
        
        */