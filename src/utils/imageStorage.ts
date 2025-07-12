// Firebase Storage utilities for payment screenshots
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
}

// Upload payment screenshot to Firebase Storage
export const uploadPaymentScreenshot = async (
  file: File, 
  userId: string, 
  paymentId: string
): Promise<UploadResult> => {
  try {
    // Compress image before upload
    const compressedFile = await compressImage(file, 0.8);
    
    // Create unique file path
    const timestamp = Date.now();
    const fileExtension = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `payment_${paymentId}_${timestamp}.${fileExtension}`;
    const filePath = `payment-screenshots/${userId}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Add metadata
    const metadata = {
      contentType: compressedFile.type,
      customMetadata: {
        'originalName': file.name,
        'paymentId': paymentId,
        'userId': userId,
        'uploadedAt': new Date().toISOString()
      }
    };
    
    // Upload file with metadata
    const snapshot = await uploadBytes(storageRef, compressedFile, metadata);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    console.log('✅ Screenshot uploaded successfully:', {
      fileName,
      size: compressedFile.size,
      url: downloadURL
    });
    
    return {
      url: downloadURL,
      path: filePath,
      fileName: fileName,
      size: compressedFile.size
    };
  } catch (error) {
    console.error('❌ Error uploading screenshot:', error);
    throw new Error('Failed to upload screenshot. Please try again.');
  }
};

// Get screenshot URL from storage path
export const getScreenshotURL = async (filePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('❌ Error getting screenshot URL:', error);
    throw new Error('Failed to load screenshot');
  }
};

// Delete screenshot from storage
export const deleteScreenshot = async (filePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    console.log('✅ Screenshot deleted successfully:', filePath);
  } catch (error) {
    console.error('❌ Error deleting screenshot:', error);
    // Don't throw error for deletion failures in production
  }
};

// Image compression utility
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if file is already small enough
    if (file.size <= 500000) { // 500KB
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            console.log('🗜️ Image compressed:', {
              original: `${(file.size / 1024).toFixed(1)}KB`,
              compressed: `${(compressedFile.size / 1024).toFixed(1)}KB`,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
            });
            
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for compression'));
    img.src = URL.createObjectURL(file);
  });
};

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, or WebP)'
    };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 10MB'
    };
  }
  
  return { valid: true };
};

// Generate thumbnail URL (for admin preview)
export const generateThumbnailURL = (originalURL: string): string => {
  // For Firebase Storage, you can use image transformation
  // This is a simple approach - in production you might want to use Firebase Extensions
  return originalURL;
};

// Batch delete screenshots (for cleanup)
export const batchDeleteScreenshots = async (filePaths: string[]): Promise<void> => {
  const deletePromises = filePaths.map(path => deleteScreenshot(path));
  await Promise.allSettled(deletePromises);
};