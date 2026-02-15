document.addEventListener("DOMContentLoaded", function () {

    const fileInput = document.getElementById("fileInput");
    const fileName = document.getElementById("fileName");
    const analyzeBtn = document.querySelector(".analyze-btn");
    const suggestionList = document.getElementById("suggestionList");
    const totalEmissionDisplay = document.getElementById("totalEmission");

    fileInput.addEventListener("change", function () {

        if (this.files.length > 0) {
            fileName.textContent = this.files[0].name;
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = "1";
        } else {
            fileName.textContent = "No file selected";
            analyzeBtn.disabled = true;
            analyzeBtn.style.opacity = "0.6";
        }
    });

    analyzeBtn.addEventListener("click", async function () {

        if (!fileInput.files.length) {
            alert("Please select a file first.");
            return;
        }

        analyzeBtn.innerText = "Analyzing...";
        analyzeBtn.disabled = true;

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        try {

            const response = await fetch("/upload-file", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Server error");
            }

            totalEmissionDisplay.textContent = data.total_emission + " kg";

            suggestionList.innerHTML = "";

            data.suggestions.forEach(s => {
                const li = document.createElement("li");
                li.textContent = s;
                suggestionList.appendChild(li);
            });

            analyzeBtn.innerText = "Analysis Complete";

        } catch (error) {
            console.error(error);
            alert("Error processing file.");
            analyzeBtn.innerText = "Analyze Carbon Emission";
            analyzeBtn.disabled = false;
        }
    });

});
