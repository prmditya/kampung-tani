/**
 * Chart data point interface for time series data
 */
interface ChartDataPoint {
  time: string;
  [key: string]: string | number | null | undefined;
}

/**
 * Downsamples data for chart rendering using simple bucket aggregation (averaging).
 * This significantly improves rendering performance for large datasets while maintaining visual trends.
 *
 * @param data Array of data points
 * @param targetPoints Maximum number of points to render
 * @param valueKeys Keys in the data objects to downsample (e.g. sensor types)
 * @returns Downsampled array
 */
export function downsampleData<T extends Record<string, unknown>>(
  data: T[],
  targetPoints: number,
  valueKeys: string[],
): T[] {
  if (data.length <= targetPoints) {
    return data;
  }

  const bucketSize = data.length / targetPoints;
  const sampledData: T[] = [];

  for (let i = 0; i < targetPoints; i++) {
    // Define bucket range
    const start = Math.floor(i * bucketSize);
    const end = Math.min(Math.floor((i + 1) * bucketSize), data.length);

    if (start >= end) continue;

    const bucketParams = data.slice(start, end);
    const centerIndex = Math.floor((start + end) / 2);

    // Create a new point based on the center point of the bucket to preserve non-numeric props (like timestamp strings)
    // We'll use the timestamp of the middle item in the bucket
    const point: Record<string, unknown> = { ...data[centerIndex] };

    // Calculate average for each value key
    valueKeys.forEach((key) => {
      let sum = 0;
      let count = 0;
      let hasValue = false;

      bucketParams.forEach((item) => {
        const val = item[key];
        if (typeof val === 'number') {
          sum += val;
          count++;
          hasValue = true;
        }
      });

      if (hasValue) {
        point[key] = Number((sum / count).toFixed(2));
      } else {
        point[key] = null;
      }
    });

    sampledData.push(point as T);
  }

  return sampledData;
}

/**
 * Aggregates data points by time interval (e.g., 10s, 30s, 1m, 5m).
 * Groups data into time buckets and calculates average value for each interval.
 * This is similar to Grafana's interval/aggregation feature.
 *
 * @param data Array of data points with a 'time' property (HH:mm:ss format)
 * @param intervalSeconds Interval in seconds (e.g., 60 for 1 minute)
 * @param valueKeys Keys in the data objects to aggregate
 * @returns Aggregated array with one point per interval
 */
export function aggregateByInterval<T extends ChartDataPoint>(
  data: T[],
  intervalSeconds: number,
  valueKeys: string[],
): T[] {
  if (!data.length || intervalSeconds <= 0) {
    return data;
  }

  // Parse time strings to get timestamps
  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  // Group data by interval buckets
  const buckets = new Map<number, T[]>();

  data.forEach((point) => {
    const timeStr = point.time;
    const totalSeconds = parseTime(timeStr);
    // Round down to nearest interval
    const bucketKey =
      Math.floor(totalSeconds / intervalSeconds) * intervalSeconds;

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey)!.push(point);
  });

  // Convert buckets back to array, sorting by bucket key
  const sortedBucketKeys = Array.from(buckets.keys()).sort((a, b) => a - b);
  const result: T[] = [];

  sortedBucketKeys.forEach((bucketKey) => {
    const bucketData = buckets.get(bucketKey)!;
    if (bucketData.length === 0) return;

    // Use the first point as template (cast to mutable Record)
    const aggregatedPoint: Record<string, unknown> = { ...bucketData[0] };

    // Convert bucket key back to time string
    const hours = Math.floor(bucketKey / 3600);
    const minutes = Math.floor((bucketKey % 3600) / 60);
    const seconds = bucketKey % 60;
    aggregatedPoint.time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Calculate average for each value key
    valueKeys.forEach((key) => {
      let sum = 0;
      let count = 0;

      bucketData.forEach((item) => {
        const val = item[key];
        if (typeof val === 'number') {
          sum += val;
          count++;
        }
      });

      if (count > 0) {
        aggregatedPoint[key] = Number((sum / count).toFixed(2));
      } else {
        aggregatedPoint[key] = null;
      }
    });

    result.push(aggregatedPoint as T);
  });

  return result;
}

/**
 * LTTB (Largest-Triangle-Three-Buckets) downsampling algorithm.
 * Preserves visual peaks and valleys better than simple averaging.
 * Ideal for time series data visualization.
 *
 * @param data Array of data points
 * @param threshold Target number of points
 * @param xKey Key for x-axis value (typically timestamp)
 * @param yKey Key for y-axis value
 * @returns Downsampled array preserving visual characteristics
 */
export function lttbDownsample<T extends Record<string, unknown>>(
  data: T[],
  threshold: number,
  xKey: string,
  yKey: string,
): T[] {
  if (threshold >= data.length || threshold <= 2) {
    return data;
  }

  const sampled: T[] = [];
  const bucketSize = (data.length - 2) / (threshold - 2);

  // Always add the first point
  sampled.push(data[0]);

  let a = 0;

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate bucket range
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      data.length,
    );

    // Calculate average of next bucket (for the target point)
    const nextBucketStart = Math.floor((i + 2) * bucketSize) + 1;
    const nextBucketEnd = Math.min(
      Math.floor((i + 3) * bucketSize) + 1,
      data.length,
    );

    let avgX = 0;
    let avgY = 0;
    let avgCount = 0;

    for (let j = nextBucketStart; j < nextBucketEnd; j++) {
      const xVal = data[j][xKey];
      const yVal = data[j][yKey];
      if (typeof xVal === 'number' && typeof yVal === 'number') {
        avgX += xVal;
        avgY += yVal;
        avgCount++;
      }
    }

    if (avgCount > 0) {
      avgX /= avgCount;
      avgY /= avgCount;
    }

    // Find the point in current bucket with maximum triangle area
    let maxArea = -1;
    let maxAreaIndex = bucketStart;

    const pointAX = data[a][xKey];
    const pointAY = data[a][yKey];

    if (typeof pointAX === 'number' && typeof pointAY === 'number') {
      for (let j = bucketStart; j < bucketEnd; j++) {
        const pointX = data[j][xKey];
        const pointY = data[j][yKey];

        if (typeof pointX === 'number' && typeof pointY === 'number') {
          // Calculate triangle area using cross product
          const area = Math.abs(
            (pointAX - avgX) * (pointY - pointAY) -
              (pointAX - pointX) * (avgY - pointAY),
          );

          if (area > maxArea) {
            maxArea = area;
            maxAreaIndex = j;
          }
        }
      }
    }

    sampled.push(data[maxAreaIndex]);
    a = maxAreaIndex;
  }

  // Always add the last point
  sampled.push(data[data.length - 1]);

  return sampled;
}
