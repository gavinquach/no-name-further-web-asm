import React, { Component } from "react";

export default class ProfileSideBar extends Component {
    render() {
        return (
            <div className="profile-sidebar">
                <ul className="profile-list">
                    <a style={{ textDecoration: "black" }} href="/user/profile#myprofile"><li>
                        Info</li>
                    </a>
                    <a style={{ textDecoration: "black" }} href="/user/profile#password">
                        <li>Change Password</li>
                    </a>
                    <a style={{ textDecoration: "black" }} href="/user/notifications">
                        <li>Notifications</li>
                    </a>
                </ul>
            </div>
        );
    }
}