import React from 'react';

export const TechnologyView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="TechnologyView" className="space-y-4">
    {children}
  </section>
);
