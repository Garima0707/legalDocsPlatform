// src/components/ProductsSection.js
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import '../styles/products.css';
import createDocImage from '../styles/createDoc.jpeg';
import docVerificationImage from '../styles/DocumentVerification.jpeg';
import signImage from '../styles/sign.jpeg';


// Product data
const products = [
    {
        title: 'Smart Contract Solution',
        description:
            'Our Smart Contract Solution allows users to create, sign, and manage legal contracts using blockchain technology, ensuring transparency and immutability in every transaction.',
        image: createDocImage,
        link: '/createDocument',
        linkLabel: 'Create Document',
    },
    {
        title: 'Document Authentication',
        description:
            'With SecureDocs\' Document Authentication feature, you can verify the authenticity of legal documents, ensuring they haven’t been tampered with.',
        image: docVerificationImage,
        link: '/document-guide-modal',
        linkLabel: 'Guide',
    },
    {
        title: 'Data Integrity Management',
        description:
            'Maintain the integrity of your legal data with our state-of-the-art blockchain solutions. Every change is logged and verifiable.',
        image: signImage,
        link: null,
        linkLabel: '',
    },
];

const ProductsSection = forwardRef(({ isVisible, onProductClick }, ref) => {
    return (
        <div className={`products-section ${isVisible ? 'visible' : ''}`} ref={ref}>
            <h2 className="products-heading">Platform Highlights</h2>
            <div className="card-container">
                {products.map((product, index) => (
                    <div
                        className="card"
                        key={index}
                        onClick={() => onProductClick(product.link)}
                        style={{ backgroundImage: `url(${product.image})` }}
                    >
                        <div
                            className="front"
                            style={{ backgroundImage: `url(${product.image})` }}
                        >
                            <h3 className="card-title">{product.title}</h3>
                        </div>
                        <div className="back">
                            <p>{product.description}</p>
                            {product.link && (
                                <button
                                    className="product-link-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onProductClick(product.link);
                                    }}
                                >
                                    {product.linkLabel}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

ProductsSection.propTypes = {
    isVisible: PropTypes.bool.isRequired,
    onProductClick: PropTypes.func.isRequired,
};

export default ProductsSection;
