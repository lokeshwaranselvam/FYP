class CarbonRecommender:
    def __init__(self):
        # Database of high-carbon categories/products and their eco-friendly alternatives
        self.alternatives_db = {
            "Dairy": {
                "default": "Plant-based Milk (Oat, Almond, Soy)",
                "Milk": "Oat Milk",
                "Cheese": "Nut-based Cheese",
                "Yogurt": "Coconut Yogurt",
                "Butter": "Olive Oil Spread"
            },
            "Plastic": {
                "default": "Biodegradable or Reusable Alternatives",
                "Bottle": "Reusable Metal/Glass Bottle",
                "Bag": "Cotton Tote Bag",
                "Packaging": "Mushroom Packaging",
                "Cutlery": "Bamboo Cutlery"
            },
            "Electronics": {
                "default": "Energy-efficient (Energy Star) or Refurbished Devices",
                "Phone": "Refurbished Phone / Fairphone",
                "Laptop": "Laptop with repairable design",
                "Monitor": "Energy-efficient LED Monitor"
            },
            "Food": {
                "default": "Locally sourced and seasonal produce",
                "Beef": "Plant-based Meat / Lentils",
                "Lamb": "Chicken / Tofu",
                "Pork": "Seitan",
                "Chicken": "Beans / Legumes",
                "Processed Food": "Whole Foods"
            },
            "Textile": {
                "default": "Organic Cotton, Hemp, or Recycled Fabrics",
                "Polyester": "Recycled Polyester",
                "Nylon": "Econyl",
                "Conventional Cotton": "Organic Cotton",
                "Rayon": "Tencel / Lyocell"
            },
             "Transport": {
                "default": "Public Transit / EV",
                "Flight": "Train",
                "Car": "Carpool / EV / Public Transit"
            },
            "Packaging": {
                 "default": "Minimal / Compostable",
                 "Styrofoam": "Mushroom Packaging",
                 "Plastic Wrap": "Beeswax Wrap"
            }
        }

    def get_suggestions(self, product_emissions):
        """
        Generates suggestions for high-emission products using the local database.
        
        Args:
            product_emissions (list): List of dicts with 'product', 'category', 'emission_per_unit'.
            
        Returns:
            list: List of suggestion dicts with details.
        """
        suggestions = []
        
        if not product_emissions:
            return []

        for item in product_emissions:
            product = item['product']
            category = item['category']
            current_emission = item.get('emission_per_unit', 0)
            
            # Find alternative
            alternative_name, alternative_emission = self._find_alternative(category, product)
            
            # Substitution Risk Analysis
            # If alternative emission is not significantly lower, flag it.
            # For this simple engine, we assume the DB provides better alternatives.
            # In a real ML system, we would calculate this dynamically.
            risk_flag = "Low"
            if alternative_emission >= current_emission * 0.9: # less than 10% improvement
                risk_flag = "Moderate - Minimal Reduction"
            
            reduction_potential = round(current_emission - alternative_emission, 2)
            if reduction_potential < 0:
                 reduction_potential = 0 # Should not happen with good DB
            
            suggestions.append({
                "original_product": product,
                "category": category,
                "alternative_product": alternative_name,
                "reduction_potential": reduction_potential,
                "risk_analysis": risk_flag
            })
            
        return suggestions

    def _find_alternative(self, category, product):
        """
        Helper to lookup alternatives. Returns (Name, Est_Emission_Factor).
        """
        # normalize inputs
        cat_key = None
        for key in self.alternatives_db:
            if key.lower() in category.lower():
                cat_key = key
                break
        
        # Default fallback
        if not cat_key:
            return ("Generic Eco-Friendly Alternative", 0.5)

        category_dict = self.alternatives_db[cat_key]
        
        # Try to match product specific
        # We need emission factors for alternatives to do risk analysis.
        # Adding simple lookup for now.
        
        # Simplified for prototype: Return string and a hardcoded lower factor
        # In full implementation, db would have {name: factor}
        
        alt_name = category_dict["default"]
        for key, value in category_dict.items():
            if key.lower() in product.lower() and key != "default":
                alt_name = value
                break
                
        return (alt_name, 0.5) # Assuming average green alternative is 0.5 kgCO2e
