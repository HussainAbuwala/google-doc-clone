import {
    collection,
    query,
    where,
    getDocs,
    setDoc,
    getDoc,
    doc,
    updateDoc,
    serverTimestamp,
    deleteDoc
 } from "firebase/firestore";
 import { auth, db } from "./firebase.js";



const documentsCollection = collection(db, "documents");


export function createDocRef(...path){
    return doc(db, ...path)
}

export async function getDocument(docRef) {
    const docSnap = await getDoc(docRef);
 
    if (docSnap.exists()) {
       console.log(`document found`);
       return docSnap.data();
    } else {
       console.log(`document not found`);
    }
 }
 
export async function getDocuments(fieldName, fieldValue, operatorString) {
    const q = query(
       documentsCollection,
       where(fieldName, operatorString, fieldValue)
    );
 
    try {
       const querySnapshot = await getDocs(q);
       const docs = querySnapshot.docs.map((doc) => {
          const formattedDoc = { ...doc.data() };
          formattedDoc['createdAt'] = formattedDoc['createdAt'].toDate()
          return formattedDoc;
       });
       return docs;
    } catch (error) {
       console.error("Error fetching all documents: ", error);
       return {};
    }
 }

export async function getAllUserStats(docId){
   const statCollection = collection(db, `documents/${docId}/users`)
   const q = query(
      statCollection
   );

   try {
      const querySnapshot = await getDocs(q);
      const stats = querySnapshot.docs.map((doc) => {
         const formattedDoc = { ...doc.data() };
         return formattedDoc
      });
      console.log(`fetched all stats with document id: ${docId} `)
      return stats
   } catch (error) {
      console.error("Error fetching all stats: ", error);
      return []
   }
}
 
export async function createDocument({ uid, email, docId, docName, data }) {
    const docIdData = {
       uid,
       email,
       docId,
       docName,
       createdAt: serverTimestamp(),
       sharedUsers: [email]
    };

    const userIdData = {
        uid,
        email,
        formats:0,
        deletes: 0,
        inserts: 0,
        types: 0
    }
    
    const docIdRef = doc(db, "documents", docId)
    const userIdRef = doc(db, 'documents', docId, 'users', uid)
    try {
       await setDoc(docIdRef, {...docIdData, data});
       await setDoc(userIdRef, userIdData )
       console.log("Successfully created new document: ", docIdData);
       return docIdData;
    } catch (error) {
       console.error("Error creating document: ", error);
       return {};
    }
 }

export async function addUserStat(uid, email, docId){
   const userIdData = {
      uid,
      email,
      formats:0,
      deletes: 0,
      inserts: 0,
      types: 0
  }  
  const userIdRef = doc(db, 'documents', docId, 'users', uid)
  try {
     await setDoc(userIdRef, userIdData )
     console.log("Successfully added new user stat to document: ", userIdData);
     return userIdData
  } catch (error) {
     console.error("Error adding stat to document: ", error);
     return {};
  }
}
 
export async function updateDocument(docRef, data) {
    try {
       await updateDoc(docRef, data);
       console.log(`document updated successfully`);
       return true
    } catch (error) {
       console.log(
          `document could not be updated, error: ${error}`
       );
       return false
    }
}

export async function deleteDocument(docRef) {
   try {
      await deleteDoc(docRef);
      console.log(`document deleted successfully`);
      return true
   } catch (error) {
      console.log(
         `document could not be deleted, error: ${error}`
      );
      return false
   }
}