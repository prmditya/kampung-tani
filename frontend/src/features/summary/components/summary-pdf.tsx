import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer';

// Register Inter font from CDN (using TTF format which is more compatible with react-pdf)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf',
      fontWeight: 400,
      fontStyle: 'italic',
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf',
      fontWeight: 600,
    },
    {
      src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf',
      fontWeight: 700,
    },
  ],
});

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontFamily: 'Inter',
    backgroundColor: '#ffffff',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  logoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
  },
  logoTextSecond: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerRight: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  // Farm Info Card
  farmCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  farmCardHeader: {
    backgroundColor: '#10b981',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmCardHeaderIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  farmCardTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  farmCardBody: {
    padding: 12,
  },
  farmInfoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  farmInfoRowLast: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  farmInfoLabel: {
    width: 100,
    fontSize: 9,
    color: '#6b7280',
  },
  farmInfoValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  statCard: {
    width: '33.33%',
    padding: 4,
  },
  statCardInner: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 10,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1fae5',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#10b981',
  },
  statTitleContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  statSubtitle: {
    fontSize: 7,
    color: '#6b7280',
    marginTop: 1,
  },
  statValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
  },
  statBoxAvg: {
    flex: 1,
    backgroundColor: '#d1fae5',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 6,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  statBoxValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
  },
  statBoxValueAvg: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#059669',
  },
  // Recommendations
  recommendationsCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    marginTop: 16,
    overflow: 'hidden',
  },
  recommendationsHeader: {
    backgroundColor: '#fef3c7',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendationsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400e',
  },
  recommendationsBody: {
    padding: 12,
  },
  recommendationItem: {
    fontSize: 8,
    color: '#374151',
    marginBottom: 6,
    paddingLeft: 8,
  },
  recommendationBullet: {
    position: 'absolute',
    left: 0,
  },
  note: {
    fontSize: 7,
    color: '#9ca3af',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
  },
});

// Measurement type short codes
const measurementShortCodes: Record<string, string> = {
  Moisture: 'H₂O',
  Temperature: '°C',
  Nitrogen: 'N',
  Phosphorus: 'P',
  Potassium: 'K',
  PH: 'pH',
  Conductivity: 'EC',
  TDS: 'TDS',
  Salinity: 'NaCl',
};

interface SummaryStats {
  unit: string;
  count: number;
  min_value: number | null;
  max_value: number | null;
  avg_value: number | null;
}

interface SummaryPDFProps {
  farmerName: string;
  farmName: string;
  location: string;
  period: string;
  generatedAt: string;
  summary: Record<string, SummaryStats>;
}

export function SummaryPDFDocument({
  farmerName,
  farmName,
  location,
  period,
  generatedAt,
  summary,
}: SummaryPDFProps) {
  const summaryEntries = Object.entries(summary);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image src="/assets/kt-logo.png" style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.headerTitle}>Farm Data Summary Report</Text>
            <Text style={styles.headerSubtitle}>Generated: {generatedAt}</Text>
          </View>
        </View>

        {/* Farm Information */}
        <View style={styles.farmCard}>
          <View style={styles.farmCardHeader}>
            <Text style={styles.farmCardTitle}>Farm Information</Text>
          </View>
          <View style={styles.farmCardBody}>
            <View style={styles.farmInfoRow}>
              <Text style={styles.farmInfoLabel}>Farmer</Text>
              <Text style={styles.farmInfoValue}>{farmerName}</Text>
            </View>
            <View style={styles.farmInfoRow}>
              <Text style={styles.farmInfoLabel}>Farm Name</Text>
              <Text style={styles.farmInfoValue}>{farmName}</Text>
            </View>
            <View style={styles.farmInfoRow}>
              <Text style={styles.farmInfoLabel}>Location</Text>
              <Text style={styles.farmInfoValue}>{location}</Text>
            </View>
            <View style={styles.farmInfoRowLast}>
              <Text style={styles.farmInfoLabel}>Reporting Period</Text>
              <Text style={styles.farmInfoValue}>{period}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          {summaryEntries.map(([type, stats]) => (
            <View key={type} style={styles.statCard}>
              <View style={styles.statCardInner}>
                <View style={styles.statHeader}>
                  <View style={styles.statIcon}>
                    <Text style={styles.statIconText}>
                      {measurementShortCodes[type] || '?'}
                    </Text>
                  </View>
                  <View style={styles.statTitleContainer}>
                    <Text style={styles.statTitle}>{type}</Text>
                    <Text style={styles.statSubtitle}>
                      {stats.unit} • {stats.count} readings
                    </Text>
                  </View>
                </View>
                <View style={styles.statValues}>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Min</Text>
                    <Text style={styles.statBoxValue}>
                      {stats.min_value?.toFixed(2) ?? '-'}
                    </Text>
                  </View>
                  <View style={styles.statBoxAvg}>
                    <Text style={styles.statBoxLabel}>Avg</Text>
                    <Text style={styles.statBoxValueAvg}>
                      {stats.avg_value?.toFixed(2) ?? '-'}
                    </Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statBoxLabel}>Max</Text>
                    <Text style={styles.statBoxValue}>
                      {stats.max_value?.toFixed(2) ?? '-'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.recommendationsCard}>
          <View style={styles.recommendationsHeader}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
          </View>
          <View style={styles.recommendationsBody}>
            <Text style={styles.recommendationItem}>
              • Monitor soil parameters regularly to track changes over time.
            </Text>
            <Text style={styles.recommendationItem}>
              • Maintain balanced N-P-K levels for optimal crop growth.
            </Text>
            <Text style={styles.recommendationItem}>
              • Keep soil moisture within the optimal range for your specific
              crop type.
            </Text>
            <Text style={styles.recommendationItem}>
              • Ensure pH is suitable for nutrient availability (Target 6.0 -
              7.0 for most crops).
            </Text>
            <Text style={styles.note}>
              Note: Consult agricultural experts for specific recommendations
              tailored to your crops and conditions.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Kampoeng Tani. All rights reserved.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
