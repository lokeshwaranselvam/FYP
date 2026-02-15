document.addEventListener("DOMContentLoaded", function () {

    const fileInput = document.getElementById("fileInput");
    const fileName = document.getElementById("fileName");
    const analyzeBtn = document.querySelector(".analyze-btn");
    const suggestionList = document.getElementById("suggestionList");
    const totalEmissionDisplay = document.getElementById("totalEmission");

    // New Elements
    const totalUnitsDisplay = document.getElementById("totalUnits");
    const avgEmissionDisplay = document.getElementById("avgEmission");
    const highestImpactDisplay = document.getElementById("highestImpact");
    const exportBtn = document.getElementById("exportBtn");

    const reportBox = document.getElementById("reportBox");
    const reportTableBody = document.getElementById("reportTableBody");

    const ctxEmission = document.getElementById('emissionChart').getContext('2d');
    const ctxSource = document.getElementById('sourceChart').getContext('2d');

    let emissionChart = null;
    let sourceChart = null;
    let currentReportData = []; // Store for export

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

            // Update Header Stats
            totalEmissionDisplay.textContent = data.total_emission + " kg";

            // Update Summary Cards
            totalUnitsDisplay.textContent = data.total_units;
            avgEmissionDisplay.textContent = data.avg_emission + " kg";
            highestImpactDisplay.textContent = data.highest_impact;

            // Render Charts
            renderEmissionChart(data.category_emissions);
            renderSourceChart(data.source_emissions);

            // Render Suggestions
            renderSuggestions(data.suggestions);

            // Render Government Report
            currentReportData = data.high_risk_report;
            renderReport(data.high_risk_report);

            analyzeBtn.innerText = "Analysis Complete";
            analyzeBtn.disabled = false;

        } catch (error) {
            console.error(error);
            alert("Error processing file: " + error.message);
            analyzeBtn.innerText = "Analyze Carbon Emission";
            analyzeBtn.disabled = false;
        }
    });

    // Export Functionality
    exportBtn.addEventListener("click", function () {
        if (!currentReportData || currentReportData.length === 0) {
            alert("No data to export");
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Product ID,Product,Category,Source,Units,Total Emission (kg),Risk Level\n";

        currentReportData.forEach(function (rowArray) {
            let row = `${rowArray.id},${rowArray.product},${rowArray.category},${rowArray.source},${rowArray.units},${rowArray.total_emission},${rowArray.risk_level}`;
            csvContent += row + "\r\n";
        });

        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "high_risk_report.csv");
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    });

    function renderEmissionChart(categoryData) {
        const labels = Object.keys(categoryData);
        const values = Object.values(categoryData);

        if (emissionChart) {
            emissionChart.destroy();
        }

        emissionChart = new Chart(ctxEmission, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Carbon Emission (kg)',
                    data: values,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: 'white' }
                    }
                }
            }
        });
    }

    function renderSourceChart(sourceData) {
        const labels = Object.keys(sourceData);
        const values = Object.values(sourceData);

        if (sourceChart) {
            sourceChart.destroy();
        }

        sourceChart = new Chart(ctxSource, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Emission by Source (kg)',
                    data: values,
                    backgroundColor: '#00c6ff',
                    borderColor: '#007ab3',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: 'white' },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function renderSuggestions(suggestions) {
        suggestionList.innerHTML = "";

        if (suggestions.length === 0) {
            suggestionList.innerHTML = "<li>No specific high-risk recommendations needed.</li>";
            return;
        }

        suggestions.forEach(s => {
            const li = document.createElement("li");
            li.className = "suggestion-item";

            const riskBadge = `<span class="suggestion-risk">${s.risk_analysis}</span>`;

            li.innerHTML = `
                <strong>${s.original_product}</strong> → ${s.alternative_product} <br>
                <small>Potential Reduction: ${s.reduction_potential} kg/unit ${riskBadge}</small>
            `;
            suggestionList.appendChild(li);
        });
    }

    function renderReport(items) {
        reportTableBody.innerHTML = "";

        if (items.length > 0) {
            reportBox.style.display = "block";
            items.forEach(item => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${item.id}</td>
                    <td>${item.product}</td>
                    <td>${item.source}</td>
                    <td>${item.total_emission}</td>
                    <td><span class="status-badge status-high-risk">${item.risk_level}</span></td>
                `;
                reportTableBody.appendChild(row);
            });
        } else {
            reportBox.style.display = "none";
        }
    }

});
