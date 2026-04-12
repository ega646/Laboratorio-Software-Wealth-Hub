package org.example.modelo.BD.servicios;

import lombok.extern.slf4j.Slf4j;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.sql.SQLException;
import java.util.Properties;

@Slf4j
public class AplicationUtils {

    private static final String ENTORNO = "application";

    private AplicationUtils() {
        super();
    }

    public static String getProp(String resourceFile, String propName)throws IOException {

        String result = "";
        InputStream inputStream = null;

        try {
            Properties prop = new Properties();

            inputStream = AplicationUtils.class.getClassLoader().getResourceAsStream(resourceFile + ".properties");

            if (inputStream != null) {
                prop.load(inputStream);
            } else {
                throw new FileNotFoundException("property file '" + resourceFile + "' not found in the classpath");
            }
            //
            result = prop.getProperty(propName);
        } finally {
            if (inputStream != null) {
                inputStream.close();
            }
        }
        return result;
    }

    public static String getProp(String propName) throws IOException {

        String result = "";
        InputStream inputStream = null;

        try {
            Properties prop = new Properties();

            inputStream = AplicationUtils.class.getClassLoader().getResourceAsStream("entorno/db/" + ENTORNO + ".properties");

            if (inputStream != null) {
                prop.load(inputStream);
            } else {
                throw new FileNotFoundException("property file '" + ENTORNO + "' not found in the classpath");
            }
            //
            result = prop.getProperty(propName);
        } finally {
            if (inputStream != null) {
                inputStream.close();
            }
        }
        return result;
    }

}

