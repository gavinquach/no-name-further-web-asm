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
        }, () => this.load());
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

    loadSortByField = (field, order) => {
        UserService.viewAdminsSortedByField(
            field,
            order == 0 ? 1 : order,
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

        if (field == "_id" && (sortOrder == 0 || sortOrder == 1)) {
            this.load();
        } else {
            this.loadSortByField(field, sortOrder);
        }

        // update sort column
        this.setState({
            sortColumn: column,
            sortOrder: sortOrder
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

        const roles = AuthService.getRoles();
        if (roles.includes("ROLE_VIEW_ADMIN") && !roles.includes("ROLE_EDIT_ADMIN") && !roles.includes("ROLE_DELETE_ADMIN")) {
            return (
                <tr>
                    {tableHeader("Username")}
                    {tableHeader("Email")}
                    <th>Roles</th>
                </tr>
            )
        } else if (roles.includes("ROLE_EDIT_ADMIN")) {
            return (
                <tr>
                    {tableHeader("Username")}
                    {tableHeader("Email")}
                    <th>Roles</th>
                    <th>Action</th>
                </tr>
            )
        } else if (!roles.includes("ROLE_VIEW_ADMIN") && (roles.includes("ROLE_EDIT_ADMIN") || roles.includes("ROLE_DELETE_ADMIN"))) {
            return (
                <tr>
                    {tableHeader("Username")}
                    <th>Action</th>
                </tr>
            )
        } else {
            return (
                <tr>
                    {tableHeader("Username")}
                    {tableHeader("Email")}
                    <th>Roles</th>
                    <th>Action</th>
                </tr>
            )
        }
    }

    tableRows = () => {
        return this.state.users.map((object) => (
            <tr key={object._id}>
                <td>
                    {object.username}
                </td>
                {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_VIEW_ADMIN") || AuthService.getRoles().includes("ROLE_EDIT_ADMIN")) ?
                    <td>{object.email}</td>
                    : null}
                {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_VIEW_ADMIN") || AuthService.getRoles().includes("ROLE_EDIT_ADMIN")) ?
                    <td>
                        {object.roles && object.roles.map((role, index) =>
                            index == object.roles.length - 1 ? role.name : role.name + ", ")}
                    </td>
                    : null}
                {this.showButtons(object)}
            </tr>
        ));
    }

    showButtons = (object) => {
        const roles = AuthService.getRoles();
        const id = object._id;
        if (roles.includes("ROLE_ROOT") || roles.includes("ROLE_EDIT_ADMIN") || roles.includes("ROLE_DELETE_ADMIN")) {
            return (
                <td>
                    {
                        // hide edit button when:
                        // admin's id is the current logged-in admin,
                        // admin is root,
                        // current admin isn't root,
                        // admin doesn't have edit_admin role.
                        object._id != AuthService.getCurrentUser().id &&
                            object.username != "root" &&
                            (roles.includes("ROLE_ROOT") || roles.includes("ROLE_EDIT_ADMIN"))
                            ? <Link to={`/admin/edit/admin/${id}`} className="btn btn-primary ActionButton">Edit</Link>
                            : null
                    }

                    {
                        // hide delete button when:
                        // admin's id is the current logged-in admin,
                        // admin is root,
                        // current admin isn't root,
                        // admin doesn't have delete_admin role.
                        object._id != AuthService.getCurrentUser().id &&
                            object.username != "root" &&
                            (roles.includes("ROLE_ROOT") || roles.includes("ROLE_DELETE_ADMIN"))
                            ? <button onClick={() => this.delete(object)} className="btn btn-danger ActionButton">Delete</button>
                            : null
                    }
                </td>
            )
        }
    }

    render() {
        // redirect to home page when unauthorized user tries to view
        if (!AuthService.isRoot() && !AuthService.getRoles().includes("ROLE_VIEW_ADMIN") && !AuthService.getRoles().includes("ROLE_CREATE_ADMIN") && !AuthService.getRoles().includes("ROLE_DELETE_ADMIN")) {
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