package TestGenerales;

import org.example.modelo.BD.apoyo.ConexionSupaBase;
import org.example.modelo.BD.clases.tabla.Divisas;
import org.example.modelo.BD.servicios.SvcUtl;
import org.example.modelo.BD.servicios.tabla.SvcDivisas;
import org.junit.Test;
import org.junit.jupiter.api.Assertions;

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
     */
    @Test public void divisas() throws SQLException {

        //Create de una divisa
        Divisas divisaPrueba = new Divisas();
        divisaPrueba.setCodigo("XXX");
        divisaPrueba.setDescripcion("Divisa para pruebas");

        try{
            SvcDivisas.addDivisas(divisaPrueba);
        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en CREATE de DIVISA (msg:"+ex.getMessage()+")");
        }

        //Read de la divisa creada
        try{
            Divisas divisaComprobacion = SvcDivisas.getDivisaPK("XXX");
            Assertions.assertEquals(divisaPrueba.getDescripcion(),divisaComprobacion.getDescripcion());
        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en READ de DIVISA (msg:"+ex.getMessage()+")");
        }

        //Update de la divisa
        try{
            Divisas divisaComprobacion = SvcDivisas.getDivisaPK("XXX");
            divisaComprobacion.setDescripcion("Nueva DESC");
            SvcDivisas.updateDivisas(divisaComprobacion);
            Divisas divisaModificada = SvcDivisas.getDivisaPK("XXX");
            Assertions.assertNotEquals(divisaPrueba.getDescripcion(),divisaModificada.getDescripcion());
        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en UPDATE de DIVISA (msg:"+ex.getMessage()+")");
        }

        //Delete de la divisa
        try{
            SvcDivisas.deleteDivisas("XXX");
            Divisas divisaComprobacion = SvcDivisas.getDivisaPK("XXX");
            Assertions.assertEquals(null,divisaComprobacion);
        }
        catch (Exception ex)
        {
            fail(SvcUtl.getMetodoActual()+"."+ex.getClass().getSimpleName()+
                    ") Fallo en TestConexionBD en DELETE de DIVISA (msg:"+ex.getMessage()+")");
        }

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
