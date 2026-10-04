import React from 'react';

export const ResourcesView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="ResourcesView" className="space-y-4">
    {children}
  </section>
);
