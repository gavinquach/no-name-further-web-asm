import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import ItemService from "../../services/item.service";

export default class UserViewItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            successful: false,
            message: "",
            sort: "none",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10,
            totalResults: 0
        }
    }

    load = () => {
        UserService.viewUserItems(
            AuthService.getCurrentUser().id,
            this.state.sort,
            parseInt(new URLSearchParams(window.location.search).get('page')),
            this.state.limit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
                items: response.data.items
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

    delete = (item) => {
        if (window.confirm("Are you sure you want to delete listing " + item.name + "?")) {
            ItemService.deleteItem(item._id)
                .then((response) => {
                    if (response.status == 200 || response.status == 201) {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        this.load();
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

    showListings = () => {
        return (
            <table className="container table table-striped" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>Type</th>
                        <th>For item name</th>
                        <th>For item quantity</th>
                        <th>For item type</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="table-data">
                    {this.state.items.map((object, index) => (
                        <tr>
                            <td>{object.name}</td>
                            <td>{object.quantity}</td>
                            <td>{object.type.name}</td>
                            <td>{object.forItemName}</td>
                            <td>{object.forItemQty}</td>
                            <td>{object.forItemType.name}</td>
                            <td>
                                <Link to={`/user/edit/item/${object._id}`} className="btn btn-primary">Edit</Link>
                                <span style={{ paddingRight: '1.5em' }} />
                                <button onClick={() => this.delete(object)} className="btn btn-danger">Delete</button>

                                {this.state.message && (
                                    <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                        {this.state.message}
                                    </div>)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }

    displayCreateItem = () => {
        return (
            <div style={{ textAlign: 'center', marginTop: '4em' }}>
                <h5>You currently have no listings. Start trading now!</h5>
                <Link to="/user/create"><button className="Create-btn">Add listing</button></Link>
            </div>
        );
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

    render() {
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
                    <title>Item Listing</title>
                </Helmet>
                <div className="title">Listings</div>
                <hr className="section-line" />
                <div className="ResultsAndSort">
                    <h3 id="results">Total: {this.state.totalResults}</h3>
                </div>
                <br />
                <div className="menu white-container">
                    {this.state.items.length == 0 ? this.displayCreateItem() : this.showListings()}
                </div>
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>
            </div>
        );
    }
}