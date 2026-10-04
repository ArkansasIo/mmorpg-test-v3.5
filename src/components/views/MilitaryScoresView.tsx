import React from 'react';

export const MilitaryScoresView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="MilitaryScoresView" className="space-y-4">
    {children}
  </section>
);
