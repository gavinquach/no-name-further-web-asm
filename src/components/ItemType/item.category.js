import { React, Component } from 'react';
import { Link } from "react-router-dom";

import '../../css/ItemCategories.css';
import { Categories } from './categories.js';

export default class ItemCategories extends Component {
    render() {
        return (
            <div className="category-menu">
                {Categories.map((item, index) => (
                    <div className="container category-item">
                        <Link to={item.url}>
                            <div className="category-image" style={{ backgroundImage: `url("${item.image}")` }} />
                            {/* <span className="category-image" style={{ backgroundImage: 'url("' + item.image + '")' }} /> */}
                            <li key={index}>
                                <p activeClassName="category-name-active" className={item.cName} >
                                    {item.title}
                                </p>
                            </li>
                        </Link>
                    </div>
                ))}
            </div>
        )
    }
}