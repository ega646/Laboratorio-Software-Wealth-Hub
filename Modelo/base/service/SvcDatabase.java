package Modelo.base.service;

import java.io.ByteArrayInputStream;
import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class SvcDatabase {

    private SvcDatabase() { throw new IllegalStateException("Service class"); }

    /* Helper para asignar valores a PreparedStatement */
    public static void setValue(PreparedStatement stmt, int index, Object valor) throws SQLException {
        if (valor == null) {
            stmt.setNull(index, Types.NULL);
            return;
        }

        if (String.class.equals(valor.getClass())) {
            stmt.setString(index, (String) valor);
        } else if (BigDecimal.class.equals(valor.getClass())) {
            stmt.setBigDecimal(index, (BigDecimal) valor);
        } else if (Long.class.equals(valor.getClass())) {
            stmt.setLong(index, (Long) valor);
        } else if (Integer.class.equals(valor.getClass())) {
            stmt.setInt(index, (int) valor);
        } else if (Date.class.equals(valor.getClass())) {
            stmt.setTimestamp(index, new Timestamp(((Date) valor).getTime()));
        } else if (LocalDate.class.equals(valor.getClass())) {
            stmt.setTimestamp(index, new Timestamp((SvcPL.toDate((LocalDate) valor)).getTime()));
        } else if (LocalDateTime.class.equals(valor.getClass())) {
            stmt.setTimestamp(index, SvcPL.toTimestamp((LocalDateTime)valor));
        } else if (ByteArrayInputStream.class.equals(valor.getClass())) {
            stmt.setBinaryStream(index, (ByteArrayInputStream) valor, ((ByteArrayInputStream) valor).available());
        } else if (oracle.sql.BLOB.class.equals(valor.getClass()) || Blob.class.equals(valor.getClass())) {
            stmt.setBlob(index, (Blob) valor);
        } else if (oracle.sql.CLOB.class.equals(valor.getClass()) || Clob.class.equals(valor.getClass())) {
            stmt.setClob(index, (Clob) valor);
        } else {
            throw new Exception("Oracle: Tipo no programado: " + valor.getClass());
        }
    }
    /* Helper para asignar valores a CallableStatement */
    public static void setValue(CallableStatement stmt, int index, Object valor) throws Exception {
        if (valor != null) {
            if (String.class.equals(valor.getClass())) {
                stmt.setString(index, (String) valor);
            } else if (BigDecimal.class.equals(valor.getClass())) {
                stmt.setBigDecimal(index, (BigDecimal) valor);
            } else if (Long.class.equals(valor.getClass())) {
                stmt.setLong(index, (Long) valor);
            } else if (Integer.class.equals(valor.getClass())) {
                stmt.setInt(index, (int) valor);
            } else if (Date.class.equals(valor.getClass())) {
                stmt.setTimestamp(index, new Timestamp(((Date) valor).getTime()));
            } else if (LocalDate.class.equals(valor.getClass())) {
                stmt.setTimestamp(index, new Timestamp((SvcPL.toDate((LocalDate) valor)).getTime()));
            } else if (ByteArrayInputStream.class.equals(valor.getClass())) {
                stmt.setBinaryStream(index, (ByteArrayInputStream) valor, ((ByteArrayInputStream) valor).available());
            } else if (Blob.class.equals(valor.getClass())) {
                stmt.setBlob(index, (Blob) valor);
            } else if (Clob.class.equals(valor.getClass())){
                stmt.setClob(index, (Clob) valor);
            } else {
                throw new Exception("Oracle: Tipo no programado: " + valor.getClass());
            }
        } else {
            stmt.setNull(index, Types.NULL);
        }
    }
}
