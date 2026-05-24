import { createClient } from '@/lib/supabase/server'
import { obtenerCarteraBinance, obtenerCarteraBinanceMock } from './binance'
import { obtenerCarteraCoinbase, obtenerCarteraCoinbaseMock} from './coinbase'
import { obtenerCarteraAlpaca, obtenerCarteraAlpacaMock} from './alpaca'
import { obtenerCarteraIBKRMock} from './ibkr'

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
    let balances = []

    switch (cuenta.tipocuentacodigo) {

      case 'BINANCE': {
        balances = await obtenerCarteraBinanceMock(
          cuenta.apikey_cifrada,
          cuenta.secretkey_cifrada
        )
        break
      }
      case 'COINBASE': {
        balances = await obtenerCarteraCoinbaseMock(
          cuenta.apikey_cifrada,
          cuenta.secretkey_cifrada
        )
        break
     }
     case 'ALPACA': {
        balances = await obtenerCarteraAlpacaMock(
            cuenta.apikey_cifrada,
            cuenta.secretkey_cifrada
        )
        break
     }
     case 'IBKR': {
             balances = await obtenerCarteraIBKRMock(
                 cuenta.apikey_cifrada,
                 cuenta.secretkey_cifrada
             )
             break
     }
     default:
             console.log('Exchange no soportado')
     }


    console.log(balances);

    // Recorrer balances
    for (const balance of balances) {

        // Ignorar balances vacíos
        if (Number(balance.free) <= 0) {
            continue
        }

        console.log(`Procesando asset: ${balance.asset}`)

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

        console.log(`Activo encontrado: ${activo.codigo}`)

        // Insertar  o actualizar posición segun si ya hay una de cuenta_origen
        // Buscar si ya existe
        const {
          data: existente,
          error: existenteError
        } = await supabase
          .from('activosposeidos')
          .select('id, fechainicio')
          .eq('usuario_id', user.id)
          .eq('cuenta_origen', cuenta.tipocuentacodigo)
          .eq('activocodigo', activo.codigo)
          .maybeSingle()
        if (existenteError) {
          console.log("Error comprobando si existe activo:")
          console.log(existenteError.message)
        }

        console.log(`Ya existia?: ${existente}`)
        let posicionError = null
        //si existe, actualiza. Si no, inserta
        if (existente) {

          const {
            error: posicionError
          } = await supabase
            .from('activosposeidos')
            .update({
              cantidad: Number(balance.free)
            })
            .eq('id', existente.id)
        }
        else {
            console.log('No existia, creando')
          const {
            error: posicionError
          } = await supabase
            .from('activosposeidos')
            .insert({
              activocodigo: activo.codigo,
              cantidad: Number(balance.free),
              fechainicio: new Date()
                .toISOString()
                .split('T')[0],
              usuario_id: user.id,
              cuenta_origen: cuenta.tipocuentacodigo
            })
        }
        if (posicionError) {
            console.log(
              'Error insertando posición:'
            )
            console.log(posicionError.message)
            //insertamos o actualizamos todo lo posible
            continue
        }
    }
  }
}