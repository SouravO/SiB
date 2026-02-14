'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { uploadImage, uploadVideo, uploadDocument, deleteAsset } from '@/lib/cloudinary';

export interface State {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
    created_at: string;
}

export interface City {
    id: string;
    name: string;
    slug: string;
    state_id: string;
    image_url?: string;
    created_at: string;
}

export interface University {
    id: string;
    name: string;
    slug: string;
    city_id: string;
    image_url?: string;
    created_at: string;
}

export interface College {
    id: string;
    name: string;
    slug: string;
    university_id: string;
    specialization?: string;
    short_description?: string;
    long_description?: string;
    description?: string;
    brochure_url?: string;
    fee_structure_pdf_url?: string;
    contact_email?: string;
    contact_phone?: string;
    website_url?: string;
    image_url?: string;
    created_at: string;
}

export interface CollegeImage {
    id: string;
    college_id: string;
    image_url: string;
    cloudinary_public_id?: string;
    caption?: string;
    display_order: number;
    created_at: string;
}

export interface CollegeVideo {
    id: string;
    college_id: string;
    video_url: string;
    cloudinary_public_id?: string;
    title?: string;
    platform?: string;
    display_order: number;
    created_at: string;
}

/**
 * Get all states
 */
export async function getStates() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('states')
            .select('*')
            .order('name');

        if (error) throw error;
        return { success: true, data: data as State[] };
    } catch (error) {
        console.error('Error fetching states:', error);
        return { success: false, error: 'Failed to fetch states' };
    }
}

/**
 * Get cities by state ID
 */
export async function getCitiesByState(stateId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('cities')
            .select('*')
            .eq('state_id', stateId)
            .order('name');

        if (error) throw error;
        return { success: true, data: data as City[] };
    } catch (error) {
        console.error('Error fetching cities:', error);
        return { success: false, error: 'Failed to fetch cities' };
    }
}

/**
 * Get universities by city ID
 */
export async function getUniversitiesByCity(cityId: string) {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('universities')
            .select('*')
            .eq('city_id', cityId)
            .order('name');

        if (error) throw error;
        return { success: true, data: data as University[] };
    } catch (error) {
        console.error('Error fetching universities:', error);
        return { success: false, error: 'Failed to fetch universities' };
    }
}

/**
 * Create a new state
 */
export async function createState(name: string) {
    try {
        const supabase = createAdminClient();

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const { data: state, error } = await supabase
            .from('states')
            .insert({
                name,
                slug,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: state as State };
    } catch (error) {
        console.error('Error creating state:', error);
        return { success: false, error: 'Failed to create state' };
    }
}

/**
 * Create a new city
 */
export async function createCity(name: string, stateId: string) {
    try {
        const supabase = createAdminClient();

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const { data: city, error } = await supabase
            .from('cities')
            .insert({
                name,
                slug,
                state_id: stateId,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: city as City };
    } catch (error) {
        console.error('Error creating city:', error);
        return { success: false, error: 'Failed to create city' };
    }
}

/**
 * Create a new university
 */
export async function createUniversity(name: string, cityId: string) {
    try {
        const supabase = createAdminClient();

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const { data: university, error } = await supabase
            .from('universities')
            .insert({
                name,
                slug,
                city_id: cityId,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: university as University };
    } catch (error) {
        console.error('Error creating university:', error);
        return { success: false, error: 'Failed to create university' };
    }
}

/**
 * Get all universities
 */
export async function getAllUniversities() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('universities')
            .select(`
                *,
                cities:city_id (
                    name,
                    states:state_id (
                        name
                    )
                )
            `)
            .order('name');

        if (error) throw error;
        return { success: true, data: data as any[] };
    } catch (error) {
        console.error('Error fetching universities:', error);
        return { success: false, error: 'Failed to fetch universities' };
    }
}

/**
 * Delete a university
 */
export async function deleteUniversity(universityId: string) {
    try {
        const supabase = createAdminClient();

        // Delete the university (this will cascade delete related colleges if configured in the DB)
        const { error } = await supabase
            .from('universities')
            .delete()
            .eq('id', universityId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting university:', error);
        return { success: false, error: 'Failed to delete university' };
    }
}

/**
 * Get all colleges with related data
 */
export async function getAllColleges() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('colleges')
            .select(`
        *,
        universities:university_id (
          name,
          cities:city_id (
            name,
            states:state_id (
              name
            )
          )
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data as any[] };
    } catch (error) {
        console.error('Error fetching colleges:', error);
        return { success: false, error: 'Failed to fetch colleges' };
    }
}

/**
 * Get college by ID with images and videos
 */
export async function getCollegeById(collegeId: string) {
    try {
        const supabase = createAdminClient();

        const { data: college, error: collegeError } = await supabase
            .from('colleges')
            .select('*')
            .eq('id', collegeId)
            .single();

        if (collegeError) throw collegeError;

        const { data: images } = await supabase
            .from('college_images')
            .select('*')
            .eq('college_id', collegeId)
            .order('display_order');

        const { data: videos } = await supabase
            .from('college_videos')
            .select('*')
            .eq('college_id', collegeId)
            .order('display_order');

        return {
            success: true,
            data: {
                ...college,
                images: images || [],
                videos: videos || [],
            },
        };
    } catch (error) {
        console.error('Error fetching college:', error);
        return { success: false, error: 'Failed to fetch college' };
    }
}

/**
 * Create a new college
 */
export async function createCollege(data: {
    name: string;
    university_id: string;
    specialization?: string;
    short_description?: string;
    long_description?: string;
    contact_email?: string;
    contact_phone?: string;
    website_url?: string;
}) {
    try {
        const supabase = createAdminClient();

        // Generate slug from name
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const { data: college, error } = await supabase
            .from('colleges')
            .insert({
                ...data,
                slug,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase Error creating college:', error);
            throw error;
        }

        return { success: true, data: college };
    } catch (error: any) {
        console.error('Error creating college:', error);
        return { success: false, error: error.message || 'Failed to create college' };
    }
}

/**
 * Update college information
 */
export async function updateCollege(
    collegeId: string,
    data: Partial<College>
) {
    try {
        const supabase = createAdminClient();

        const { data: college, error } = await supabase
            .from('colleges')
            .update(data)
            .eq('id', collegeId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: college };
    } catch (error) {
        console.error('Error updating college:', error);
        return { success: false, error: 'Failed to update college' };
    }
}

/**
 * Delete college and all associated media
 */
export async function deleteCollege(collegeId: string) {
    try {
        const supabase = createAdminClient();

        // Get all images and videos to delete from Cloudinary
        const { data: images } = await supabase
            .from('college_images')
            .select('cloudinary_public_id')
            .eq('college_id', collegeId);

        const { data: videos } = await supabase
            .from('college_videos')
            .select('cloudinary_public_id, platform')
            .eq('college_id', collegeId);

        // Delete from Cloudinary
        if (images) {
            for (const img of images) {
                if (img.cloudinary_public_id) {
                    await deleteAsset(img.cloudinary_public_id, 'image');
                }
            }
        }

        if (videos) {
            for (const vid of videos) {
                if (vid.cloudinary_public_id && vid.platform === 'cloudinary') {
                    await deleteAsset(vid.cloudinary_public_id, 'video');
                }
            }
        }

        // Delete college (cascade will delete images and videos from DB)
        const { error } = await supabase
            .from('colleges')
            .delete()
            .eq('id', collegeId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting college:', error);
        return { success: false, error: 'Failed to delete college' };
    }
}

/**
 * Upload image to Cloudinary and save to database
 */
export async function addCollegeImage(
    collegeId: string,
    imageData: string,
    caption?: string
) {
    try {
        const supabase = createAdminClient();

        // Upload to Cloudinary
        const uploadResult = await uploadImage(imageData, 'colleges/images');

        // Save to database
        const { data, error } = await supabase
            .from('college_images')
            .insert({
                college_id: collegeId,
                image_url: uploadResult.secure_url,
                cloudinary_public_id: uploadResult.public_id,
                caption,
                display_order: 0,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error adding college image:', error);
        return { success: false, error: 'Failed to add image' };
    }
}

/**
 * Delete college image
 */
export async function deleteCollegeImage(imageId: string) {
    try {
        const supabase = createAdminClient();

        // Get image data
        const { data: image } = await supabase
            .from('college_images')
            .select('cloudinary_public_id')
            .eq('id', imageId)
            .single();

        // Delete from Cloudinary
        if (image?.cloudinary_public_id) {
            await deleteAsset(image.cloudinary_public_id, 'image');
        }

        // Delete from database
        const { error } = await supabase
            .from('college_images')
            .delete()
            .eq('id', imageId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting college image:', error);
        return { success: false, error: 'Failed to delete image' };
    }
}

/**
 * Add college video (upload or URL)
 */
export async function addCollegeVideo(
    collegeId: string,
    videoData: {
        url?: string;
        file?: string;
        title?: string;
        platform?: 'youtube' | 'vimeo' | 'cloudinary' | 'other';
    }
) {
    try {
        const supabase = createAdminClient();
        let videoUrl = videoData.url || '';
        let publicId: string | undefined;
        let platform = videoData.platform || 'other';

        // If file is provided, upload to Cloudinary
        if (videoData.file) {
            const uploadResult = await uploadVideo(videoData.file, 'colleges/videos');
            videoUrl = uploadResult.secure_url;
            publicId = uploadResult.public_id;
            platform = 'cloudinary';
        }

        // Save to database
        const { data, error } = await supabase
            .from('college_videos')
            .insert({
                college_id: collegeId,
                video_url: videoUrl,
                cloudinary_public_id: publicId,
                title: videoData.title,
                platform,
                display_order: 0,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error adding college video:', error);
        return { success: false, error: 'Failed to add video' };
    }
}

/**
 * Delete college video
 */
export async function deleteCollegeVideo(videoId: string) {
    try {
        const supabase = createAdminClient();

        // Get video data
        const { data: video } = await supabase
            .from('college_videos')
            .select('cloudinary_public_id, platform')
            .eq('id', videoId)
            .single();

        // Delete from Cloudinary if it's a Cloudinary video
        if (video?.cloudinary_public_id && video.platform === 'cloudinary') {
            await deleteAsset(video.cloudinary_public_id, 'video');
        }

        // Delete from database
        const { error } = await supabase
            .from('college_videos')
            .delete()
            .eq('id', videoId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting college video:', error);
        return { success: false, error: 'Failed to delete video' };
    }
}

/**
 * Upload brochure PDF
 */
export async function uploadBrochure(collegeId: string, pdfData: string) {
    try {
        const supabase = createAdminClient();

        // Upload to Cloudinary
        const uploadResult = await uploadDocument(pdfData, 'colleges/documents');

        // Update college with brochure URL
        const { data, error } = await supabase
            .from('colleges')
            .update({ brochure_url: uploadResult.secure_url })
            .eq('id', collegeId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error uploading brochure:', error);
        return { success: false, error: 'Failed to upload brochure' };
    }
}
