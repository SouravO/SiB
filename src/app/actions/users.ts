'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { handleSupabaseError, successResult, errorResult, validateRequired, validateEmail, validatePassword } from '@/lib/error-handler';

export type UserRole = 'user' | 'admin';

export interface CreateUserInput {
    email: string;
    password: string;
    role: UserRole;
    fullName?: string;
    createdBy?: string; // Email of the user creating this account
}

export interface UserWithProfile {
    id: string;
    email: string;
    role: UserRole;
    full_name?: string;
    created_at: string;
    last_sign_in_at?: string;
}

// Super admin email
const SUPER_ADMIN_EMAIL = 'studyinbengalurub2b@gmail.com';

export async function createUserWithRole(input: CreateUserInput) {
    // Validation
    const emailError = validateEmail(input.email);
    if (emailError) {
        return errorResult(emailError);
    }

    const passwordError = validatePassword(input.password);
    if (passwordError) {
        return errorResult(passwordError);
    }

    const roleError = validateRequired(input.role, 'Role');
    if (roleError) {
        return errorResult(roleError);
    }

    if (!['user', 'admin'].includes(input.role)) {
        return errorResult('Invalid role selected');
    }

    try {
        const supabase = createAdminClient();

        // Check permissions: Only super admin can create admins
        if (input.role === 'admin' && input.createdBy !== SUPER_ADMIN_EMAIL) {
            return errorResult('Only super admin can create admin accounts');
        }

        // 1. Create user in auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: input.email,
            password: input.password,
            email_confirm: true,
        });

        if (authError) {
            // Handle specific auth errors
            if (authError.message.includes('User already registered')) {
                return errorResult('An account with this email already exists. Please use a different email address.');
            }
            if (authError.message.includes('Weak password')) {
                return errorResult('Password is too weak. Please use at least 6 characters.');
            }
            if (authError.message.includes('Invalid email')) {
                return errorResult('Please enter a valid email address.');
            }
            return errorResult(`Failed to create user account: ${authError.message}`);
        }

        if (!authData.user) {
            return errorResult('Failed to create user account. Please try again.');
        }

        // 2. Create profile with role in user_profiles table
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
                id: authData.user.id,
                email: input.email,
                role: input.role,
                full_name: input.fullName || null,
            });

        if (profileError) {
            // If profile creation fails, delete the auth user to maintain consistency
            await supabase.auth.admin.deleteUser(authData.user.id);
            return errorResult(`Profile creation failed: ${profileError.message}`);
        }

        revalidatePath('/');
        return successResult(authData.user);
    } catch (error) {
        return handleSupabaseError(error, 'create user');
    }
}

export async function getAllUsers(): Promise<UserWithProfile[]> {
    try {
        const supabase = createAdminClient();

        // Get all users from auth
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('Error fetching auth users:', authError);
            return [];
        }

        // Get all profiles from user_profiles table
        const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profileError) {
            console.error('Error fetching profiles:', profileError);
            return [];
        }

        // Merge auth users with profiles
        const usersWithProfiles: UserWithProfile[] = authUsers.users.map((authUser) => {
            const profile = profiles?.find((p) => p.id === authUser.id);
            return {
                id: authUser.id,
                email: authUser.email || '',
                role: (profile?.role as UserRole) || 'user',
                full_name: profile?.full_name,
                created_at: authUser.created_at,
                last_sign_in_at: authUser.last_sign_in_at,
            };
        });

        return usersWithProfiles;
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        return [];
    }
}

export async function deleteUser(userId: string, deletedBy?: string) {
    const idError = validateRequired(userId, 'User ID');
    if (idError) {
        return errorResult(idError);
    }

    try {
        const supabase = createAdminClient();

        // Get the user being deleted to check their role
        const { data: userToDelete } = await supabase
            .from('user_profiles')
            .select('email, role')
            .eq('id', userId)
            .single();

        if (!userToDelete) {
            return errorResult('User not found');
        }

        // Check permissions: Only super admin can delete admins
        if (userToDelete.role === 'admin' && deletedBy !== SUPER_ADMIN_EMAIL) {
            return errorResult('Only super admin can delete admin accounts');
        }

        // Prevent deletion of super admin
        if (userToDelete.email === SUPER_ADMIN_EMAIL) {
            return errorResult('Cannot delete super admin account');
        }

        // Prevent user from deleting themselves
        if (deletedBy && userToDelete.email === deletedBy) {
            return errorResult('You cannot delete your own account');
        }

        // Delete from auth (profile will cascade delete if FK is set up)
        const { error } = await supabase.auth.admin.deleteUser(userId);

        if (error) {
            if (error.message.includes('not found')) {
                return errorResult('User not found or already deleted');
            }
            return errorResult(`Failed to delete user: ${error.message}`);
        }

        revalidatePath('/');
        return successResult(true);
    } catch (error) {
        return handleSupabaseError(error, 'delete user');
    }
}
