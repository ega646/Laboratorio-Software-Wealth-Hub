package org.example.modelo.BD.servicios;

import lombok.extern.slf4j.Slf4j;
import org.example.modelo.BD.apoyo.ConexionSupaBase;
import org.example.modelo.BD.clases.OracleTable;
import org.example.modelo.BD.clases.PrcParam;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.TreeMap;

@Slf4j
public class SvcOracleDatabase
{
    private SvcOracleDatabase(){throw new IllegalStateException("Service class");}

    /*
    public static List<String> getOracleFields(String owner, String tabla, Connection conn) throws Exception {
        List<String> lisCampos = new ArrayList<>();
        try
        {
            List<OracleTable> listOraCampo = SvcOracleDatabase.getOracleObject(owner,tabla, conn);
            for (OracleTable campo: listOraCampo)
                lisCampos.add(campo.getOtabColumnName());
        }
        catch (SQLException ex)
        {
            throw new Exception(SvcUtl.getMetodoActual()+") Error recuperando datos de ORACLE.", ex);
        }
        return lisCampos;
    }
     */

    public static String getOracleObjectType (String owner, String objectName) throws Exception, SQLException{
        try (Connection conn = ConexionSupaBase.obtieneConexion()){
            return getOracleObjectType(owner,objectName,conn);
        }
    }
    public static String getOracleObjectType (String owner, String objectName, Connection conn) throws Exception, SQLException
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("objectName", objectName,"S"))));

        String result = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            String sql = " SELECT OBJECT_TYPE " +
                    "        FROM ALL_OBJECTS " +
                    "       WHERE OWNER       = ? " +
                    "         AND OBJECT_NAME = ? ";

            stmt = conn.prepareStatement(sql);

            SvcDatabase.setValue(stmt,1,owner);
            SvcDatabase.setValue(stmt,2,objectName);

            rs = stmt.executeQuery();

            if (rs.next())
                result = rs.getString("OBJECT_TYPE");

            if (SvcUtl.isNuloOVacio(result))
                throw new Exception("El objeto "+owner+"."+objectName+" no existe en la base de datos.");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return result;
    }
  /*
    public static List<OracleTable> getOracleObject (String owner, String objectName) throws Exception, SQLException
    {
        try (Connection conn = ConexionSupaBase.obtieneConexion()){
            return getOracleObject(owner, objectName, conn);
        }
    }
    public static List<OracleTable> getOracleObject (String owner, String objectName, Conexion conn) throws Exception, SQLException
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("objectName", objectName,"S"))));

        List<OracleTable> result;
        String tipo;

        tipo = getOracleObjectType (owner, objectName,conn);
        if (tipo==null) throw new Exception("El objeto "+owner+"."+objectName+" no existe o no se encuentra");

        if (tipo.equalsIgnoreCase("VIEW"))
            result = getOracleView (owner, objectName,conn);
        else if (tipo.equalsIgnoreCase("TABLE"))
            result = getOracleTable (owner, objectName,conn);
        else
            throw new Exception("El objeto "+owner+"."+objectName+" con tipo "+tipo+" no tiene tratamiento definido.");

        return result;
    }

    public static List<OracleTable> getOracleTable (String owner, String tableName) throws SQLException{
        try (Conexion conn = AplicationUtils.getConexionGfin()){
            return getOracleTable(owner, tableName, conn);
        }
    }
    public static List<OracleTable> getOracleTable (String owner, String tableName, Conexion conn) throws SQLException
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("tableName", tableName,"S"))));

        List<OracleTable> result = new ArrayList<>();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            String sql = " SELECT TAB.OWNER, TAB.TABLE_NAME, COL.COLUMN_NAME, COL.DATA_TYPE, COL.DATA_LENGTH, COL.NULLABLE," +
                    "             (SELECT COC.POSITION " +
                    "                FROM ALL_CONS_COLUMNS COC " +
                    "               WHERE CON.OWNER           = COC.OWNER " +
                    "                 AND CON.CONSTRAINT_NAME = COC.CONSTRAINT_NAME " +
                    "                 AND CON.TABLE_NAME      = COC.TABLE_NAME " +
                    "                 AND COL.COLUMN_NAME     = COC.COLUMN_NAME ) PK_POSITION" +
                    "  FROM ALL_TABLES TAB, ALL_TAB_COLS COL, ALL_CONSTRAINTS CON" +
                    " WHERE TAB.OWNER = COL.OWNER" +
                    "   AND TAB.TABLE_NAME          = COL.TABLE_NAME " +
                    "   AND TAB.OWNER               = CON.OWNER      (+) " +
                    "   AND TAB.TABLE_NAME          = CON.TABLE_NAME (+) " +
                    "   AND COL.COLUMN_ID IS NOT NULL " +
                    "   AND CON.CONSTRAINT_TYPE (+) = 'P' " +
                    "   AND TAB.OWNER               = ? " +
                    "   AND TAB.TABLE_NAME          = ? " +
                    " ORDER BY COL.COLUMN_ID ";

            stmt = conn.getConnection().prepareStatement(sql);

            SvcDatabase.setValue(stmt,1,owner);
            SvcDatabase.setValue(stmt,2,tableName);

            rs = stmt.executeQuery();

            while (rs.next())
            {
                OracleTable ota = new OracleTable();

                ota.setOtabOwner(rs.getString("OWNER"));
                ota.setOtabTableName(rs.getString("TABLE_NAME"));
                ota.setOtabColumnName(rs.getString("COLUMN_NAME"));
                ota.setOtabDataType(rs.getString("DATA_TYPE"));
                ota.setOtabDatalength(rs.getLong("DATA_LENGTH"));
                ota.setOtabNullable(rs.getString("NULLABLE"));

                ota.setOtabPKPosition(rs.getLong("PK_POSITION"));
                if (rs.wasNull())
                    ota.setOtabPKPosition(null);

                result.add(ota);
            }
        }
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return result;
    }

    public static List<OracleTable> getOracleView(String owner, String viewName) throws SQLException{
        try (Conexion conn = AplicationUtils.getConexionGfin()){
            return getOracleView(owner, viewName,conn);
        }
    }
    public static List<OracleTable> getOracleView(String owner, String viewName, Conexion conn) throws SQLException
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("viewName", viewName,"S"))));

        List<OracleTable> result = new ArrayList<>();
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try
        {
            String sql = " SELECT VW.OWNER, VW.VIEW_NAME, COL.COLUMN_NAME, COL.DATA_TYPE, COL.DATA_LENGTH, COL.NULLABLE, NULL PK_POSITION " +
                    "        FROM ALL_VIEWS VW, ALL_TAB_COLUMNS COL " +
                    "       WHERE VW.OWNER      = COL.OWNER" +
                    "         AND VW.VIEW_NAME  = COL.TABLE_NAME " +
                    "         AND COL.COLUMN_ID IS NOT NULL " +
                    "         AND VW.OWNER      = ? " +
                    "         AND VW.VIEW_NAME  = ? " +
                    "       ORDER BY COL.COLUMN_ID ";

            stmt = conn.getConnection().prepareStatement(sql);

            SvcDatabase.setValue(stmt,1,owner);
            SvcDatabase.setValue(stmt,2,viewName);

            rs = stmt.executeQuery();

            while (rs.next())
            {
                OracleTable ota = new OracleTable();

                ota.setOtabOwner(rs.getString("OWNER"));
                ota.setOtabTableName(rs.getString("VIEW_NAME"));
                ota.setOtabColumnName(rs.getString("COLUMN_NAME"));
                ota.setOtabDataType(rs.getString("DATA_TYPE"));
                ota.setOtabDatalength(rs.getLong("DATA_LENGTH"));
                ota.setOtabNullable(rs.getString("NULLABLE"));
                ota.setOtabPKPosition(rs.getLong("PK_POSITION"));

                result.add(ota);
            }
        }
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return result;
    }

    public static String getOracleFieldType (String owner, String objectName, String field) throws Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("objectName", objectName,"S"),
                                                        new PrcParam("field", field,"S"))));

        String result = null;
        PreparedStatement stmt = null;
        ResultSet rs = null;

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            String sql = " SELECT DATA_TYPE " +
                    "        FROM ALL_TAB_COLUMNS " +
                    "       WHERE OWNER       = ? " +
                    "         AND TABLE_NAME  = ? " +
                    "         AND COLUMN_NAME = ? ";

            stmt = conn.getConnection().prepareStatement(sql);

            SvcDatabase.setValue(stmt,1,owner);
            SvcDatabase.setValue(stmt,2,objectName);
            SvcDatabase.setValue(stmt,3,field);

            rs = stmt.executeQuery();

            if (rs.next())
                result = rs.getString("DATA_TYPE");

            if (SvcUtl.isNuloOVacio(result))
                throw new Exception("No se ha podido encontra TIPO DE CAMPO para el objeto "+owner+"."+objectName+".");
        }
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return result;
    }

    public static List<String> getOraclePK (String owner, String tableName) throws SQLException, Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("tableName", tableName,"S"))));

        TreeMap<Long,String> result = new TreeMap<>();
        List<OracleTable> tab;

        tab = SvcOracleDatabase.getOracleTable (owner, tableName);

        for (OracleTable t: tab)
            if (!SvcUtl.isNuloOVacio(t.getOtabPKPosition()) && !t.getOtabPKPosition().equals(Long.valueOf(0)))
                result.put(t.getOtabPKPosition(),t.getOtabColumnName());

        if (result.isEmpty())
            throw new Exception("No existe PK para '"+owner+"."+tableName+"'.");

        return new ArrayList<>(result.values());
    }

    public static String getOracleDBValue (String owner, String tableName, String fieldName, List<String> pk) throws SQLException, Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("owner", owner,"S"),
                                                        new PrcParam("tableName", tableName,"S"),
                                                        new PrcParam("fieldName", tableName,"S"))));
        String result = null;
        String tipo;
        PreparedStatement stmt = null;
        ResultSet rs = null;
        int i = 0;

        tipo = getOracleFieldType(owner, tableName, fieldName);

        if (tipo == null)
            throw new Exception("No se ha podido obtener tipo para el campo "+fieldName+" de tabla "+tableName+" ("+owner+")");

        StringBuilder sql = new StringBuilder();
        if (tipo.equals("VARCHAR2") || tipo.equals("CLOB") )
            sql = sql.append(" SELECT "+fieldName);
        else if (tipo.equals("NUMBER"))
            sql = sql.append(" SELECT NUM2C("+fieldName+")");
        else if (tipo.equals("DATE"))
            sql = sql.append(" SELECT FEC2C("+fieldName+")");
        else if (tipo.equals("BOOLEAN"))
            sql = sql.append(" SELECT BOOLEAN_TO_CHAR("+fieldName+")");
        else
            throw new Exception("El tipo de dato '"+tipo+"' no está contemplado.");

        sql = sql.append(" VALOR FROM "+owner+"."+tableName+" WHERE ");

        List<String> tablePK = SvcOracleDatabase.getOraclePK (owner,tableName);
        for (String campo: tablePK)
            sql = sql.append(campo + " = '" + pk.get(i++) + "' AND ");

        sql = new StringBuilder(sql.substring(1, sql.length()-4));

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            stmt = conn.getConnection().prepareStatement(sql.toString());

            rs = stmt.executeQuery();

            if (rs.next())
                result = rs.getString("VALOR");

            if (SvcUtl.isNuloOVacio(result))
                throw new Exception("No se ha encontrado VALOR para el campo " + owner + "." + tableName + "." + fieldName + ".");
        }
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return result;
    }

    public static int getOracleFileSize(String esquema, String tabla, String campo) throws SQLException, Exception
    {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList( new PrcParam("esquema", esquema,"S"),
                                                        new PrcParam("tabla", tabla,"S"),
                                                        new PrcParam("campo", campo,"S"))));
        int length;

        PreparedStatement stmt = null;
        ResultSet rs = null;

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            String sql = " SELECT COL.DATA_TYPE DATA_TYPE, COL.DATA_LENGTH DATA_LENGTH, COL.NULLABLE NULLABLE " +
                    "        FROM ALL_TAB_COLS COL " +
                    "       WHERE COL.OWNER       = ? " +
                    "         AND COL.TABLE_NAME  = ? " +
                    "         AND COL.COLUMN_NAME = ? ";

            stmt = conn.getConnection().prepareStatement(sql);

            SvcDatabase.setValue(stmt,1, esquema);
            SvcDatabase.setValue(stmt,2, tabla);
            SvcDatabase.setValue(stmt,3, campo);

            rs = stmt.executeQuery();

            if (rs.next())
                length = rs.getInt("DATA_LENGTH");
            else
                throw new SQLException("No se encuentran valores para "+esquema+"-"+tabla+"-"+campo);
        }
        finally
        {
            BDUtils.close(stmt,rs);
        }
        return length;
    }

    public static Long getSeq (String seqName) throws Exception, SQLException {

        String sql = " SELECT " + seqName + ".NEXTVAL FROM DUAL";

        PreparedStatement stmt = null;
        ResultSet rs = null;

        Long result = null;

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            stmt = conn.getConnection().prepareStatement(sql);
            rs = stmt.executeQuery();

            if (rs.next()) {
                result = rs.getLong(1);
            }
        } finally {
            BDUtils.close(stmt, rs);
        }

        return result;
    }

   */
}
