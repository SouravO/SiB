import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
    try {
        const { name, cityId } = await request.json();
        
        if (!name || !cityId) {
            return NextResponse.json(
                { error: 'Name and cityId are required' },
                { status: 400 }
            );
        }
        
        console.log('[Test API] Creating university:', { name, cityId });
        
        const supabase = createAdminClient();
        
        // Generate slug
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        
        // Check if city exists
        const { data: cityData, error: cityError } = await supabase
            .from('cities')
            .select('id')
            .eq('id', cityId)
            .single();
        
        if (cityError || !cityData) {
            return NextResponse.json(
                { 
                    error: 'City not found', 
                    cityId,
                    cityError: cityError?.message 
                },
                { status: 404 }
            );
        }
        
        // Check for existing university with same slug
        const { data: existingUni } = await supabase
            .from('universities')
            .select('id, name')
            .eq('slug', slug)
            .single();
        
        if (existingUni) {
            return NextResponse.json(
                { 
                    error: 'University with similar name already exists',
                    existing: existingUni
                },
                { status: 409 }
            );
        }
        
        // Create university
        const { data: university, error } = await supabase
            .from('universities')
            .insert({
                name,
                slug,
                city_id: cityId,
            })
            .select()
            .single();
        
        if (error) {
            console.error('[Test API] Database error:', error);
            return NextResponse.json(
                { 
                    error: 'Database error',
                    code: error.code,
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                },
                { status: 500 }
            );
        }
        
        console.log('[Test API] University created:', university);
        
        return NextResponse.json({
            success: true,
            university,
            message: 'University created successfully'
        });
        
    } catch (error: any) {
        console.error('[Test API] Error:', error);
        return NextResponse.json(
            { 
                error: 'Test failed',
                message: error.message,
                stack: error.stack 
            },
            { status: 500 }
        );
    }
}
