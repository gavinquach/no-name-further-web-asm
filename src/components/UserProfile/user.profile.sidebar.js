import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class ProfileSideBar extends Component {
    render() {
        return (
            <div className="profile-sidebar">
                <ul className="profile-list">
                    <Link style={{ textDecoration: "black" }} to="/user/profile#myprofile"><li>
                        Info</li>
                    </Link>
                    <Link style={{ textDecoration: "black" }} to="/user/profile#password">
                        <li>Change Password</li>
                    </Link>
                    <Link style={{ textDecoration: "black" }} to="/user/notifications">
                        <li>Notifications</li>
                    </Link>
                </ul>
            </div>
        );
    }
}