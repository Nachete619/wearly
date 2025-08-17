import { getBrowserSupabase } from './supabase'

export interface UserProfile {
  id: string
  username: string
  full_name: string
  bio: string
  avatar_url: string
  tipo_usuario: 'comun' | 'empresa'
  followers_count: number
  following_count: number
  instagram_url?: string
  pinterest_url?: string
  created_at: string
  updated_at: string
}

export interface CompanyProfile {
  id: string
  profile_id: string
  nombre_empresa: string
  descripcion: string
  direccion: string
  telefono: string
  horarios: string
  sitio_web: string
  created_at: string
  updated_at: string
}

// Obtener el perfil del usuario actual
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return profile
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Obtener el perfil de empresa del usuario actual
export async function getCurrentCompanyProfile(): Promise<CompanyProfile | null> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: companyProfile, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error
    }

    return companyProfile
  } catch (error) {
    console.error('Error getting company profile:', error)
    return null
  }
}

// Cambiar el tipo de usuario
export async function changeUserType(tipoUsuario: 'comun' | 'empresa'): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Si está cambiando a tipo empresa, verificar que no tenga ya un perfil de empresa
    if (tipoUsuario === 'empresa') {
      const existingCompanyProfile = await getCurrentCompanyProfile()
      if (existingCompanyProfile) {
        return { success: false, error: 'Ya tienes un perfil de empresa configurado' }
      }
    }

    // Actualizar el tipo de usuario
    const { error } = await supabase
      .from('profiles')
      .update({ tipo_usuario: tipoUsuario })
      .eq('id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error changing user type:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Crear perfil de empresa
export async function createCompanyProfile(companyData: {
  nombre_empresa: string
  descripcion: string
  direccion: string
  telefono: string
  horarios: string
  sitio_web: string
}): Promise<{ success: boolean; error?: string; companyProfile?: CompanyProfile }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar que el usuario sea de tipo empresa
    const profile = await getCurrentUserProfile()
    if (!profile || profile.tipo_usuario !== 'empresa') {
      return { success: false, error: 'Debes ser de tipo empresa para crear un perfil de empresa' }
    }

    // Verificar que no tenga ya un perfil de empresa
    const existingCompanyProfile = await getCurrentCompanyProfile()
    if (existingCompanyProfile) {
      return { success: false, error: 'Ya tienes un perfil de empresa configurado' }
    }

    // Crear el perfil de empresa
    const { data: companyProfile, error } = await supabase
      .from('company_profiles')
      .insert({
        profile_id: user.id,
        ...companyData
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, companyProfile }
  } catch (error) {
    console.error('Error creating company profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Actualizar perfil de empresa
export async function updateCompanyProfile(companyData: Partial<CompanyProfile>): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar que tenga un perfil de empresa
    const existingCompanyProfile = await getCurrentCompanyProfile()
    if (!existingCompanyProfile) {
      return { success: false, error: 'No tienes un perfil de empresa configurado' }
    }

    // Actualizar el perfil de empresa
    const { error } = await supabase
      .from('company_profiles')
      .update(companyData)
      .eq('profile_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating company profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Eliminar perfil de empresa
export async function deleteCompanyProfile(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Eliminar el perfil de empresa
    const { error } = await supabase
      .from('company_profiles')
      .delete()
      .eq('profile_id', user.id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting company profile:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Convertir usuario a empresa (cambiar tipo + crear perfil)
export async function convertToCompany(companyData: {
  nombre_empresa: string
  descripcion: string
  direccion: string
  telefono: string
  horarios: string
  sitio_web: string
}): Promise<{ success: boolean; error?: string; companyProfile?: CompanyProfile }> {
  try {
    // Primero cambiar el tipo de usuario
    const typeChangeResult = await changeUserType('empresa')
    if (!typeChangeResult.success) {
      return typeChangeResult
    }

    // Luego crear el perfil de empresa
    const companyResult = await createCompanyProfile(companyData)
    return companyResult
  } catch (error) {
    console.error('Error converting to company:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Convertir empresa a usuario común
export async function convertToRegularUser(): Promise<{ success: boolean; error?: string }> {
  try {
    // Primero eliminar el perfil de empresa
    const deleteResult = await deleteCompanyProfile()
    if (!deleteResult.success) {
      return deleteResult
    }

    // Luego cambiar el tipo de usuario
    const typeChangeResult = await changeUserType('comun')
    return typeChangeResult
  } catch (error) {
    console.error('Error converting to regular user:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
