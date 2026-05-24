import { NextResponse } from 'next/server'
import { sincronizarCuentas } from '@/lib/services/sync'

export async function POST() {
  try {
    await sincronizarCuentas()

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message
      },
      {
        status: 500
      }
    )
  }
}