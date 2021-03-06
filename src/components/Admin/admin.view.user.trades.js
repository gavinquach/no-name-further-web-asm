import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';

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
            sort: "none",
            sortField: "_id",
            sortOrder: 0,
            sortColumn: "",
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

    loadSortByField = () => {
        TradeService.getAllTradesSortByField(
            this.state.sortField,
            this.state.sortOrder == 0 ? 1 : this.state.sortOrder,
            parseInt(new URLSearchParams(window.location.search).get('page')),
            this.state.limit
        ).then(response => {
            this.setState({
                totalPages: response.data.totalPages,
                totalResults: response.data.totalResults,
                trades: response.data.trades
            }, () => {
                console.log(response.data.trades);
                this.loadPageButtons()
            });
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
            case "ID":
                field = "_id"
                break;
            case "Owner":
                field = "user_seller"
                break;
            case "Owner item":
                field = "item.name"
                break;
            case "Trader":
                field = "user_buyer"
                break;
            case "Trader item":
                field = "item.forItemName"
                break;
            case "Location (from)":
                field = "user_seller.location"
                break;
            case "Location (to)":
                field = "user_buyer.location"
                break;
            case "Created date":
                field = "createdAt"
                break;
            case "Last updated date":
                field = "updatedAt"
                break;
            case "Completion date":
                field = "finalization_date"
                break;
            case "Status":
                field = "status"
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

    showTrades = () => {
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

        const tradeStatus = {
            PENDING: "Ongoing",
            WAITING_APPROVAL: "Waiting approval from owner",
            DENIED: "Request denied by owner",
            CANCELLED: "Cancelled",
            EXPIRED: "Expired"
        };

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
                        {tableHeader("Last updated date")}
                        {tableHeader("Completion date")}
                        {tableHeader("Status")}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.trades.map((object) => (
                        <tr key={object._id}>
                            <td style={{ maxWidth: '6em', wordWrap: 'break-word' }}>{object._id}</td>
                            <td>{object.user_seller ? object.user_seller.username : "N/A"}</td>
                            <td>{object.item.name}</td>
                            <td>{object.user_buyer ? object.user_buyer.username : "N/A"}</td>
                            <td>{object.item.forItemName}</td>
                            <td>{object.user_seller ? object.user_seller.location[0] : "N/A"}</td>
                            <td>{object.user_buyer ? object.user_buyer.location[0] : "N/A"}</td>
                            <td>{formatDate(object.createdAt)}</td>
                            <td>{formatDate(object.updatedAt)}</td>
                            <td>{object.finalization_date ? formatDate(object.finalization_date) : "None"}</td>
                            <td>{tradeStatus[object.status]}</td>
                            <td>
                                <Link to={`/trade/${object._id}`} className="btn btn-info ActionButton">Visit</Link>
                                {/* <Link to={`/user/edit/trade/${object._id}`} className="btn btn-primary ActionButton">Edit</Link> */}
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
                    {this.state.trades.length > 0
                        ? this.showTrades()
                        : (
                            <div style={{ textAlign: 'center', marginTop: '4em' }}>
                                <h2>No trades found</h2>
                            </div>
                        )}
                </div>
                <div className="page-buttons">
                    {this.state.pageButtons}
                </div>
            </div>
        );
    }
}