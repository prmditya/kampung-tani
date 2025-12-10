import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
    paddingBottom: 15,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 35,
    objectFit: 'contain',
  },
  headerRight: {
    textAlign: 'right',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
  },
  card: {
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 6,
    marginBottom: 12,
    padding: 12,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 6,
  },
  farmInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  farmInfoItem: {
    width: '25%',
    marginBottom: 6,
  },
  farmInfoLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  farmInfoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '32%',
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: '#d1fae5',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 10,
    color: '#10b981',
    textAlign: 'center',
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
  },
  statValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  statBoxAvg: {
    flex: 1,
    backgroundColor: '#d1fae5',
    borderRadius: 4,
    padding: 4,
    alignItems: 'center',
    marginHorizontal: 1,
  },
  statBoxLabel: {
    fontSize: 6,
    color: '#6b7280',
    marginBottom: 1,
  },
  statBoxValue: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#111827',
  },
  statBoxValueAvg: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#059669',
  },
  recommendations: {
    marginTop: 4,
  },
  recommendationItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 4,
  },
  note: {
    fontSize: 8,
    color: '#9ca3af',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    borderTopWidth: 2,
    borderTopColor: '#10b981',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
  },
});

// Measurement type short codes (instead of emojis which don't render well)
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
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farm Information</Text>
          <View style={styles.farmInfoGrid}>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>Farmer</Text>
              <Text style={styles.farmInfoValue}>{farmerName}</Text>
            </View>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>Farm</Text>
              <Text style={styles.farmInfoValue}>{farmName}</Text>
            </View>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>Location</Text>
              <Text style={styles.farmInfoValue}>{location}</Text>
            </View>
            <View style={styles.farmInfoItem}>
              <Text style={styles.farmInfoLabel}>Period</Text>
              <Text style={styles.farmInfoValue}>{period}</Text>
            </View>
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.statsGrid}>
          {summaryEntries.map(([type, stats]) => (
            <View key={type} style={styles.statCard}>
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
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recommendations</Text>
          <View style={styles.recommendations}>
            <Text style={styles.recommendationItem}>
              • Monitor soil parameters regularly
            </Text>
            <Text style={styles.recommendationItem}>
              • Maintain balanced N-P-K levels
            </Text>
            <Text style={styles.recommendationItem}>
              • Keep soil moisture within optimal range
            </Text>
            <Text style={styles.recommendationItem}>
              • Ensure pH is suitable for nutrient availability
            </Text>
          </View>
          <Text style={styles.note}>
            Note: Consult agricultural experts for specific recommendations.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © {new Date().getFullYear()} Kampoeng Tani
          </Text>
        </View>
      </Page>
    </Document>
  );
}
