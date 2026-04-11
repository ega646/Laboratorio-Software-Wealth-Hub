package Modelo.base.service.tabla;


import Modelo.base.model.PrcParam;
import Modelo.base.service.AplicationUtils;
import Modelo.base.service.SvcDatabase;
import Modelo.base.service.SvcErr;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;

public class SvcDivisas
{
    private SvcDivisas(){throw new IllegalStateException("Service class");}


    public static Modelo.base.model.tabla.Divisas getDivisaPK(String codigo) throws SQLException, Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("codigo", codigo, "S")));

        Modelo.base.model.tabla.Divisas result = new Modelo.base.model.tabla.Divisas();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            String sql = " SELECT CODIGO, DESCRIPCION " +
                    "        FROM DIVISA " +
                    "       WHERE CODIGO = ?";

            stmt = conn.getConnection().prepareStatement(sql);
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
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return result;
    }

    public static Modelo.base.model.tabla.Divisas getDivisa() throws SQLException, Exception
    {

        Modelo.base.model.tabla.Divisas result = new ListModelo.base.model.tabla.Divisas();

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            String sql = " SELECT CODIGO, DESCRIPCION " +
                    "        FROM DIVISA " +
                    "       WHERE CODIGO = ?";

            stmt = conn.getConnection().prepareStatement(sql);
            SvcDatabase.setValue(stmt,1,codigo);
            rs = stmt.executeQuery();

            while (rs.next())
            {
                Result = new
                result.setCodigo(rs.getString("CODIGO"));
                result.setDescripcion(rs.getString("DESCRIPCION"));
            }
            else
                throw new SQLException("No se han encontrado datos para PK: "+codigo+" en tabla Divisas.");
        }
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return result;
    }
}
