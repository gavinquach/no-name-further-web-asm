import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from "react-helmet";

import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";

import '../../css/UserPages.css';

export default class AdminIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            successful: false,
            message: "",
            currentPage: parseInt(new URLSearchParams(window.location.search).get('page')),
            totalPages: 0,
            pageButtons: [],
            limit: 10
        }
    }

    componentDidMount() {
        window.scrollTo(0, 0); // automatically scroll to top
        ItemService.viewAllItems().then(response => {
            this.setState({ items: response.data.items });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        });
    }

    showListings = () => {
        return (
            <table className="container table table-striped" style={{ marginTop: 20 }}>
                <thead>
                    <tr>
                        <th>User To</th>
                        <th>Name</th>
                        <th>Quantity</th>
                        <th>User From</th>
                        <th>For item name</th>
                        <th>For item quantity</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="table-data">
                    {this.state.items.map((object, index) => (
                        <tr>
                            <td>{object.id}</td>
                            <td>{object.name}</td>
                            <td>{object.quantity}</td>
                            <td>{object.id}</td>
                            <td>{object.forItemName}</td>
                            <td>{object.forItemQty}</td>
                            <td>
                                <Link to={`/user/edit/item/${object._id}`} className="btn btn-primary">Undo</Link>
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
        );
    }

    displayAddItemText = () => {
        return (
            <div style={{ textAlign: 'center', marginTop: '4em' }}>
                <h5>No user posted anything yet!</h5>
            </div>
        );
    }

    delete = (item) => {
        if (window.confirm("Are you sure you want to delete listing " + item.name + "?")) {
            ItemService.deleteItem(
                item._id
            ).then((response) => {
                if (response.status == 200 || response.status == 201) {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });
                    window.location.reload();
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

    manageAdmin = () => (
        <div className="Center-text">
            {/* <h2 className="Center-text">Manage admins</h2> */}
            <Link to="/admin/view/admin" className="Button-item">
                <button className="admin-menu-button">View admins</button>
            </Link>
            {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_CREATE_ADMIN")) && (
                <Link to="/admin/create/admin" className="Button-item">
                    <button className="admin-menu-button">Create admin</button>
                </Link>
            )}
        </div>
    );

    manageUser = () => (
        <div className="Center-text">
            <Link to="/admin/view/user" className="Button-item">
                <button className="admin-menu-button">View users</button>
            </Link>
            {(AuthService.isRoot() || AuthService.getRoles().includes("ROLE_CREATE_USER")) && (
                <Link to="/admin/create/user" className="Button-item">
                    <button className="admin-menu-button">Create user</button>
                </Link>
            )}
        </div>
    );

    viewUserTradesAndItems = () => (
        <div className="Center-text">
            <Link to="/admin/view/user/trades" className="Button-item">
                <button className="admin-menu-button">View user trades</button>
            </Link>
            <Link to="/admin/view/user/items" className="Button-item">
                <button className="admin-menu-button">View user items</button>
            </Link>
        </div>
    );

    render() {
        return (
            <div className="page-container">
                <Helmet>
                    <title>Admin Panel</title>
                </Helmet>
                <h1 className="title">Admin Panel</h1>
                <hr className="section-line" />
                <div className="menu white-container">
                    <br />
                    <div className="Flexbox container" style={{ width: '80em' }}>
                        {AuthService.hasManageAdminRole() ? this.manageAdmin() : null}
                        {this.manageUser()}
                        {this.viewUserTradesAndItems()}
                    </div>
                </div>
                {/* <br />
                <br />
                <div className="title">Listings</div>
                <hr className="section-line" />
                <div className="menu white-container">
                    {this.state.items.length > 0 ? this.showListings() : this.displayAddItemText()}
                </div>
                <div className="title">Trades</div>
                <hr className="section-line" />
                <div className="menu white-container">
                    {this.state.items.length > 0 ? this.viewTrade() : <h2>No trades available</h2>}
                </div> */}
            </div>
        );
    }
}