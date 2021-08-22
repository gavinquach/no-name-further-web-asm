import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AuthService from "../services/auth.service";

export default class AdminTableRow extends Component {
    constructor(props) {
        super(props);
        this.delete = this.delete.bind(this);

        this.state = {
            successful: false,
            message: ""
        }
    }

    delete = () => {
        if (this.props.obj._id == AuthService.getCurrentUser().id) {
            this.setState({
                successful: false,
                message: "You can't delete yourself!"
            });
            return;
        }
        if (window.confirm("Are you sure you want to delete admin " + this.props.obj.username + "?")) {
            AuthService.deleteUser(this.props.obj._id)
                .then(
                    response => {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        window.location.reload();
                    },
                    error => {
                        const resMessage =
                            (error.response &&
                                error.response.data &&
                                error.response.data.message) ||
                            error.message ||
                            error.toString();

                        this.setState({
                            successful: false,
                            message: resMessage
                        });
                    }
                );
        }
    }

    demote = () => {

    }

    showButtons = () => {
        const roles = AuthService.getRoles();
        const id = this.props.obj._id;
        if (roles.includes("ROLE_ROOT") || roles.includes("ROLE_EDIT_ADMIN") || roles.includes("ROLE_DELETE_ADMIN")) {
            return (
                <td>
                    {
                        // hide edit button when:
                        // admin's id is the current logged-in admin,
                        // admin is root,
                        // current admin isn't root,
                        // admin doesn't have edit_admin role.
                        this.props.obj._id != AuthService.getCurrentUser().id &&
                            this.props.obj.username != "root" &&
                            (roles.includes("ROLE_ROOT") || roles.includes("ROLE_EDIT_ADMIN")) ?
                            <Link to={`/admin/edit/admin/${id}`} className="btn btn-primary">Edit</Link>
                            : null
                    }

                    {this.props.obj._id != AuthService.getCurrentUser().id &&
                        this.props.obj.username != "root" &&
                        (roles.includes("ROLE_ROOT") || roles.includes("ROLE_DELETE_ADMIN")) ?
                        <span style={{ paddingRight: '1.5em' }} />
                        : null}

                    {
                        // hide delete button when:
                        // admin's id is the current logged-in admin,
                        // admin is root,
                        // current admin isn't root,
                        // admin doesn't have delete_admin role.
                        this.props.obj._id != AuthService.getCurrentUser().id &&
                            this.props.obj.username != "root" &&
                            (roles.includes("ROLE_ROOT") || roles.includes("ROLE_DELETE_ADMIN")) ?
                            <button onClick={this.delete} className="btn btn-danger">Delete</button>
                            : null
                    }

                    {/* {this.props.obj._id != AuthService.getCurrentUser().id &&
                        this.props.obj.username != "root" &&
                        (roles.includes("ROLE_ROOT") || roles.includes("ROLE_DEMOTE_ADMIN")) ?
                        <span style={{ paddingRight: '1.5em' }} />
                        : null}

                    {
                        // hide delete button when:
                        // admin's id is the current logged-in admin,
                        // admin is root,
                        // current admin isn't root,
                        // admin doesn't have demote_admin role.
                        this.props.obj._id != AuthService.getCurrentUser().id &&
                            this.props.obj.username != "root" &&
                            (roles.includes("ROLE_ROOT") || roles.includes("ROLE_DEMOTE_ADMIN")) ?
                            <button onClick={this.demote} className="btn btn-warning">Demote</button>
                            : null
                    } */}

                    {this.state.message && (
                        <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                            {this.state.message}
                        </div>)}
                </td>
            )
        }
    }

    render() {
        return (
            <tr>
                <td>
                    {this.props.obj.username}
                </td>
                {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_VIEW_ADMIN") || AuthService.getRoles().includes("ROLE_EDIT_ADMIN")) ?
                    <td>{this.props.obj.email}</td>
                    : null}
                {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_VIEW_ADMIN") || AuthService.getRoles().includes("ROLE_EDIT_ADMIN")) ?
                    <td>
                        {this.props.obj.roles && this.props.obj.roles.map((role, index) =>
                            index == this.props.obj.roles.length - 1 ? role.name : role.name + ", ")}
                    </td>
                    : null}
                {this.showButtons()}
            </tr>
        );
    }
}
