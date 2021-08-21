import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import AuthService from "../services/auth.service";

export default class ItemTableRow extends Component {
    constructor(props) {
        super(props);
        this.delete = this.delete.bind(this);

        this.state = {
            successful: false,
            message: ""
        }
    }

    delete = () => {
        if (confirm("Are you sure you want to delete listing " + this.props.obj.name + "?")) {
            AuthService.deleteItem(this.props.obj._id)
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
            <tr>
                <td>{this.props.obj.name}</td>
                <td>{this.props.obj.quantity}</td>
                <td>{this.props.obj.type}</td>
                <td>{this.props.obj.forItemName}</td>
                <td>{this.props.obj.forItemQty}</td>
                <td>{this.props.obj.forItemType}</td>
                <td>
                    <Link to={`/user/edit/item/${this.props.obj._id}`} className="btn btn-primary">Edit</Link>
                    <span style={{ paddingRight: '1.5em' }} />
                    <button onClick={this.delete} className="btn btn-danger">Delete</button>

                    {this.state.message && (
                        <div className={this.state.successful ? "alert alert-success" : "alert alert-danger"} role="alert">
                            {this.state.message}
                        </div>)}
                </td>
            </tr>
        );
    }
}
