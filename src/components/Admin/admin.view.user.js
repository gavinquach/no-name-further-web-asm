import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom'
import { Helmet } from "react-helmet";

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import UserTableRow from '../ViewUserTableRow';

export default class AdminViewUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            sort: "none",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10,
            totalResults: 0
        };
    }

    load = () => {
        UserService.viewUsers(
            this.state.sort,
            parseInt(new URLSearchParams(window.location.search).get('page')),
            this.state.limit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
                users: response.data.users
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
                    <title>View Users</title>
                </Helmet>
                <h1 className="title">View Users</h1>
                <hr className="section-line" />
                <table className="container table table-striped" style={{ marginTop: 20 }}>
                    <thead>
                        {this.tableHeader()}
                    </thead>
                    <tbody id="table-data">
                        {this.tabRow()}
                    </tbody>
                </table>
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>
            </div>
        );
    }
}