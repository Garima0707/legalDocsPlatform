import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import ProductsSection from "./components/ProductSection";
import DocumentGuideModal from "./components/DocumentGuideModal";
import ProblemSolutionSection from "./components/ProblemSolutionSection";
import ContactSection from "./components/ContactSection";
import useIntersection from "./hooks/useIntersection";
import { useAuth0 } from "@auth0/auth0-react";

const HomePage = () => {
    const [aboutRef, aboutVisible] = useIntersection({ threshold: 0.2 });
    const [productsRef, productsVisible] = useIntersection({ threshold: 0.2 });
    const [problemSolutionRef, problemSolutionVisible] = useIntersection({ threshold: 0.2 });
    const [contactRef, contactVisible] = useIntersection({ threshold: 0.2 });

    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const handleProductClick = (link) => {
        if (!isAuthenticated && link === "/createDocument") {
            loginWithRedirect();
        } else if (link) {
            navigate(link);
        }
    };

    return (
        <div className="home-container">
            <HeroSection />
            <section id="about">
                <AboutSection ref={aboutRef} isVisible={aboutVisible} />
            </section>
            <section id="products">
                <ProductsSection
                    ref={productsRef}
                    isVisible={productsVisible}
                    onProductClick={handleProductClick}
                />
            </section>
            <section id="document-creation-process">
                <h2>The Problem & Our Answer</h2>
                <DocumentGuideModal />
            </section>
            <section id="problem-solution">
                <ProblemSolutionSection
                    ref={problemSolutionRef}
                    isVisible={problemSolutionVisible}
                />
            </section>
            <section id="contact">
                <ContactSection ref={contactRef} isVisible={contactVisible} />
            </section>
        </div>
    );
};

export default HomePage;
