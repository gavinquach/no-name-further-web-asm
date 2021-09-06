import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class ProfileSideBar extends Component {

    render() {
        return (
            <div className="profile-sidebar">
                <ul className="profile-list">
                   <li style={{marginBottom: "18px"}}><Link  className="profile-item" to="/user/profile">
                        Info
                    </Link>
                    </li>
                    <li ><Link className="profile-item" to="/user/password">
                        Change Password
                    </Link>
                    </li>
                </ul>
            </div>
        );
    }
}