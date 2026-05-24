import { createClient } from '@/lib/supabase/server'
import { obtenerCarteraBinance, obtenerCarteraBinanceMock } from './binance'

export async function sincronizarCuentas() {

  const supabase = await createClient()

  // Usuario autenticado
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No autorizado')
  }

  // Obtener cuentas activas
  const { data: cuentas, error } = await supabase
    .from('cuentas')
    .select(`
      tipocuentacodigo,
      apikey_cifrada,
      secretkey_cifrada
    `)
    .eq('usuario_id', user.id)
    .eq('activa', true)

  if (error) {
    throw new Error(error.message)
  }

  // Recorrer cuentas
  for (const cuenta of cuentas || []) {

    switch (cuenta.tipocuentacodigo) {

      case 'BINANCE': {

        const balances = await obtenerCarteraBinanceMock(
          cuenta.apikey_cifrada,
          cuenta.secretkey_cifrada
        )

        // Recorrer balances
        for (const balance of balances) {

          // Ignorar balances vacíos
          if (Number(balance.free) <= 0) {
            continue
          }

          console.log('Procesando asset:')
          console.log(balance.asset)

          // Buscar activo por símbolo
          const {
            data: activo,
            error: activoError
          } = await supabase
            .from('activos')
            .select('codigo')
            .eq('simbolo', balance.asset)
            .single()

          if (activoError || !activo) {

            console.log(
              `Activo no encontrado: ${balance.asset}`
            )

            continue
          }

          console.log('Activo encontrado:')
          console.log(activo.codigo)

          // Insertar posición
          const {
            error: posicionError
          } = await supabase
            .from('activosposeidos')
            .upsert({
              activocodigo: activo.codigo,
              cantidad: Number(balance.free),
              fechainicio: new Date()
                .toISOString()
                .split('T')[0],
              usuario_id: user.id
            })

          if (posicionError) {

            console.log(
              'Error insertando posición:'
            )

            console.log(posicionError.message)

            continue
          }

          console.log(
            `Posición insertada: ${balance.asset}`
          )
        }

        break
      }

      default:
        console.log('Exchange no soportado')
    }
  }
}