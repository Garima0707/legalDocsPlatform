import React from 'react';
import PropTypes from 'prop-types';

const ProductItem = ({ title, description, backgroundImage, link, onClick }) => {
    return (
        <div 
            className="product-item" 
            onClick={onClick} 
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            <div className="product-item-front">
                <h3>{title}</h3>
            </div>
            <div className="product-item-back">
                <p>{description}</p>
            </div>
        </div>
    );
};

// PropTypes to enforce type checking for props
ProductItem.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    backgroundImage: PropTypes.string.isRequired,
    link: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

export default ProductItem;
