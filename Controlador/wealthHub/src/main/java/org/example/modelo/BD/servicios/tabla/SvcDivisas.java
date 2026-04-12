package org.example.modelo.BD.servicios.tabla;

import org.example.modelo.BD.apoyo.ConexionSupaBase;
import org.example.modelo.BD.clases.PrcParam;
import org.example.modelo.BD.clases.tabla.Divisas;
import org.example.modelo.BD.servicios.AplicationUtils;
import org.example.modelo.BD.servicios.SvcDatabase;
import org.example.modelo.BD.servicios.SvcErr;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Servicio de comunicacion para la tabla de divisas
 */
public class SvcDivisas
{
    private SvcDivisas(){throw new IllegalStateException("Service class");}


    public static Divisas getDivisaPK(String codigo) throws SQLException, Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("codigo", codigo, "S"))));

        Divisas result = new Divisas();

        PreparedStatement stmt;
        ResultSet rs = null;

        try (Connection conn = ConexionSupaBase.obtieneConexion())
        {
            String sql = " SELECT CODIGO, DESCRIPCION " +
                    "        FROM DIVISAS " +
                    "       WHERE CODIGO = ?";

            stmt = conn.prepareStatement(sql);
            SvcDatabase.setValue(stmt,1,codigo);
            rs = stmt.executeQuery();

            if (rs.next())
            {
                result.setCodigo(rs.getString("CODIGO"));
                result.setDescripcion(rs.getString("DESCRIPCION"));
            }
            else
                throw new SQLException("No se han encontrado datos para PK: "+codigo+" en tabla Divisas.");
        }
        catch (SQLException e){
            if (e.getMessage().contains("No se han encontrado datos")||
                e.getMessage().contains("No data found"))
                return null;
            throw e;
        }
        return result;
    }

    public static List<Divisas> getDivisas() throws Exception
    {

        List<Divisas> lista = new ArrayList<>();

        PreparedStatement stmt;
        ResultSet rs;
        Divisas result;

        try (Connection conn = ConexionSupaBase.obtieneConexion())
        {
            String sql = " SELECT CODIGO, DESCRIPCION " +
                    "        FROM DIVISAS ";

            stmt = conn.prepareStatement(sql);
            rs = stmt.executeQuery();

            while (rs.next())
            {
                result = new Divisas();
                result.setCodigo(rs.getString("CODIGO"));
                result.setDescripcion(rs.getString("DESCRIPCION"));
                lista.add(result);
            }
        }
        return lista;
    }

    public static void addDivisas(Divisas nueva) throws Exception
    {
        PreparedStatement stmt;
        ResultSet rs;

        try (Connection conn = ConexionSupaBase.obtieneConexion())
        {
            String sql = " INSERT INTO DIVISAS (CODIGO, DESCRIPCION) " +
                    "                   VALUES (?,?)";

            stmt = conn.prepareStatement(sql);
            SvcDatabase.setValue(stmt,1,nueva.getCodigo());
            SvcDatabase.setValue(stmt,2,nueva.getDescripcion());
            stmt.execute();
            conn.commit();
        }
        catch (SQLException E){
            //Error mas comun es DUP VAL ON INDEX.
            updateDivisas(nueva);
        }
    }

    public static void updateDivisas(Divisas nueva) throws Exception
    {
        PreparedStatement stmt;

        try (Connection conn = ConexionSupaBase.obtieneConexion())
        {
            String sql = " UPDATE DIVISAS " +
                    "         SET DESCRIPCION = ? " +
                    "       WHERE CODIGO = ? " ;

            stmt = conn.prepareStatement(sql);
            SvcDatabase.setValue(stmt,1,nueva.getDescripcion());
            SvcDatabase.setValue(stmt,2,nueva.getCodigo());
            int resultado = stmt.executeUpdate();
            if (resultado < 1) throw new Exception("No se ha actualizado nada");
            conn.commit();
        }
    }

    public static void deleteDivisas(String codigo) throws Exception
    {
        PreparedStatement stmt;

        try (Connection conn = ConexionSupaBase.obtieneConexion())
        {
            String sql = " DELETE FROM DIVISAS " +
                    "       WHERE CODIGO = ?";

            stmt = conn.prepareStatement(sql);
            SvcDatabase.setValue(stmt,1,codigo);
            stmt.execute();
            conn.commit();
        }
    }
}
