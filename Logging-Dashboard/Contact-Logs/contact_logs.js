// ✅ Store the currently selected date range globally
let activeStartDate = null;
let activeEndDate = null; 

 console.log("📌 contact_logs.js loaded!");
// ✅ Correctly Convert Date to MST (UTC-7)
function getMSTDate(date) {
    let utcTime = date.getTime() + date.getTimezoneOffset() * 60000; // Convert to UTC
    let mstTime = new Date(utcTime + (-7 * 3600000)); // Subtract 7 hours for MST
    return mstTime;
}


// 📌 Function to Fetch Logs from Server with Sorting
function fetchLogs(startDate, endDate, callback) {
    let startDateStr = startDate ? startDate.toISOString().split("T")[0] : "";
    let endDateStr = endDate ? endDate.toISOString().split("T")[0] : "";

    // ✅ Store active date range globally for sorting consistency
    activeStartDate = startDate;
    activeEndDate = endDate;

    fetch(`fetch_logs.php?startDate=${startDateStr}&endDate=${endDateStr}&sortOrder=${document.querySelector('input[name="sortOrder"]:checked').value}`)

        .then(response => response.json())
        .then(data => {
            let tableBody = document.querySelector("#ContactLogsTable tbody");
            tableBody.innerHTML = "";

            if (data.logs) {
                tableBody.innerHTML = data.logs;

                // ✅ Reapply status colors
                document.querySelectorAll("td").forEach(td => {
                    if (td.textContent.includes("Success")) {
                        td.classList.add("status-success");
                    }
                    if (td.textContent.includes("Blocked")) {
                        td.classList.add("status-blocked");
                    }
                });

                // ✅ Ensure country links are reattached
                attachCountryClickEvents();
                console.log("✅ Country click events reattached after filtering!");

            } else {
                tableBody.innerHTML = "<tr><td colspan='9'>No log data available.</td></tr>";
            }

            // ✅ Update Counters
            document.querySelector(".counter.success").textContent = "Success: " + data.successCount;
            document.querySelector(".counter.blocked").textContent = "Blocked: " + data.blockedCount;

            // ✅ Apply sorting after logs load
            if (callback) callback();
        })
        .catch(error => console.error("❌ Error fetching logs:", error));
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
    console.log("📌 contact_logs.js loaded!");

    // ✅ Wait for the table to be fully loaded before attaching events
    setTimeout(() => {
        attachCountryClickEvents();
        console.log("✅ Country click events attached after initial load.");
    }, 500); // Small delay to ensure table is ready
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("📌 Page Loaded - Fetching Initial Logs");

    let today = new Date();
    let startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    let endDate = today;

    // ✅ Ensure default sorting is "Newest to Oldest" (new)
    document.querySelector('#sortNewToOld').checked = true;

    // ✅ Fetch logs with correct sorting on page load
    fetchLogs(startDate, endDate, () => {
    applySorting();
});
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

// 📌 Function to Show Top Blocked Countries
function showTopBlockedCountries() {
    let filter = document.getElementById("dateFilter").value;
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (filter !== "custom") {
        let today = getMSTDate(new Date()); // ✅ Convert to MST timezone

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
                startDate = "2025-02-01"; // ✅ Ensure "Show All" works
                endDate = today.toISOString().split("T")[0];
                break;
            default:
                console.error("❌ Invalid filter value.");
                return;
        }
    }

    console.log(`📅 Fetching Top Blocked Countries from ${startDate} to ${endDate}`);

    fetch(`fetch_logs.php?startDate=${startDate}&endDate=${endDate}&freshData=true`) // ✅ Force fresh data
        .then(response => response.json())
        .then(data => {
            console.log("✅ Response received:", data);

            if (!data || !data.topBlockedCountries || Object.keys(data.topBlockedCountries).length === 0) {
                alert("❌ No blocked countries found for this range.");
                return;
            }

            let message = "🌍 Top Blocked Countries:\n\n";
            Object.entries(data.topBlockedCountries).forEach(([country, count]) => {
                message += `📌 ${country}: ${count} times\n`;
            });

            alert(message);
        })
        .catch(error => alert("❌ Error fetching data: " + error));
}



function showTopBlockedUsers() {
    console.log("✅ showTopBlockedUsers() function called!");

    let filter = document.getElementById("dateFilter").value;
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (!startDate || !endDate) {
        let today = new Date();
        today = getMSTDate(today); // ✅ Apply MST timezone

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
            case "all":
                startDate = "2025-02-01"; // ✅ Ensure valid format for "Show All"
                endDate = new Date().toISOString().split("T")[0];
                break;
            default:
                console.error("❌ Invalid filter value.");
                return;
        }
    }

    console.log(`🔍 Debugging: Start Date = ${startDate}, End Date = ${endDate}`);

    fetch(`fetch_logs.php?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.json())
        .then(data => {
            console.log("✅ Response received:", data);

            if (!data || !data.topBlockedCountries || Object.keys(data.topBlockedCountries).length === 0) {
                alert("No blocked countries found for this range.");
                return;
            }

            let message = "🌍 Top Blocked Countries:\n\n";
            Object.entries(data.topBlockedCountries).forEach(([country, count]) => {
                message += `📌 ${country}: ${count} times\n`;
            });

            alert(message);
        })
        .catch(error => alert("❌ Error fetching data: " + error));
}

// 📌 Function to Filter Logs Based on Selection
function filterLogs() {
    let filter = document.getElementById("dateFilter").value;
    let today = new Date();
    today = getMSTDate(today); // ✅ Convert to MST timezone
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

// ✅ Ensure sorting applies after fetching logs via AJAX
document.querySelectorAll('input[name="sortOrder"]').forEach(radio => {
    radio.addEventListener("change", function () {
        applySorting(); // ✅ Sorting always respects the selected date range
    });
});

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


// ✅ Sorting function - Ensures table is sorted correctly
function sortLogTable(order) {
    let table = document.querySelector("#ContactLogsTable tbody");
    if (!table) {
        console.error("❌ Error: Table body not found! Check table ID.");
        return;
    }

    let rows = Array.from(table.querySelectorAll("tr"));
    console.log("📌 Sorting rows:", rows.length, "Order:", order);

    // ✅ Ensure sorting applies correctly
    rows.sort((rowA, rowB) => {
        let dateA = new Date(rowA.cells[0].textContent.trim());
        let dateB = new Date(rowB.cells[0].textContent.trim());

        return order === "new" ? dateB - dateA : dateA - dateB;
    });

    // ✅ Apply sorting to the table
    table.innerHTML = "";
    rows.forEach(row => table.appendChild(row));

    console.log(`✅ Sorting Applied: ${order === "new" ? "Newest to Oldest" : "Oldest to Newest"}`);
}



// ✅ Function to apply sorting
function applySorting() {
    let selectedSortOrder = document.querySelector('input[name="sortOrder"]:checked').value;

    if (!activeStartDate || !activeEndDate || isNaN(new Date(activeStartDate).getTime()) || isNaN(new Date(activeEndDate).getTime())) {
        console.warn("⚠️ No active date range. Using default (This Month).");

        let today = new Date();
        activeStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        activeEndDate = today;
    }

    console.log("📌 Applying Sorting - Order:", selectedSortOrder);
    console.log("📌 Selected Date Range - Start:", activeStartDate.toISOString().split("T")[0], "End:", activeEndDate.toISOString().split("T")[0]);

    // ✅ Ensure sorting applies correctly after fetching logs
    fetchLogs(activeStartDate, activeEndDate, () => {
        sortLogTable(selectedSortOrder);
        console.log("✅ Sorting applied successfully.");
    });
}


// 📌 Attach Event for Custom Range Selection
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("applyDateRange").addEventListener("click", function () {
        let startDate = document.getElementById("startDate").value;
        let endDate = document.getElementById("endDate").value;

        if (startDate && endDate) {
            fetchLogs(new Date(startDate), new Date(endDate));
        } else {
            alert("❌ Please select both start and end dates.");
        }
    });

// 🌍 MAP FUNCTIONALITY
    let mapPopup = document.getElementById("mapPopup");
    let mapTitle = document.getElementById("mapTitle");

if (typeof L === "undefined") {
    console.error("❌ Leaflet library is missing!");
}


    if (!mapPopup || !mapTitle) {
        console.error("❌ Map popup elements not found!");
        return;
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
});
