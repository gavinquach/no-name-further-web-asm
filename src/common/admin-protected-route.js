import React from "react";
import { Route, Redirect } from "react-router-dom";
import AuthService from "../services/auth.service"

const AdminProtectedRoute = ({ component, ...args }) => {
    return AuthService.isAdmin() ? (<Route component={(component)} {...args} />) : (<Redirect to="/"/>)
};

export default AdminProtectedRoute;
