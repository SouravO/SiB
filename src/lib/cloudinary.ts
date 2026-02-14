import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
    public_id: string;
    secure_url: string;
    width?: number;
    height?: number;
    format?: string;
    resource_type?: string;
}

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path
 * @returns Upload result with public_id and secure_url
 */
export async function uploadImage(
    file: string | Buffer,
    folder: string = 'colleges/images'
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' },
                { quality: 'auto', fetch_format: 'auto' },
            ],
        });

        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
        };
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
}

/**
 * Upload a video to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path
 * @returns Upload result with public_id and secure_url
 */
export async function uploadVideo(
    file: string | Buffer,
    folder: string = 'colleges/videos'
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'video',
            transformation: [
                { quality: 'auto' },
            ],
        });

        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
            resource_type: 'video',
        };
    } catch (error) {
        console.error('Error uploading video to Cloudinary:', error);
        throw new Error('Failed to upload video');
    }
}

/**
 * Upload a PDF document to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path
 * @returns Upload result with public_id and secure_url
 */
export async function uploadDocument(
    file: string | Buffer,
    folder: string = 'colleges/documents'
): Promise<UploadResult> {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'raw',
            access_mode: 'public',
        });

        return {
            public_id: result.public_id,
            secure_url: result.secure_url,
            format: result.format,
        };
    } catch (error) {
        console.error('Error uploading document to Cloudinary:', error);
        throw new Error('Failed to upload document');
    }
}

/**
 * Delete an asset from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param resourceType - Type of resource (image, video, raw)
 */
export async function deleteAsset(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
        console.error('Error deleting asset from Cloudinary:', error);
        throw new Error('Failed to delete asset');
    }
}

/**
 * Get optimized image URL
 * @param publicId - Cloudinary public ID
 * @param width - Desired width
 * @param height - Desired height
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
    publicId: string,
    width?: number,
    height?: number
): string {
    const transformation = [];

    if (width || height) {
        transformation.push({
            width,
            height,
            crop: 'fill',
            gravity: 'auto',
        });
    }

    transformation.push({
        quality: 'auto',
        fetch_format: 'auto',
    });

    return cloudinary.url(publicId, {
        transformation,
    });
}

/**
 * Get video streaming URL
 * @param publicId - Cloudinary public ID
 * @returns Video streaming URL
 */
export function getVideoUrl(publicId: string): string {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: [
            { quality: 'auto' },
        ],
    });
}

export default cloudinary;
