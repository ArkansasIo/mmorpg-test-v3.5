import React from 'react';

export const TechTreeView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="TechTreeView" className="space-y-4">
    {children}
  </section>
);
