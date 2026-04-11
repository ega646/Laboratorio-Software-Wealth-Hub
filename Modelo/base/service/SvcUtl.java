package Modelo.base.service;

import Modelo.base.model.Param;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Slf4j
public class SvcUtl
{
    public static boolean isNuloOVacio(Object valor)
    {
       boolean result;

        if (valor instanceof CharSequence)
            result = valor.equals("");
        else
            result = (valor==null);

       return result;
    }

    public String num2c (BigDecimal n, char c)
    {
        // Máscara numérica 9999999999990D00
        String mascara = "##################.##";
        String result;

        if (isNuloOVacio(n))
        {
            result = "0.00";
        }
        else
        {
            DecimalFormat df = new DecimalFormat (mascara);
            result = df.format (n);
        }
        return result;
    }

    public String fec2c (Date fecha)
    {
        String result = null;

        if (fecha != null)
        {
            SimpleDateFormat formato;
            SimpleDateFormat sdf = new SimpleDateFormat("hh:mm:ss");

            if (sdf.format(fecha).equals("00:00:00"))
                formato = new SimpleDateFormat("dd/MM/yyyy");
            else
                formato = new SimpleDateFormat("dd/MM/yyyy hh:mm");

            result = formato.format(fecha);
        }
        return result;
    }

    public static String getMetodoActual()
    {
        return getMetodoActual(3); // 2 si se llama directamente, 3 en este caso, al haber un metodo más en la pila.
    }
    public static String getMetodoActual(int n)
    {
        // Verficamos que exista
        if (Thread.currentThread().getStackTrace().length>n)
            return Thread.currentThread().getStackTrace()[n].getClassName()+'.'+
                   Thread.currentThread().getStackTrace()[n].getMethodName();
        else
            return "'NO-DEFINIDO'";
    }

    public static boolean isNumerico (String txt)
    {
        boolean result;
        try
        {
            Integer.parseInt(txt);
            result = true;
        }
        catch (NumberFormatException ex)
        {
            result = false;
        }
        return result;
    }

    public static String listToString(List<String> elementos, String separador, String cobertura) {
        StringBuilder constructor = new StringBuilder();
        for (String elemento: elementos){
            if (constructor.toString().equals(""))
                constructor.append(cobertura+elemento+cobertura);
            else
                constructor.append(separador+cobertura+elemento+cobertura);
        }
        return constructor.toString();
    }

    public static ArrayList<String> stringToList (String cadena, String separador, Boolean quitarEspacios){
        if (Boolean.TRUE.equals(quitarEspacios))
            return new ArrayList<>(Arrays.asList(cadena.replace(" ","").split(separador)));
        else
            return new ArrayList<>(Arrays.asList(cadena.split(separador)));
    }

    public static List<String> stringToList (String cadena, String separador){
        return stringToList(cadena, separador, true);
    }

    public static String parametrizarString(String entrada, List<Param> parametros){
        String salida = entrada;
        for (Param parametro: parametros){
            salida = salida.replace("@@@"+parametro.getNombre()+"@@@",parametro.getValor());
        }
        return salida;
    }

    public static String getLibProperty(String file, String property) throws IOException {
        return AplicationUtils.getProp(file,property);
    }


    public static LocalDate getFechaInicialMin() { return SvcPL.toDate("01/01/1900"); }
    public static LocalDate getFechaFinalMax()
    {
        return SvcPL.toDate("31/12/2500");
    }

    public static String formatearCadena(String cadena){

        if (SvcUtl.isNuloOVacio(cadena))
            return "";

        cadena = cadena.replace('Ñ','N');
        cadena = cadena.replace('ñ','n');
        cadena = cadena.replace('Á','A');
        cadena = cadena.replace('É','E');
        cadena = cadena.replace('Í','I');
        cadena = cadena.replace('Ó','O');
        cadena = cadena.replace('Ú','U');
        cadena = cadena.replace('á','a');
        cadena = cadena.replace('é','e');
        cadena = cadena.replace('í','i');
        cadena = cadena.replace('ó','o');
        cadena = cadena.replace('ú','u');

        return cadena;

    }

    public static String componerPath (String path, String fichero)
    {
        return componerPath(path, fichero, "/");
    }

    public static String componerPath (String path, String fichero, String intermedio)
    {
        String result = path;

        //Si es nulo o vacio por lo que fuera cogemos el path base que es "/"
        if (SvcUtl.isNuloOVacio(result))
            result = "/";


        if (!result.endsWith(intermedio))
            result += intermedio;

        result += fichero;

        return result;
    }

    public static String removerTextos(String original, List<String> noDeseado){

        for(String s: noDeseado){
            original = original.replace(s,"");
        }

        return original;
    }
}
