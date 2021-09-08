import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom'
import {Helmet} from "react-helmet";

import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";
import ItemService from "../../services/item.service";

export default class UserViewItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            successful: false,
            message: ""
        }
    }

    load = () => {
        UserService.viewUserItems(
            AuthService.getCurrentUser().id
        ).then(response => {
            // console.log(response.data);
            this.setState({ items: response.data });
        }).catch(function (error) {
            console.log(error);
        })
    }

    componentDidMount() {
        this.load();
    }

    delete = (item) => {
        if (window.confirm("Are you sure you want to delete listing " + item.name + "?")) {
            ItemService.deleteItem(item._id)
                .then(
                    response => {
                        this.setState({
                            message: response.data.message,
                            successful: true
                        });
                        window.location.reload();
                    },
                    error => {
                        const resMessage =
                            (error.response &&
                                error.response.data &&
                                error.response.data.message) ||
                            error.message ||
                            error.toString();

                        this.setState({
                            successful: false,
                            message: resMessage
                        });
                    }
                );
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

    render() {
        return (
            <div className ="page-container">
                 <Helmet>
                    <title>Item Listing</title>
                </Helmet>
                 <div className = "title">Listings</div>
                    <hr className="section-line" />
                    <div className="menu white-container">
                { this.state.items.length == 0 ? this.displayCreateItem() : this.showListings() }
            </div>
            </div>
        );
    }
}