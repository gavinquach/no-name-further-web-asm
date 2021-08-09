import React from "react";
import { Route, Redirect } from "react-router-dom";
import AuthService from "../services/auth.service"

const RouteForAdmin = ({ component, ...args }) => {
    return AuthService.isAdmin() ? (<Route component={(component)} {...args} />) : (<Redirect to="/"/>)
};

export default RouteForAdmin;
