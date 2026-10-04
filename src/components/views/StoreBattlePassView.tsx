import React from 'react';

export const StoreBattlePassView: React.FC<Record<string, any>> = ({ children }) => (
  <section data-component="StoreBattlePassView" className="space-y-4">
    {children}
  </section>
);
