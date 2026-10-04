import React from 'react';

export const MissionsView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="MissionsView" className="space-y-4">
    {children}
  </section>
);
