
## App Generation Prompt for Antigravity

**System Role & Goal**
Build a **Carbon Emission Analyzer** application using **Python Flask** for the backend and a custom **ML/Rule-Based Recommendation Engine**. The app must help businesses calculate product carbon footprints based on sales volume and suggest sustainable alternatives.

1. Data & File Upload Module 

* Create a user-friendly UI for **CSV/Excel file uploads**.


* The data will include: Product ID, Category, Sales Volume, and Production Source.


* Use **Pandas** to process and clean the uploaded datasets.



2. Calculation & Classification Engine (Rule-Based) 

* Implement a logic to calculate: .


* 
**Classification Rules**:


* **Normal**: Low emission/Low sales impact.
* **Critical**: High emission/Moderate sales.
* 
**High-Risk**: High emission and High sales volume.





3. ML Recommendation & Substitution Logic 

* Instead of LLMs, use a **K-Nearest Neighbors (KNN)** or **Rule-Based Filtering** algorithm to suggest alternative products within the same category that have lower emission factors.


* Include a **Substitution Risk Analysis** that flags if replacing a product might lead to unintended higher net emissions elsewhere.



4. Reporting & Visualization 

* 
**Dashboard**: Display a dynamic table of results using **Jinja2 templates**.


* 
**Government Reporting**: Generate a summary for "High-Risk" products that includes the production source and criticality level for regulatory compliance.


* 
**Visuals**: Use Chart.js (or similar) to show the breakdown of high-emission vs. low-emission products.



5. Technical Stack 

* **Frontend**: HTML5, CSS3, JavaScript.
* **Backend**: Python Flask.
* **Data Processing**: Pandas, Scikit-learn (for ML recommendations).

---

### Key Adjustments for your Review

* 
**Removal of Gemini API**: The logic is now shifted to local Python scripts using Scikit-learn or hardcoded environmental metrics.


* 
**Accuracy**: The focus is on integrating sales data directly with these metrics to automate what was previously manual.


