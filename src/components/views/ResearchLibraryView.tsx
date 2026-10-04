import React from 'react';

export const ResearchLibraryView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="ResearchLibraryView" className="space-y-4">
    {children}
  </section>
);
