
from langchain_core.tools import tool
from langgraph.types import interrupt, Command
from typing import Any
from services.quer_generation import generate_catalog_query
from services.run_query import run_catalog_query


@tool
def search_product_catalog(user_query: str) -> list[dict[str, Any]]:
    """
    Search the product catalog according to the user's requirements.

    Use this tool for requests involving product name, company, department,
    fit category, fit subcategory, price, currency, size, colour, description,
    sorting, grouping, counting, or result limits.

    Args:
        user_query: The user's complete product catalog requirement,
        including all filters, sorting, grouping, and limits.

    Returns:
        Matching product records from the catalog database.
    """
    print(f"tool called for: {user_query}")
    catalog_query = generate_catalog_query(user_query)
    print(f"generated query isss: {catalog_query}")
    result = run_catalog_query(catalog_query)
    print(f"tool result: {result}")
    return result
# @tool
# def book_flight(name: str, country: str) -> float:
#     '''Return the Name of Passenger and ticket number after booking a flight
#     :param name: Name of Passenger
#     :param country: Country of Passenger

#     '''
 
#     decision = interrupt(f"Do you want to book a flight for {name} from {country}? (yes/no)")

#     if decision == "yes":
#         response = f"mr {name} from {country} you have booked a seat on the flight WITH ticket number 123456789"
#     else:
#         response = f"mr {name} from {country} you have not booked a seat on the flight"
#     print(response)
#     return response



def get_tools():
    return [search_product_catalog]