
import {Helmet} from "react-helmet";
import { Link } from "react-router-dom";
const NotFound = () => {
    return (

        <div className ="page-container">
            <Helmet>
                    <title>Login</title>
            </Helmet>
        <div className ="white-container" style={{ textAlign: 'center', marginTop: '2em' }}>
            <h3>404! <br/>Page not found.</h3>
            <Link to="/">CLick here to go to homepage</Link>
        </div>
        </div>
    )
};

export default NotFound;