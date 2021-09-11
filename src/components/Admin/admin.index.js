import React, { Component } from 'react';

import AuthService from "../../services/auth.service";
import ItemService from "../../services/item.service";

import '../../css/UserPages.css'
import '../../css/NavigationBar.css'
import '../../css/Bootstrap.css'
import { Link } from 'react-router-dom';

const manageAdmin = (
    <div className="user-item Center-text">
        {/* <h2 className="Center-text">Manage admins</h2> */}
        <Link to="/admin/view/admin" className="Button-item">
            <button className="admin-menu-button">View admins</button>
        </Link>
        {/* {AuthService.isRoot() || AuthService.getRoles().includes("ROLE_CREATE_ADMIN") && ( */}
            <Link to="/admin/create/admin" className="Button-item">
                <button className="admin-menu-button">Create admin</button>
            </Link>
        {/* )} */}
    </div>
)

const manageUser = (
    <div className="Flexbox-item Center-text">
        {/* <h2 className="Center-text">Manage users</h2> */}
        <Link to="/admin/view/user" className="Button-item">
            <button className="admin-menu-button">View users</button>
        </Link>
        {/* {AuthService.isRoot() || AuthService.getRoles().includes("ROLE_CREATE_USER") && ( */}
            <Link to="/admin/create/user" className="Button-item">
                <button className="admin-menu-button">Create user</button>
            </Link>
        {/* )} */}
    </div>
)


const viewTrade = (
    <div>
        <h3 className="admin-control-header">View trades</h3>
    </div>
)


export default class AdminIndex extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            items: [],
            successful: false,
            message: "" }
    }

    componentDidMount() {
        ItemService.viewAllItems().then(response => {
            this.setState({ items: response.data.items });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                console.log(error.response.data.message);
            } else {
                console.log(error);
            }
        })
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
        )
    }

    displayCreateItem = () => {
        return (
            <div style={{ textAlign: 'center', marginTop: '4em' }}>
                <h5>No user posted anything yet!</h5>
            </div>
        );
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

    render() {
        return (
            <div>
                <br />

                <h1 className="title">Admin Panel</h1>
                <hr className="section-line" />
                <br />
                <div className="Flexbox container" style={{ width: '80em' }}>
                    {AuthService.hasManageAdminRole() ? manageAdmin : null}
                    {/* {(AuthService.hasManageAdminRole() && AuthService.hasManageUserRole()) ? <span className="Vertical-line" /> : null} */}
                    {AuthService.hasManageUserRole() ? manageUser : null}
                </div>
                <div>
                    <br />
                    <br />
                    <div className = "title">Listings</div>                    
                    <hr className="section-line" />
                    
                    <div className="menu white-container">
                         { this.state.items.length == 0 ? this.displayCreateItem() : this.showListings() }
                </div>
                </div>
                <div>
                    <div className = "title">Trades</div>
                    <hr className="section-line" />
                    {AuthService.hasManageAdminRole() ? viewTrade : null}
                </div>
            </div>
        );
    }
}