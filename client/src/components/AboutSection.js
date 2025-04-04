import React, { useEffect, useRef, useState, forwardRef } from "react";
import "../styles/About.css";

import signImage from "../assets/images/signDocs.png";
import docImage from "../styles/doc.png";
const AboutSection = forwardRef((props, ref) => {
  const [isImageVisible] = useState(false);
  const aboutRef = useRef(null);

  useEffect(() => {
    const sections = document.querySelectorAll(".about-section");
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.3 }
    );
  
    sections.forEach((section) => observer.observe(section));
  
    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);
  
  

  return (
    <section
      id="about"
      ref={aboutRef}
      className={`section about ${isImageVisible ? "visible" : ""}`}
    >
      <div id="about-sections">
        {/* Who We Are Section */}
        <div className="about-section">
          <div className="about-text">
            <h2 className="section-title">Who We Are</h2>
            <p>
              At SecureDocs, we leverage blockchain technology to revolutionize
              the way legal documents are managed, authenticated, and secured.
              Our platform ensures that your important documents are tamper-proof,
              transparent, and easily accessible.
            </p>
          </div>
          <div className="about-image">
            <img src={signImage} alt="Who We Are" />
          </div>
        </div>

        {/* Why Us Section */}
        <div id="why-us" className="about-section">
          <div className="about-text">
            <h2 className="section-title">Why Us</h2>
            <p>
              With SecureDocs, you gain peace of mind knowing that your legal
              documents are protected by cutting-edge blockchain technology. Our
              platform offers unparalleled security, transparency, and efficiency,
              making document management easier and more reliable than ever.
            </p>
          </div>
          <div className="about-image">
            <img src={docImage} alt="Why Us" />
          </div>
        </div>
      </div>
    </section>
  );
});

export default AboutSection;


