from __future__ import annotations

import os
from typing import Any

import oracledb
from dotenv import load_dotenv


load_dotenv()

DB_USERNAME = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST_PRIMARY = os.getenv("DB_HOST_PRIMARY")
DB_HOST_SECONDARY = os.getenv("DB_HOST_SECONDARY")
DB_PORT = int(os.getenv("DB_PORT", "1521"))
DB_SERVICE = os.getenv("DB_SERVICE")
ORACLE_LIB_DIR = os.getenv("ORACLE_LIB_DIR")


def initialize_oracle_client() -> None:
    if not ORACLE_LIB_DIR:
        raise RuntimeError(
            "Missing ORACLE_LIB_DIR in the .env file."
        )

    try:
        oracledb.init_oracle_client(
            lib_dir=ORACLE_LIB_DIR
        )
    except oracledb.ProgrammingError:
        # Oracle client was already initialized.
        pass


initialize_oracle_client()

print(
    "Oracle connection mode:",
    "Thin" if oracledb.is_thin_mode() else "Thick",
)
def get_oracle_connection():
    """
    Connect to the primary Oracle host and use the secondary host
    when the primary connection fails.
    """
    required_config = {
        "DB_USERNAME": DB_USERNAME,
        "DB_PASSWORD": DB_PASSWORD,
        "DB_HOST_PRIMARY": DB_HOST_PRIMARY,
        "DB_SERVICE": DB_SERVICE,
    }

    missing = [
        key
        for key, value in required_config.items()
        if not value
    ]

    if missing:
        raise RuntimeError(
            f"Missing .env values: {', '.join(missing)}"
        )

    hosts = [DB_HOST_PRIMARY]

    if (
        DB_HOST_SECONDARY
        and DB_HOST_SECONDARY != DB_HOST_PRIMARY
    ):
        hosts.append(DB_HOST_SECONDARY)

    connection_errors = []

    for host in hosts:
        try:
            dsn = oracledb.makedsn(
                host=host,
                port=DB_PORT,
                service_name=DB_SERVICE,
            )

            return oracledb.connect(
                user=DB_USERNAME,
                password=DB_PASSWORD,
                dsn=dsn,
            )

        except oracledb.Error as exc:
            connection_errors.append(f"{host}: {exc}")

    raise RuntimeError(
        "Could not connect to Oracle database. "
        + " | ".join(connection_errors)
    )


def run_catalog_query(
    query_data: dict[str, Any],
) -> dict[str, Any]:
    """
    Execute SQL returned by the query-generation LLM.

    Expected input:

    {
        "sql": "SELECT ... WHERE BRAND = :brand_0",
        "params": {
            "brand_0": "Levi's"
        }
    }
    """
    connection = None
    cursor = None

    try:
        sql = query_data.get("sql")
        params = query_data.get("params", {})

        if not isinstance(sql, str) or not sql.strip():
            raise ValueError("Missing or invalid SQL query.")

        if not isinstance(params, dict):
            raise ValueError("Query params must be a dictionary.")

        # # Validate before execution.
        # safe_sql, safe_params = validate_catalog_sql(
        #     query=sql,
        #     params=params,
        # )

        connection = get_oracle_connection()
        cursor = connection.cursor()

        cursor.arraysize = 100
        cursor.prefetchrows = 100

        cursor.execute(
            sql,
            params,
        )

        if cursor.description is None:
            return {
                "success": False,
                "message": "The query did not return any columns.",
                "columns": [],
                "rows": [],
                "row_count": 0,
            }

        columns = [
            column[0].lower()
            for column in cursor.description
        ]

        rows = [
            dict(zip(columns, row))
            for row in cursor.fetchall()
        ]

        return {
            "success": True,
            "columns": columns,
            "rows": rows,
            "row_count": len(rows),
        }

    except ValueError as exc:
        return {
            "success": False,
            "error": "VALIDATION_ERROR",
            "message": str(exc),
            "columns": [],
            "rows": [],
            "row_count": 0,
        }

    except oracledb.Error as exc:
        error = exc.args[0]

        return {
            "success": False,
            "error": "ORACLE_DATABASE_ERROR",
            "message": getattr(error, "message", str(exc)),
            "oracle_code": getattr(error, "code", None),
            "columns": [],
            "rows": [],
            "row_count": 0,
        }

    except Exception as exc:
        return {
            "success": False,
            "error": "QUERY_EXECUTION_ERROR",
            "message": str(exc),
            "columns": [],
            "rows": [],
            "row_count": 0,
        }

    finally:
        if cursor is not None:
            try:
                cursor.close()
            except Exception:
                pass

        if connection is not None:
            try:
                connection.close()
            except Exception:
                pass