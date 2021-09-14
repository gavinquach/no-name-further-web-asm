import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import "../../css/UserPages.css";
import AuthService from "../../services/auth.service";

export default class UserIndex extends Component {
    render() {
        window.scrollTo(0, 0); // automatically scroll to top
        return (
            <div className="page-container">
                <Helmet>
                    <title>User Panel</title>
                </Helmet>
                <div className="title">User Panel</div>
                <hr className="section-line" />
                <div className="white-container">
                    <div className="user-menu Center-text">
                        <Link to="/user/profile#myprofile" className="Button-item">
                            <button className="user-menu-button">View your profile</button>
                        </Link>
                        <Link to="/user/profile#password" className="Button-item">
                            <button className="user-menu-button">Change your password</button>
                        </Link>
                        {!AuthService.isRootAccount() && (
                            <Link to="/user/items" className="Button-item">
                                <button className="user-menu-button">View your items</button>
                            </Link>
                        )}
                        {!AuthService.isRootAccount() && (
                            <Link to="/user/create" className="Button-item">
                                <button className="user-menu-button">Add item listing</button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}
