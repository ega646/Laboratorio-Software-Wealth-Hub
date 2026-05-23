import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  // Usuario autenticado
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    )
  }

  // 1. Obtener tipos de cuenta
  const { data: tipos, error: tiposError } = await supabase
    .from('tiposcuentas')
    .select(`
      codigo,
      descripcion,
      color
    `)

  if (tiposError) {
    console.log('En tiposcuentas: ' + tiposError.message)

    return NextResponse.json(
      { error: tiposError.message },
      { status: 500 }
    )
  }

  if (!tipos || tipos.length === 0) {
    return NextResponse.json([])
  }

  // 2. Obtener cuentas del usuario
  const codigosTipos = tipos.map(t => t.codigo)

  const { data: cuentas, error: cuentasError } = await supabase
    .from('cuentas')
    .select(`
      tipocuentacodigo,
      activa
    `)
    .eq('usuario_id', user.id)
    .in('tipocuentacodigo', codigosTipos)

  if (cuentasError) {
    console.log('En cuentas: ' + cuentasError.message)

    return NextResponse.json(
      { error: cuentasError.message },
      { status: 500 }
    )
  }

  // 3. Combinar resultados
  console.log('antes de combinar cuentas y tipos cuentas')
  const resultado = tipos.map(tipo => {
    const cuenta = cuentas?.find(
      c => c.tipocuentacodigo === tipo.codigo
    )

    return {
      codigo: tipo.codigo,
      descripcion: tipo.descripcion,
      color: tipo.color,
      status: cuenta ? 'conectada' : 'desconectada',
      activa: cuenta ? cuenta.activa : null
    }
  })
  console.log(resultado)
  return NextResponse.json(resultado, { status: 200 })
}