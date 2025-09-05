import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

// Define styles for the detailed PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontSize: 10,
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: '2px solid #1976d2',
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logo: {
    width: 50,
    height: 25,
  },
  headerDetails: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    textAlign: 'right',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1976d2',
    marginTop: 0,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 0,
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
    borderBottom: '1px solid #1976d2',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 2,
  },
  infoLabel: {
    fontSize: 10,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 8,
  },
  featureChip: {
    backgroundColor: '#e8f5e8',
    border: '1px solid #4caf50',
    borderRadius: 4,
    padding: '4px 8px',
    marginBottom: 4,
    minWidth: 60,
    maxWidth: 120,
    flex: '0 0 auto',
  },
  featureChipUnavailable: {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ccc',
    borderRadius: 4,
    padding: '4px 8px',
    marginBottom: 4,
    minWidth: 60,
    maxWidth: 120,
    flex: '0 0 auto',
  },
  featureText: {
    fontSize: 8,
    color: '#333',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  featureTextUnavailable: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    lineHeight: 1.2,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 10,
    color: '#666',
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  carImage: {
    width: 200,
    height: 150,
    alignSelf: 'center',
    marginBottom: 15,
    borderRadius: 8,
    border: '2px solid #e0e0e0',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 15,
  },
  imageItem: {
    width: 120,
    height: 90,
    borderRadius: 6,
    border: '1px solid #e0e0e0',
  },
  reviewSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    border: '1px solid #e0e0e0',
  },
  reviewText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333',
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    paddingTop: 15,
    borderTop: '1px solid #e0e0e0',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666',
    marginBottom: 3,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 15,
  },
  column: {
    flex: 1,
  },
});

interface CarDetailsPDFProps {
  carData: {
    CarID: number;
    Brand: string;
    ModelId: number;
    ModelName: string;
    ModelYear: string;
    Mileage: string;
    EmissionNormCompliance: string;
    Price: number;
    VariantID: number;
    VariantName: string;
    Engine: any;
    Interior: any;
    DRIVERDISPLAY: any;
    AutomationsID: any;
    PARKINGSUPPORT: any;
    EXTERIOR: any;
    Luxury: any;
    Safety: any;
    ENTERTAINMENTANDCONNECT: any;
    AI_REVIEW: any;
    total_engin_rating: number;
    engin_rating: number;
    images: Array<{
      CarImageURL: string;
      color: string | null;
      Description: string | null;
    }>;
  };
}

const CarDetailsPDF: React.FC<CarDetailsPDFProps> = ({ carData }) => {
  // Debug: Log the car data received by PDF component
  console.log('CarDetailsPDF received carData:', carData);
  console.log('CarDetailsPDF Interior data:', carData.Interior);
  console.log('CarDetailsPDF Safety data:', carData.Safety);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderFeatureList = (features: any, title: string) => {
    console.log(`Processing ${title} features:`, features);
    const featureEntries = Object.entries(features);
    const availableFeatures = featureEntries.filter(([_, value]) => Number(value) >= 1);
    const unavailableFeatures = featureEntries.filter(([_, value]) => Number(value) === 0);
    
    console.log(`${title} - Available features:`, availableFeatures);
    console.log(`${title} - Unavailable features:`, unavailableFeatures);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        
        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#4caf50' }}>
          Available Features ({availableFeatures.length})
        </Text>
        <View style={styles.featureGrid}>
          {availableFeatures.map(([feature, _]) => (
            <View key={feature} style={styles.featureChip}>
              <Text style={styles.featureText}>
                {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>

        {unavailableFeatures.length > 0 && (
          <>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#666' }}>
              Not Available ({unavailableFeatures.length})
            </Text>
            <View style={styles.featureGrid}>
              {unavailableFeatures.map(([feature, _]) => (
                <View key={feature} style={styles.featureChipUnavailable}>
                  <Text style={styles.featureTextUnavailable}>
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            src="https://www.aicaradvisor.com/assets/logo.jpeg"
            style={styles.logo}
          />
          <View style={styles.headerDetails}>
            <Text style={styles.title}>
              {carData.Brand} {carData.ModelName}
            </Text>
            <Text style={styles.subtitle}>
              {carData.VariantName} ({carData.ModelYear})
            </Text>
            <Text style={styles.price}>
              {formatPrice(carData.Price)}
            </Text>
          </View>
        </View>

        {/* Car Images */}
        {carData.images && carData.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Car Images</Text>
            <View style={styles.imageGrid}>
              {carData.images.slice(0, 4).map((image, index) => (
                <Image
                  key={index}
                  src={image.CarImageURL}
                  style={styles.imageItem}
                />
              ))}
            </View>
          </View>
        )}

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Brand:</Text>
                <Text style={styles.infoValue}>{carData.Brand}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Model:</Text>
                <Text style={styles.infoValue}>{carData.ModelName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Variant:</Text>
                <Text style={styles.infoValue}>{carData.VariantName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Year:</Text>
                <Text style={styles.infoValue}>{carData.ModelYear}</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mileage:</Text>
                <Text style={styles.infoValue}>{carData.Mileage} kmpl</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Emission Norm:</Text>
                <Text style={styles.infoValue}>BS{carData.EmissionNormCompliance}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Engine Rating:</Text>
                <Text style={styles.ratingValue}>{carData.engin_rating}/100</Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>AiCarAdvisor Score:</Text>
                <Text style={styles.ratingValue}>{carData.total_engin_rating}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Engine Specifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine & Performance</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transmission:</Text>
                <Text style={styles.infoValue}>{carData.Engine.Transmission}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Engine Capacity:</Text>
                <Text style={styles.infoValue}>{carData.Engine.EngineCapacity}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Max Power:</Text>
                <Text style={styles.infoValue}>{carData.Engine.MaxPowerBhp} bhp @ {carData.Engine.MaxPowerRpm} rpm</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Max Torque:</Text>
                <Text style={styles.infoValue}>{carData.Engine.MaxTorqueBhp} Nm @ {carData.Engine.MaxTorqueRpm} rpm</Text>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Cylinders:</Text>
                <Text style={styles.infoValue}>{carData.Engine.Cylinder}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Valves:</Text>
                <Text style={styles.infoValue}>{carData.Engine.Valves}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Fuel Tank:</Text>
                <Text style={styles.infoValue}>{carData.Engine.FuelTank} L</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Drive Type:</Text>
                <Text style={styles.infoValue}>{carData.Engine.DriveType}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Parking Support Features */}
        {renderFeatureList(carData.PARKINGSUPPORT, 'Parking Support Features')}

        {/* Safety Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          
          {/* Available Features with Safety Ratings */}
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#4caf50' }}>
            Available Features ({Object.entries(carData.Safety).filter(([_, value]) => Number(value) >= 1).length + 3})
          </Text>
          <View style={styles.featureGrid}>
            {Object.entries(carData.Safety)
              .filter(([_, value]) => Number(value) >= 1)
              .map(([feature, _]) => (
                <View key={feature} style={styles.featureChip}>
                  <Text style={styles.featureText}>
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                </View>
              ))}
            {/* Safety Ratings as chips */}
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Global NCAP Safety: {carData.Safety.GlobalNCAPSafetyRating}/5
              </Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Child Safety Rating: {carData.Safety.GlobalNCAPChildSafetyRating}/5
              </Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Airbag Count: {carData.Safety.AirbagCount}
              </Text>
            </View>
          </View>
          
          {/* Not Available Features */}
          {Object.entries(carData.Safety).filter(([_, value]) => Number(value) === 0).length > 0 && (
            <>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#666' }}>
                Not Available ({Object.entries(carData.Safety).filter(([_, value]) => Number(value) === 0).length})
              </Text>
              <View style={styles.featureGrid}>
                {Object.entries(carData.Safety)
                  .filter(([_, value]) => Number(value) === 0)
                  .map(([feature, _]) => (
                    <View key={feature} style={styles.featureChipUnavailable}>
                      <Text style={styles.featureTextUnavailable}>
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </View>

        {/* Interior Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Features</Text>
          
          {/* Available Features with Interior Specs */}
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#4caf50' }}>
            Available Features ({Object.entries(carData.Interior).filter(([_, value]) => Number(value) >= 1).length + 1})
          </Text>
          <View style={styles.featureGrid}>
            {Object.entries(carData.Interior)
              .filter(([_, value]) => Number(value) >= 1)
              .map(([feature, _]) => (
                <View key={feature} style={styles.featureChip}>
                  <Text style={styles.featureText}>
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                </View>
              ))}
            {/* Interior Specs as chips */}
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Doors: {carData.Interior.Doors}
              </Text>
            </View>
          </View>
          
          {/* Not Available Features */}
          {Object.entries(carData.Interior).filter(([_, value]) => Number(value) === 0).length > 0 && (
            <>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#666' }}>
                Not Available ({Object.entries(carData.Interior).filter(([_, value]) => Number(value) === 0).length})
              </Text>
              <View style={styles.featureGrid}>
                {Object.entries(carData.Interior)
                  .filter(([_, value]) => Number(value) === 0)
                  .map(([feature, _]) => (
                    <View key={feature} style={styles.featureChipUnavailable}>
                      <Text style={styles.featureTextUnavailable}>
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </View>

        {/* Automation Features */}
        {renderFeatureList(carData.AutomationsID, 'Automation Features')}

        {/* Entertainment & Connectivity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Entertainment & Connectivity</Text>
          
          {/* Available Features with Entertainment Specs */}
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5, color: '#4caf50' }}>
            Available Features ({Object.entries(carData.ENTERTAINMENTANDCONNECT).filter(([_, value]) => Number(value) >= 1).length + 3})
          </Text>
          <View style={styles.featureGrid}>
            {Object.entries(carData.ENTERTAINMENTANDCONNECT)
              .filter(([_, value]) => Number(value) >= 1)
              .map(([feature, _]) => (
                <View key={feature} style={styles.featureChip}>
                  <Text style={styles.featureText}>
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                </View>
              ))}
            {/* Entertainment Specs as chips */}
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Speakers: {carData.ENTERTAINMENTANDCONNECT.Speakers}
              </Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Touch Screen Size: {carData.ENTERTAINMENTANDCONNECT.TouchScreenSize}"
              </Text>
            </View>
            <View style={styles.featureChip}>
              <Text style={styles.featureText}>
                Woofers: {carData.ENTERTAINMENTANDCONNECT.Woofers || 'None'}
              </Text>
            </View>
          </View>
          
          {/* Not Available Features */}
          {Object.entries(carData.ENTERTAINMENTANDCONNECT).filter(([_, value]) => Number(value) === 0).length > 0 && (
            <>
              <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#666' }}>
                Not Available ({Object.entries(carData.ENTERTAINMENTANDCONNECT).filter(([_, value]) => Number(value) === 0).length})
              </Text>
              <View style={styles.featureGrid}>
                {Object.entries(carData.ENTERTAINMENTANDCONNECT)
                  .filter(([_, value]) => Number(value) === 0)
                  .map(([feature, _]) => (
                    <View key={feature} style={styles.featureChipUnavailable}>
                      <Text style={styles.featureTextUnavailable}>
                        {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Text>
                    </View>
                  ))}
              </View>
            </>
          )}
        </View>

        {/* Driver Display Features */}
        {renderFeatureList(carData.DRIVERDISPLAY, 'Driver Display Features')}

        {/* Exterior Features */}
        {renderFeatureList(carData.EXTERIOR, 'Exterior Features')}

        {/* Luxury Features */}
        {renderFeatureList(carData.Luxury, 'Luxury Features')}

        {/* AI Review */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>AI Review & Analysis</Text>
          
          {/* Sentiment Display */}
          <View style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, color: '#666', marginBottom: 5 }}>Sentiment</Text>
            <View style={{
              backgroundColor: '#e8f5e8',
              border: '1px solid #4caf50',
              borderRadius: 4,
              padding: '4px 8px',
              alignSelf: 'flex-start'
            }}>
              <Text style={{ fontSize: 9, color: '#2e7d32', fontWeight: 'bold' }}>
                Generally Positive
              </Text>
            </View>
          </View>
          
          {/* Complete Review Summary */}
          <Text style={{ fontSize: 10, color: '#666', marginBottom: 5 }}>Complete Review Analysis</Text>
          <Text style={styles.reviewText}>
            {carData.AI_REVIEW.ReviewSummary
              .replace(/<[^>]*>/g, '')
              .replace(/\n\n/g, '\n')
              .replace(/\n/g, '\n')
              .replace(/\*\s*/g, '• ')
            }
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by AI Car Advisor on {new Date().toLocaleDateString('en-IN')}
          </Text>
          <Text style={styles.footerText}>
            For more details, visit our website: https://www.aicaradvisor.com/
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CarDetailsPDF;
