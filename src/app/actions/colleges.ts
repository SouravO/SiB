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

export interface Course {
    id: string;
    name: string;
    slug: string;
    category: string;
    degree: string;
    duration_years: number;
    description?: string;
    created_at: string;
}

export interface CollegeCourse {
    id: string;
    college_id: string;
    course_id: string;
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
        let query = supabase.from('cities').select('*');

        if (stateId) {
            query = query.eq('state_id', stateId);
        }

        const { data, error } = await query.order('name');

        if (error) throw error;
        return { success: true, data: data as City[] };
    } catch (error) {
        console.error('Error fetching cities:', error);
        return { success: false, error: 'Failed to fetch cities' };
    }
}

/**
 * Get all cities
 */
export async function getAllCities() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('cities')
            .select(`
                *,
                states:state_id (
                    name
                )
            `)
            .order('name');

        if (error) throw error;
        return { success: true, data: data as any[] };
    } catch (error) {
        console.error('Error fetching all cities:', error);
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
 * Update a state
 */
export async function updateState(
    stateId: string,
    data: { name?: string }
) {
    try {
        const supabase = createAdminClient();

        const updateData: any = { ...data };
        if (data.name) {
            updateData.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const { data: state, error } = await supabase
            .from('states')
            .update(updateData)
            .eq('id', stateId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: state as State };
    } catch (error) {
        console.error('Error updating state:', error);
        return { success: false, error: 'Failed to update state' };
    }
}

/**
 * Delete a state
 */
export async function deleteState(stateId: string) {
    try {
        const supabase = createAdminClient();

        const { error } = await supabase
            .from('states')
            .delete()
            .eq('id', stateId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting state:', error);
        return { success: false, error: 'Failed to delete state' };
    }
}

/**
 * Create a new city
 */
export async function createCity(name: string, stateId: string, imageUrl?: string) {
    try {
        const supabase = createAdminClient();

        console.log('Creating city:', { name, stateId, imageUrl: !!imageUrl });

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
                image_url: imageUrl,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase error creating city:', error);
            throw error;
        }

        console.log('City created successfully:', city);
        return { success: true, data: city as City };
    } catch (error) {
        console.error('Error creating city:', error);
        return { success: false, error: 'Failed to create city' };
    }
}

/**
 * Update city information
 */
export async function updateCity(
    cityId: string,
    data: {
        name?: string;
        image_url?: string;
    }
) {
    try {
        const supabase = createAdminClient();

        const { data: city, error } = await supabase
            .from('cities')
            .update(data)
            .eq('id', cityId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: city as City };
    } catch (error) {
        console.error('Error updating city:', error);
        return { success: false, error: 'Failed to update city' };
    }
}

/**
 * Upload image to Cloudinary and update city
 */
export async function uploadCityImage(cityId: string, file: File) {
    try {
        const supabase = createAdminClient();

        if (!cityId || !file) {
            console.error('Missing cityId or file:', { cityId, file: !!file });
            throw new Error('Missing required fields');
        }

        console.log('Uploading image for city:', cityId, 'File:', file.name, 'Size:', file.size, 'Type:', file.type);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log('Buffer size:', buffer.length);
        console.log('Uploading to Cloudinary...');

        // Upload to Cloudinary
        const uploadResult = await uploadImage(buffer, 'cities/images');
        console.log('Cloudinary upload result:', uploadResult.secure_url);

        // Update city with image URL
        console.log('Updating city', cityId, 'with image_url:', uploadResult.secure_url);
        const { data, error } = await supabase
            .from('cities')
            .update({ image_url: uploadResult.secure_url })
            .eq('id', cityId)
            .select()
            .single();

        if (error) {
            console.error('Supabase update error:', error);
            throw error;
        }

        console.log('City updated successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error uploading city image:', error);
        return { success: false, error: 'Failed to upload city image' };
    }
}

/**
 * Delete city image
 */
export async function deleteCityImage(cityId: string) {
    try {
        const supabase = createAdminClient();

        // Get city to find the image URL
        const { data: city } = await supabase
            .from('cities')
            .select('image_url')
            .eq('id', cityId)
            .single();

        // Extract public ID from URL if it's a Cloudinary URL
        if (city?.image_url) {
            const urlParts = city.image_url.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const filename = filenameWithExt.split('.')[0];
            const publicId = `cities/images/${filename}`;

            // Try to delete from Cloudinary
            try {
                await deleteAsset(publicId, 'image');
            } catch (cloudinaryError) {
                console.warn('Could not delete from Cloudinary:', cloudinaryError);
            }
        }

        // Remove image URL from city
        const { error } = await supabase
            .from('cities')
            .update({ image_url: null })
            .eq('id', cityId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting city image:', error);
        return { success: false, error: 'Failed to delete city image' };
    }
}

/**
 * Delete a city
 */
export async function deleteCity(cityId: string) {
    try {
        const supabase = createAdminClient();

        // Get city to find the image URL for cleanup
        const { data: city } = await supabase
            .from('cities')
            .select('image_url')
            .eq('id', cityId)
            .single();

        // Try to delete city image from Cloudinary
        if (city?.image_url) {
            const urlParts = city.image_url.split('/');
            const filenameWithExt = urlParts[urlParts.length - 1];
            const filename = filenameWithExt.split('.')[0];
            const publicId = `cities/images/${filename}`;
            try {
                await deleteAsset(publicId, 'image');
            } catch (cloudinaryError) {
                console.warn('Could not delete city image from Cloudinary:', cloudinaryError);
            }
        }

        const { error } = await supabase
            .from('cities')
            .delete()
            .eq('id', cityId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error deleting city:', error);
        return { success: false, error: 'Failed to delete city' };
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
 * Update a university
 */
export async function updateUniversity(
    universityId: string,
    data: { name?: string; city_id?: string }
) {
    try {
        const supabase = createAdminClient();

        const updateData: any = { ...data };
        if (data.name) {
            updateData.slug = data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
        }

        const { data: university, error } = await supabase
            .from('universities')
            .update(updateData)
            .eq('id', universityId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: university as University };
    } catch (error) {
        console.error('Error updating university:', error);
        return { success: false, error: 'Failed to update university' };
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
        ),
        college_images (
          image_url
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform data to include the first image URL for each college
        const transformedData = data.map((college: any) => {
            // Get the first image if available
            const firstImage = Array.isArray(college.college_images) && college.college_images.length > 0
                ? college.college_images[0].image_url
                : college.image_url; // fallback to the image_url field on the college record

            return {
                ...college,
                image_url: firstImage
            };
        });

        return { success: true, data: transformedData as any[] };
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
 * Get college by Slug with images and videos
 */
export async function getCollegeBySlug(slug: string) {
    try {
        const supabase = createAdminClient();

        const { data: college, error: collegeError } = await supabase
            .from('colleges')
            .select('*')
            .eq('slug', slug)
            .single();

        if (collegeError) throw collegeError;

        const { data: images } = await supabase
            .from('college_images')
            .select('*')
            .eq('college_id', college.id)
            .order('display_order');

        const { data: videos } = await supabase
            .from('college_videos')
            .select('*')
            .eq('college_id', college.id)
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
        console.error('Error fetching college by slug:', error);
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
        // Generate base slug from name
        const baseSlug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        let slug = baseSlug;
        let counter = 1;

        // Check for uniqueness
        while (true) {
            const { data: existing } = await supabase
                .from('colleges')
                .select('id')
                .eq('slug', slug)
                .maybeSingle();

            if (!existing) break;

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

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
export async function addCollegeImage(formData: FormData) {
    try {
        const supabase = createAdminClient();

        const collegeId = formData.get('collegeId') as string;
        const file = formData.get('file') as File;
        const caption = formData.get('caption') as string || undefined;

        if (!collegeId || !file) {
            throw new Error('Missing required fields');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResult = await uploadImage(buffer, 'colleges/images');

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
export async function uploadBrochure(formData: FormData) {
    try {
        const supabase = createAdminClient();

        const collegeId = formData.get('collegeId') as string;
        const file = formData.get('file') as File;

        if (!collegeId || !file) {
            throw new Error('Missing required fields');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResult = await uploadDocument(buffer, 'colleges/documents');

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

/**
 * Upload fee structure PDF
 */
export async function uploadFeeStructurePdf(formData: FormData) {
    try {
        const supabase = createAdminClient();

        const collegeId = formData.get('collegeId') as string;
        const file = formData.get('file') as File;

        if (!collegeId || !file) {
            throw new Error('Missing required fields');
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
        const uploadResult = await uploadDocument(buffer, 'colleges/documents');

        // Update college with fee structure URL
        const { data, error } = await supabase
            .from('colleges')
            .update({ fee_structure_pdf_url: uploadResult.secure_url })
            .eq('id', collegeId)
            .select()
            .single();

        if (error) throw error;

        return { success: true, data };
    } catch (error) {
        console.error('Error uploading fee structure PDF:', error);
        return { success: false, error: 'Failed to upload fee structure PDF' };
    }
}

/**
 * Get all courses
 */
export async function getAllCourses() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('category')
            .order('name');

        if (error) throw error;
        return { success: true, data: data as Course[] };
    } catch (error) {
        console.error('Error fetching courses:', error);
        return { success: false, error: 'Failed to fetch courses' };
    }
}

/**
 * Get courses by college ID
 */
export async function getCoursesByCollege(collegeId: string) {
    try {
        const supabase = createAdminClient();

        console.log('Fetching courses for college:', collegeId);

        const { data, error } = await supabase
            .from('college_courses')
            .select(`
                *,
                courses:course_id (
                    id,
                    name,
                    slug,
                    category,
                    degree,
                    duration_years
                )
            `)
            .eq('college_id', collegeId)
            .order('courses(category)')
            .order('courses(name)');

        if (error) {
            console.error('Supabase error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }

        console.log('Fetched courses for college:', { collegeId, count: data?.length });

        return { success: true, data: data as any[] };
    } catch (error: any) {
        console.error('Error fetching college courses:', {
            message: error?.message,
            details: error?.details,
            hint: error?.hint,
            code: error?.code,
            stack: error?.stack
        });
        return {
            success: false,
            error: error?.message || 'Failed to fetch college courses',
            details: error?.details
        };
    }
}

/**
 * Link courses to college
 */
export async function linkCoursesToCollege(collegeId: string, courseIds: string[]) {
    try {
        const supabase = createAdminClient();

        console.log('Linking courses to college:', { collegeId, courseIds });

        // First, delete existing course links for this college
        await supabase
            .from('college_courses')
            .delete()
            .eq('college_id', collegeId);

        // Then insert new course links
        if (courseIds.length > 0) {
            const courseLinks = courseIds.map(courseId => ({
                college_id: collegeId,
                course_id: courseId
            }));

            console.log('Inserting course links:', courseLinks);

            const { error } = await supabase
                .from('college_courses')
                .insert(courseLinks);

            if (error) {
                console.error('Error inserting course links:', error);
                throw error;
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error linking courses to college:', error);
        return { success: false, error: 'Failed to link courses' };
    }
}

/**
 * Create a new course
 */
export async function createCourse(data: {
    name: string;
    category: string;
    degree: string;
    duration_years: number;
    description?: string;
}) {
    try {
        const supabase = createAdminClient();

        // Generate slug from name
        const slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        const { data: course, error } = await supabase
            .from('courses')
            .insert({
                ...data,
                slug,
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, data: course as Course };
    } catch (error) {
        console.error('Error creating course:', error);
        return { success: false, error: 'Failed to create course' };
    }
}
