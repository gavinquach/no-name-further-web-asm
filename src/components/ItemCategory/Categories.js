import { React, Component } from 'react';
import { Link } from "react-router-dom";

import '../../css/ItemCategories.css';
import { CategoryList } from './item-categories.js';

export default class Categories extends Component {
    render() {
        return (
            <div>
                <div className="title">Categories</div>
                <hr className="section-line" />
                <div className="category-menu ">
                    {CategoryList.map((category, index) => (
                        <div key={index} className="container category-item">
                            <Link className="link-no-style" to={`/items?category=${category.url}`}>
                                <div className="category-image" style={{ backgroundImage: `url("${category.image}")` }} />
                                {/* <span className="category-image" style={{ backgroundImage: 'url("' + category.image + '")' }} /> */}
                                <li key={index}>
                                    <p className={category.cName} >
                                        <b>{category.title}</b>
                                    </p>
                                </li>
                            </Link>
                        </div>
                    ))}
                </div>
            </div >
        )
    }
}