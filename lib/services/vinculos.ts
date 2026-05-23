import { createClient } from '@/lib/supabase/server'

export async function insertarVinculo({
  tipoCuenta,
  fechaInicio,
  apikey_cifrada,
  secretkey_cifrada
}: {
  tipoCuenta: string
  fechaInicio: string
  apikey_cifrada: string
  secretkey_cifrada: string
}) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autorizado')
  }

  const { data, error } = await supabase
    .from('cuentas')
    .upsert({
      tipocuentacodigo: tipoCuenta,
      fechaenlace: fechaInicio,
      activa: true,
      usuario_id: user.id,
      apikey_cifrada: ,
      secretkey_cifrada
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}