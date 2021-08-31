import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { Redirect } from "react-router-dom";


import AuthService from '../services/auth.service'

const required = (value) => {
    if (!value) {
        return (
            <div className="alert alert-danger" role="alert">
                This field is required!
            </div>
        );
    }
};

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.onChangeUsername = this.onChangeUsername.bind(this);
        this.onChangePassword = this.onChangePassword.bind(this);

        this.state = {
            username: "",
            password: "",
            loading: false,
            message: "",
            disableSend: false,
            resendMessage: ""
        };
    }

    onChangeUsername = (e) => {
        this.setState({
            username: e.target.value
        });
    }

    onChangePassword = (e) => {
        this.setState({
            password: e.target.value
        });
    }

    handleLogin = (e) => {
        e.preventDefault();

        this.setState({
            message: "",
            loading: true
        });

        this.form.validateAll();

        if (this.checkBtn.context._errors.length === 0) {
            AuthService.login(
                this.state.username,
                this.state.password
            ).then(
                () => {
                    this.props.history.push("/");
                },
                error => {
                    const resMessage =
                        (error.response &&
                            error.response.data &&
                            error.response.data.message) ||
                        error.message ||
                        error.toString();

                    this.setState({
                        loading: false,
                        message: resMessage
                    });
                }
            );
        } else {
            this.setState({
                loading: false
            });
        }
    }

    sendEmail = () => {
        if (!this.state.disableSend) {
            AuthService.sendVerifyEmail(
                this.state.username,
                this.state.password
            ).then(response => {
                console.log(response.data.resendMessage);
                this.setState({
                    resendMessage: "Email sent, you will be able to resend again in 2 minutes."
                });
            }, error => {
                const resMessage =
                    (error.response &&
                        error.response.data &&
                        error.response.data.message) ||
                    error.message ||
                    error.toString();

                this.setState({
                    loading: false,
                    message: resMessage
                });
            }
            );
            this.setState({
                disableSend: true
            }, () => {
                // re-enable link after 2 minutes
                setTimeout(() => {
                    this.setState({
                        disableSend: false,
                        resendMessage: ""
                    });
                }, 120 * 1000);
            });
        }
    }

    render() {
        if (AuthService.isLoggedIn()) {
            return <Redirect to="/" />
        }
        return (
            <div>
                <Form onSubmit={this.handleLogin} ref={c => { this.form = c; }} className="container" style={{ width: "30em", marginTop: '7em', marginBottom: '7em' }}>
                    <h1 className="Big-text">Login</h1>
                    <br></br>
                    <Input
                        className="Input"
                        type="text"
                        name="username"
                        value={this.state.username}
                        onChange={this.onChangeUsername}
                        validations={[required]}
                        placeholder="Username"
                    />
                    <Input
                        className="Input"
                        type="password"
                        value={this.state.password}
                        onChange={this.onChangePassword}
                        validations={[required]}
                        placeholder="Password"
                    />

                    {(this.state.message) && (
                        <span>
                            <span
                                id={this.state.disableSend ? "send-email-text-disabled" : "send-email-text"}
                                onClick={this.sendEmail}>
                                Resend email
                            </span>
                            <br />
                        </span>
                    )}

                    {this.state.resendMessage && (
                        <span style={{ color: 'blue', float: 'right' }}>{this.state.resendMessage}</span>
                    )}

                    <button className="Create-btn" disabled={this.state.loading}>
                        {this.state.loading && (
                            <span className="spinner-border spinner-border-sm" style={{ marginRight: '5px' }}></span>
                        )}
                        <span>Login</span>
                    </button>

                    {this.state.message && (
                        <div className="form-group">
                            <div className="alert alert-danger" role="alert">
                                {this.state.message}
                            </div>
                        </div>
                    )}
                    <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }}
                    />
                </Form>
            </div>
        );
    };
}