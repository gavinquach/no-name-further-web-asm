import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import AdminTableRow from '../ViewAdminTableRow';


import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

export default class AdminViewAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = { users: [] };
    }

    load = () => {
        UserService.viewAdmins()
            .then(response => {
                // console.log(response.data);
                this.setState({ users: response.data.admins });
            })
            .catch((error) => {
                if (error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            })
    }

    componentDidMount() {
        this.load();
    }

    tableHeader = () => {
        const roles = AuthService.getRoles();
        if (roles.includes("ROLE_VIEW_ADMIN") && !roles.includes("ROLE_EDIT_ADMIN") && !roles.includes("ROLE_DELETE_ADMIN")) {
            return (
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Roles</th>
                </tr>
            )
        } else if (roles.includes("ROLE_EDIT_ADMIN")) {
            return (
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Action</th>
                </tr>
            )
        } else if (!roles.includes("ROLE_VIEW_ADMIN") && (roles.includes("ROLE_EDIT_ADMIN") || roles.includes("ROLE_DELETE_ADMIN"))) {
            return (
                <tr>
                    <th>Username</th>
                    <th>Action</th>
                </tr>
            )
        } else {
            return (
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Roles</th>
                    <th>Action</th>
                </tr>
            )
        }
    }

    tabRow = () => {
        return this.state.users.map(function (object, i) {
            return <AdminTableRow obj={object} key={i} />;
        });
    }

    render() {
        // redirect to home page when unauthorized user tries to view
        if (!AuthService.isRoot() && !AuthService.getRoles().includes("ROLE_VIEW_ADMIN") && !AuthService.getRoles().includes("ROLE_CREATE_ADMIN") && !AuthService.getRoles().includes("ROLE_DELETE_ADMIN")) {
            return <Redirect to='/admin/index' />
        }
        return (
            <div>
                <br />
                <h3 align="center">View Admins</h3>
                <table className="container table table-striped" style={{ marginTop: 20 }}>
                    <thead>
                        {this.tableHeader()}
                    </thead>
                    <tbody id="table-data">
                        {this.tabRow()}
                    </tbody>
                </table>
                {this.state.message && (
                    <div className="form-group">
                        <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                            {this.state.message}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}