import type { AnyRecord, PlanetColony } from '../types';

export function calculateColonyMaintenance(colony: PlanetColony = {}, totalColonies = 1, ..._args: any[]): number {
  const level = Number(colony?.level || 1);
  const isHomeworld = Boolean(colony?.isHomeworld);
  const population = Number(colony?.population || 0);
  const baseMaint = isHomeworld ? 1000 : 2500 * level;
  const popMaint = Math.max(0, Math.floor(population * 0.0005));
  const expansionFactor = Math.max(1, 1 + (Number(totalColonies) - 1) * 0.1);
  return Math.round((baseMaint + popMaint) * expansionFactor);
}

export function getColonyMaintenanceDetails(colony: PlanetColony = {}, totalColonies = 1, ..._args: any[]): AnyRecord {
  const maintenance = calculateColonyMaintenance(colony, totalColonies);
  return { maintenance, population: Number(colony?.population || 0) };
}

export function getEmpireColonialSummary(planets: PlanetColony[] = []): AnyRecord {
  const safePlanets = Array.isArray(planets) ? planets : [];
  const colonyCount = safePlanets.length;
  const totalMaintenanceCost = safePlanets.reduce((sum, planet) => sum + calculateColonyMaintenance(planet, colonyCount), 0);
  const totalGrossIncome = safePlanets.reduce((sum, p) => sum + Number(p?.incomeBonus || (Number(p?.level || 1) * 10000 + 5000)), 0);
  const netColonialIncome = Math.max(0, totalGrossIncome - totalMaintenanceCost);
  const expansionEfficiencyPercent = totalGrossIncome > 0
    ? Math.max(0, Math.round(((totalGrossIncome - totalMaintenanceCost) / totalGrossIncome) * 100))
    : 100;
  const expansionEfficiencyRating = expansionEfficiencyPercent >= 75
    ? 'Optimal'
    : expansionEfficiencyPercent >= 50
    ? 'Sustainable'
    : expansionEfficiencyPercent >= 25
    ? 'Strained'
    : 'Critical';

  return {
    colonyCount,
    totalGrossIncome,
    totalMaintenanceCost,
    totalMaintenance: totalMaintenanceCost,
    netColonialIncome,
    expansionEfficiencyPercent,
    expansionEfficiencyRating,
  };
}
