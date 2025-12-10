'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { SummaryPDFDocument } from './summary-pdf';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface SummaryStats {
  unit: string;
  count: number;
  min_value: number | null;
  max_value: number | null;
  avg_value: number | null;
}

interface PDFDownloadWrapperProps {
  farmerName: string;
  farmName: string;
  location: string;
  period: string;
  generatedAt: string;
  summary: Record<string, SummaryStats>;
  fileName: string;
}

export default function PDFDownloadWrapper({
  farmerName,
  farmName,
  location,
  period,
  generatedAt,
  summary,
  fileName,
}: PDFDownloadWrapperProps) {
  return (
    <PDFDownloadLink
      document={
        <SummaryPDFDocument
          farmerName={farmerName}
          farmName={farmName}
          location={location}
          period={period}
          generatedAt={generatedAt}
          summary={summary}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
