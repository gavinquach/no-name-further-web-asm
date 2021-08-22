import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AuthService from "../services/auth.service";

export default class UserTableRow extends Component {
    constructor(props) {
        super(props);
        this.delete = this.delete.bind(this);

        this.state = {
            successful: false,
            message: ""
        }
    }

    delete = () => {
        // admin isn't a user but just putting it here because why not...
        if (this.props.obj._id == AuthService.getCurrentUser().id) {
            this.setState({
                successful: false,
                message: "You can't delete yourself!"
            });
            return;
        }
        if (window.confirm("Are you sure you want to delete user " + this.props.obj.username + "?")) {
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

    showButtons = () => {
        const roles = AuthService.getRoles();
        if (AuthService.isRoot() || roles.includes("ROLE_EDIT_USER") || roles.includes("ROLE_DELETE_USER")) {
            return (
                <td>
                    {(AuthService.isRoot() || roles.includes("ROLE_EDIT_USER")) ?
                        <Link to={`/admin/edit/user/${this.props.obj._id}`} className="btn btn-primary">Edit</Link>
                        : null}

                    {(AuthService.isRoot() || roles.includes("ROLE_DELETE_USER")) ?
                        <span style={{ paddingRight: '1.5em' }} />
                        : null}

                    {(AuthService.isRoot() || roles.includes("ROLE_DELETE_USER")) ?
                        <button onClick={this.delete} className="btn btn-danger">Delete</button>
                        : null}

                    {/* {this.props.obj._id != AuthService.getCurrentUser().id &&
                        this.props.obj.username != "root" &&
                        (roles.includes("ROLE_ROOT") || roles.includes("ROLE_PROMOTE_ADMIN")) ?
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
                            (roles.includes("ROLE_ROOT") || roles.includes("ROLE_PROMOTE_ADMIN")) ?
                            <button onClick={this.demote} className="btn btn-success">Promote</button>
                            : null
                    } */}

                    {this.state.message && (
                        <div className="form-group">
                            <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"}
                                role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )}
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
                {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_VIEW_USER")) ?
                    <td>{this.props.obj.email}</td>
                    : null}
                {this.showButtons()}
            </tr>
        );
    }
}
