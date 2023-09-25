import React from "react";
import "./CenteredContainer.css"

export default function CenteredContainer({children}) {
   return (
      <div className="centered-container">
         <div className="child-container" style={{ maxWidth: "400px" }}>
            {children}
         </div>
      </div>
      
   );
}