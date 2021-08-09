import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom'

import ViewItemTableRow from './ViewItemTableRow';
import NavigationBar from "../NavigationBar"

import AuthService from "../services/auth.service";

export default class UserViewItem extends Component {
    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    load = () => {
        AuthService.viewItems(
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

    tabRow = () => {
        return this.state.items.map(function (object, index) {
            return <ViewItemTableRow obj={object} key={index} />
        });
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
                    {this.tabRow()}
                </tbody>
            </table>
            // this.state.message && (
            //     <div className="form-group">
            //         <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
            //             {this.state.message}
            //         </div>
            //     </div>
            // )
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
            <div>
                <NavigationBar />
                <br />
                <h3 align="center">View Items</h3>
                { this.state.items.length == 0 ? this.displayCreateItem() : this.showListings() }
            </div>
        );
    }
}