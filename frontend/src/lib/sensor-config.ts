/**
 * Sensor Chart Grouping Configuration
 *
 * This file defines chart groups for sensor data visualization.
 * Groups are determined by measurement type name and unit, making it easy
 * to add new sensor types by simply updating the configuration.
 */

// Chart group definitions
export const CHART_GROUPS = {
  CLIMATE: {
    id: 'climate',
    title: 'Temperature & Moisture',
    description:
      'Environmental conditions including temperature, humidity, and moisture levels',
    units: ['C', '%', 'Celcius', 'Wm2', '°C'],
    color: '#10b981', // Emerald
  },
  NUTRIENTS: {
    id: 'nutrients',
    title: 'Nutrients & Conductivity',
    description: 'Soil nutrients and electrical conductivity measurements',
    units: ['ppm', 'mg/kg', 'uS/cm', 'ppt', 'mS/cm'],
    color: '#3b82f6', // Blue
  },
  CHEMICAL: {
    id: 'chemical',
    title: 'Chemical & System',
    description: 'pH levels and system voltage readings',
    units: ['pH', 'V', 'Volts'],
    color: '#f59e0b', // Amber
  },
  MISC: {
    id: 'misc',
    title: 'Other Measurements',
    description: 'Additional sensor readings',
    units: [],
    color: '#8b5cf6', // Violet
  },
} as const;

export type ChartGroupId = keyof typeof CHART_GROUPS;

// Keywords for measurement type matching (case-insensitive)
const MEASUREMENT_TYPE_KEYWORDS: Record<
  Exclude<ChartGroupId, 'MISC'>,
  string[]
> = {
  CLIMATE: [
    'temp',
    'temperature',
    'humid',
    'humidity',
    'moisture',
    'solar',
    'radiation',
    'light',
  ],
  NUTRIENTS: [
    'nitrogen',
    'phosphorus',
    'potassium',
    'npk',
    'conductivity',
    'ec',
    'tds',
    'salinity',
  ],
  CHEMICAL: ['ph', 'voltage', 'battery', 'power'],
};

/**
 * Determines which chart group a parameter belongs to.
 *
 * Priority:
 * 1. Check measurement type name (contains keywords)
 * 2. Check unit
 * 3. Default to MISC
 *
 * @param measurementType - The name of the measurement type (e.g., "Temperature", "pH Level")
 * @param unit - The unit of measurement (e.g., "C", "pH", "ppm")
 * @returns The chart group ID
 */
export function getGroupForParameter(
  measurementType: string,
  unit?: string | null,
): ChartGroupId {
  const lowerType = measurementType.toLowerCase();

  // Priority 1: Check measurement type name for keywords
  for (const [groupId, keywords] of Object.entries(MEASUREMENT_TYPE_KEYWORDS)) {
    if (keywords.some((keyword) => lowerType.includes(keyword))) {
      return groupId as ChartGroupId;
    }
  }

  // Priority 2: Check unit
  if (unit) {
    for (const [groupId, group] of Object.entries(CHART_GROUPS)) {
      if (groupId === 'MISC') continue;
      if (group.units.some((u) => u.toLowerCase() === unit.toLowerCase())) {
        return groupId as ChartGroupId;
      }
    }
  }

  // Priority 3: Default to MISC
  return 'MISC';
}

/**
 * Groups chart data by chart categories.
 *
 * @param chartData - Array of chart data points with measurement types as keys
 * @param measurementTypes - Array of measurement type names
 * @param units - Record mapping measurement type to unit
 * @returns Object with grouped data for each chart category
 */
export function groupChartData<
  T extends { time: string; [key: string]: string | number | null | undefined },
>(
  chartData: T[],
  measurementTypes: string[],
  units: Record<string, string>,
): Record<
  ChartGroupId,
  {
    data: T[];
    types: string[];
    hasData: boolean;
  }
> {
  // Initialize groups
  const groups: Record<
    ChartGroupId,
    { data: T[]; types: string[]; hasData: boolean }
  > = {
    CLIMATE: { data: [], types: [], hasData: false },
    NUTRIENTS: { data: [], types: [], hasData: false },
    CHEMICAL: { data: [], types: [], hasData: false },
    MISC: { data: [], types: [], hasData: false },
  };

  // Categorize measurement types into groups
  measurementTypes.forEach((type) => {
    const groupId = getGroupForParameter(type, units[type]);
    groups[groupId].types.push(type);
  });

  // Filter chart data for each group
  Object.keys(groups).forEach((groupId) => {
    const group = groups[groupId as ChartGroupId];
    if (group.types.length === 0) return;

    group.data = chartData.map((point) => {
      const filteredPoint: Record<string, string | number | null | undefined> =
        { time: point.time };
      group.types.forEach((type) => {
        filteredPoint[type] = point[type];
      });
      return filteredPoint as T;
    });

    // Check if group has any non-null data
    group.hasData = group.data.some((point) =>
      group.types.some(
        (type) => point[type] !== null && point[type] !== undefined,
      ),
    );
  });

  return groups;
}

/**
 * Gets the group configuration for a given group ID.
 */
export function getGroupConfig(groupId: ChartGroupId) {
  return CHART_GROUPS[groupId];
}

/**
 * Returns all groups that have data.
 */
export function getActiveGroups(
  groups: Record<ChartGroupId, { hasData: boolean }>,
): ChartGroupId[] {
  return (Object.keys(groups) as ChartGroupId[]).filter(
    (id) => groups[id].hasData,
  );
}
