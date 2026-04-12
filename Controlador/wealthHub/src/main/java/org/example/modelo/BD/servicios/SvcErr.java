package org.example.modelo.BD.servicios;

import lombok.extern.slf4j.Slf4j;
import org.example.modelo.BD.clases.PrcParam;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.example.modelo.BD.servicios.SvcUtl.getMetodoActual;

@Slf4j
public class SvcErr
{
    private SvcErr(){throw new IllegalStateException("Service class");}

    static final List<String> listaParam = Arrays.asList("S", "N", "OP", "OP1");

    public static void ctrlParam(List<PrcParam> param) throws Exception
    {
        StringBuilder txtParam = new StringBuilder(getMetodoActual(3) + ") Inicio,");

        boolean seleccionOpcional = false;
        boolean existeOpcional = false;

        boolean seleccionOpcional1 = false;
        boolean existeOpcional1Varios = false;
        boolean existeOpcional1 = false;

        StringBuilder errParamObl = new StringBuilder();
        StringBuilder errParamObl1 = new StringBuilder();

        if (!(param.isEmpty()))
        {
            for (PrcParam p:param)
            {
                if (!listaParam.contains(p.getObligatiorio().toUpperCase()))
                    throw new Exception("El tipo de obligatoriedad '"+p.getObligatiorio()+"' no es válido.");

                switch (p.getObligatiorio().toUpperCase())
                {
                    case "S":
                    {
                        if (SvcUtl.isNuloOVacio(p.getValor()))
                            throw new Exception(getMetodoActual(3)+") El parámetro '"+p.getParametro().toUpperCase()+"' es NULO.");

                        txtParam.append("(Obl)");
                        break;
                    }
                    case "OP":
                    {
                        seleccionOpcional = true;
                        if (!SvcUtl.isNuloOVacio(p.getValor()))
                            existeOpcional = true;

                        txtParam.append("(Op)");
                        errParamObl.append(p.getParametro()+",");
                        break;
                    }
                    case "OP1":
                    {
                        if (!seleccionOpcional1)
                        {
                            seleccionOpcional1 = true;
                            if (!SvcUtl.isNuloOVacio(p.getValor()))
                                existeOpcional1 = true;
                        }
                        else if (!SvcUtl.isNuloOVacio(p.getValor()))
                        {
                            if (!existeOpcional1)
                                existeOpcional1 = true;
                            else
                                existeOpcional1Varios = true;
                        }

                        txtParam.append("(Op1)");
                        errParamObl1.append(p.getParametro()+",");
                        break;
                    }
                    default: break;
                }

                txtParam.append(p.getParametro()+": ").append(p.getValor()).append(", ");
            }

            if (seleccionOpcional && !existeOpcional)
            {
                errParamObl = new StringBuilder("["+errParamObl.substring(0, errParamObl.length() - 2) + "].");
                throw new Exception("Es necesario al menos uno de estos parámetros "+errParamObl);
            }

            if (seleccionOpcional1 && (!existeOpcional1 || existeOpcional1Varios))
            {
                errParamObl1 = new StringBuilder("["+errParamObl1.substring(0, errParamObl1.length() - 2) + "].");
                throw new Exception(getMetodoActual(3)+") Es necesario uno y sólo uno de estos parámetros "+errParamObl1);
            }

            if (!SvcUtl.isNuloOVacio(txtParam))
                txtParam = new StringBuilder(txtParam.substring(0, txtParam.length() - 2) + ".");
        }
        log.info(txtParam.toString());
    }

    private static final ArrayList<Character> caracteresCodigo = new ArrayList<>(Arrays.asList('_','-','@','$','.'));
    private static final ArrayList<Character> prohibidosCodigo = new ArrayList<>(Arrays.asList('Ñ','Ç'));
    public static void isCodigoCorrecto (String codigo) throws Exception
    {
        if (!SvcUtl.isNuloOVacio((codigo)))
        {
            for (Character c : codigo.toCharArray())
            {
                if (prohibidosCodigo.contains(Character.toUpperCase(c)))
                    throw new Exception("(1) El caracter '"+c+"' no es válido para un código.");

                if (!(Character.isLetter(c) || Character.isDigit(c)) && !caracteresCodigo.contains(c))
                        throw new Exception("(2) El caracter '"+c+"' no es válido para un código.");
            }
        }
    }

}
