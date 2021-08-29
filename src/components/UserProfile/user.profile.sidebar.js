import React, { Component } from "react";
import { Link } from "react-router-dom";

export default class ProfileSideBar extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className="Left-content">
                <ul className="left-item-list">
                    <Link to="/user/">
                        <li className="list-item">
                            Info
                        </li>
                    </Link>
                    <Link to="/user/password">
                        <li className="list-item">
                            Change password
                        </li>
                    </Link>
                </ul>
            </div>
        );
    }
}