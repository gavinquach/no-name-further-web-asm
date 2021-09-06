import { React, Component } from 'react';
import { Navbar, NavDropdown, Nav, Image } from 'react-bootstrap'; 

import logo from '../../images/lazyslob-logo.png';
import '../../css/NavigationBar.css'

import AuthService from "../../services/auth.service";

export default class NavigationBar extends Component {
    constructor(props) {
        super(props);
        this.logOut = this.logOut.bind(this);

        this.state = {
            showAdminPanel: false,
            currentUser: undefined,
        };
    }

    componentDidMount() {
        const user = AuthService.getCurrentUser();

        if (user) {
            this.setState({
                currentUser: user,
                showAdminPanel: AuthService.isAdmin(user),
                showUserPanel: user.roles.includes("ROLE_USER")
            });
        }
    }

    logOut() {
        AuthService.logout();
        this.setState({
            showAdminPanel: false,
            currentUser: undefined,
        });
    }

    render() {
        const { currentUser, showAdminPanel } = this.state;
        return (
            <Navbar className="navbar" expand ="lg" > 
                <Navbar.Brand href="/"><Image src={logo} fluid style={{ marginLeft: '1em', width: '3em', maxWidth: '3em', height: "100%" }} /></Navbar.Brand>
                <Navbar.Toggle aria-controls= 'basic-navbar-nav'/>
                <Navbar.Collapse id = 'basic-navbar-nav'>
                    <Nav className= "nav">
                        <Nav.Link className="navbar-text navbar-item" href="/transactions" >Transactions</Nav.Link>
                        <Nav.Link className="navbar-text navbar-item" href="/cart">Cart</Nav.Link>
<<<<<<< Updated upstream
                    
                {/* show user panel user is logged in */}
                {currentUser && (
                    <Nav.Link className="navbar-text navbar-item" href="/user/index">User Panel</Nav.Link>
                )}
                {/* show admin panel fi user is admin */}
                {showAdminPanel && (
                    <Nav.Link className="navbar-text navbar-item" href="/admin/index">Admin Panel</Nav.Link>
                )}
=======

                        {/* show user panel user is logged in */}
                        {currentUser && (
                            <Nav.Link className="navbar-text navbar-item" href="/user">User Panel</Nav.Link>
                        )}
                        {/* show admin panel fi user is admin */}
                        {(currentUser && currentUser.isAdmin) && (
                            <Nav.Link className="navbar-text navbar-item" href="/admin/index">Admin Panel</Nav.Link>
                        )}
>>>>>>> Stashed changes
                    </Nav>
                {/* show username and logout button if logged in, otherwise, show log in and sign up buttons */}
                    <Nav>
<<<<<<< Updated upstream
                {currentUser ? (
                    <span className="navbar-item">
                        <button className="button1">
                            <Nav.Link href="/user" id="username-text" className="button-text">
                                {currentUser.username}
                            </Nav.Link>
                        </button>
                    </span>
                ) : (
                    <span className="navbar-item">
                        <button className="button1">
                            <Nav.Link href="/login" className="button-text">Log In</Nav.Link>
                        </button>
                    </span>
                )}
                {currentUser ? (
                    <span className="navbar-item">
                        <button className="button2" onClick={this.logOut}>
                            <Nav.Link href="/login" className="button-text">Log Out</Nav.Link>
                        </button>
                    </span>
                ) : (
                    <span className="navbar-item">
                        <button className="button2">
                            <Nav.Link href="/signup" className="button-text">Sign Up</Nav.Link>
                        </button>
                    </span>
                )}
                </Nav>
=======
                        {currentUser ? (
                            <span className="navbar-item">
                                <button className="button1">
                                    <Nav.Link href="/user/profile" id="username-text" className="button-text">
                                        {currentUser.username}
                                    </Nav.Link>
                                </button>
                            </span>
                        ) : (
                            <span className="navbar-item">
                                <button className="button1">
                                    <Nav.Link href="/login" className="button-text">Log In</Nav.Link>
                                </button>
                            </span>
                        )}
                        {currentUser ? (
                            <span className="navbar-item">
                                <button className="button2" onClick={this.logOut}>
                                    <Nav.Link href="/" className="button-text">Log Out</Nav.Link>
                                </button>
                            </span>
                        ) : (
                            <span className="navbar-item">
                                <button className="button2">
                                    <Nav.Link href="/signup" className="button-text">Sign Up</Nav.Link>
                                </button>
                            </span>
                        )}
                    </Nav>
>>>>>>> Stashed changes
                </Navbar.Collapse>
            </Navbar>
        );
    }
}