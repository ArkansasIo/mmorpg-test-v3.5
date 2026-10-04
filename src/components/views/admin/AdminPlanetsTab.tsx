import React from 'react';

export const AdminPlanetsTab: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="AdminPlanetsTab" className="space-y-4">
    {children}
  </section>
);
