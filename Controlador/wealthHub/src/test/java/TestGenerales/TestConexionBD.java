package TestGenerales;

import org.example.modelo.BD.apoyo.ConexionSupaBase;
import org.example.modelo.BD.clases.tabla.Divisas;
import org.example.modelo.BD.servicios.SvcUtl;
import org.example.modelo.BD.servicios.tabla.SvcDivisas;
import org.junit.Test;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

import static org.junit.Assert.fail;

public class TestConexionBD
{
    /**
     * Comrpueba la conexion contra SUPABASE
     */
    @Test public void conexion(){
        try{
            ConexionSupaBase.conexionPrueba();
        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en prueba de conexion (msg:"+ex.getMessage()+")");
            ex.printStackTrace();
        }
    }
    /**
     * Comprueba las operaciones asociadas a divisa (CRUD) y en consecuencia la conexion con la BD
     * Elegimos divisa al ser una tabla estable
     * @throws SQLException
     * @throws IOException
     */
    @Test public void divisas() throws SQLException, IOException {

        //Create de una divisa
        Divisas divisaPrueba = new Divisas();
        divisaPrueba.setCodigo("XXX");
        divisaPrueba.setDescripcion("Divisa para pruebas");

        /*
        try{
            SvcDivisas.create(divisaPrueba);
        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en CREATE de DIVISA (msg:"+ex.getMessage()+")");
        }

        //Read de la divisa creada
        try{
            Divisas divisaComprobacion = SvcDivisas.getDivisaPK("XXX");
            SvcDivisas.create(divisaPrueba);

        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en READ de DIVISA (msg:"+ex.getMessage()+")");
        }

        //Update de la divisa

        //Delete de la divisa
        */

        //Lista de todas las divisas existentes
        try{
            int numeroDivisas = 0;
            List<Divisas> divisas = SvcDivisas.getDivisas();
            for (Divisas divisa : divisas) {
                System.out.println(divisa.getCodigo()+": "+divisa.getDescripcion());
                numeroDivisas++;
            }
            if (numeroDivisas <3){
                throw new Exception("Deberia haber al menos 3 divisas predefinidas");
            }

        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en READ de DIVISA (msg:"+ex.getMessage()+")");
        }
    }
}
