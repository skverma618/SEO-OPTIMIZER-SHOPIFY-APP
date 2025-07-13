import requests
import json
import os
from datetime import datetime
# --- Configuration (replace with your actual values) ---
SHOPIFY_STORE_NAME = os.getenv("SHOPIFY_STORE_NAME", "shopryzeclean") # e.g., "my-awesome-store"
SHOPIFY_API_VERSION = os.getenv("SHOPIFY_API_VERSION", "2024-07") # Use a current stable version
SHOPIFY_ADMIN_API_ACCESS_TOKEN = os.getenv("SHOPIFY_ADMIN_API_ACCESS_TOKEN", "") # KEEP THIS SECURE!

# The GraphQL endpoint
SHOPIFY_GRAPHQL_URL = f"https://{SHOPIFY_STORE_NAME}.myshopify.com/admin/api/{SHOPIFY_API_VERSION}/graphql.json"

# --- GraphQL Query to fetch 10 products with title, description, and metafields ---
GRAPHQL_QUERY = """
query GetProducts {
  products(first: 2) {
    edges {
      node {
        id
        title
        handle
        status
        vendor
        description
        metafields(first: 250) { # Fetch up to 20 metafields per product
          edges {
            node {
              id
              namespace
              key
              value
              type
            }
          }
        }
        variants(first: 1) {
                edges {
                  node {
                    id
                    inventoryQuantity
                  }
                }
              }
        seo {
                title
                description
              }
              description
        images(first: 250) {
                edges {
                  node {
                    id
                    url
                    altText
                  }
                }
              }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
"""

# --- Request Headers ---
HEADERS = {
    "Content-Type": "application/json",
    "X-Shopify-Access-Token": SHOPIFY_ADMIN_API_ACCESS_TOKEN,
}

def fetch_shopify_products_limited_data():
    """
    Fetches products from Shopify focusing on title, description, and metafields.
    Returns the raw JSON data of the products.
    """
    payload = {
        "query": GRAPHQL_QUERY,
        "variables": {} # No variables needed for this basic query
    }

    try:
        response = requests.post(SHOPIFY_GRAPHQL_URL, headers=HEADERS, data=json.dumps(payload))
        response.raise_for_status() # Raise an HTTPError for bad responses (4xx or 5xx)

        data = response.json()

        # Check for GraphQL errors
        if 'errors' in data:
            return {"success": False, "errors": data['errors'], "message": "GraphQL errors encountered."}

        products_data = data.get('data', {}).get('products', {})
        products_edges = products_data.get('edges', [])
        page_info = products_data.get('pageInfo', {})

        products_list = [edge.get('node', {}) for edge in products_edges]

        return {
            "products": products_list,
            "pageInfo": page_info,
            "success": True,
            "message": f"Successfully retrieved {len(products_list)} products."
        }

    except requests.exceptions.HTTPError as http_err:
        return {"success": False, "error": f"HTTP error occurred: {http_err}", "response_text": response.text if 'response' in locals() else None, "message": "HTTP Request Failed"}
    except requests.exceptions.ConnectionError as conn_err:
        return {"success": False, "error": f"Connection error occurred: {conn_err}", "message": "Network Connection Failed"}
    except requests.exceptions.Timeout as timeout_err:
        return {"success": False, "error": f"Timeout error occurred: {timeout_err}", "message": "Request Timed Out"}
    except requests.exceptions.RequestException as req_err:
        return {"success": False, "error": f"An error occurred: {req_err}", "message": "General Request Error"}
    except json.JSONDecodeError:
        return {"success": False, "error": f"Failed to decode JSON response.", "response_text": response.text if 'response' in locals() else None, "message": "Invalid JSON Response"}
    except Exception as e:
        return {"success": False, "error": f"An unexpected error occurred: {e}", "message": "Unhandled Exception"}

def dump_to_json_file(data, filename="shopify_products.json"):
    """
    Dumps a Python dictionary to a JSON file.
    """
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Data successfully dumped to {filename}")
    except IOError as e:
        print(f"Error writing to file {filename}: {e}")
    except Exception as e:
        print(f"An unexpected error occurred while dumping to JSON: {e}")

if __name__ == "__main__":
    # --- IMPORTANT SECURITY NOTE ---
    # For production environments, DO NOT hardcode sensitive credentials like API tokens.
    # Use environment variables or a secure configuration management system.
    # Example for setting environment variables (in your terminal before running script):
    # export SHOPIFY_STORE_NAME="your-store-name"
    # export SHOPIFY_API_VERSION="2024-07"
    # export SHOPIFY_ADMIN_API_ACCESS_TOKEN="shpat_YOUR_ACTUAL_ACCESS_TOKEN_HERE"

    # If you choose to hardcode for quick testing (NOT RECOMMENDED FOR PROD):
    # SHOPIFY_STORE_NAME = "your-store-name"
    # SHOPIFY_API_VERSION = "2024-07"
    # SHOPIFY_ADMIN_API_ACCESS_TOKEN = "shpat_YOUR_ACCESS_TOKEN"

    # Make sure your variables are set either as environment variables or hardcoded above
    if "your-store-name" in SHOPIFY_STORE_NAME or "YOUR_ACCESS_TOKEN" in SHOPIFY_ADMIN_API_ACCESS_TOKEN:
        error_data = {"success": False, "message": "WARNING: Please update SHOPIFY_STORE_NAME and SHOPIFY_ADMIN_API_ACCESS_TOKEN in the script or via environment variables. Exiting..."}
        print(json.dumps(error_data, indent=2))
        # Optionally dump this error to a file too
        # dump_to_json_file(error_data, "shopify_products_error.json")
    else:
        print(f"Starting product fetch at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        products_data = fetch_shopify_products_limited_data()

        # You can customize the filename, e.g., include a timestamp
        output_filename = "shopify_products_output.json"
        dump_to_json_file(products_data, output_filename)

        if not products_data.get("success", False):
            print(f"Operation failed. Check {output_filename} for details.")
        else:
            print(f"Product data saved successfully to {output_filename}")