import requests

SHOPIFY_API_URL = "https://ambvra-1n.myshopify.com/admin/api/2024-01/graphql.json"
ACCESS_TOKEN = "b68a7db47939978859738f6dbb4fab96:33d7f5483fcdf3cea5eaf4604fef57adcd02ee4f29c3e7fc29eadaffab07284224033742fe61901db63dc6c967cba0d1"

def fetch_shopify_products():
    headers = {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": ACCESS_TOKEN
    }

    has_next_page = True
    after_cursor = None
    all_products = []

    while has_next_page:
        query = """
        query ($cursor: String) {
          products(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
            }
            edges {
              cursor
              node {
                id
                title
                descriptionHtml
                metafields(first: 10, namespace: "seo") {
                  edges {
                    node {
                      namespace
                      key
                      value
                    }
                  }
                }
              }
            }
          }
        }
        """

        variables = {"cursor": after_cursor}
        response = requests.post(
            SHOPIFY_API_URL,
            json={"query": query, "variables": variables},
            headers=headers
        )

        if response.status_code != 200:
            raise Exception(f"Query failed: {response.status_code}, {response.text}")

        json_data = response.json()
        products_data = json_data["data"]["products"]
        edges = products_data["edges"]

        print(f"Fetched {len(edges)} products in this page.")

        for edge in edges:
            product = edge["node"]
            all_products.append(product)

        has_next_page = products_data["pageInfo"]["hasNextPage"]
        after_cursor = edges[-1]["cursor"] if has_next_page and edges else None

        print("Has next page:", has_next_page)
        print("Next cursor:", after_cursor)

    return all_products


if __name__ == "__main__":
    products = fetch_shopify_products()
    print(f"\n✅ Total products fetched: {len(products)}\n")
    for p in products[:5]:  # preview only first 5
        print("Title:", p["title"])
        print("Description:", p["descriptionHtml"][:80], "...")
        seo_meta = p.get("metafields", {}).get("edges", [])
        for meta in seo_meta:
            print(f"  - {meta['node']['key']}: {meta['node']['value']}")
        print("------")