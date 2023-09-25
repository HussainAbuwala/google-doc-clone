import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./ContributionStats.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileWord } from "@fortawesome/free-solid-svg-icons";
import GroupedBarChart from "./GroupedBarChart";
import BoxPlot from "./BoxPlot";
import { useAuth } from "../../contexts/AuthContext";


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

export default function ContributionStats() {
   const { id: documentId } = useParams();
   const [socket, setSocket] = useState();
   const [docInfo, setdocInfo] = useState({});
   const [statInfo, setStatInfo] = useState([]);
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

      function statHandler({ documentInfo, statInfo }) {
         setdocInfo(documentInfo);
         setStatInfo(statInfo);
      }
      socket.on("receive-document-stats", statHandler);
      socket.emit("get-document-stats", documentId);

      return () => {
         socket.off("receive-document-stats", statHandler);
      };
   }, [socket]);

   const findHighestValue = (attribute) => {
    return Math.max(
      ...statInfo.map((statInfo) => {
        if(attribute === 'edits'){
          return statInfo['inserts'] + statInfo['deletes']
        }
        return statInfo[attribute]
      })
    );
  };

   return (
      <>

         {docInfo && (
            <div className="stats-container">
               <div className="doc-info-container">
                  <FontAwesomeIcon
                     className="fa-10x metadata-icons"
                     icon={faFileWord}
                     style={{ color: "#125fe2" }}
                  />
                  <h4 className="d-inline-block text-truncate">{docInfo.docName}</h4>
                  <span className="doc-items">Owner: {docInfo.email}</span>
                  <span className="doc-items">
                     Created At:{" "}
                     {docInfo.createdAt && getDate(docInfo.createdAt)}
                  </span>
                  <span className="doc-items">
                     Total Contributors:{" "}
                     {docInfo.sharedUsers && docInfo.sharedUsers.length}
                  </span>
               </div>
            </div>
         )}
         <div className="stats-info-table-container">
         <h5>Contribution Table</h5>
            <table>
               <thead>
                  <tr>
                     <th scope="col">User Email</th>
                     <th scope="col">Inserts</th>
                     <th scope="col">Deletes</th>
                     <th scope="col">Edits</th>
                     <th scope="col">Formats</th>
                     <th scope="col">Types</th>
                  </tr>
               </thead>
               <tbody>
                  {statInfo.map(({inserts, deletes, types, formats, email, uid}) => (
                     <tr key={uid}>
                        <td>{email === currentUser.email ? <strong>{email}<em>:(You)</em></strong> : email}</td>
                        <td style={{backgroundColor: findHighestValue('inserts') === inserts ? '#00FF7F' : ""}}>{inserts}</td>
                        <td style={{backgroundColor: findHighestValue('deletes') === deletes ? '#00FF7F' : ""}}>{deletes}</td>
                        <td style={{backgroundColor: findHighestValue('edits') === inserts + deletes ? '#00FF7F' : ""}}>{inserts + deletes}</td>
                        <td style={{backgroundColor: findHighestValue('formats') === formats ? '#00FF7F' : ""}}>{formats}</td>
                        <td style={{backgroundColor: findHighestValue('types') === types ? '#00FF7F' : ""}}>{types}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         <h5>Contribution Bar Chart</h5>
         <GroupedBarChart data={statInfo} />
         <h5>Contribution Box Plot</h5>
         <BoxPlot data={statInfo} />
         </div>
         
      </>
   );
}
