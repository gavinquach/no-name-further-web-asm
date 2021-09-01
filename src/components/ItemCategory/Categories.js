import { React, Component } from 'react';
import { Link } from "react-router-dom";

import '../../css/ItemCategories.css';
import { CategoryList } from './item-categories.js';

export default class Categories extends Component {
    render() {
        return (
            <div className="category-menu">
                {CategoryList.map((category, index) => (
                    <div className="container category-item">
                        <Link to={`/items?category=${category.url}`}>
                            <div className="category-image" style={{ backgroundImage: `url("${category.image}")` }} />
                            {/* <span className="category-image" style={{ backgroundImage: 'url("' + category.image + '")' }} /> */}
                            <li key={index}>
                                <p activeClassName="category-name-active" className={category.cName} >
                                    {category.title}
                                </p>
                            </li>
                        </Link>
                    </div>
                ))}
            </div>
        )
    }
}