// ✅ Store the currently selected date range globally
let activeStartDate = null;
let activeEndDate = null; 

function fetchLogs(startDate, endDate, callback) {
    if (typeof startDate === "string") startDate = new Date(startDate);
    if (typeof endDate === "string") endDate = new Date(endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date format!");
        return;
    }

    let startDateStr = startDate.toISOString().split("T")[0];
    let endDateStr = endDate.toISOString().split("T")[0];

    console.log(`Fetching logs from ${startDateStr} to ${endDateStr}`);

    // ✅ Store active date range globally
    activeStartDate = startDate;
    activeEndDate = endDate;

    fetch(`fetch_blocked_users.php?startDate=${startDateStr}&endDate=${endDateStr}`)
    .then(response => response.json())
    .then(data => {
        let tableBody = document.querySelector("#BlockedUserLogsTable tbody");
        tableBody.innerHTML = "";

        if (data.logs) {
            tableBody.innerHTML = data.logs;

            // ✅ Reapply red color to "Blocked" text in the Status column
            document.querySelectorAll("td").forEach(td => {
                if (td.textContent.trim() === "Blocked") {
                    td.classList.add("status-blocked");
                }
            });

            // ✅ Ensure Countries Become Clickable Again
            attachCountryClickEvents();
            console.log("🔄 Country click events reattached!");
        } else {
            tableBody.innerHTML = "<tr><td colspan='9'>No log data available.</td></tr>";
        }

        // ✅ Update the counters
        document.querySelector(".counter.total-blocked").textContent = "Total Blocked: " + (data.totalBlocked || 0);
        document.querySelector(".counter.unique-blocked").textContent = "Unique Blocked: " + (data.uniqueBlocked || 0);

        // ✅ Apply sorting after logs are loaded
        if (callback) callback();
    })
    .catch(error => console.error("Error fetching logs:", error));
}


function attachCountryClickEvents() {
    console.log("🔄 Reattaching country click events...");

    document.querySelectorAll("td:nth-child(9)").forEach(td => {
        let country = td.textContent.trim();
        let city = td.previousElementSibling.textContent.trim(); // Get the city from the previous column

        if (!td.querySelector("a") && country !== "NA" && country !== "") {
            let countryLink = document.createElement("a");
            countryLink.href = "#";
            countryLink.classList.add("country-link");
            countryLink.setAttribute("data-city", city);
            countryLink.setAttribute("data-country", country);
            countryLink.textContent = country;
            countryLink.addEventListener("click", function (event) {
                event.preventDefault();
                showMapPopup(city, country);
            });

            td.innerHTML = ""; // Clear the existing text
            td.appendChild(countryLink); // Make it clickable
        }
    });

    console.log("✅ Country click events reattached!");
}

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
    let startDateStr = document.getElementById("startDate").value;
    let endDateStr = document.getElementById("endDate").value;

    if (!startDateStr || !endDateStr) {
        alert("Please select both start and end dates.");
        return;
    }

    let startDate = new Date(startDateStr);
    let endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date format!");
        return;
    }

    console.log(`Applying Custom Range: ${startDateStr} to ${endDateStr}`);
    fetchLogs(startDate, endDate);
}

function fetchBlockedUsers(startDate, endDate) {
    let startDateStr = startDate ? startDate.toISOString().split("T")[0] : "";
    let endDateStr = endDate ? endDate.toISOString().split("T")[0] : "";

    fetch("fetch_blocked_users.php?startDate=" + startDateStr + "&endDate=" + endDateStr)
        .then(response => response.json())
        .then(data => {
            // ✅ Update table data
            let tableBody = document.querySelector("tbody");
            tableBody.innerHTML = ""; // Clear current table

            if (data.logs) {
                tableBody.innerHTML = data.logs;
            } else {
                tableBody.innerHTML = "<tr><td colspan='9'>No log data available.</td></tr>";
            }

            // ✅ Update the counters
            document.querySelector(".counter.total.blocked").textContent = "Total Blocked: " + data.totalBlocked;
            document.querySelector(".counter.unique.blocked").textContent = "Unique Blocked: " + data.uniqueBlocked;

            // ✅ Update Top Blocked Countries
            updateTopBlockedCountries(data.topBlockedCountries);
        })
        .catch(error => console.error("Error fetching blocked users:", error));
}

// ✅ Function to show Top Blocked Countries
function updateTopBlockedCountries() {
    let filter = document.getElementById("dateFilter").value;
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
                today.setDate(today.getDate() - 6);
                startDate = today.toISOString().split("T")[0];
                endDate = new Date().toISOString().split("T")[0];
                break;
            default:
                startDate = "";
                endDate = "";
        }
    }

    fetch(`get-blocked-users.php?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.json())
        .then(data => {
            let message = "Top Blocked Countries:\n\n";
            for (let country in data.topBlockedCountries) {
                message += `${country}: ${data.topBlockedCountries[country]} times\n`;
            }
            alert(message);
        })
        .catch(error => alert("Error fetching data: " + error));
}

function showTopBlockedUsers() {
    console.log("✅ showTopBlockedUsers() function called!");

    let filter = document.getElementById("dateFilter").value;
    let startDate = "";
    let endDate = "";

    // ✅ If a custom date range was previously selected, reset it
    if (filter !== "custom") {
        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";
    }

    // ✅ Determine the date range based on the selected filter
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
            startDate = "2025-02-01"; // ✅ First possible log entry
            endDate = today.toISOString().split("T")[0]; // ✅ Today
            break;
        case "custom":
            startDate = document.getElementById("startDate").value;
            endDate = document.getElementById("endDate").value;
            break;
        default:
            console.error("❌ Invalid filter option selected.");
            return;
    }

    console.log(`🔍 Fetching Top Blocked Countries for: ${startDate} to ${endDate}`);

    fetch(`fetch_blocked_users.php?startDate=${startDate}&endDate=${endDate}`)
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

            // ✅ Ensure stale data isn't displayed
            document.getElementById("topBlockedCountriesBtn").setAttribute("data-top-countries", JSON.stringify(data.topBlockedCountries));

            setTimeout(() => alert(message), 300); // Adds slight delay to prevent UI lag
        })
        .catch(error => {
            console.error("❌ Error fetching top blocked countries:", error);
            alert("Error fetching data: " + error);
        });
}

// 📌 Function to Filter Logs Based on Selection
function filterLogs() {
    let filter = document.getElementById("dateFilter").value;
    let startDateInput = document.getElementById("startDate");
    let endDateInput = document.getElementById("endDate");
    let applyBtn = document.getElementById("applyDateRange");
    let now = new Date();

    // ✅ Convert to MST (UTC-6)
    let mstOffset = -6 * 60; // MST is UTC-6
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + mstOffset);

    let startDate, endDate;

    if (filter === "custom") {
        startDateInput.style.display = "inline-block";
        endDateInput.style.display = "inline-block";
        applyBtn.style.display = "inline-block";
        return;  // ✅ Stop execution for Custom Range
    } else {
        startDateInput.style.display = "none";
        endDateInput.style.display = "none";
        applyBtn.style.display = "none";
    }

    switch (filter) {
        case "today":
            startDate = endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "yesterday":
            startDate = endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            break;
        case "last7":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
            endDate = now;
            break;
        case "last14":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
            endDate = now;
            break;
        case "last30":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
            endDate = now;
            break;
        case "thisMonth":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
            break;
        case "lastMonth":
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        case "past3":
            startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
            endDate = now;
            break;
        case "past6":
            startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            endDate = now;
            break;
        case "all": // ✅ Ensure "Show All" fetches everything
            startDate = "2025-02-01"; // ✅ First possible log entry
            endDate = new Date().toISOString().split("T")[0]; // ✅ Today as string
            break;
        default:
            return;
    }

    let startDateStr = startDate instanceof Date ? startDate.toISOString().split("T")[0] : startDate;
    let endDateStr = endDate instanceof Date ? endDate.toISOString().split("T")[0] : endDate;

    console.log(`📅 Filtering logs from ${startDateStr} to ${endDateStr}`);

    // ✅ Preserve the selected sorting order
    let selectedSortOrder = document.querySelector('input[name="sortOrder"]:checked').value;

    // ✅ Fetch logs with correct sorting
    fetchLogs(startDateStr, endDateStr, () => {
        sortLogTable(selectedSortOrder); // ✅ Apply the preserved sorting order
        console.log(`✅ Date range applied with sorting: ${selectedSortOrder}`);
    });
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
    let table = document.querySelector("#BlockedUserLogsTable tbody");
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

    // ✅ Ensure activeStartDate and activeEndDate are set correctly
    if (!activeStartDate || !activeEndDate || isNaN(new Date(activeStartDate).getTime()) || isNaN(new Date(activeEndDate).getTime())) {
        console.warn("⚠️ No active date range. Using default (This Month).");

        let today = new Date();
        activeStartDate = new Date(today.getFullYear(), today.getMonth(), 1); // ✅ First day of the month
        activeEndDate = today; // ✅ Set to today's date
    }

    console.log("📌 Applying Sorting - Order:", selectedSortOrder);
    console.log("📌 Selected Date Range - Start:", activeStartDate.toISOString().split("T")[0], "End:", activeEndDate.toISOString().split("T")[0]);

    // ✅ Ensure sorting applies correctly after fetching logs
    fetchLogs(activeStartDate, activeEndDate, () => {
        sortLogTable(selectedSortOrder);
        console.log("✅ Sorting applied successfully.");
    });
}


document.addEventListener("DOMContentLoaded", function () {
    let mapPopup = document.getElementById("mapPopup");
    let mapTitle = document.getElementById("mapTitle");

    if (!mapPopup || !mapTitle) {
        console.error("❌ Map popup elements not found!");
        return;
    }

    // 🌍 Initialize the Map
    let map = L.map("map", { zoomControl: false }).setView([20, 0], 2);

    // 🗺️ Add OpenStreetMap Tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 📌 Function to Show the Map in a Popup
window.showMapPopup = function (city, country) {
    let mapPopup = document.getElementById("mapPopup");
    let mapTitle = document.getElementById("mapTitle");

    if (!mapPopup || !mapTitle) {
        console.error("❌ Map popup elements not found!");
        return;
    }

    // ✅ Update the Map Title
    mapTitle.textContent = `Map of ${city ? city + ", " : ""}${country}`;
    mapPopup.style.display = "block";

    setTimeout(() => {
        map.invalidateSize();
    }, 300);

    // ✅ Ensure We Query the City First (If Available)
    let query = city && city !== "NA" ? `${city}, ${country}` : country;

    // ✅ Fetch Coordinates from OpenStreetMap API
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                let { lat, lon } = data[0];
                map.setView([lat, lon], 8);

                // ✅ Remove previous markers
                map.eachLayer(layer => {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });

                // ✅ Add Marker to Exact City Location
                L.marker([lat, lon]).addTo(map)
                    .bindPopup(`${city ? city + ", " : ""}${country}`)
                    .openPopup();
            } else {
                alert("❌ Location not found on the map.");
            }
        })
        .catch(error => console.error("❌ Error fetching map data:", error));
};


    // ❌ Close Map Popup
    window.closeMapPopup = function () {
        mapPopup.style.display = "none";
    };

    // 🖱️ Attach Click Events to Country Names
    document.querySelectorAll(".country-link").forEach(countryLink => {
        countryLink.addEventListener("click", function (event) {
            event.preventDefault();
            let city = this.getAttribute("data-city");
            let country = this.getAttribute("data-country");
            showMapPopup(city, country);
        });
    });
});
