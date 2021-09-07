
import {Helmet} from "react-helmet";
const NotFound = () => {
    return (

        <div className ="page-container">
            <Helmet>
                    <title>Login</title>
            </Helmet>
        <div className ="white-container" style={{ textAlign: 'center', marginTop: '2em' }}>
            <h3>404! <br/>Page not found.</h3>
            <a href="/">CLick here to go to homepage</a>
        </div>
        </div>
    )
};

export default NotFound;