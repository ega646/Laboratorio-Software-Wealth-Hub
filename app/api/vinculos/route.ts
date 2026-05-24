import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body: NuevaCuenta = await request.json()

  const { data, error } = await supabase
    .from('cuentas')
    .upsert({
      tipocuentacodigo: body.tipoCuenta,
      fechaenlace: new Date().toISOString(),
      activa: true,
      usuario_id: user.id,
      apikey_cifrada: body.apiKey,
      secretkey_cifrada: body.apiSecret
    },
    {
        onConflict: 'usuario_id,tipocuentacodigo'
    }
    )
    .select()
    .single()

  if (error) {
    console.log('En cuentas: ' + error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }


  return NextResponse.json(data, { status: 201 })
}
