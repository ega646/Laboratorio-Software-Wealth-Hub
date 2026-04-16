package org.example.modelo.BD.apoyo;

import lombok.extern.slf4j.Slf4j;
import org.example.modelo.BD.clases.PrcParam;
import org.example.modelo.BD.servicios.SvcErr;
import org.example.modelo.BD.servicios.SvcPL;
import org.example.modelo.BD.servicios.SvcUtl;

import java.lang.reflect.Field;
import java.sql.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
public class CorrespondenciaBD
{
    private CorrespondenciaBD(){throw new IllegalStateException("Utility class");}


    public static String getAtributoFromBBDD (Class c, String campoBBDD)
    {
        // Reflection
        String result = null;

        for (Field campo: c.getDeclaredFields())
        {
            ColumnaBD anotacion = campo.getAnnotation(ColumnaBD.class);
            if (anotacion != null && anotacion.value().equalsIgnoreCase(campoBBDD))
                return campo.getName();
        }
        return result;
    }
    public static String getAtributoFromBBDD (Object regClase, String campoBBDD)
    {
        return getAtributoFromBBDD (regClase.getClass(), campoBBDD);
    }

    public static List<String> getListaCamposBD (Class c)
    {
        List<String> lista = new ArrayList<>();
        for (Field campo: c.getDeclaredFields())
        {
            ColumnaBD anotacion = campo.getAnnotation(ColumnaBD.class);
            if (anotacion != null)
                lista.add(anotacion.value());
        }
        return lista;
    }
    public static List<String> getListaCamposBD (Object o)
    {
        return getListaCamposBD(o.getClass());
    }


    public static String getListaCamposBDListados(Class c)
    {
        StringBuilder result = null;

        List<String> lista = getListaCamposBD(c);
        for (String l: lista)
        {
            if (result == null)
                result = new StringBuilder(l);
            else
                result = result.append(", "+l);
        }
        if (result == null) result = new StringBuilder("");

        return result.toString();
    }

    /*
    public static void setCampos (ResultSet rs, Object registro, List<String> campos) throws SQLException
    {
        List<String> listaCampos;
        if (SvcUtl.isNuloOVacio(campos))
            listaCampos = getListaCamposBD(registro);
        else
            listaCampos = campos;

        InformacionClase info = InformacionClase.get(registro);

        for (String s: listaCampos)
        {
            String nombreCampo = CorrespondenciaBD.getAtributoFromBBDD (registro, s);

            if (SvcUtl.isNuloOVacio(nombreCampo))
            {
                //Logueamos que el campo no existe, pero si en la base de datos
                log.error(SvcUtl.getMetodoActual() + ") Campo: " + nombreCampo + " correspondencia con " + s + " es nulo o vacio.");
                continue;
            }

            Class<?> tipoCampoJava = info.getTipoCampo(nombreCampo);
            Object valor = BDUtils.sqlToJava(rs.getObject(s), tipoCampoJava, null, null);
            info.setValor(registro, nombreCampo, valor);
        }
    }
    public static void setCampos (ResultSet rs, Object registro) throws SQLException { setCampos (rs, registro, null); }

    public static Struct setDBType (String tipoDB, Object tipo) throws Exception {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList(new PrcParam("tipoDB", tipoDB,"S"),
                                                       new PrcParam("tipo", tipo,"S"))));
        Struct result;
        List<Object> lista = new ArrayList<>();

        try (Conexion conn = AplicationUtils.getConexionGfin())
        {
            for (Field campo: tipo.getClass().getDeclaredFields())
            {
                campo.setAccessible(true); // Feo, feo, feo, esto requiere un debate
                Object valor;

                switch (campo.getType().getSimpleName())
                {
                    case "int":
                        valor = campo.getInt(tipo);
                        break;
                    case "Long":
                    case "String":
                    case "BigDecimal":
                    case "Date":
                        valor = campo.get(tipo);
                        break;
                    case "LocalDate":
                    case "LocalDateTime":
                        valor = SvcPL.toDate((LocalDate) campo.get(tipo));
                        break;
                    default:
                        throw new Exception("El tipo de dato '"+campo.getType().getSimpleName()+"' no está contemplado.");
                }
                lista.add(valor);
            }

            result = conn.createStruct(tipoDB, lista.toArray());
        }
        catch (Exception ex)
        {
            String error = "Err.COM."+SvcUtl.getMetodoActual()+") "+ex.getMessage();
            log.error(error, ex);
            throw new Exception(error);
        }
        catch (SQLException ex)
        {
            String error = "Err.SQL."+SvcUtl.getMetodoActual()+") "+ex.getMessage();
            log.error(error, ex);
            throw new Exception(error);
        }
        catch (Exception e)
        {
            String error = "Err.GEN."+SvcUtl.getMetodoActual()+"."+e.getClass().getSimpleName();
            log.error(error, e);
            throw new Exception(error);
        }
        return result;
    }

    public static Array setDBCollection (String tipoDB, String subTipoBD, Object tipo) throws Exception {
        SvcErr.ctrlParam(new ArrayList<>(Arrays.asList(new PrcParam("tipoDB", tipoDB,"S"),
                                                       new PrcParam("subTipoBD", subTipoBD,"S"))));

        Array result;
        Struct[] lista;
        int tamayo;

        try
        {
            tamayo = ((List<?>) tipo).size();
            lista = new Struct[0];

            for (int i = 0; i < tamayo; i++)
            {
                Struct elemento = setDBType(subTipoBD, ((List<?>) tipo).get(i));

                // Añadimos el elemento al Array "lista"
                int n = lista.length;
                lista = Arrays.copyOf(lista, n + 1);
                lista[n] = elemento;
            }

            Connection conn = ConexionSupaBase.obtieneConexion();
            result = (conn.unwrap(OracleConnection.class)).createOracleArray(tipoDB, lista);
        }
        catch (Exception ex)
        {
            String error = "Err.COM."+SvcUtl.getMetodoActual()+") "+ex.getMessage();
            log.error(error, ex);
            throw new Exception(error);
        }
        catch (SQLException ex)
        {
            String error = "Err.SQL."+SvcUtl.getMetodoActual()+") "+ex.getMessage();
            log.error(error, ex);
            throw new Exception(error);
        }
        catch (Exception e)
        {
            String error = "Err.GEN."+SvcUtl.getMetodoActual()+"."+e.getClass().getSimpleName();
            log.error(error, e);
            throw new Exception(error);
        }
        return result;
    }
     */
}
