import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('id');
    
    try {
        const supabase = createAdminClient();
        
        // Get all cities
        const { data: cities, error } = await supabase
            .from('cities')
            .select('id, name, states!inner(id, name)');
        
        if (error) {
            return NextResponse.json(
                { error: 'Failed to fetch cities', details: error.message },
                { status: 500 }
            );
        }
        
        if (!cityId) {
            return NextResponse.json({
                exists: false,
                availableCities: cities,
                message: 'No city ID provided. Use ?id={city_id} to check a specific city.'
            });
        }
        
        // Check specific city
        const { data: city, error: cityError } = await supabase
            .from('cities')
            .select('id, name, states!inner(id, name)')
            .eq('id', cityId)
            .single();
        
        if (cityError || !city) {
            return NextResponse.json({
                exists: false,
                availableCities: cities,
                message: `City with ID ${cityId} not found`
            });
        }
        
        return NextResponse.json({
            exists: true,
            city,
            availableCities: cities
        });
        
    } catch (error: any) {
        return NextResponse.json(
            { error: 'Test failed', message: error.message },
            { status: 500 }
        );
    }
}
