import React, { Component } from "react";
import { Helmet } from "react-helmet";
import UserService from "../services/user.service";

import '../css/Search.css';

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: "",
            notfound: true,
            items: [],
            users: []
        };
    }

    load = () => {
        const queryParams = new URLSearchParams(window.location.search);
        let keyword = queryParams.get('keyword');
        console.log(keyword, "keyword");

        if (keyword) {
            this.setState({
                keyword: keyword
            }, () => {
                UserService.search(encodeURIComponent(this.state.keyword))
                    .then((response) => {
                        if (response.status == 200 && response.data) {
                            this.setState({
                                notfound: false
                            });
                            console.log(response);

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
                            {this.state.users.map((user) => (
                                <div>
                                    {user.username}
                                </div>
                            ))}
                        </div>
                        <div>
                            <h1>Items</h1>
                            {this.state.items.map((item) => (
                                <div>
                                    {item.name}
                                </div>
                            ))}
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