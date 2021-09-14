import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFrown } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
    window.scrollTo(0, 0); // automatically scroll to top
    return (
        <div className="page-container" style={{ textAlign: 'center' }}>
            <Helmet>
                <title>404 Not Found</title>
            </Helmet>
            <h1>
                <FontAwesomeIcon id="fa-icon-frown" icon={faFrown} />
            </h1>
            <h1 id="four-o-four">404</h1>
            <h1>Page not found</h1>
            <br />
            <Link to="/">CLick here to go to homepage</Link>
        </div>
    )
};

export default NotFound;