import { getBrowserSupabase } from './supabase'

export interface Product {
  id: string
  empresa_id: string
  titulo: string
  descripcion?: string
  link_tienda?: string
  ubicacion?: string
  precio: number
  precio_original?: number
  rebaja_porcentaje?: number
  categoria?: string
  etiquetas: string[]
  imagenes: string[]
  stock_disponible: number
  es_destacado: boolean
  es_activo: boolean
  created_at: string
  updated_at: string
}

export interface ProductWithCompany extends Product {
  empresa_nombre?: string
  empresa_username?: string
  empresa_avatar?: string
}

export interface CreateProductData {
  titulo: string
  descripcion?: string
  link_tienda?: string
  ubicacion?: string
  precio: number
  precio_original?: number
  rebaja_porcentaje?: number
  categoria?: string
  etiquetas?: string[]
  imagenes?: string[]
  stock_disponible?: number
  es_destacado?: boolean
}

export interface UpdateProductData extends Partial<CreateProductData> {
  es_activo?: boolean
}

// Obtener todos los productos activos
export async function getActiveProducts(): Promise<ProductWithCompany[]> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('active_products_view')
      .select('*')
      .order('es_destacado', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting active products:', error)
    return []
  }
}

// Obtener productos destacados
export async function getFeaturedProducts(): Promise<ProductWithCompany[]> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('featured_products_view')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting featured products:', error)
    return []
  }
}

// Obtener productos de la empresa actual
export async function getMyProducts(): Promise<Product[]> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('empresa_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error getting my products:', error)
    return []
  }
}

// Obtener un producto específico (para vista pública)
export async function getProduct(productId: string): Promise<ProductWithCompany | null> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('active_products_view')
      .select('*')
      .eq('id', productId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error getting product:', error)
    return null
  }
}

// Obtener un producto específico por ID (para edición)
export async function getProductById(productId: string): Promise<{ success: boolean; error?: string; product?: Product }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('empresa_id', user.id)
      .single()

    if (error) throw error

    return { success: true, product: data }
  } catch (error) {
    console.error('Error getting product by id:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Crear un nuevo producto
export async function createProduct(productData: CreateProductData): Promise<{ success: boolean; error?: string; product?: Product }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar que el usuario sea de tipo empresa
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tipo_usuario')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    if (profile.tipo_usuario !== 'empresa') {
      return { success: false, error: 'Solo los usuarios de tipo empresa pueden crear productos' }
    }

    // Crear el producto
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        empresa_id: user.id,
        ...productData,
        etiquetas: productData.etiquetas || [],
        imagenes: productData.imagenes || [],
        stock_disponible: productData.stock_disponible || 0,
        es_destacado: productData.es_destacado || false
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Actualizar un producto
export async function updateProduct(productId: string, productData: UpdateProductData): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar que el producto pertenece al usuario
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('empresa_id')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    if (existingProduct.empresa_id !== user.id) {
      return { success: false, error: 'No tienes permisos para editar este producto' }
    }

    // Actualizar el producto
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Eliminar un producto
export async function deleteProduct(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Verificar que el producto pertenece al usuario
    const { data: existingProduct, error: fetchError } = await supabase
      .from('products')
      .select('empresa_id')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    if (existingProduct.empresa_id !== user.id) {
      return { success: false, error: 'No tienes permisos para eliminar este producto' }
    }

    // Eliminar el producto
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Buscar productos
export async function searchProducts(searchTerm: string, categoryFilter?: string): Promise<ProductWithCompany[]> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    let query = supabase
      .from('active_products_view')
      .select('*')
      .or(`titulo.ilike.%${searchTerm}%,descripcion.ilike.%${searchTerm}%,categoria.ilike.%${searchTerm}%`)

    if (categoryFilter) {
      query = query.eq('categoria', categoryFilter)
    }

    const { data, error } = await query
      .order('es_destacado', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching products:', error)
    return []
  }
}

// Obtener categorías disponibles
export async function getProductCategories(): Promise<string[]> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data, error } = await supabase
      .from('products')
      .select('categoria')
      .eq('es_activo', true)
      .not('categoria', 'is', null)

    if (error) throw error

    const categories = [...new Set(data?.map(item => item.categoria).filter(Boolean) || [])]
    return categories.sort()
  } catch (error) {
    console.error('Error getting product categories:', error)
    return []
  }
}

// Toggle destacado de un producto
export async function toggleProductFeatured(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Obtener el estado actual del producto
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('empresa_id, es_destacado')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    if (product.empresa_id !== user.id) {
      return { success: false, error: 'No tienes permisos para editar este producto' }
    }

    // Cambiar el estado de destacado
    const { error } = await supabase
      .from('products')
      .update({ es_destacado: !product.es_destacado })
      .eq('id', productId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error toggling product featured:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Toggle activo/inactivo de un producto
export async function toggleProductActive(productId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error('Supabase client not available')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    // Obtener el estado actual del producto
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('empresa_id, es_activo')
      .eq('id', productId)
      .single()

    if (fetchError) throw fetchError

    if (product.empresa_id !== user.id) {
      return { success: false, error: 'No tienes permisos para editar este producto' }
    }

    // Cambiar el estado de activo
    const { error } = await supabase
      .from('products')
      .update({ es_activo: !product.es_activo })
      .eq('id', productId)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error toggling product active:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
