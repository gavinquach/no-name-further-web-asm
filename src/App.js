import './App.css';
import './css/Bootstrap.css'
import './css/Main.css'

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';  // npm install react-router-dom
import { Component } from 'react';

import AuthService from './services/auth.service';
import AuthVerify from "./common/auth-verify";

import AdminProtectedRoute from './common/admin-protected-route';
import UserProtectedRoute from './common/user-protected-route';

import Home from './components/home';
import Signup from './components/signup';
import Login from './components/login';
import ItemDetails from './components/Item/item.details';
import Cart from './components/cart';
import Transactions from './components/transaction';
import NotFound from './components/notfound';
import UserProfile from './components/UserProfile/user.profile';
import UserEditPassword from './components/UserProfile/user.edit.password';
import UserIndex from './components/User/user.index';
import UserCreateItem from './components/User/user.create.item';
import UserEditItem from './components/User/user.edit.item';
import UserViewItem from './components/User/user.view.item';
import AdminIndex from './components/Admin/admin.index';
import AdminViewAdmin from './components/Admin/admin.view.admin';
import AdminViewUser from './components/Admin/admin.view.user';
import AdminCreateAdmin from './components/Admin/admin.create.admin';
import AdminCreateUser from './components/Admin/admin.create.user';
import AdminEditAdmin from './components/Admin/admin.edit.admin';
import AdminEditUser from './components/Admin/admin.edit.user';
import NavigationBar from './components/Navbar/NavigationBar';
import Footer from './components/Footer/Footer'

export default class App extends Component {
    constructor(props) {
        super(props);
    }

    logOut() {
        AuthService.logout();
    }

    render = () => {
        return (
            <Router>
            <NavigationBar/>
                <Switch>
                    <Route exact path="/" component={Home} />
                    <Route exact path="/signup" component={Signup} />
                    <Route exact path="/login" component={Login} />
                    <Route path="/item/:id" component={ItemDetails} />
                    <UserProtectedRoute path="/cart" component={Cart} />
                    <UserProtectedRoute path="/transactions" component={Transactions} />
                    <UserProtectedRoute exact path='/user' component={UserProfile} />
                    <UserProtectedRoute exact path='/user/password' component={UserEditPassword} />
                    <UserProtectedRoute exact path='/user/index' component={UserIndex} />
                    <UserProtectedRoute exact path='/user/create' component={UserCreateItem} />
                    <UserProtectedRoute path='/user/edit/item/:id' component={UserEditItem} />
                    <UserProtectedRoute exact path='/user/items' component={UserViewItem} />
                    <AdminProtectedRoute exact path='/admin/index' component={AdminIndex} />
                    <AdminProtectedRoute exact path='/admin/view/admin' component={AdminViewAdmin} />
                    <AdminProtectedRoute exact path='/admin/view/user' component={AdminViewUser} />
                    <AdminProtectedRoute exact path='/admin/create/admin' component={AdminCreateAdmin} />
                    <AdminProtectedRoute exact path='/admin/create/user' component={AdminCreateUser} />
                    <AdminProtectedRoute path='/admin/edit/admin/:id' component={AdminEditAdmin} />
                    <AdminProtectedRoute path='/admin/edit/user/:id' component={AdminEditUser} />
                    <Route component={NotFound} />
                </Switch>
                <AuthVerify logOut={this.logOut} />
                <Footer/>
            </Router>
        );
    }
}

