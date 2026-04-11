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

public class SvcDivisas
{
    private SvcDivisas(){throw new IllegalStateException("Service class");}


    public static Divisas getDivisaPK(String codigo) throws SQLException, Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("codigo", codigo, "S"))));

        Divisas result = new Divisas();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try (Connection conn = ConexionSupaBase.obtieneConexion())
        {
            String sql = " SELECT CODIGO, DESCRIPCION " +
                    "        FROM DIVISA " +
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
                    "        FROM DIVISA ";

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
}
