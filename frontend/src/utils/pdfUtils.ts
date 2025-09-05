import { pdf, DocumentProps } from '@react-pdf/renderer';
import React from 'react';

export const downloadPDF = async (component: React.ReactElement<DocumentProps>, filename: string) => {
  try {
    console.log('Starting PDF generation...');
    console.log('Component props:', component.props);
    
    // Generate PDF blob
    console.log('Converting component to PDF blob...');
    const blob = await pdf(component).toBlob();
    console.log('PDF blob generated successfully, size:', blob.size);
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    console.log('PDF download completed successfully');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    
    // Log additional error details
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('Image')) {
        throw new Error('Failed to load images in PDF. Please try again.');
      } else if (error.message.includes('Font')) {
        throw new Error('Failed to load fonts in PDF. Please try again.');
      } else if (error.message.includes('Network')) {
        throw new Error('Network error while generating PDF. Please check your connection and try again.');
      } else if (error.message.includes('Timeout')) {
        throw new Error('PDF generation timed out. Please try again.');
      } else {
        throw new Error(`PDF generation failed: ${error.message}`);
      }
    }
    
    // Handle non-Error objects
    console.error('Non-Error object thrown:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const generateCarPDFFilename = (selectedItem: any, modelCars: any[]) => {
  try {
    if (!selectedItem || modelCars.length === 0) {
      return `car-recommendations-${new Date().toISOString().split('T')[0]}.pdf`;
    }
    
    const keys = Object.keys(selectedItem);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const cars = selectedItem[firstKey];
      
      if (Array.isArray(cars) && cars.length > 0) {
        const firstCar = cars[0];
        const brandName = (firstCar.BrandName || 'Car').replace(/[^a-zA-Z0-9]/g, '');
        const modelName = (firstCar.ModelName || 'Recommendations').replace(/[^a-zA-Z0-9]/g, '');
        const date = new Date().toISOString().split('T')[0];
        return `${brandName}-${modelName}-${date}.pdf`;
      }
    }
    
    return `car-recommendations-${new Date().toISOString().split('T')[0]}.pdf`;
  } catch (error) {
    console.error('Error generating filename:', error);
    return `car-recommendations-${new Date().toISOString().split('T')[0]}.pdf`;
  }
};
