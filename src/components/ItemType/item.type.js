import { React, Component } from 'react';
import '../../css/ItemTypes.css';
import {Types} from './types.js';
import { NavLink } from "react-router-dom";

export default class ItemTypes extends Component {
    render() {
        return (
            <div>
                <div className="container">
                    <div className = "title-container"><h3>Item Type</h3></div>
                    <nav className = "">
                    <ul className = 'type-menu'> {
                        Types.map((item, index) => {
                            return ( 
                                <li key = { index }>
                                    <NavLink to={item.url} activeClassName ='type-links-active' className = {item.cName} >
                                        {item.title}</NavLink></li>
                            )
                        })
                    }
                    </ul> 
                    </nav>   
                </div>
            </div>
        )
    }
}