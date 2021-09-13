import React, { Component } from "react";
import { Helmet } from "react-helmet";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

import UserService from "../services/user.service";

import '../css/Search.css';

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: "",
            notfound: false,
            items: [],
            users: []
        };
    }

    load = () => {
        const queryParams = new URLSearchParams(window.location.search);
        let keyword = queryParams.get('keyword');

        if (keyword) {
            keyword = unescape(keyword);  // escape html special characters
            this.setState({
                keyword: keyword
            }, () => {
                UserService.search(encodeURIComponent(this.state.keyword))
                    .then((response) => {
                        if (response.status == 200 && response.data) {
                            this.setState({
                                notfound: false
                            });

                            this.setState({
                                items: response.data.items,
                                users: response.data.users
                            })
                        }
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
            });
        }
    }

    componentDidMount() {
        this.load();
    }

    render() {
        return (
            <div className="page-container">
                <Helmet>
                    <title>Search "{this.state.keyword}"</title>
                </Helmet>
                <div className="title">Search</div>
                <hr className="section-line" />
                {!this.state.notfound ? (
                    <div>
                        <div>
                            <h1>Users</h1>
                            <div id="user-menu" className="menu white-container">
                                {this.state.users.map((user, index) => (
                                    <a key={index + "-user"} href={"/trader/" + user.username} className="item-box UserBox" key={index}>
                                        <div className="item-box-img">
                                            <FontAwesomeIcon icon={faUserCircle} id="avatar" />
                                        </div>
                                        <div className="item-info">
                                            <div style={{ textAlign: 'center' }}>{user.username}</div>
                                            <hr />
                                            <div>{user.email}</div>
                                            <div>{user.location[1]}, {user.location[0]}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h1>Items</h1>
                            <div className="menu white-container">
                                {this.state.items.length > 0 && this.state.items.map((item, index) => (
                                    <a key={index + "-item"} href={"/item/" + item._id} className="item-box" key={index}>
                                        <div className="item-box-img">
                                            {item.images.map(image =>
                                                image.cover && (
                                                    <img key={"img-" + item._id} src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)} />
                                                )
                                            )}
                                        </div>
                                        <div className="item-info">
                                            {item.name} / <b>{item.quantity}</b>
                                            <p className="for">FOR</p>
                                            <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                            <p><b>Offers</b>: {item.offers}</p>
                                            <div style={{ textAlign: 'right', fontSize: '15px' }}>Location: {item.seller.location[0]}</div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div align='center'>
                        <div id="not-found-img" />
                        <div style={{ fontSize: '2em' }}>We can't find what you are searching for 😔</div>
                    </div>
                )}
            </div>
        );
    }
}