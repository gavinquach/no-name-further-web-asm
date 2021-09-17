import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { Link, Redirect } from "react-router-dom";

import "../../css/TradeDetails.css";
import '../../css/Notifications.css';

import AuthService from "../../services/auth.service";
import TradeService from "../../services/trade.service";
import ItemService from "../../services/item.service";

import ProfileSideBar from "./user.profile.sidebar";

export default class Trades extends Component {
    constructor(props) {
        super(props);
        this.state = {
            trades: [],
            message: "No trades found.",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10
        };
    }

    load = () => {
        // get hash value in URL
        let hash = window.location.hash.replace("#", "");
        if (!hash || hash == "") hash = "pending";

        TradeService.getUserTrades(
            AuthService.getCurrentUser().id,
            hash.toUpperCase(),
            "-updatedAt",
            this.state.currentPage,
            this.state.limit
        ).then(async (response) => {
            const trades = response.data.trades;
            await Promise.all(
                response.data.trades.map(async (trade) => {
                    await ItemService.viewOneItem(
                        trade.item._id
                    ).then(res => {
                        trades.map((trade) => {
                            if (trade.item._id == res.data._id) {
                                trade.item = res.data;
                            }
                        });
                    }).catch((err) => {
                        if (err.response && err.response.status != 500) {
                            console.log(err.response.data.message);
                        } else {
                            console.log(err);
                        }
                    });
                })
            );

            this.setState({
                totalPages: response.data.totalPages,
                trades: trades
            }, () => this.loadPageButtons());
        }).catch((error) => {
            this.setState({
                totalPages: 0,
                currentPage: 0,
                trades: []
            }, () => this.loadPageButtons());
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        if (AuthService.isRootAccount()) {
            return;
        }
        this.load();
    }

    getTrades = () => {
        this.setState({
            currentPage: 1
        }, () => {
            const url = new URL(window.location.href);
            const search_params = url.searchParams;
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString() + window.location.hash;
            this.props.history.push(pageURL);
        });

        // set timer because hash is undefined in URL if retrieved too early
        setTimeout(() => {
            this.load();
        }, 100);
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
        if (AuthService.isRootAccount()) {
            return (
                <div className="page-container my-profile">
                    <Helmet>
                        <title>Trades</title>
                    </Helmet>
                    <ProfileSideBar />
                    <div className="profile-page">
                        <div className="title">Trades</div>
                        <hr className="section-line" />
                        <div style={{ padding: '1em 2em', textAlign: 'center' }}>
                            <h2>Root account can't make trades</h2>
                        </div>
                    </div>
                </div>
            )
        }
        const tradeStatuses = {
            PENDING: "Ongoing",
            WAITING_APPROVAL: "Waiting approval",
            REQUESTS: "Requests from users",
            CANCELLED: "Cancelled",
            EXPIRED: "Expired",
            DENIED: "Denied requests"
        };
        const tradeStatusKeys = Object.keys(tradeStatuses);
        const trades = this.state.trades && this.state.trades;
        let hash = window.location.hash.replace("#", "");

        if (!hash || hash == "") hash = "PENDING";
        else if (hash == "requests") hash = "WAITING_APPROVAL";

        // ========== validate GET parameters ==========
        const url = new URL(window.location.href);
        const search_params = url.searchParams;
        const page = search_params.get("page");
        if (!page || page === "") {
            search_params.set("page", 1);
            const pageURL = url.pathname + "?" + search_params.toString();
            return <Redirect to={pageURL} />
        }
        // ========== end of GET param validation ==========

        return (
            <div className="page-container my-profile">
                <Helmet>
                    <title>Trades</title>
                </Helmet>
                <ProfileSideBar />
                <div className="profile-page">
                    <div className="title">Trades</div>
                    <hr className="section-line" />
                    <div className="NotificationTypes">
                        <div className="NotificationTypesRow" onClick={this.getTrades}>
                            {tradeStatusKeys.map((status) => (
                                <a href={"#".concat(status.toLowerCase())}
                                    className={"NotificationTypesCell ".concat(
                                        ((status == "PENDING" && window.location.hash == "") || window.location.hash == "#".concat(status.toLowerCase())) && (
                                            "SectionActive"
                                        )
                                    )}>
                                    {tradeStatuses[status]}
                                </a>
                            ))}
                        </div>
                    </div>

                    <br />
                    <div className="page-buttons">
                        {this.state.pageButtons}
                    </div>
                    <br />

                    {this.state.trades.length > 0 ? (
                        <span>
                            {trades.map((trade) =>
                                trade.status === hash.toUpperCase() && (
                                    <span>
                                        <Link to={"/trade/" + trade._id} className="ItemPanel">
                                            {trade.item.images.map((image, index) =>
                                                image.cover && (
                                                    <img key={index + "-img"} className="ItemImage" src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                                )
                                            )}
                                            <div className="ItemDetails">
                                                <div style={{ textAlign: 'center' }}><b>{trade.item.name}</b></div>
                                                <hr style={{ border: '1px solid black' }} />
                                                <div>Category: <b>{trade.item.type.name}</b><br></br>
                                                Quantity: <b>{trade.item.quantity}</b></div>
                                            </div>
                                            <div id="for">for</div>
                                            <div className="ItemDetails">
                                                <div style={{ textAlign: 'center' }}><b>{trade.item.forItemName}</b></div>
                                                <hr style={{ border: '1px solid black' }} />
                                                <div>Category: <b>{trade.item.forItemType.name}</b><br></br>
                                                Quantity: <b>{trade.item.forItemQty}</b></div>
                                            </div>
                                        </Link>
                                    </span>
                                ))}
                        </span>
                    ) : (
                        // no trades, display text
                        <div style={{ padding: '1em 2em', textAlign: 'center' }}>
                            <h2>{this.state.message}</h2>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}