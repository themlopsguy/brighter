// components/PdfView.tsx

import React from 'react';
import { StyleSheet, View, ViewStyle, ActivityIndicator, Text } from 'react-native';
import Pdf from 'react-native-pdf';
import { PrepTalkTheme } from '@/constants/Theme';

interface PdfViewProps {
  /** File path or URL to the PDF */
  source: string;
  /** Custom style for the container */
  style?: ViewStyle;
  /** Custom style for the PDF component */
  pdfStyle?: ViewStyle;
  /** Enable/disable horizontal scrolling */
  horizontal?: boolean;
  /** Enable/disable paging */
  enablePaging?: boolean;
  /** Scale factor for the PDF */
  scale?: number;
  /** Minimum scale */
  minScale?: number;
  /** Maximum scale */
  maxScale?: number;
  /** Spacing between pages */
  spacing?: number;
  /** Fit policy: 0 = fit width, 1 = fit height, 2 = fit both */
  fitPolicy?: number;
  /** Show loading indicator */
  showLoading?: boolean;
  /** Custom loading component */
  renderLoading?: () => React.ReactNode;
  /** Callback when PDF loads successfully */
  onLoadComplete?: (numberOfPages: number, filePath?: string) => void;
  /** Callback when page changes */
  onPageChanged?: (page: number, numberOfPages: number) => void;
  /** Callback when error occurs */
  onError?: (error: any) => void;
  /** Callback when link is pressed */
  onPressLink?: (uri: string) => void;
}

const PdfView: React.FC<PdfViewProps> = ({
  source,
  style,
  pdfStyle,
  horizontal = false,
  enablePaging = true,
  scale = 1.0,
  minScale = 0.5,
  maxScale = 3.0,
  spacing = 10,
  fitPolicy = 0,
  showLoading = true,
  renderLoading,
  onLoadComplete,
  onPageChanged,
  onError,
  onPressLink,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Determine source format based on input
  const getPdfSource = () => {
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return { uri: source, cache: true };
    } else if (source.startsWith('file://')) {
      return { uri: source };
    } else if (source.startsWith('/')) {
      return { uri: `file://${source}` };
    } else {
      // Assume it's a relative path or bundle asset
      return { uri: source };
    }
  };

  const handleLoadComplete = (numberOfPages: number, filePath?: string) => {
    setIsLoading(false);
    setError(null);
    onLoadComplete?.(numberOfPages, filePath);
    console.log(`PDF loaded successfully: ${numberOfPages} pages`);
  };

  const handleError = (error: any) => {
    setIsLoading(false);
    setError(error?.message || 'Failed to load PDF');
    onError?.(error);
    console.error('PDF load error:', error);
  };

  const handlePageChanged = (page: number, numberOfPages: number) => {
    onPageChanged?.(page, numberOfPages);
  };

  const handlePressLink = (uri: string) => {
    onPressLink?.(uri);
    console.log(`PDF link pressed: ${uri}`);
  };

  const renderLoadingComponent = () => {
    if (renderLoading) {
      return renderLoading();
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PrepTalkTheme.colors.primary} />
        <Text style={styles.loadingText}>Loading PDF...</Text>
      </View>
    );
  };

  const renderErrorComponent = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>Failed to load PDF</Text>
      <Text style={styles.errorSubtext}>{error}</Text>
    </View>
  );

  if (error) {
    return (
      <View style={[styles.container, style]}>
        {renderErrorComponent()}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {isLoading && showLoading && renderLoadingComponent()}
      
      <Pdf
        source={getPdfSource()}
        onLoadComplete={handleLoadComplete}
        onPageChanged={handlePageChanged}
        onError={handleError}
        onPressLink={handlePressLink}
        horizontal={horizontal}
        enablePaging={enablePaging}
        scale={scale}
        minScale={minScale}
        maxScale={maxScale}
        spacing={spacing}
        fitPolicy={fitPolicy}
        style={[
          styles.pdf,
          pdfStyle,
          isLoading && showLoading && styles.hiddenPdf
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdf: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  hiddenPdf: {
    opacity: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: PrepTalkTheme.colors.error || '#FF6B6B',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    color: PrepTalkTheme.colors.mediumGray,
    textAlign: 'center',
  },
});

export default PdfView;