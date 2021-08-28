import React, { Component } from 'react';

import AuthService from "../services/auth.service";
import ItemService from "../services/item.service";

import NavigationBar from "../NavigationBar"
import '../css/UserPages.css'

const manageAdmin = (
    <div className="Flexbox-item Center-text">
        <h2 className="Center-text">Manage admins</h2>
        <a href="/admin/view/admin" className="Button-item">
            <button className="Redirect-btn">View admins</button>
        </a>
        <a href="/admin/create/admin" className="Button-item">
            <button className="Redirect-btn">Create admin</button>
        </a>
    </div>
)

const manageUser = (
    <div className="Flexbox-item Center-text">
        <h2 className="Center-text">Manage users</h2>
        <a href="/admin/view/user" className="Button-item">
            <button className="Redirect-btn">View users</button>
        </a>
        <a href="/admin/create/user" className="Button-item">
            <button className="Redirect-btn">Create user</button>
        </a>
    </div>
)

const allItem = (
    <div>
        <h3 className="admin-control-header">All Item List</h3>

    </div>
)

const viewTrade = (
    <div>
        <h3 className="admin-control-header">View trade</h3>
    </div>
)


export default class AdminIndex extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }
    componentDidMount() {
        ItemService.viewAllItems().then(response => {
            // console.log(response.data);
            this.setState({ items: response.data });
        }).catch(function (error) {
            console.log(error);
        })
    }

    render() {
        return (
            <div>
                <NavigationBar />
                <h1 className="Center-text-header">Admin Panel</h1>
                <br />

                <div className="Flexbox container" style={{ width: '80em' }}>
                    {AuthService.hasManageAdminRole() ? manageAdmin : null}
                    {(AuthService.hasManageAdminRole() && AuthService.hasManageUserRole()) ? <span className="Vertical-line" /> : null}
                    {AuthService.hasManageUserRole() ? manageUser : null}
                </div>
                <div>
                    <br />
                    <br />
                    {AuthService.hasManageAdminRole() ? allItem : null}
                    <br />
                    <br />
                    {AuthService.hasManageAdminRole() && this.state.items.map((item, index) =>
                        (item.seller != AuthService.getCurrentUser().id) &&
                        <a key={index} href={"item/" + item._id}>
                            <div className="dashbord">
                                <div className="dashbord-img">
                                    {item.images.map(image =>
                                        image.cover && (
                                            <img src={process.env.REACT_APP_NODEJS_URL.concat("images/", image.name)}/>
                                        )
                                    )}
                                </div>
                                <p>{item.name} / <b>{item.quantity}</b></p>
                                <p></p>
                                <p className="for">For</p>
                                <p>{item.forItemName} / <b>{item.forItemQty}</b></p>
                                <p></p>
                                <button className="delete-item-btn">Delete</button>
                            </div>
                        </a>
                    )}
                </div>
                <div>
                    <br />
                    <br />
                    {AuthService.hasManageAdminRole() ? viewTrade : null}
                </div>
            </div>
        );
    }
}