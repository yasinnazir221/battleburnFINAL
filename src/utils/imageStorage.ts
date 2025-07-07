// Image Storage Utilities for Production

// Option 1: Firebase Storage (Recommended)
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase/config'; // You'll need to add storage to your config

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
}

// Upload screenshot to Firebase Storage
export const uploadPaymentScreenshot = async (
  file: File, 
  userId: string, 
  paymentId: string
): Promise<UploadResult> => {
  try {
    // Create unique file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `payment_${paymentId}_${timestamp}.${fileExtension}`;
    const filePath = `payment-screenshots/${userId}/${fileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, filePath);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: filePath,
      fileName: fileName
    };
  } catch (error) {
    console.error('Error uploading screenshot:', error);
    throw new Error('Failed to upload screenshot');
  }
};

// Get screenshot URL
export const getScreenshotURL = async (filePath: string): Promise<string> => {
  try {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting screenshot URL:', error);
    throw new Error('Failed to get screenshot');
  }
};

// Delete screenshot
export const deleteScreenshot = async (filePath: string): Promise<void> => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    throw new Error('Failed to delete screenshot');
  }
};

// Option 2: Base64 Storage (Simple but not recommended for large files)
export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Option 3: Cloudinary Upload (Alternative cloud storage)
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_upload_preset'); // Set in Cloudinary
  
  try {
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/your_cloud_name/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
};

// Image compression utility
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1200px width)
      const maxWidth = 1200;
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};