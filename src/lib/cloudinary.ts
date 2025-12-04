/**
 * Cloudinary upload utility for client-side image uploads
 * Uses unsigned upload preset for direct client-to-Cloudinary uploads
 */

interface UploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

interface UploadOptions {
  folder?: string;
  transformation?: any;
}

/**
 * Upload a single image file to Cloudinary
 * @param file - The image file to upload
 * @param options - Upload options (folder, transformations, etc.)
 * @returns Promise with upload response containing secure_url
 */
export const uploadImageToCloudinary = async (
  file: File,
  options: UploadOptions = {}
): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary configuration missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in your .env.local file.'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.transformation) {
    formData.append('transformation', JSON.stringify(options.transformation));
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to upload image');
    }

    const data: UploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

/**
 * Upload multiple image files to Cloudinary
 * @param files - Array of image files to upload
 * @param options - Upload options
 * @returns Promise with array of secure URLs
 */
export const uploadImagesToCloudinary = async (
  files: File[],
  options: UploadOptions = {}
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file) =>
      uploadImageToCloudinary(file, options)
    );
    const urls = await Promise.all(uploadPromises);
    return urls;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

/**
 * Validate image file before upload
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5)
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateImageFile = (
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `Image size must be less than ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
};
