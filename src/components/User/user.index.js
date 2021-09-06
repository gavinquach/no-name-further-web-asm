import React, { Component } from "react";
import { Router, Switch, useRouteMatch } from "react-router-dom";

import "../../css/UserPages.css";

export default class UserIndex extends Component {

        render(){
        return (
            <div className = "page-container">
                <div className="title">User Panel</div>
                <hr className="section-line" />
                <div className="white-container">
                    <div className="user-menu Center-text">
                        <a href="/user/profile" className="Button-item">
                            <button className="user-menu-button">View your profile</button>
                        </a>
                        <a href="/user/password" className="Button-item">
                            <button className="user-menu-button">Change your password</button>
                        </a>
                        <a href="/user/items" className="Button-item">
                            <button className="user-menu-button">View your items</button>
                        </a>
                        <a href="/user/create" className="Button-item">
                            <button className="user-menu-button">Add item listing</button>
                        </a>
                    </div>
                </div>
            
            </div>
        );
        }
    }
