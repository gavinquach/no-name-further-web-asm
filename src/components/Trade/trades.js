import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import AuthService from "../../services/auth.service";
import TradeService from "../../services/trade.service";

export default class Trades extends Component {
    constructor(props) {
        super(props);
        this.state = { trades: [] };
    }

    load = () => {
        this.setState({ trades: [] });
        TradeService.getTradesByBuyer(
            AuthService.getCurrentUser().id
        ).then(response => {
            this.setState({ trades: response.data });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        })
    }

    componentDidMount() {
        this.load();
    }

    cancelTrade = (trade) => {
        if (window.confirm("Are you sure you want to request for trade cancellation?")) {
            TradeService.cancelTradeWithNotification(
                trade
            ).then(() => {
                this.load();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    console.log(error.response.data.message);
                } else {
                    console.log(error);
                }
            });
        }
    }

    render() {
        return (
            <div className="page-container">
                <Helmet>
                    <title>Trades</title>
                </Helmet>
                <div className="title">Trades</div>
                <hr className="section-line" />
                <h2>Ongoing</h2>
                {this.state.trades.map((trade, index) =>
                    trade.status === "PENDING" &&
                    <div key={index + "-div1"} style={{ backgroundColor: 'lightgrey', width: '60em', height: '10em', marginBottom: '4em' }}>
                        <Link to={"/trade/" + trade._id}>
                            <div key={index + "-ItemPanel"} className="ItemPanel" style={{ width: '60em', height: '10em' }}>
                                {/* {trade.item.images.map(image =>
                                    image.cover && (
                                        <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} alt={image.name} />
                                    )
                                )} */}
                                <h4>{trade.item.name} for {trade.item.forItemName}</h4>
                            </div>
                        </Link>
                        <button onClick={() => this.cancelTrade(trade)}>Cancel trade</button>
                    </div>
                )}

                <h2>Waiting approval</h2>
                {this.state.trades.map((trade, index) =>
                    trade.status === "WAITING_APPROVAL" && (
                        <div key={index + "-div2"} style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            {trade.item ? (
                                <Link to={"/trade/" + trade._id}>
                                    <div key={index + "-ItemPanel"} className="ItemPanel">
                                        <h4>{trade.item.name} for {trade.item.forItemName}</h4>
                                    </div>
                                </Link>
                            ) : (
                                <div className="ItemPanel">
                                    <h4>(Item removed by owner)</h4>
                                </div>
                            )}
                        </div>
                    )
                )}

                <h2>Cancelled</h2>
                {this.state.trades.map((trade, index) =>
                    trade.status === "CANCELLED" && (
                        <div key={index + "-div2"} style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            {trade.item ? (
                                <Link to={"/trade/" + trade._id}>
                                    <div key={index + "-ItemPanel"} className="ItemPanel">
                                        <h4>{trade.item.name} for {trade.item.forItemName}</h4>
                                    </div>
                                </Link>
                            ) : (
                                <div className="ItemPanel">
                                    <h4>(Item removed by owner)</h4>
                                </div>
                            )}
                        </div>
                    )
                )}

                <h2>Expired</h2>
                {this.state.trades.map((trade, index) =>
                    trade.status === "EXPIRED" && (
                        <div key={index + "-div2"} style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            {trade.item ? (
                                <Link to={"/trade/" + trade._id}>
                                    <div key={index + "-ItemPanel"} className="ItemPanel">
                                        <h4>{trade.item.name} for {trade.item.forItemName}</h4>
                                    </div>
                                </Link>
                            ) : (
                                <div className="ItemPanel">
                                    <h4>(Item removed by owner)</h4>
                                </div>
                            )}
                        </div>
                    )
                )}

                <h2>Denied requests</h2>
                {this.state.trades.map((trade, index) =>
                    trade.status === "DENIED" && (
                        <div key={index + "-div2"} style={{ width: '40em', height: '10em', marginTop: '2em' }}>
                            {trade.item ? (
                                <Link to={"/trade/" + trade._id}>
                                    <div key={index + "-ItemPanel"} className="ItemPanel">
                                        <h4>{trade.item.name} for {trade.item.forItemName}</h4>
                                    </div>
                                </Link>
                            ) : (
                                <div className="ItemPanel">
                                    <h4>(Item removed by owner)</h4>
                                </div>
                            )}
                        </div>
                    )
                )}
            </div>
        );
    }
}