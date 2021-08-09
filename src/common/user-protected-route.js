import React from "react";
import { Route, Redirect } from "react-router-dom";
import AuthService from "../services/auth.service"

const UserProtectedRoute = ({ component, ...args }) => {
    return AuthService.isLoggedIn() ? (<Route component={(component)} {...args} />) : (<Redirect to="/"/>)
};

export default UserProtectedRoute;
