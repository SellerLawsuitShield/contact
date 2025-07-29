  console.log("📌 valid_visitors.js loaded!");
// ✅ Correctly Convert Date to MST (UTC-7)
function getMSTDate(date) {
    let utcTime = date.getTime() + date.getTimezoneOffset() * 60000; // Convert to UTC
    let mstTime = new Date(utcTime + (-7 * 3600000)); // Subtract 7 hours for MST
    return mstTime;
}

// 📌 Function to Fetch Logs from Server
function fetchLogs(startDate, endDate) {
    let startDateStr = startDate ? startDate.toISOString().split("T")[0] : "";
    let endDateStr = endDate ? endDate.toISOString().split("T")[0] : "";

    fetch(`fetch_valid_visitors.php?startDate=${startDateStr}&endDate=${endDateStr}`)
        .then(response => response.json())
        .then(data => {
            let tableBody = document.querySelector("tbody");
            tableBody.innerHTML = "";

            if (data.logs) {
                tableBody.innerHTML = data.logs;

                // ✅ Ensure country links are reattached
                attachCountryClickEvents();
                console.log("✅ Country click events reattached after filtering!");

                // ✅ Highlight and make duplicate IPs clickable
                highlightDuplicateIps(data.duplicateIps || []);
            } else {
                tableBody.innerHTML = "<tr><td colspan='8'>No log data available.</td></tr>";
            }

            // ✅ Update Counters (Total Visits & Unique Visits)
            document.querySelector(".counter.total-visits").textContent = "Total Visits: " + data.totalVisits;
            document.querySelector(".counter.unique-visits").textContent = "Unique Visits: " + data.uniqueVisits;
        })
        .catch(error => console.error("❌ Error fetching logs:", error));
}

const ipColors = {}; // ✅ Store assigned colors for each visitor
const colors = ["#FF80ED", "#FF80ED", "#FF0000", "#FFD700", "#00FFFF", "#00FFFF", "#FFA500", "#C6E2FF", "#40E0D0", "#FF7373", "#003366", "#BADA55", "#800000", "#800080", "#00FF00", "#C39797", "#7FFFD4", "#FF00FF", "#FF7F50", "#468499", "#008000", "#000080", "#8A2BE2", "#696969", "#DAA520", "#0E2F44", "CCFF00", "#2ACAEA", "#CC0000", "#794044"];

function getIpColor(ip) {
    if (!ipColors[ip]) {
        let colorIndex = Object.keys(ipColors).length % colors.length;
        ipColors[ip] = colors[colorIndex]; // ✅ Assign a unique color per IP
    }
    return ipColors[ip];
}

function highlightDuplicateIps(duplicateIps) {
    document.querySelectorAll("tbody tr").forEach(row => {
        let ipCell = row.cells[3]; // ✅ IP is in the 4th column
        let ip = ipCell.textContent.trim();

        if (duplicateIps.includes(ip)) {
            let color = getIpColor(ip); // ✅ Assign a unique color per visitor
            ipCell.innerHTML = `<a href="#" class="ip-link" data-ip="${ip}" style="color: ${color}; font-weight: bold;">${ip}</a>`;
        }
    });

    attachIpClickEvents(); // ✅ Attach event listeners
}

function attachIpClickEvents() {
    document.querySelectorAll(".ip-link").forEach(ipLink => {
        ipLink.addEventListener("click", function (event) {
            event.preventDefault();
            let ip = this.getAttribute("data-ip");
            showIpVisitDetails(ip);
        });
    });
}


function showIpVisitDetails(ip) {
    console.log(`📌 Fetching visits for IP: ${ip}`);

    fetch(`fetch_valid_visitors.php?ip=${ip}`)
        .then(response => response.json())
        .then(data => {
            if (!data || !data.visits || data.visits.length === 0) {
                alert("❌ No visits found for this IP.");
                return;
            }

            let message = `📌 Visits from IP: ${ip}\n\n`;
            data.visits.forEach(visit => {
                message += `🕒 ${visit.date} - ${visit.totalTime}\n`;
            });

            alert(message);
        })
        .catch(error => console.error("❌ Error fetching IP visit data:", error));
}


// 🌍 Function to Reattach Click Events to Country Links (Fix Clickable Issue)
function attachCountryClickEvents() {
    console.log("🔄 Reattaching country click events...");

    let countryLinks = document.querySelectorAll(".country-link");
    console.log(`🔍 Found ${countryLinks.length} country links.`); // ✅ Log how many links exist

    countryLinks.forEach(countryLink => {
        countryLink.removeEventListener("click", handleCountryClick); // ✅ Remove previous listeners
        countryLink.addEventListener("click", handleCountryClick);
    });

    console.log("✅ Country click events reattached!");
}



// ✅ Function to Handle Country Click
function handleCountryClick(event) {
    event.preventDefault();
    let city = this.getAttribute("data-city");
    let country = this.getAttribute("data-country");

    if (city && country) {
        console.log(`🌍 Showing Map for: ${city}, ${country}`);
        showMapPopup(city, country);
    } else {
        console.error("❌ Invalid location data.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 valid_visitors.js loaded!");

    // ✅ Wait for the table to be fully loaded before attaching events
    setTimeout(() => {
        attachCountryClickEvents();
        console.log("✅ Country click events attached after initial load.");
    }, 500); // Small delay to ensure table is ready
});


function applyCustomRange() {
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        alert("❌ Please select both start and end dates.");
        return;
    }

    console.log(`📅 Applying Custom Range: ${startDate} to ${endDate}`);
    fetchLogs(new Date(startDate), new Date(endDate));
}

// 📌 Function to Show Top Country Visits
function showTopCountryVisits() {
    console.log("✅ showTopCountryVisits() function called!");
    
    let filterElement = document.getElementById("dateFilter");
    let filter = filterElement && filterElement.value ? filterElement.value : "thisMonth"; // ✅ Ensure a default value
    console.log(`📌 Selected filter: ${filter}`);
    
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        let today = new Date(); // ✅ Get current date
        switch (filter) {
            case "today":
                startDate = endDate = today.toISOString().split("T")[0];
                break;
            case "yesterday":
                today.setDate(today.getDate() - 1);
                startDate = endDate = today.toISOString().split("T")[0];
                break;
            case "last7":
                let last7 = new Date(today);
                last7.setDate(today.getDate() - 6);
                startDate = last7.toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "last14":
                let last14 = new Date(today);
                last14.setDate(today.getDate() - 13);
                startDate = last14.toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "last30":
                let last30 = new Date(today);
                last30.setDate(today.getDate() - 29);
                startDate = last30.toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "thisMonth":
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "lastMonth":
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
                endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
                break;
            case "past3":
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "past6":
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1).toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "all":
                startDate = "2025-02-01"; // ✅ Ensure valid format for "Show All"
                endDate = new Date().toISOString().split("T")[0];
                break;
            default:
                console.error("❌ Invalid filter value.");
                return;
        }
    }

    console.log(`📅 Fetching Top Country Visits from ${startDate} to ${endDate}`);

    fetch(`fetch_valid_visitors.php?startDate=${startDate}&endDate=${endDate}`)
    .then(response => response.json())
    .then(data => {
        console.log("✅ Response received:", data); // ✅ Debugging log
        
        if (!data || typeof data.topCountryVisits !== "object" || Object.keys(data.topCountryVisits).length === 0) {
            alert("❌ No country visits found for this range.");
            return;
        }

        let message = "🌍 Top Country Visits (Based on Unique Visits):\n\n";
        Object.entries(data.topCountryVisits).forEach(([country, count]) => {
            message += `📌 ${country}: ${count} times\n`;
        });

        alert(message);
    })
    .catch(error => console.error("❌ Error fetching data:", error));
}





function showTopBlockedUsers() {
    console.log("✅ showTopBlockedUsers() function called!");

    let filterElement = document.getElementById("dateFilter");
    let filter = filterElement && filterElement.value ? filterElement.value : "thisMonth"; // ✅ Ensure a default value
    console.log(`📌 Selected filter: ${filter}`);

    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        let today = new Date();
        switch (filter) {
            case "today":
                startDate = endDate = today.toISOString().split("T")[0];
                break;
            case "yesterday":
                today.setDate(today.getDate() - 1);
                startDate = endDate = today.toISOString().split("T")[0];
                break;
            case "last7":
                let last7 = new Date(today);
                last7.setDate(today.getDate() - 6);
                startDate = last7.toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "last14":
                let last14 = new Date(today);
                last14.setDate(today.getDate() - 13);
                startDate = last14.toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "last30":
                let last30 = new Date(today);
                last30.setDate(today.getDate() - 29);
                startDate = last30.toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "thisMonth":
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "lastMonth":
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split("T")[0];
                endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split("T")[0];
                break;
            case "past3":
                startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1).toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "past6":
                startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1).toISOString().split("T")[0];
                endDate = today.toISOString().split("T")[0];
                break;
            case "all":
                startDate = "2025-02-01";
                endDate = today.toISOString().split("T")[0];
                break;
            default:
                console.error("❌ Invalid filter value.");
                return;
        }
    }

    console.log(`📅 Fetching Top Country Visits from ${startDate} to ${endDate}`);

    fetch(`fetch_valid_visitors.php?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Response received:", data);

            if (!data || typeof data.topCountryVisits !== "object" || Object.keys(data.topCountryVisits).length === 0) {
                alert("❌ No country visits found for this range.");
                return;
            }

            let message = "🌍 Top Country Visits (Based on Unique Visits):\n\n";
            Object.entries(data.topCountryVisits).forEach(([country, count]) => {
                message += `📌 ${country}: ${count} times\n`;
            });

            alert(message);
        })
        .catch(error => console.error("❌ Error fetching data:", error));
}


// 📌 Function to Filter Logs Based on Selection
function filterLogs() {
    let filterElement = document.getElementById("dateFilter");
	let filter = filterElement && filterElement.value ? filterElement.value : "thisMonth"; // ✅ Ensure a default value
	console.log(`📌 Selected filter: ${filter}`);
    let today = new Date();
    let startDate, endDate;

    switch (filter) {
        case "today":
            startDate = endDate = today;
            break;
        case "yesterday":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 1);
            endDate = startDate;
            break;
        case "last7":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 6);
            endDate = today;
            break;
        case "last14":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 13);
            endDate = today;
            break;
        case "last30":
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 29);
            endDate = today;
            break;
        case "thisMonth":
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = today;
            break;
        case "lastMonth":
            startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            endDate = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case "past3":
            startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
            endDate = today;
            break;
        case "past6":
            startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
            endDate = today;
            break;
        case "custom":
            return; // ✅ Custom range handled separately
        case "all":
            startDate = new Date("2025-02-01"); // ✅ Show all logs
            endDate = today;
            break;
        default:
            return;
    }

    fetchLogs(startDate, endDate);
}

// ✅ Ensure Custom Range Fields Appear
document.getElementById("dateFilter").addEventListener("change", function () {
    let filter = this.value;
    let startDateInput = document.getElementById("startDate");
    let endDateInput = document.getElementById("endDate");
    let applyBtn = document.getElementById("applyDateRange");

    if (filter === "custom") {
        startDateInput.style.display = "inline-block";
        endDateInput.style.display = "inline-block";
        applyBtn.style.display = "inline-block";
    } else {
        startDateInput.style.display = "none";
        endDateInput.style.display = "none";
        applyBtn.style.display = "none";
    }
});

// 📌 Attach Event for Custom Range Selection
document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Page Loaded - Fetching Initial Logs");

    // ✅ Fetch logs immediately with default date range (first day of this month → today)
    let today = new Date();
    let startDate = new Date(today.getFullYear(), today.getMonth(), 1); // First day of this month
    let endDate = today;
    fetchLogs(startDate, endDate);

    // ✅ Attach event listener for "Apply Custom Range" button
    document.getElementById("applyDateRange").addEventListener("click", function () {
        let startDate = document.getElementById("startDate").value;
        let endDate = document.getElementById("endDate").value;

        if (startDate && endDate) {
            fetchLogs(new Date(startDate), new Date(endDate));
        } else {
            alert("❌ Please select both start and end dates.");
        }
    });
});


// 🌍 MAP FUNCTIONALITY (FIXED)
document.addEventListener("DOMContentLoaded", function () {
    let mapPopup = document.getElementById("mapPopup");
    let mapTitle = document.getElementById("mapTitle");

    if (!mapPopup || !mapTitle) {
        console.error("❌ Map popup elements not found!");
        return; // ✅ Now inside a function, so no syntax error
    }

    let map = L.map("map", { zoomControl: false }).setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    window.showMapPopup = function (city, country) {
        let query = city && city !== "NA" ? `${city}, ${country}` : country;

        mapTitle.textContent = `Map of ${query}`;
        mapPopup.style.display = "block";

        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    let { lat, lon } = data[0];
                    map.setView([lat, lon], 8);

                    map.eachLayer(layer => {
                        if (layer instanceof L.Marker) {
                            map.removeLayer(layer);
                        }
                    });

                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(`${query}`)
                        .openPopup();
                } else {
                    alert("❌ Location not found on the map.");
                }
            })
            .catch(error => console.error("❌ Error fetching map data:", error));
    };

    window.closeMapPopup = function () {
        mapPopup.style.display = "none";
    };

    attachCountryClickEvents(); // ✅ Attach Click Events on Page Load
document.addEventListener("DOMContentLoaded", function () {
    let dateSelector = document.getElementById("dateRangeSelector");
    if (dateSelector) {
        dateSelector.addEventListener("change", function () {
            loadVisitorLogs();
        });
    } else {
        console.warn("⚠️ Warning: dateRangeSelector not found!");
    }
});
}
function loadVisitorLogs() {
    let selectedSortOrder = document.querySelector('input[name="sortOrder"]:checked').value;

    fetch(`fetch_valid_visitors.php?sortOrder=${selectedSortOrder}`)
        .then(response => response.text())
        .then(data => {
            let tableBody = document.getElementById("visitorLogsTable");
            if (!tableBody) return;
            tableBody.innerHTML = data;
            
            applySortingAfterDataLoad(); // ✅ Ensures sorting applies after data is loaded
        })
        .catch(error => console.error("Error loading logs:", error));
}

});
