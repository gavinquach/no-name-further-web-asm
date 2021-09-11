import React, { Component } from 'react';
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';

import '../../css/ItemMenu.css'

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

export default class UserViewItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null,
            items: [],
            successful: false,
            message: ""
        }
    }

    componentDidMount() {
        this.loadUser();
    }

    loadUser = () => {
        UserService.publicgetUser(
            this.props.match.params.username
        ).then(response => {
            this.setState({
                user: response.data
            });
            this.loadUserItems(response.data._id);
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    loadUserItems = () => {
        UserService.viewUserItems(
            this.state.user._id
        ).then(response => {
            this.setState({ items: response.data.items });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    chatWithUser = (transaction) => {
        const data = {
            user: AuthService.getCurrentUser().id,
            receiver: transaction.user_seller._id == AuthService.getCurrentUser().id ? transaction.user_buyer._id : transaction.user_seller._id,
            transaction: transaction
        };
        socket.emit("chatWithUserRequest", data);
    }

    render() {
        const user = this.state.user && {
            _id: this.state.user._id,
            username: this.state.user.username,
            email: this.state.user.email,
            location: this.state.user.location.length > 0 ? this.state.user.location : ["", ""],
            items: this.state.user.items
        };
        const items = this.state.items && this.state.items;
        return (
            <div>
                {user ? (
                    <div className="page-container">
                        <Helmet>
                            <title>{this.props.match.params.username}'s' page</title>
                        </Helmet>
                        <div className="title">{this.props.match.params.username}</div>
                        <hr className="section-line" />
                        <div className="UserInfo">
                            <p>ID: {user._id}</p>
                            <p>Email: {user.email}</p>
                            <p>City: {user.location[0].replace("Thành phố ", "").replace("Tỉnh ", "")}</p>
                            <p>District: {user.location[1].replace("Huyện ", "").replace("Quận ", "")}</p>
                            <br />
                            <button className="TradeButton" onClick={() => this.chatWithUser(transaction)}>Chat with user</button>
                        </div>

                        <br /><br /><br />

                        <div className="title">Item listings</div>
                        <hr className="section-line" />
                        {items.length > 0 ? (
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
                        ) : (
                            <div>
                                <h1>This user has no listings.</h1>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="page-container" style={{ textAlign: 'center' }}>
                        <h1>
                            <FontAwesomeIcon id="fa-icon-frown" icon={faFrown} />
                        </h1>
                        <h1 id="four-o-four">404</h1>
                        <h1>User not found</h1>
                    </div>
                )}
            </div>
        );
    }
}