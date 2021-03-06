import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import { Redirect } from "react-router-dom";
import { Helmet } from "react-helmet";

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
            resendMessage: "",
            verified: true
        };
    }

    componentDidMount = () => {
        window.scrollTo(0, 0); // automatically scroll to top
        if (this.props.match.params.email && this.props.match.params.token) {
            AuthService.confirmEmail(
                this.props.match.params.email,
                this.props.match.params.token
            ).then(() => {
                this.props.history.push("/");
                window.location.reload();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    this.setState({
                        message: error.response.data.message
                    });
                } else {
                    this.setState({
                        message: `${error.response.status} ${error.response.statusText}`
                    });
                }
            });
        }
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
            ).then(() => {
                window.location.reload();
            }).catch((error) => {
                if (error.response && error.response.status != 500) {
                    this.setState({
                        loading: false,
                        message: error.response.data.message
                    });
                } else {
                    this.setState({
                        loading: false,
                        message: `${error.response.status} ${error.response.statusText}`
                    });
                }

                if (error.response.data.verified && error.response.data.verified === false) {
                    this.setState({ verified: false });
                } else {
                    this.setState({ verified: true });
                }
            });
        } else {
            this.setState({
                loading: false
            });
        }
    }

    sendEmail = () => {
        if (this.state.disableSend) {
            return;
        }
        AuthService.sendVerifyEmail(
            this.state.username,
            this.state.password
        ).then(response => {
            this.setState({
                resendMessage: "Email sent, you will be able to resend again in 2 minutes."
            });
        }).catch((error) => {
            if (error.response && error.response.status != 500) {
                this.setState({
                    loading: false,
                    message: error.response.data.message
                });
            } else {
                this.setState({
                    loading: false,
                    message: `${error.response.status} ${error.response.statusText}`
                });
            }
        });

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

    render() {
        if (AuthService.isLoggedIn()) {
            return <Redirect to="/" />
        }
        return (
            <div className='page-container'>
                <Helmet>
                    <title>Login</title>
                </Helmet>
                <div className="form white-container">
                    <div className="container login-title">
                        <div className="title">Login</div>
                        <hr className="section-line " />
                    </div>
                    <Form onSubmit={this.handleLogin} ref={c => { this.form = c; }} className="container" style={{ width: "30em" }}>
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

                        {(this.state.message && this.state.verified === false) && (
                            <span>
                                <span
                                    id={this.state.disableSend ? "send-email-text-disabled" : "send-email-text"}
                                    onClick={this.sendEmail}>
                                    Resend email
                                </span>
                                <br />
                            </span>
                        )}

                        {(this.state.resendMessage && this.state.verified === false) && (
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
            </div>

        );
    };
}