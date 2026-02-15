from flask import Flask, request, jsonify, send_from_directory
import os
import pandas as pd
import requests

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# 🔐 IMPORTANT: Move this to environment variable in production
DEEPSEEK_API_KEY = "sk-2a06d1eeaba84c0eab4eeec3e5cf693c"
DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions"

CARBON_TABLE = {
    "Dairy": 1.9,
    "Plastic": 3.5,
    "Electronics": 8.2,
    "Food": 2.1,
    "Textile": 4.0
}

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/<path:filename>")
def serve_files(filename):
    return send_from_directory(".", filename)

@app.route("/upload-file", methods=["POST"])
def upload_file():

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    if file.filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    if "Category" not in df.columns or "Units_Sold" not in df.columns or "Product" not in df.columns:
        return jsonify({"error": "File must contain Product, Category, Units_Sold columns"}), 400

    total_emission = 0
    product_emissions = []

    for _, row in df.iterrows():
        category = str(row["Category"]).strip()
        units = float(row["Units_Sold"])
        product = str(row["Product"]).strip()

        emission_per_unit = CARBON_TABLE.get(category, 0)
        product_total = units * emission_per_unit

        total_emission += product_total

        # Identify high emission products
        if units > 50 and emission_per_unit > 3:
            product_emissions.append({
                "product": product,
                "category": category
            })

    # If no high emission products
    if not product_emissions:
        return jsonify({
            "total_emission": round(total_emission, 2),
            "suggestions": ["No high-impact products detected"]
        })

    # Prepare AI prompt
    product_list_text = "\n".join(
        [f"- {p['product']} (Category: {p['category']})" for p in product_emissions]
    )

    prompt = f"""
For each product below, suggest ONE lower-carbon alternative product.
Return ONLY valid JSON in this format:

{{
  "alternatives": [
    {{
      "original_product": "Product Name",
      "alternative_product": "Alternative Name"
    }}
  ]
}}

Products:
{product_list_text}
"""

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    response = requests.post(DEEPSEEK_URL, headers=headers, json=data)

    try:
        result = response.json()
        ai_text = result["choices"][0]["message"]["content"]

        # Extract JSON safely
        import json
        alternatives_data = json.loads(ai_text)

        suggestions = [
            f"{item['original_product']} → {item['alternative_product']}"
            for item in alternatives_data["alternatives"]
        ]

    except Exception as e:
        suggestions = ["AI alternative suggestion failed"]

    return jsonify({
        "total_emission": round(total_emission, 2),
        "suggestions": suggestions
    })

if __name__ == "__main__":
    app.run(debug=True)
