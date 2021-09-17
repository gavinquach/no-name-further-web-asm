import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

export default class AdminViewAdmin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            sort: "none",
            sortField: "_id",
            sortOrder: 0,
            sortColumn: "",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10,
            totalResults: 0
        };
    }

    load = () => {
        UserService.viewAdmins(
            this.state.sort,
            parseInt(new URLSearchParams(window.location.search).get('page')),
            this.state.limit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
                users: response.data.admins
            }, () => this.loadPageButtons());
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        if (new URLSearchParams(window.location.search).get('page')) {
            this.load();
        }
    }

    updatePage = (page) => {
        this.setState({
            currentPage: page
        }, () => {
            if (this.state.sortField == "_id" && (this.state.sortOrder == 0 || this.state.sortOrder == 1)) {
                this.load();
            } else {
                this.loadSortByField(this.state.sortField, this.state.sortOrder);
            }
        });
    }

    loadPageButtons = () => {
        if (this.state.currentPage > this.state.totalPages) {
            return;
        }

        // get URL for redirect
        const url = new URL(window.location.href);
        const search_params = url.searchParams;

        const buttons = [];
        if (this.state.currentPage > 1) {
            const prevPage = this.state.currentPage - 1;
            search_params.set("page", prevPage);
            const pageURL = url.pathname + "?" + search_params.toString() + window.location.hash;

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(prevPage)}>
                    <button>Previous</button>
                </Link>
            );
        }
        for (let i = 1; i <= this.state.totalPages; i++) {
            // replace page number with index number
            search_params.set("page", i);
            const pageURL = url.pathname + "?" + search_params.toString() + window.location.hash;

            if (i === this.state.currentPage) {
                buttons.push(
                    <button disabled>{i}</button>
                )
            } else {
                buttons.push(
                    <Link to={pageURL} onClick={() => this.updatePage(i)}>
                        <p className="page-button" style={{ display: "inline", margin: '0px 8px' }}>{i}</p>
                    </Link>
                )
            }
        }
        if (this.state.currentPage < this.state.totalPages) {
            const nextPage = this.state.currentPage + 1;
            search_params.set("page", nextPage);
            const pageURL = url.pathname + "?" + search_params.toString() + window.location.hash;

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(nextPage)}>
                    <button>Next</button>
                </Link>
            );
        }
        this.setState({ pageButtons: buttons });
    }

    delete = (object) => {
        if (object._id == AuthService.getCurrentUser().id) {
            this.setState({
                successful: false,
                message: "You can't delete yourself!"
            });
            return;
        }
        if (window.confirm("Are you sure you want to delete admin " + object.username + "?")) {
            UserService.deleteUser(object._id)
                .then((response) => {
                    if (response.status == 200 || response.status == 201) {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        window.location.reload();
                    } else {
                        this.setState({
                            message: response.data.message,
                            successful: false
                        });
                    }
                }).catch((error) => {
                    if (error.response && error.response.status != 500) {
                        this.setState({
                            message: error.response.data.message,
                            successful: false
                        });
                    } else {
                        this.setState({
                            message: `${error.response.status} ${error.response.statusText}`,
                            successful: false
                        });
                    }
                });
        }
    }

    loadSortByField = () => {
        UserService.viewAdminsSortedByField(
            this.state.sortField,
            this.state.sortOrder == 0 ? 1 : this.state.sortOrder,
            parseInt(new URLSearchParams(window.location.search).get('page')),
            this.state.limit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
                users: response.data.admins
            }, () => this.loadPageButtons());
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    sort = (e) => {
        let column = e.currentTarget.id;
        let sortOrder = this.state.sortOrder;

        // user is clicking onto another column
        if (this.state.sortColumn != column) {
            sortOrder = 1;
        }
        // user is clicking onto the same column
        else {
            // handle the cycle of ordering on user button click
            if (this.state.sortOrder == 0) {
                sortOrder = 1;
            } else if (this.state.sortOrder == 1) {
                sortOrder = -1;
            } else if (this.state.sortOrder == -1) {
                sortOrder = 0;
                column = "";
            }
        }

        let field = "_id";
        switch (column) {
            case "Username":
                field = "username";
                break;
            case "Email":
                field = "email";
                break;
            default:
                field = "_id";
        }

        // update sort column
        this.setState({
            sortField: field,
            sortColumn: column,
            sortOrder: sortOrder
        }, () => {
            if (this.state.sortField == "_id" && (this.state.sortOrder == 0 || this.state.sortOrder == 1)) {
                this.load();
            } else {
                this.loadSortByField();
            }
        });
    }

    tableHeaders = () => {
        let sortIcon = null;
        if (this.state.sortColumn) {
            if (this.state.sortOrder == 1) {
                sortIcon = <FontAwesomeIcon className="SortIcon" icon={faAngleUp} />
            } else if (this.state.sortOrder == -1) {
                sortIcon = <FontAwesomeIcon className="SortIcon" icon={faAngleDown} />
            }
        }

        const tableHeader = (str) => {
            if (this.state.sortColumn == str) {
                return (
                    <th id={str} onClick={this.sort} className="HasHover">
                        <div style={{ display: 'inline' }}>{str}{sortIcon}</div>
                    </th>
                );
            } else {
                return (
                    <th id={str} onClick={this.sort} className="HasHover">
                        <div style={{ display: 'inline' }}>{str}</div>
                    </th>
                );
            }
        };

        return (
            <tr>
                {tableHeader("Username")}
                {tableHeader("Email")}
                {tableHeader("Phone")}
                {tableHeader("Location")}
                <th>Roles</th>
                <th>Action</th>
            </tr>
        );
    }

    tableRows = () => {
        return this.state.users.map((object) => (
            <tr key={object._id}>
                <td>{object.username}</td>
                <td>{object.email}</td>
                <td>{object.phone}</td>
                <td>
                    {object.location[0] && object.location[0] ? (
                        object.location[1] + ", " + object.location[0]
                    ) : (
                        null
                    )}
                </td>
                <td>
                    {(AuthService.hasManageAdminRole()) &&
                        object.roles && object.roles.map((role, index) =>
                            index == object.roles.length - 1
                                ? role.name
                                : role.name + ", ")
                    }
                </td>
                {this.showButtons(object)}
            </tr>
        ));
    }

    showButtons = (object) => {
        const roles = AuthService.getRoles();
        const adminIsRoot = () => {
            let isRoot = false;
            object.roles.map((role) => {
                if (role.name == "root") isRoot = true;
            });
            return isRoot;
        }
        return (
            <td>
                {
                    // show edit button when:
                    // the other admin's id is not the current admin,
                    // the other admin is not root account,
                    // current admin is has root role,
                    // current admin isn't root account,
                    // admin doesn't have edit_admin role and the other admin is not root.
                    object._id != AuthService.getCurrentUser().id
                        && object.username != "root"
                        && (AuthService.isRootAccount() || AuthService.isRoot() || (roles.includes("ROLE_EDIT_ADMIN") && !adminIsRoot(object)))
                        ? <Link to={`/admin/edit/admin/${object.username}`} className="btn btn-primary ActionButton">Edit</Link>
                        : null
                }

                {
                    // show delete button when:
                    // the other admin's id is not the current admin,
                    // the other admin is not root account,
                    // current admin is has root role,
                    // current admin isn't root account,
                    // admin doesn't have delete_admin role and the other admin is not root.
                    object._id != AuthService.getCurrentUser().id
                        && object.username != "root"
                        && (AuthService.isRootAccount() || AuthService.isRoot() || (roles.includes("ROLE_DELETE_ADMIN") && !adminIsRoot(object)))
                        ? <button onClick={() => this.delete(object)} className="btn btn-danger ActionButton">Delete</button>
                        : null
                }
            </td>
        );
    }

    render() {
        // redirect to home page when unauthorized user tries to view
        if (!AuthService.isRoot() && !AuthService.hasManageAdminRole()) {
            return <Redirect to='/admin/index' />
        }
        // ========== validate GET parameters ==========
        const url = new URL(window.location.href);
        const search_params = url.searchParams;
        const page = search_params.get("page");
        if (!page || page === "") {
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString();
            return <Redirect to={pageURL} />
        }
        if (page > 1 && page > this.state.totalPages) {
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString();
            return <Redirect to={pageURL} />
        }
        // ========== end of GET param validation ==========

        return (
            <div className="page-container">
                <Helmet>
                    <title>View Admins</title>
                </Helmet>
                <h1 className="title">View Admins</h1>
                <hr className="section-line" />
                <div className="ResultsAndSort">
                    <h3 id="results">Total: {this.state.totalResults}</h3>
                </div>
                <br />
                <br />
                <table id="data-table" className="table">
                    <thead>
                        {this.tableHeaders()}
                    </thead>
                    <tbody>
                        {this.tableRows()}
                    </tbody>
                </table>
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>
            </div>
        );
    }
}