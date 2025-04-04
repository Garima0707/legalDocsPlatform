import React, { useEffect, useRef, useState } from "react";
import "../styles/problems.css";
import sampleGif from "../styles/question.gif";

const ProblemSolutionSection = React.forwardRef((props, ref) => {
  const [flippedCardIndex, setFlippedCardIndex] = useState(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const currentRef = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFlippedCardIndex(-1); // Reset flip on intersection
          }
        });
      },
      { threshold: 0.5 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const handleCardClick = (index) => {
    setFlippedCardIndex(index === flippedCardIndex ? null : index);
  };

  const cards = [
    {
      title: "Problem",
      content: "Managing legal documents is plagued by inefficiencies, lack of transparency, and security vulnerabilities. Physical storage risksand unauthorized access exacerbate these challenges.",
      details: " Version control issues often lead to confusion in tracking updates.\n- Documents are vulnerable to tampering and unauthorized alterations.\n- Manual workflows result in increased costs and time delays.\n - Lack of audit trails makes compliance verification challenging.",
    },
    {
      title: "Solution",
      content: "Our blockchain-based platform transforms legal document management by ensuring security, transparency, and efficiency through decentralized technology.",
      details: "- Security: Documents are encrypted and stored immutably on the blockchain.\n- Transparency: Documents are encrypted and stored immutably on the blockchain.\n Efficiency: Smart contracts automate workflows, reducing costs and delays.\n Scalability: The system supports multi-language contracts and cross-border collaboration.",
    },
    {
      title: "Impact",
      content: "Transforming legal documentation to reduce errors, increase compliance, and enable seamless collaboration.",
      details: "- Cost Reduction: Automation reduces labor costs.\n- Trust: Immutable records build confidence between parties.\n ",
    },
  ];

  return (
    <section ref={ref || sectionRef} className="section Problem-Solution">
      <div className="problem-solution-content">
        <div className="gif-container">
          <img src={sampleGif} alt="Problem Solution GIF" />
        </div>
        <div className="pcards-container">
          {cards.map((card, index) => (
            <div
              key={index}
              className={`pcard ${flippedCardIndex === index ? "flipped" : ""}`}
              onClick={() => handleCardClick(index)}
            >
              <div className="pcard-face pcard-front">
                <h3>{card.title}</h3>
                <p>{card.content}</p>
              </div>
              <div className="pcard-face pcard-back">
                <h3>{card.title} Details</h3>
                <p>{card.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default ProblemSolutionSection;
