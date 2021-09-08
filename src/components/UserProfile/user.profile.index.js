import React, { Component } from "react";
import { Helmet } from "react-helmet";
import UserProfile from './user.profile';
import UserEditPassword from './user.edit.password';

import '../../css/Profile.css';
import AuthService from "../../services/auth.service";

import ProfileSideBar from "./user.profile.sidebar"

export default class UserProfileIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hash: ""
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                hash: window.location.hash.replace("#", "")
            });
        }, 100);
    }

    setHashTagValue = () => {
        console.log(window.location.hash.replace("#", ""))
        setTimeout(() => {
            this.setState({
                hash: window.location.hash.replace("#", "")
            }, () => console.log(this.state.hash));
        }, 100);
    }

    render() {
        // const currentUser = AuthService.getCurrentUser();
        return (
            <div className="page-container my-profile">
                <span onClick={this.setHashTagValue}>
                    <ProfileSideBar />
                </span>
                <div className="profile-page">
                    {(this.state.hash == "myprofile" || this.state.hash == "") && (
                        <div>
                            <Helmet>
                                <title>{AuthService.getCurrentUser().username}'s Profile</title>
                            </Helmet>
                            <UserProfile />
                        </div>
                    )}

                    {this.state.hash == "password" && (
                        <div>
                            <Helmet>
                                <title>Change Password</title>
                            </Helmet>
                            <UserEditPassword />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}