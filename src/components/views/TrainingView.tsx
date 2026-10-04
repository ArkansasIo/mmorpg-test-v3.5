import React from 'react';

export const TrainingView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="TrainingView" className="space-y-4">
    {children}
  </section>
);
