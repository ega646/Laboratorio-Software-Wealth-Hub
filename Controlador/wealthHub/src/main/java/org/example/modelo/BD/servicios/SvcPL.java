package org.example.modelo.BD.servicios;

import lombok.NonNull;
import org.example.modelo.BD.apoyo.ConexionSupaBase;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.sql.Date;
import java.sql.*;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.time.temporal.TemporalAdjusters.lastDayOfYear;

public class SvcPL
{
    public static final String DEFAULT_FORMAT = "yyyy-MM-dd";              // ISO-8601
    public static final String DEFAULT_TIME_FORMAT = "HH:mm:ss";
    public static final String DEFAULT_TIME_FORMAT_EMPTY = "00:00:00";
    public static final String DEFAULT_DH_FORMAT = "yyyy-MM-dd HH:mm:ss";  // ISO-8601
    public static final String PL_FORMAT = "dd/MM/yyyy";
    public static final String PL_DH_FORMAT = "dd/MM/yyyy HH:mm:ss";

    public static final List<String> valoresCheckSN = Collections.unmodifiableList(new ArrayList<>(Arrays.asList("S","N")));

    private SvcPL(){throw new IllegalStateException("Service class");}

    public static String nvl(Object valor1, String valor2)
    {
        if (SvcUtl.isNuloOVacio(valor1))
            return valor2;
        else
            return valor1.toString();
    }
    public static BigDecimal nvl(BigDecimal valor1, int valor2)  { return nvl(valor1, BigDecimal.valueOf(valor2)); }
    public static BigDecimal nvl(BigDecimal valor1, Long valor2) { return nvl(valor1, BigDecimal.valueOf(valor2)); }
    public static BigDecimal nvl(BigDecimal valor1, BigDecimal valor2)
    {
        if (valor1 == null)
            return valor2;
        else
            return valor1;
    }
    public static LocalDate nvl(LocalDate valor1, LocalDate valor2)
    {
        if (valor1 == null)
            return valor2;
        else
            return valor1;
    }
    public static LocalDateTime nvl(LocalDateTime valor1, LocalDateTime valor2)
    {
        if (valor1 == null)
            return valor2;
        else
            return valor1;
    }
    public static Long nvl(Long valor1, Long valor2)
    {
        if (valor1 == null)
            return valor2;
        else
            return valor1;
    }
    public static int nvl(int valor1, int valor2)
    {
        if (Integer.valueOf(valor1) == null)
            return valor2;
        else
            return valor1;
    }



    public static Date toDate(LocalDate fecha)
    {
        if (fecha == null) return null;
        return Date.valueOf(fecha);
    }

    public static Date toDateWS(LocalDate fecha)
    {
        if (fecha == null)
            return null;
        return null;
    }
    public static LocalDate toDate(Date fecha)
    {
        LocalDate ld;

        if (fecha == null)
            ld = null;
        else
            ld = new Date(fecha.getTime()).toLocalDate();

        return ld;
    }
    public static LocalDate toDate(String fechaTxt) throws Exception {
        return toDate(fechaTxt, PL_FORMAT);
    }
    public static LocalDate toDate(String fechaTxt, String formatMask) throws Exception {
        LocalDate ld = null;

        try
        {
            if (!SvcUtl.isNuloOVacio(fechaTxt))
            {
                DateTimeFormatter formato = DateTimeFormatter.ofPattern(formatMask);
                ld = LocalDate.parse(fechaTxt, formato);
            }
        }
        catch (Exception e)
        {
            throw new Exception("No se ha podido convertir fecha '"+fechaTxt+"' en formato '"+formatMask+"'.");
        }
        return ld;
    }

    public static LocalDate toDate(Calendar fechaCal){
         return LocalDateTime.ofInstant(fechaCal.toInstant(), fechaCal.getTimeZone().toZoneId()).toLocalDate();
    }
    public static LocalDate toDate(int tiempo){
        return LocalDate.ofEpochDay(tiempo);
    }

    public static LocalDate toDate(java.util.Date fecha) {
        return fecha.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDate();
    }

    public static LocalDate toLastYearDate (LocalDate fecha) { return fecha.with(lastDayOfYear()); }


    public static Timestamp toTimestamp(LocalDateTime fecha)
    {
        return Timestamp.valueOf(fecha);
    }


    public static String toChar(LocalDate fecha, String formato)
    {
        String result = null;

        if (!(SvcUtl.isNuloOVacio(fecha) || SvcUtl.isNuloOVacio(formato)))
        {
            if (formato.equals("DD/MM/YYYY"))
                formato = PL_FORMAT;

            result = fecha.format(DateTimeFormatter.ofPattern(formato));
        }
        return result;
    }
    public static String toChar(LocalDate fecha)
    {
        return toChar(fecha, PL_FORMAT);
    }
    public static String toChar(Date fecha, String formato)
    {
        String result = null;

        if (!(SvcUtl.isNuloOVacio(fecha)))
        {
            LocalDate ld = new Date(fecha.getTime()).toLocalDate();
            result = toChar(ld, formato);
        }
        return result;
    }
    public static String toChar(Date fecha)
    {
        return toChar(fecha, PL_FORMAT);
    }
    public static String toChar(LocalDateTime fechaHora)
    {
        return toChar(fechaHora, PL_FORMAT);
    }
    public static String toChar(LocalDateTime fechaHora, String formato)
    {
        String result = null;

        if (!(SvcUtl.isNuloOVacio(fechaHora) || SvcUtl.isNuloOVacio(formato)))
        {
            final DateTimeFormatter CUSTOM_FORMATTER = DateTimeFormatter.ofPattern(formato);
            result = fechaHora.format(CUSTOM_FORMATTER);
        }
        return result;
    }
    public static String toCharJson(LocalDate fecha)
    {
        return toChar(fecha, DEFAULT_FORMAT);
    }
    public static String toChar(Long valor) { return String.valueOf(valor); }

    public static String toChar(boolean b)
    {
        String result;
        if (SvcUtl.isNuloOVacio(b))
            result = null;
        else if (b)
            result = "TRUE";
        else
            result = "FALSE";
        return result;
    }

    public static String toChar(BigDecimal numero, int decimales)
    {
        BigDecimal bd = numero.setScale(decimales, BigDecimal.ROUND_DOWN);

        DecimalFormat df = new DecimalFormat();
        df.setMaximumFractionDigits(decimales);
        df.setMinimumFractionDigits(0);
        df.setGroupingUsed(false);

        return df.format(bd);
    }
    public static String toChar(BigDecimal numero) { return toChar(numero, 2);}

    public static BigDecimal toNumber (Long numero)
    {
        BigDecimal result = null;
        if (!(SvcUtl.isNuloOVacio(numero)))
            result = BigDecimal.valueOf(numero);

        return result;
    }
    public static BigDecimal toNumber (String numero) throws Exception {
        /* Formato numérico actual 9999.99 */

        BigDecimal result = null;
        if (!SvcUtl.isNuloOVacio(numero))
        {
            DecimalFormatSymbols simbolos = new DecimalFormatSymbols();
            simbolos.setGroupingSeparator(',');
            simbolos.setDecimalSeparator('.');
            String patron = "#,##0.0#";
            DecimalFormat decimalFormat = new DecimalFormat(patron, simbolos);
            decimalFormat.setParseBigDecimal(true);

            try
            {
                result = (BigDecimal) decimalFormat.parse(numero);
            }
            catch (ParseException ex)
            {
                throw new Exception("Err.CONVERSION."+ex.getClass().getSimpleName()+") "+ex.getMessage());
            }
        }
        return result;
    }

    public static BigDecimal round(BigDecimal numero, int caracteres)
    {
        MathContext mc = new MathContext(caracteres, RoundingMode.HALF_UP);
        return numero.round(mc);
    }
    public static Long round(Long numero, int caracteres)
    {
        BigDecimal redondeo = round(BigDecimal.valueOf(numero),caracteres);
        return redondeo.longValue();
    }

    public static LocalDate sysdate () { return LocalDate.now(); }
    public static Date sysdateD () { return Date.valueOf(sysdate());}
    public static LocalDateTime sysdateDT() {return LocalDateTime.now();}

    /**
     * 14/06/2021, Cambia la mascara de un String de la original a la de destino.
     *             Util para trabajos con fechas.
     * @author Jose Diaz
     * @param valor String a trabajar
     * @param mascaraOrigen Mascara con la que llega
     * @param mascaraDestino Mascara de salida
     * @return String con nueva mascara
     */
    public static String enmascararFecha(String valor, String mascaraOrigen, String mascaraDestino) throws ParseException
    {
        SimpleDateFormat formatoOrigen = new SimpleDateFormat(mascaraOrigen);
        java.util.Date fecha = formatoOrigen.parse(valor);
        SimpleDateFormat formatoDestino = new SimpleDateFormat(mascaraDestino);
        return formatoDestino.format(fecha);
    }

    public static Long extraerYear (Date fecha)
    {
        try {
            return extraerYear(toDate(fecha));
        }
        catch (Exception e){
            return Integer.toUnsignedLong(0);
        }
    }
    public static Long extraerYear (LocalDate fecha)
    {
        Long result = null;
        if (!(SvcUtl.isNuloOVacio(fecha)))
        {
            int anyo = fecha.getYear();
            result = Long.valueOf(anyo);
        }
        return result;
    }

    /**
     * 29/06/2021, Conviente un String en Clob (java.sql.Clob) para inserciones en base de datos.
     * Con INT (añade desde una posición determinada en el CLOB), sin el empieza uno nuevo.
     * @param posicion Posición en la que empiezas a escribir dentro de Clob.
     * @param datos String a escribir
     * @return Clob con los datos insertados/añadidos del String.
     * @throws SQLException Cuando haya problemas de base de datos.
     */
    public static Clob toClob (int posicion, String datos) throws SQLException
    {
        Clob c;
        Connection conn = ConexionSupaBase.obtieneConexion();
        c = conn.createClob();
        c.setString(posicion, datos);
        return c;
    }
    public static Clob toClob (String datos) throws SQLException
    {
        return toClob(1, datos);
    }

    /*
    public static boolean betweenFechas(LocalDate fechaInicial, LocalDate fechaFinal, @NonNull LocalDate fecha)
    {
        LocalDate fecini = SvcPL.nvl(fechaInicial,SvcUtl.getFechaInicialMin());
        LocalDate fecfin = SvcPL.nvl(fechaFinal,SvcUtl.getFechaFinalMax());

        return (!fecha.isBefore(fecini) && !fecha.isAfter(fecfin));
    }
     */

}
