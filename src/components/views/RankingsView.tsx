import React from 'react';

export const RankingsView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="RankingsView" className="space-y-4">
    {children}
  </section>
);
