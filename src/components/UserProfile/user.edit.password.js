import React, { Component } from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import CheckButton from "react-validation/build/button";
import AuthService from "../../services/auth.service";
import UserService from "../../services/user.service";

import '../..//css/Profile.css'

export default class UserEditPassword extends Component {
    constructor(props) {
        super(props);
        this.handleRegister = this.handleRegister.bind(this);
        this.onChangeOldPassword = this.onChangeOldPassword.bind(this);
        this.onChangeNewPassword = this.onChangeNewPassword.bind(this);
        this.onChangeConfirmNewPassword = this.onChangeConfirmNewPassword.bind(this);
        this.errorLength = "";
        this.errorRequireOld = "";
        this.errorRequireNew = "";
        this.errorNoMatch = "";

        this.state = {
            id: AuthService.getCurrentUser().id,
            oldpassword: '',
            newpassword: '',
            confirm_new_password: '',
            successful: false,
            message: "",
            errors: []
        };
    }

    onChangeOldPassword = (e) => {
        this.setState({
            oldpassword: e.target.value
        });

        if (!e.target.value || e.target.value.length != 0 && (e.target.value.length < 6 || e.target.value.length > 40)) {
            document.getElementById('newpassword').disabled = true;
            document.getElementById('confirm-new-password').disabled = true;

            if (!document.getElementById('save-btn').classList.contains('not-allowed')) {
                document.getElementById('save-btn').classList.add('not-allowed');
                document.getElementById('save-btn').disabled = true;
            }
        } else {
            document.getElementById('newpassword').disabled = false;
            document.getElementById('confirm-new-password').disabled = false;
            if (document.getElementById('save-btn').classList.contains('not-allowed')) {
                document.getElementById('save-btn').classList.remove('not-allowed');
            }
        }
    }

    onChangeNewPassword = (e) => {
        this.setState({
            newpassword: e.target.value
        });

        if (!e.target.value || e.target.value.length != 0 && (e.target.value.length < 6 || e.target.value.length > 40)) {
            if (!document.getElementById('save-btn').classList.contains('not-allowed')) {
                document.getElementById('save-btn').classList.add('not-allowed');
                document.getElementById('save-btn').disabled = true;
            }
        }
    }

    onChangeConfirmNewPassword = (e) => {
        this.setState({
            confirm_new_password: e.target.value
        });

        if (!e.target.value || e.target.value.length != 0 && (e.target.value.length < 6 || e.target.value.length > 40)) {
            if (!document.getElementById('save-btn').classList.contains('not-allowed')) {
                document.getElementById('save-btn').classList.add('not-allowed');
                document.getElementById('save-btn').disabled = true;
            }
        } else {
            if (document.getElementById('save-btn').classList.contains('not-allowed')) {
                document.getElementById('save-btn').classList.remove('not-allowed');
                document.getElementById('save-btn').disabled = false;
            }
        }
    }

    handleRegister = (e) => {
        e.preventDefault();

        const oldPass = document.getElementById('oldpassword').value;
        const newPass = document.getElementById('newpassword').value;
        const confirmNewPass = document.getElementById('confirm-new-password').value;
        const errors = [];

        // has new pass but no old pass 
        if (oldPass.length == 0 && newPass.length > 0) {
            errors.push("Old password is required!");
        }
        // has confirm new pass but no new pass
        if (oldPass.length == 0 && newPass.length > 0) {
            errors.push("New password is required!");
        }
        if (newPass.length > 0 && (!confirmNewPass || confirmNewPass.length == 0)) {
            errors.push("Please confirm the new password!");
        }
        if (newPass.length > 0 && confirmNewPass.length > 0 && newPass != confirmNewPass) {
            errors.push("New and confirm new password don't match!");
        }
        this.setState({ errors: errors });

        if (this.checkBtn.context._errors.length === 0 && errors.length == 0) {
            UserService.editPassword(
                this.state.id,
                this.state.oldpassword,
                this.state.confirm_new_password
            ).then(
                response => {
                    this.setState({
                        message: response.data.message,
                        successful: true
                    });
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
                <div className="title">Change Password</div>
                <hr className="section-line" />
                <div className="form white-container">
                    <Form onSubmit={this.handleRegister} ref={c => { this.form = c; }}>
                        <div className="labels">
                            <label className="label row"> Old password: </label>
                            <label className="label row"> New password: </label>
                            <label className="label row"> Confirm new password: </label>
                        </div>
                        <div>
                            <span className="prow">
                                <Input
                                    id="oldpassword"
                                    name="oldfpassword"
                                    className="profile-input"
                                    type="password"
                                    placeholder="Old Password"
                                    value={this.state.oldpassword}
                                    onChange={this.onChangeOldPassword}>
                                </Input>
                            </span>
                            <span className="prow">
                                <Input
                                    id="newpassword"
                                    name="newpassword"
                                    className="profile-input"
                                    type="password"
                                    placeholder="New Password"
                                    value={this.state.newpassword}
                                    onChange={this.onChangeNewPassword}
                                    disabled>
                                </Input>
                            </span>
                            <span className="prow">
                                <Input
                                    id="confirm-new-password"
                                    name="confirm-new-password"
                                    className="profile-input"
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={this.state.confirm_new_password}
                                    onChange={this.onChangeConfirmNewPassword}
                                    disabled>
                                </Input>
                            </span>
                        </div>

                        <button id="save-btn" className="Create-btn not-allowed" disabled='true'>Save</button>

                        <h5 style={{ color: 'red' }}>
                            {
                                this.state.errors.map(err =>
                                (<p>
                                    {err}
                                </p>)
                                )
                            }
                            {this.state.message && (
                                <p className={this.state.successful ? "success" : "fail"}>{this.state.message}</p>
                            )}
                        </h5>
                        <CheckButton style={{ display: "none" }} ref={c => { this.checkBtn = c; }} />
                    </Form>
                </div>
            </div>
        );
    }
}