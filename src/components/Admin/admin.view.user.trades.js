import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import TradeService from "../../services/trade.service";

// format the date to be readable from Date object
const formatDate = (d) => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const dateObj = new Date(d);
    const date = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()];   // add leading 0 to month
    const year = dateObj.getFullYear();
    const hour = ("0" + dateObj.getHours()).slice(-2);   // add leading 0 to hour
    const minute = ("0" + (dateObj.getMinutes())).slice(-2);   // add leading 0 to minute
    const second = ("0" + (dateObj.getSeconds())).slice(-2);

    return `${month} ${date}, ${year} at ${hour}:${minute}:${second}`;
}

export default class AdminViewUserTrades extends Component {
    constructor(props) {
        super(props);

        this.state = {
            trades: [],
            successful: false,
            message: "",
            sortOrder: 0,
            sort: "none",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10,
            totalResults: 0
        }
    }

    load = () => {
        TradeService.getAllTrades(
            this.state.sort,
            parseInt(new URLSearchParams(window.location.search).get('page')),
            this.state.limit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
                trades: response.data.trades
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

    cancel = (trade) => {
        if (window.confirm("Are you sure you want to cancel trade " + trade._id + "?")) {
            TradeService.cancelTrade(trade._id)
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

    delete = (trade) => {
        if (window.confirm("Are you sure you want to delete trade " + trade._id + "?")) {
            TradeService.deleteTrade(trade._id)
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
        const sortIcon = (
            <FontAwesomeIcon
                className="SortIcon"
                icon={this.state.sortOrder == 1
                    ? faAngleUp
                    : this.state.sortOrder == -1 && faAngleDown} />
        );
        const tableHeader = (str) => (
            <th onClick={this.sort}>{str} {sortIcon}</th>
        );

        return (
            <table id="data-table" className="table">
                <thead>
                    <tr>
                        {tableHeader("ID")}
                        {tableHeader("Owner")}
                        {tableHeader("Owner item")}
                        {tableHeader("Trader")}
                        {tableHeader("Trader item")}
                        {tableHeader("Location (from)")}
                        {tableHeader("Location (to)")}
                        {tableHeader("Created date")}
                        {tableHeader("Update date")}
                        {tableHeader("Completion date")}
                        {tableHeader("Status")}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.trades.map((object) => (
                        <tr key={object._id}>
                            <td style={{ maxWidth: '6em', wordWrap: 'break-word' }}>{object._id}</td>
                            <td>{object.user_buyer.username}</td>
                            <td>{object.item.name}</td>
                            <td>{object.user_seller.username}</td>
                            <td>{object.item.forItemName}</td>
                            <td>{object.user_seller.location[0]}</td>
                            <td>{object.user_buyer.location[0]}</td>
                            <td>{formatDate(object.createdAt)}</td>
                            <td>{formatDate(object.updatedAt)}</td>
                            <td>{object.finalization_date ? formatDate(object.finalization_date) : "None"}</td>
                            <td>{object.status}</td>
                            <td>
                                <Link to={`/trade/${object._id}`} className="btn btn-info ActionButton">Visit</Link>
                                <Link to={`/user/edit/trade/${object._id}`} className="btn btn-primary ActionButton">Edit</Link>
                                <button key={object._id.toString() + "-cancel"} onClick={() => this.cancel(object)} className="btn btn-warning ActionButton">Cancel</button>
                                <button key={object._id.toString() + "-delete"} onClick={() => this.delete(object)} className="btn btn-danger ActionButton">Delete</button>

                                {this.state.message && (
                                    <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                                        {this.state.message}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
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
                    <title>View User Trades</title>
                </Helmet>
                <div className="title">Trades</div>
                <hr className="section-line" />
                <div className="ResultsAndSort">
                    <h3 id="results">Total: {this.state.totalResults}</h3>
                </div>
                <br />
                <br />
                <div className="white-container">
                    {this.state.trades.length == 0 ? this.displayCreateItem() : this.showListings()}
                </div>
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>
            </div>
        );
    }
}