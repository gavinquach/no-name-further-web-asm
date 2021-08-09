import React, { Component } from 'react';

import NavigationBar from "../NavigationBar"
import AuthService from "../services/auth.service";

import '../css/UserPages.css'

const manageAdmin = (
    <div className="Flexbox-item Center-text">
        <h2 className="Center-text">Manage admins</h2>
        <a href="/admin/view/admin" className="Button-item">
            <button className="Redirect-btn">View admins</button>
        </a>
        <a href="/admin/create/admin" className="Button-item">
            <button className="Redirect-btn">Create admin</button>
        </a>
    </div>
)

const manageUser = (
    <div className="Flexbox-item Center-text">
        <h2 className="Center-text">Manage users</h2>
        <a href="/admin/view/user" className="Button-item">
            <button className="Redirect-btn">View users</button>
        </a>
        <a href="/admin/create/user" className="Button-item">
            <button className="Redirect-btn">Create user</button>
        </a>
    </div>
)

export default class AdminIndex extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <h1 className="Center-text">Admin Panel</h1>
                <br />
                <div className="Flexbox container" style={{ width: '80em' }}>
                    {AuthService.hasManageAdminRole() ? manageAdmin : null}
                    {(AuthService.hasManageAdminRole() && AuthService.hasManageUserRole()) ? <span className="Vertical-line" /> : null}
                    {AuthService.hasManageUserRole() ? manageUser : null}
                </div>
            </div>
        );
    }
}