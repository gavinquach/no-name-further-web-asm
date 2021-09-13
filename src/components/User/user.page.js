import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { Link, Redirect } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';

import '../../css/ItemMenu.css'

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import socket from '../../services/socket';

export default class UserPage extends Component {
    constructor(props) {
        super(props);
        this.widthChangeExecced = -1;
        this.resultLimit = 15;

        this.state = {
            user: null,
            items: [],
            successful: false,
            message: "",
            notfound: false,
            sort: "none",
            currentPage: 1,
            totalPages: 0,
            totalResults: 0,
            pageButtons: []
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        this.loadUser();    // get user information

        window.addEventListener('resize', () => {
            if (this.state.items.length > 0) {
                if (window.innerWidth > 1380) {
                    if (this.widthChangeExecced != 0) {
                        this.resultLimit = 15;
                        this.loadUserItems();
                        this.widthChangeExecced = 0;
                    }
                } else if (window.innerWidth <= 1380 && window.innerWidth > 1090) {
                    if (this.widthChangeExecced != 1) {
                        this.resultLimit = 12;
                        this.loadUserItems();
                        this.widthChangeExecced = 1;
                    }
                } else if (window.innerWidth <= 1090 && window.innerWidth > 830) {
                    if (this.widthChangeExecced != 2) {
                        this.resultLimit = 9;
                        this.loadUserItems();
                        this.widthChangeExecced = 2;
                    }
                } else if (window.innerWidth <= 830) {
                    if (this.widthChangeExecced != 3) {
                        this.resultLimit = 6;
                        this.loadUserItems();
                        this.widthChangeExecced = 3;
                    }
                }
            }
        });
    }

    loadUser = () => {
        UserService.publicgetUser(
            this.props.match.params.username
        ).then(response => {
            this.setState({
                user: response.data
            });
            this.loadUserItems();
        }).catch((error) => {
            this.setState({
                notfound: true
            });
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    loadUserItems = () => {
        if (window.innerWidth > 1380) {
            this.resultLimit = 15;
        } else if (window.innerWidth <= 1380 && window.innerWidth > 1090) {
            this.resultLimit = 12;
        } else if (window.innerWidth <= 1090 && window.innerWidth > 830) {
            this.resultLimit = 9;
        } else if (window.innerWidth <= 830) {
            this.resultLimit = 6;
        }

        UserService.viewUserItems(
            this.state.user._id,
            this.state.sort,
            this.state.currentPage,
            this.resultLimit
        ).then(response => {
            this.setState({
                sort: new URLSearchParams(window.location.search).get('sort') != undefined
                    ? new URLSearchParams(window.location.search).get('sort')
                    : "none",
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

    chatWithUser = () => {
        if (!AuthService.isLoggedIn()) {
            return;
        }
        const data = {
            user: AuthService.getCurrentUser().id,
            receiver: this.state.user._id
        };
        socket.emit("chatWithUserRequest", data);
    }

    updatePage = (page) => {
        this.setState({
            currentPage: page
        }, () => this.loadUserItems());
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
            const pageURL = url.pathname + "?" + search_params.toString();

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(prevPage)}>
                    <button>Previous</button>
                </Link>
            );
        }
        for (let i = 1; i <= this.state.totalPages; i++) {
            // replace page number with index number
            search_params.set("page", i);
            const pageURL = url.pathname + "?" + search_params.toString();

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
            const pageURL = url.pathname + "?" + search_params.toString();

            buttons.push(
                <Link to={pageURL} onClick={() => this.updatePage(nextPage)}>
                    <button>Next</button>
                </Link>
            );
        }
        this.setState({ pageButtons: buttons });
    }

    updateSort = (e) => {
        const params = ["name", "-name", "offers", "-offers"];

        // invalid value, reload page
        if (!params.includes(e.target.value)) {
            return window.location.reload();
        }

        this.setState({
            sort: e.target.value
        }, () => {
            this.loadUserItems();
        });
    }

    render() {
        const user = this.state.user && {
            _id: this.state.user._id,
            username: this.state.user.username,
            email: this.state.user.email,
            location: this.state.user.location.length > 0 ? this.state.user.location : ["", ""]
        };
        const items = this.state.items.length > 0 ? this.state.items : [];

        const url = new URL(window.location.href);
        const search_params = url.searchParams;
        const page = search_params.get("page");

        // redirect to page 1 if user tries to access page with no items
        if (this.state.totalPages > 0 && page > this.state.totalPages) {
            search_params.set("page", 1);
            return <Redirect to={url.pathname + "?" + search_params.toString()} />
        }

        // check if there is page query params in URL
        if (items.length > 0) {
            let pageURL = url.pathname + "?";
            if (!page || page == "") {
                search_params.set("page", 1);
                pageURL = pageURL.concat(search_params.toString());
                return <Redirect to={pageURL} />
            }

            // const sort = search_params.get("sort");
            // if (!sort || sort == "") {
            //     search_params.set("sort", "none");
            //     pageURL = pageURL.concat(search_params.toString());
            //     return <Redirect to={pageURL} />
            // }
        }

        return (
            <div className="page-container">
                {this.state.notfound && (
                    <span style={{ textAlign: 'center' }}>
                        <Helmet>
                            <title>404 User not found</title>
                        </Helmet>
                        <h1>
                            <FontAwesomeIcon id="fa-icon-frown" icon={faFrown} />
                        </h1>
                        <h1 id="four-o-four">404</h1>
                        <h1>User not found</h1>
                    </span>
                )}
                {user && (
                    <span>
                        <Helmet>
                            <title>{this.props.match.params.username}</title>
                        </Helmet>
                        <div className="title">{this.props.match.params.username}</div>
                        <hr className="section-line" />
                        <div className="UserInfo">
                            <p><b>Email:</b> {user.email}</p>
                            <p><b>City:</b> {user.location[0].replace("Thành phố ", "").replace("Tỉnh ", "")}</p>
                            <p><b>District:</b> {user.location[1].replace("Huyện ", "").replace("Quận ", "")}</p>
                            <br />
                            <button className="TradeButton" onClick={this.chatWithUser}>Chat with user</button>
                        </div>
                        {items.length > 0 ? (
                            <span>
                                <br /><br /><br />
                                <div className="title">Item listings</div>
                                <hr className="section-line" />
                                <div>
                                    <div className="ResultsAndSort">
                                        <h3 id="results">Results: {this.state.totalResults}</h3>
                                        <select id="select-sort" onChange={this.updateSort}>
                                            <option value="">Sort by:</option>
                                            <option value="name">Name (A-Z)</option>
                                            <option value="-name">Name (Z-A)</option>
                                            <option value="offers">Popularity (Least)</option>
                                            <option value="-offers">Popularity (Most)</option>
                                        </select>
                                    </div>
                                    <br />
                                    <div className="menu">
                                        {items.map((item, index) =>
                                            <Link className="item-box" key={index} to={"/item/" + item._id}>
                                                <div className="item-box-img">
                                                    {item.images.map(image =>
                                                        image.cover && (
                                                            <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                                        )
                                                    )}
                                                </div>
                                                <div className="item-info">
                                                    {item.name} / <b>{item.quantity}</b>
                                                    <p className="for">FOR</p>
                                                    <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                                    <p><b>Offers</b>: {item.offers}</p>
                                                </div>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="page-buttons">
                                        {this.state.pageButtons}
                                    </div>
                                </div>
                            </span>
                        ) : (
                            <span>
                                <br /><br /><br />
                                <div className="title">Item listings</div>
                                <hr className="section-line" />
                                <div>
                                    <h1>This user has no listings.</h1>
                                </div>
                            </span>
                        )}
                    </span>
                )}

            </div>
        );
    }
}