package org.example.modelo.BD.clases;

import lombok.Data;

@Data
public class OracleTable
{
    private String otabOwner;
    private String otabTableName;
    private String otabColumnName;
    private String otabDataType;
    private Long otabDatalength;
    private String otabNullable;
    private Long otabPKPosition;
}
