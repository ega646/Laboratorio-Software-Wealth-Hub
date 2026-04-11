package org.example.modelo.BD.apoyo;

import java.sql.*;

public class ConexionSupaBase {

    private static final String PASSWORD = "DIVIDINGworlds2026";
    private static final String URL = "jdbc:postgresql://aws-1-eu-central-1.pooler.supabase.com:6543/postgres";
    private static final String USER = "postgres.fosephxtagbzyvbluhbv";


    public static void conexionPrueba() throws SQLException {

        try (Connection conn = DriverManager.getConnection(URL, USER, PASSWORD)) {

            System.out.println("Conectado correctamente");

            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT CODIGO, DESCRIPCION FROM DIVISAS");

            while (rs.next()) {
                System.out.println(rs.getString("CODIGO"));
            }

        } catch (Exception e) {
            throw e;
        }
    }

    public static Connection obtieneConexion() throws SQLException {
        Connection con = DriverManager.getConnection(URL, USER, PASSWORD);
        con.setAutoCommit(false);
        return con;
    }
}