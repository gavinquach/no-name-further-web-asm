import React, { Component } from "react";


import "../../css/UserPages.css";

export default class UserIndex extends Component {
    render() {
        return (
            <div>
                <h1 className="Center-text">USER PANEL</h1>
                <br />
                <div className="Flexbox container" style={{ width: '80em' }}>
                    <div className="Flexbox-item Center-text">
                        <a href="/user" className="Button-item">
                            <button className="user-button">View your profile</button>
                        </a>
                        <a href="/user/password" className="Button-item">
                            <button className="user-button">Change your password</button>
                        </a>
                        <a href="/user/items" className="Button-item">
                            <button className="user-button">View your items</button>
                        </a>
                        <a href="/user/create" className="Button-item">
                            <button className="user-button">Add item listing</button>
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}