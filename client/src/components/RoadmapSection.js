// src/components/RoadmapSection.js
import React, { forwardRef } from 'react';

const RoadmapSection = forwardRef(({ isVisible }, ref) => (
  <section ref={ref}
  className={`section Roadmap ${isVisible ? 'visible' : ''}`}>
    <h2>Future Plans</h2>
    <ol>
      <li>Integrate advanced AI for contract analysis and recommendations.</li>
      <li>Implement a decentralized dispute resolution system using smart contracts.</li>
      <li>Expand multi-language support to cover more global languages.</li>
    </ol>
  </section>
));

export default RoadmapSection;
