import { React, Component } from 'react';
import { Navbar, NavDropdown, Nav, Image } from 'react-bootstrap'; // npm install react-bootstrap@next bootstrap@5.0.2=

import logo from './images/lazyslob-logo.png';
import './css/NavigationBar.css'

import AuthService from "./services/auth.service";

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
            <Navbar className="Flexbox-container Navbar" >
                <Navbar.Brand href="/"><Image src={logo} fluid style={{ marginLeft: '1em', width: '3em', maxWidth: '3em', height: "100%" }} /></Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <NavDropdown className="Nav-bar-text Nav-bar-item" title={<span className="Nav-bar-text">Community</span>} id="basic-nav-dropdown">
                    <NavDropdown.Item href="/">aaaaa</NavDropdown.Item>
                    <NavDropdown.Item href="/">aaaaa</NavDropdown.Item>
                    <NavDropdown.Item href="/">aaaaa</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/">aaaaa</NavDropdown.Item>
                </NavDropdown>

                {/* show user panel user is logged in */}
                {currentUser && (
                    <Nav.Link className="Nav-bar-text Nav-bar-item" href="/user/index">User Panel</Nav.Link>
                )}
                {/* show admin panel fi user is admin */}
                {showAdminPanel && (
                    <Nav.Link className="Nav-bar-text Nav-bar-item" href="/admin/index">Admin Panel</Nav.Link>
                )}

                {/* show username and logout button if logged in, otherwise, show log in and sign up buttons */}
                {currentUser ? (
                    <span className="Nav-bar-item Push-left">
                        <button className="Sign-up-btn">
                            <Nav.Link href="/user" id="username-text">
                                {currentUser.username}
                            </Nav.Link>
                        </button>
                    </span>
                ) : (
                    <span className="Nav-bar-item Push-left">
                        <button className="Log-in-out-btn">
                            <Nav.Link href="/login" className="Log-in-out-text">Log In</Nav.Link>
                        </button>
                    </span>
                )}
                {currentUser ? (
                    <span className="Nav-bar-item">
                        <button className="Log-in-out-btn" onClick={this.logOut}>
                            <Nav.Link href="/login" className="Log-in-out-text">Log Out</Nav.Link>
                        </button>
                    </span>
                ) : (
                    <span className="Nav-bar-item">
                        <button className="Sign-up-btn">
                            <Nav.Link href="/signup" className="Sign-up-text">Sign Up</Nav.Link>
                        </button>
                    </span>
                )}
            </Navbar>
        );
    }
}