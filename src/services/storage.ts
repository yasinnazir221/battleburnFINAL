import { supabase } from '../lib/supabase'

export interface UploadResult {
  url: string
  path: string
  fileName: string
  size: number
}

// Upload payment screenshot to Supabase Storage
export const uploadPaymentScreenshot = async (
  file: File, 
  userId: string, 
  paymentId: string
): Promise<UploadResult> => {
  try {
    // Compress image before upload
    const compressedFile = await compressImage(file, 0.8)
    
    // Create unique file path
    const timestamp = Date.now()
    const fileExtension = compressedFile.name.split('.').pop() || 'jpg'
    const fileName = `payment_${paymentId}_${timestamp}.${fileExtension}`
    const filePath = `payment-screenshots/${userId}/${fileName}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('payment-screenshots')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(filePath)

    console.log('✅ Screenshot uploaded successfully:', {
      fileName,
      size: compressedFile.size,
      url: urlData.publicUrl
    })
    
    return {
      url: urlData.publicUrl,
      path: filePath,
      fileName: fileName,
      size: compressedFile.size
    }
  } catch (error) {
    console.error('❌ Error uploading screenshot:', error)
    throw new Error('Failed to upload screenshot. Please try again.')
  }
}

// Get screenshot URL from storage path
export const getScreenshotURL = async (filePath: string): Promise<string> => {
  try {
    const { data } = supabase.storage
      .from('payment-screenshots')
      .getPublicUrl(filePath)
    
    return data.publicUrl
  } catch (error) {
    console.error('❌ Error getting screenshot URL:', error)
    throw new Error('Failed to load screenshot')
  }
}

// Delete screenshot from storage
export const deleteScreenshot = async (filePath: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from('payment-screenshots')
      .remove([filePath])

    if (error) throw error
    console.log('✅ Screenshot deleted successfully:', filePath)
  } catch (error) {
    console.error('❌ Error deleting screenshot:', error)
    // Don't throw error for deletion failures in production
  }
}

// Image compression utility (same as before)
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Check if file is already small enough
    if (file.size <= 500000) { // 500KB
      resolve(file)
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calculate new dimensions (max 1200px width/height)
        const maxSize = 1200
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            
            console.log('🗜️ Image compressed:', {
              original: `${(file.size / 1024).toFixed(1)}KB`,
              compressed: `${(compressedFile.size / 1024).toFixed(1)}KB`,
              reduction: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
            })
            
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        }, 'image/jpeg', quality)
      } catch (error) {
        reject(error)
      }
    }
    
    img.onerror = () => reject(new Error('Failed to load image for compression'))
    img.src = URL.createObjectURL(file)
  })
}

// Validate image file
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPG, PNG, or WebP)'
    }
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image file size must be less than 10MB'
    }
  }
  
  return { valid: true }
}