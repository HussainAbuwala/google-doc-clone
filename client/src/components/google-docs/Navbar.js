import React from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

export default function NavbarComponent() {
   const { currentUser } = useAuth();
   const userStyle = {
    'background-color': '#36454F',
    'color': 'white',
    'border-radius': '5em',
    'width': '40px',
    'text-align': 'center',
    'margin-right': '5px',
   }
   return (
      <Navbar bg="light" className="mb-4 nav-container">
         <div className="nav-items">
            <Navbar.Brand as={Link} to="/" className="ms-4">
            <FontAwesomeIcon icon={faFile} style={{color: "#0a48b2",}} />
            DocClone
            </Navbar.Brand>
            {currentUser && (
               <Nav>
                  <Nav.Link as={Link} to="/user" style={userStyle}>
                     {currentUser.email[0].toUpperCase()}
                  </Nav.Link>
               </Nav>
            )}
         </div>
      </Navbar>
   );
}