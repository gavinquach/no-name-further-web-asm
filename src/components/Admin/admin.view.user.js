import React, { Component } from 'react';
import { Redirect } from 'react-router-dom'

import UserTableRow from '../ViewUserTableRow';


import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

export default class AdminViewUser extends Component {
    constructor(props) {
        super(props);
        this.state = { users: [] };
    }

    load = () => {
        UserService.viewUsers()
            .then(response => {
                // console.log(response.data);
                this.setState({ users: response.data.users });
            }).catch((error) => {
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
        if (roles.includes("ROLE_VIEW_USER") && !roles.includes("ROLE_EDIT_USER") && !roles.includes("ROLE_DELETE_USER")) {
            return (
                <tr>
                    <th>Username</th>
                    <th>Email</th>
                </tr>
            )
        } else if (!roles.includes("ROLE_VIEW_USER") && (roles.includes("ROLE_EDIT_USER") || roles.includes("ROLE_DELETE_USER"))) {
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
                    <th>Action</th>
                </tr>
            )
        }
    }

    tabRow = () => {
        return this.state.users.map(function (object, i) {
            return <UserTableRow obj={object} key={i} />
        });
    }

    render() {
        // redirect to home page when unauthorized admin tries to view
        if (!AuthService.isRoot() && !AuthService.getRoles().includes("ROLE_VIEW_USER") && !AuthService.getRoles().includes("ROLE_CREATE_USER") && !AuthService.getRoles().includes("ROLE_DELETE_USER")) {
            return <Redirect to='/admin/index' />
        }
        return (
            <div>
                <br />
                <h3 align="center">View Users</h3>
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