import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2px solid #1976d2',
    paddingBottom: 15,
  },
  logoSection: {
    marginBottom: 15,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 80,
    height: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976d2',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  carGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  carCard: {
    width: '48%',
    border: '2px solid #e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
    marginBottom: 15,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  carHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  carName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  price: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
    backgroundColor: '#e3f2fd',
    padding: '3px 6px',
    borderRadius: 4,
    border: '1px solid #1976d2',
  },
  brandName: {
    fontSize: 9,
    color: '#666',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  specItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
    border: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  specText: {
    fontSize: 8,
    color: '#333',
    fontWeight: 'bold',
  },
  scoreSection: {
    marginBottom: 8,
  },
  scoreButton: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    padding: 4,
    borderRadius: 4,
    marginBottom: 3,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 8,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    textAlign: 'center',
  },
  actionButtonText: {
    fontSize: 7,
    color: '#fff',
    fontWeight: 'bold',
  },
  colorsSection: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
  },
  footer: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
    borderTop: '1px solid #e0e0e0',
    paddingTop: 10,
  },
  noImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderRadius: 4,
    border: '1px dashed #ccc',
  },
  noImageText: {
    fontSize: 9,
    color: '#999',
    fontStyle: 'italic',
  },
  summarySection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
    border: '1px solid #e9ecef',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 9,
    color: '#6c757d',
    lineHeight: 1.4,
  },
  carImagesContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
    justifyContent: 'center',
  },
  carImage: {
    width: '48%',
    height: 80,
    borderRadius: 4,
    objectFit: 'cover',
  },
  moreImagesIndicator: {
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: '2px 6px',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    width: '48%',
    height: 80,
  },
  moreImagesText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: 'bold',
  },
});

interface CarPDFProps {
  selectedItem: any;
  modelCars: any[];
  searchTitle?: string;
  imageBase64Map?: { [key: string]: string };
}

const CarPDF: React.FC<CarPDFProps> = ({ selectedItem, modelCars, searchTitle, imageBase64Map = {} }) => {

  const formatInternational = (price: number) => {
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const generateCarChatMessage = (selectedItem: any, carCount: number) => {
    if (!selectedItem) return '';
    
    const keys = Object.keys(selectedItem);
    if (keys.length === 0) return '';
    
    const firstKey = keys[0];
    const cars = selectedItem[firstKey];
    
    if (Array.isArray(cars) && cars.length > 0) {
      const firstCar = cars[0];
      return `Here are ${carCount} ${firstCar.ModelName} variants for you to choose from. Each variant offers different features and pricing to suit your needs.`;
    }
    
    return 'Car recommendations based on your preferences.';
  };

  const message = generateCarChatMessage(selectedItem, modelCars.length);

  // Calculate summary statistics
  const totalPrice = modelCars.reduce((sum, car) => sum + (car.Price || 0), 0);
  const avgPrice = totalPrice / modelCars.length;
  const fuelTypes = [...new Set(modelCars.map(car => car.FuelType).filter(Boolean))];
  const transmissionTypes = [...new Set(modelCars.map(car => car.Trans_fullform).filter(Boolean))];

  return (
    <Document>
      {/* First Page - Header, Summary, and 2 Cards */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo Section - Top Left */}
          <View style={styles.logoSection}>
            <Image
              src="https://www.aicaradvisor.com/assets/logo.jpeg"
              style={styles.logo}
            />
          </View>
          
          <Text style={styles.title}>{searchTitle || "AI Car Advisor - Car Recommendations"}</Text>
          <Text style={styles.subtitle}>{message}</Text>
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <Text style={styles.summaryText}>
            Total Variants: {modelCars.length} | 
            Average Price: ₹{formatInternational(Math.round(avgPrice))} | 
            Fuel Types: {fuelTypes.join(', ')} | 
            Transmission: {transmissionTypes.join(', ')}
          </Text>
        </View>

        {/* First 2 Car Cards */}
        <View style={styles.carGrid}>
          {modelCars.slice(0, 2).map((car: any, index: number) => (
            <View key={index} style={styles.carCard}>
              {/* Car Images */}
              {car?.CarImageDetails && Array.isArray(car.CarImageDetails) && car.CarImageDetails.length > 0 ? (
                <View style={styles.carImagesContainer}>
                  {car.CarImageDetails.slice(0, 2).map((imageDetail: any, imgIdx: number) => {
                    const base64Image = imageBase64Map[imageDetail.CarImageURL];
                    if (base64Image && base64Image !== 'no-cors-fallback') {
                      return (
                        <Image
                          key={imgIdx}
                          src={base64Image}
                          style={styles.carImage}
                        />
                      );
                    } else if (base64Image === 'no-cors-fallback') {
                      return (
                        <View key={imgIdx} style={styles.noImage}>
                          <Text style={styles.noImageText}>Image Available</Text>
                        </View>
                      );
                    } else {
                      return (
                        <View key={imgIdx} style={styles.noImage}>
                          <Text style={styles.noImageText}>Image Loading...</Text>
                        </View>
                      );
                    }
                  })}
                  {car.CarImageDetails.length > 2 && (
                    <View style={styles.moreImagesIndicator}>
                      <Text style={styles.moreImagesText}>+{car.CarImageDetails.length - 2}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.noImage}>
                  <Text style={styles.noImageText}>Car Image</Text>
                </View>
              )}

              {/* Car Header */}
              <View style={styles.carHeader}>
                <Text style={styles.carName}>
                  {car.VariantName || 'Variant Name'}
                </Text>
                <Text style={styles.price}>
                  ₹{formatInternational(car.Price || 0)}
                </Text>
              </View>

              {/* Brand Name */}
              <Text style={styles.brandName}>{car.BrandName || 'Brand Name'}</Text>

              {/* Colors */}
              {car?.Colors && Array.isArray(car.Colors) && car.Colors.length > 0 && (
                <View style={styles.colorsSection}>
                  {car.Colors.slice(0, 6).map((color: any, idx: number) => (
                    <View
                      key={idx}
                      style={[
                        styles.colorDot,
                        {
                          backgroundColor: color.ColorHex && !color.ColorHex.includes(",")
                            ? color.ColorHex
                            : "#ccc",
                        }
                      ]}
                    />
                  ))}
                  {car.Colors.length > 6 && (
                    <Text style={styles.specText}>+{car.Colors.length - 6}</Text>
                  )}
                </View>
              )}

              {/* Specifications Grid */}
              <View style={styles.specsGrid}>
                {[
                  { label: `${car.FuelType || 'N/A'}` },
                  { label: `${car.Trans_fullform || 'N/A'}` },
                  { label: `${car.Seats || 'N/A'} Seater` },
                  { label: `${car.Mileage || 'N/A'} kmpl` },
                ].map((item, idx) => (
                  <View key={idx} style={styles.specItem}>
                    <Text style={styles.specText}>{item.label}</Text>
                  </View>
                ))}
              </View>

              {/* AI Score and Sentiments */}
              <View style={styles.scoreSection}>
                <View style={styles.scoreButton}>
                  <Text style={styles.scoreText}>
                    AI Score: {car?.AIScore || "--"}
                  </Text>
                </View>
                <View style={styles.scoreButton}>
                  <Text style={styles.scoreText}>
                    Sentiments: {car?.AISummary || "--"}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <View style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>EMI</Text>
                </View>
                <View style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Test Drive</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated by AI Car Advisor on {new Date().toLocaleDateString('en-IN')}</Text>
          <Text>For more details, visit our website</Text>
        </View>
      </Page>

      {/* Second Page - Remaining 4 Cards */}
      {modelCars.length > 2 && (
        <Page size="A4" style={styles.page}>
          {/* Remaining Car Cards */}
          <View style={styles.carGrid}>
            {modelCars.slice(2).map((car: any, index: number) => (
              <View key={index + 2} style={styles.carCard}>
                {/* Car Images */}
                {car?.CarImageDetails && Array.isArray(car.CarImageDetails) && car.CarImageDetails.length > 0 ? (
                  <View style={styles.carImagesContainer}>
                    {car.CarImageDetails.slice(0, 2).map((imageDetail: any, imgIdx: number) => {
                      const base64Image = imageBase64Map[imageDetail.CarImageURL];
                      if (base64Image && base64Image !== 'no-cors-fallback') {
                        return (
                          <Image
                            key={imgIdx}
                            src={base64Image}
                            style={styles.carImage}
                          />
                        );
                      } else if (base64Image === 'no-cors-fallback') {
                        return (
                          <View key={imgIdx} style={styles.noImage}>
                            <Text style={styles.noImageText}>Image Available</Text>
                          </View>
                        );
                      } else {
                        return (
                          <View key={imgIdx} style={styles.noImage}>
                            <Text style={styles.noImageText}>Image Loading...</Text>
                          </View>
                        );
                      }
                    })}
                    {car.CarImageDetails.length > 2 && (
                      <View style={styles.moreImagesIndicator}>
                        <Text style={styles.moreImagesText}>+{car.CarImageDetails.length - 2}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.noImage}>
                    <Text style={styles.noImageText}>Car Image</Text>
                  </View>
                )}

                {/* Car Header */}
                <View style={styles.carHeader}>
                  <Text style={styles.carName}>
                    {car.VariantName || 'Variant Name'}
                  </Text>
                  <Text style={styles.price}>
                    ₹{formatInternational(car.Price || 0)}
                  </Text>
                </View>

                {/* Brand Name */}
                <Text style={styles.brandName}>{car.BrandName || 'Brand Name'}</Text>

                {/* Colors */}
                {car?.Colors && Array.isArray(car.CarImageDetails) && car.Colors.length > 0 && (
                  <View style={styles.colorsSection}>
                    {car.Colors.slice(0, 6).map((color: any, idx: number) => (
                      <View
                        key={idx}
                        style={[
                          styles.colorDot,
                          {
                            backgroundColor: color.ColorHex && !color.ColorHex.includes(",")
                              ? color.ColorHex
                              : "#ccc",
                          }
                        ]}
                      />
                    ))}
                    {car.Colors.length > 6 && (
                      <Text style={styles.specText}>+{car.Colors.length - 6}</Text>
                    )}
                  </View>
                )}

                {/* Specifications Grid */}
                <View style={styles.specsGrid}>
                  {[
                    { label: `${car.FuelType || 'N/A'}` },
                    { label: `${car.Trans_fullform || 'N/A'}` },
                    { label: `${car.Seats || 'N/A'} Seater` },
                    { label: `${car.Mileage || 'N/A'} kmpl` },
                  ].map((item, idx) => (
                    <View key={idx} style={styles.specItem}>
                      <Text style={styles.specText}>{item.label}</Text>
                    </View>
                  ))}
                </View>

                {/* AI Score and Sentiments */}
                <View style={styles.scoreSection}>
                  <View style={styles.scoreButton}>
                    <Text style={styles.scoreText}>
                      AI Score: {car?.AIScore || "--"}
                    </Text>
                  </View>
                  <View style={styles.scoreButton}>
                    <Text style={styles.scoreText}>
                      Sentiments: {car?.AISummary || "--"}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>EMI</Text>
                  </View>
                  <View style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Test Drive</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text>Generated by AI Car Advisor on {new Date().toLocaleDateString('en-IN')}</Text>
            <Text>For more details, visit our website</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default CarPDF;
