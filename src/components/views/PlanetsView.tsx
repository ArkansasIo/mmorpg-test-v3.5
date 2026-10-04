import React from 'react';

export const PlanetsView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="PlanetsView" className="space-y-4">
    {children}
  </section>
);
