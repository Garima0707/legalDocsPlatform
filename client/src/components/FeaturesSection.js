// src/components/FeaturesSection.js
import React, {forwardRef} from 'react';

const FeaturesSection = forwardRef(({ isVisible }, ref) => (
  <section ref={ref}
  className={`section Features ${isVisible ? 'visible' : ''}`}>
    <h2>Key Features</h2>
    <ul>
      <li>Secure document management with blockchain technology.</li>
      <li>Real-time updates and collaboration tools for legal documents.</li>
      <li>Multi-language support for contract creation.</li>
      <li>Automated notifications for contract deadlines and expirations.</li>
    </ul>
  </section>
));

export default FeaturesSection;
