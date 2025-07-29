<!DOCTYPE html>
<html lang="en">
<head>
<link rel="icon" href="../../../favicon.ico" type="image/x-icon">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
<!-- Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<!-- Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blocked User Logs</title>
<link rel="stylesheet" href="../styles.css">
</head>
<body>
<header>
     <div class="header-container">
       <p><img class="logo" style="display: block; margin-left: auto; margin-right: auto;" src="../../images/unbreakable-will.png" alt="Unbreakable Will Logo Logo"></p>
        <nav class="nav-tabs">
            <!-- Navigation links go here -->
        </nav>
    </div>
    <nav>
        <ul class="nav-tabs">
		    <li><a href="/../../index.php">Main Website</a></li>
            <li><a href="../index.php">Logging Dashboard</a></li>
			<li><a href="../Contact-Logs/">Contact Form Logs</a></li>
			<li><a href="../Blocked-User-Logs/">Blocked User Logs</a></li>
			<li><a href="../Download-Logs/">Download Logs</a></li>
			<li><a href="../Bot-Logs/">Bot Tracker Logs</a></li>
        </ul>
    </nav>
</header>
<main>

<h1 class="log-title">Bot Tracker Logs</h1>
<div class="date-filter-container">
    <label for="dateFilter">View logs for:</label>
    <select id="dateFilter" onchange="filterLogs()">
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="last7">Last 7 Days</option>
        <option value="last14">Last 14 Days</option>
        <option value="last30">Last 30 Days</option>
        <option value="thisMonth" selected>This Month</option>
        <option value="lastMonth">Last Month</option>
        <option value="past3">Past 3 Months</option>
        <option value="past6">Past 6 Months</option>
        <option value="custom">Custom Range</option>
        <option value="all">Show All</option>
    </select>
	<div id="customRangeInputs" style="display: none; margin-top: 10px;">
    <label for="startDate">From:</label>
    <input type="date" id="startDate">
    <label for="endDate">To:</label>
    <input type="date" id="endDate">
    <button onclick="applyCustomDateRange()">Apply</button>
</div>

</div>


    <!-- Custom Date Range Inputs (Hidden by Default) -->
    <input type="date" id="startDate" class="date-input" style="display: none;">
    <input type="date" id="endDate" class="date-input" style="display: none;">
    <button id="applyDateRange" style="display: none;" onclick="applyCustomRange()">Apply</button>
</div>
<label class="sort-label">Sort:</label>
<input type="radio" id="newest" name="sortOrder" value="newest" checked>
<label for="newest">Newest to Oldest</label>

<input type="radio" id="oldest" name="sortOrder" value="oldest">
<label for="oldest">Oldest to Newest</label>
</div>
  <div class="table-container">
    <table id="BotLogsTable">
        <thead>
            <tr>
                <th>Date</th>
                <th>Bot Name</th>
                <th>User Agent</th>
                <th>IP Address</th>
                <th>Web Page</th>
                <th>Referrer</th>
                <th>Bot Type</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
        <?php
        $logFile = __DIR__ . "/bot-visits.log";

        if (file_exists($logFile)) {
            $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $columns = explode(" | ", $line);
                echo "<tr>";
                foreach ($columns as $index => $column) {
                    // Highlight bots that are marked as allowed or blocked
                    if ($index === 7) { // Status column
                        $status = trim($column);
                        $class = ($status === 'Blocked') ? 'status-blocked' : 'status-allowed';
                        echo "<td class='$class'>" . htmlspecialchars($column) . "</td>";
                    } else {
                        echo "<td>" . htmlspecialchars($column) . "</td>";
                    }
                }
                echo "</tr>";
            }
        } else {
            echo "<tr><td colspan='8'>No bot log data available.</td></tr>";
        }
        ?>
        </tbody>
    </table>
</div>

<footer>
        <p>&copy; 2025 Seller Lawsuit Shield</p>
		<p>
            <a href="/../index.php">Main Website</a> | 
            <a href="../index.php">Logging Dashboard</a> | 
            <a href="../Contact-Logs/">Contact Form Logs</a> | 
            <a href="../Blocked-User-Logs/">Blocked User Logs</a> | 
            <a href="../Download-Logs/">Download Logs</a> |
			<a href="../Bot-Logs/">Bot Tracker Logs</a>
        </p>
    </footer>
<script>
function filterLogs() {
    const filter = document.getElementById("dateFilter").value;
    const rows = document.querySelectorAll("#BotLogsTable tbody tr");
    const now = new Date();

    // Show or hide custom date inputs
    document.getElementById("customRangeInputs").style.display = filter === "custom" ? "block" : "none";

    if (filter === "custom") return; // Wait for user to click "Apply"

    rows.forEach(row => {
        const dateCell = row.querySelector("td");
        if (!dateCell) return;

        const logDate = new Date(dateCell.textContent.trim());
        let show = false;

        switch (filter) {
            case "today":
                show = isSameDay(now, logDate);
                break;
            case "yesterday":
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                show = isSameDay(yesterday, logDate);
                break;
            case "last7":
                show = daysAgo(logDate) <= 7;
                break;
            case "last14":
                show = daysAgo(logDate) <= 14;
                break;
            case "last30":
                show = daysAgo(logDate) <= 30;
                break;
            case "thisMonth":
                show = logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
                break;
            case "lastMonth":
                const lastMonth = new Date(now);
                lastMonth.setMonth(now.getMonth() - 1);
                show = logDate.getMonth() === lastMonth.getMonth() && logDate.getFullYear() === lastMonth.getFullYear();
                break;
            case "past3":
                show = daysAgo(logDate) <= 90;
                break;
            case "past6":
                show = daysAgo(logDate) <= 180;
                break;
            case "all":
                show = true;
                break;
        }

        row.style.display = show ? "" : "none";
    });
}

function applyCustomDateRange() {
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);
    const rows = document.querySelectorAll("#BotLogsTable tbody tr");

    if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
        alert("Please select a valid start and end date.");
        return;
    }

    rows.forEach(row => {
        const dateCell = row.querySelector("td");
        if (!dateCell) return;

        const logDate = new Date(dateCell.textContent.trim());
        row.style.display = (logDate >= startDate && logDate <= endDate) ? "" : "none";
    });
}

function isSameDay(d1, d2) {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
}

function daysAgo(date) {
    const diff = Date.now() - date.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// Sort rows newest to oldest
document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("BotLogsTable").querySelector("tbody");
    const rows = Array.from(table.querySelectorAll("tr"));

    rows.sort((a, b) => {
        const dateA = new Date(a.cells[0].textContent.trim());
        const dateB = new Date(b.cells[0].textContent.trim());
        return dateB - dateA;
    });

    rows.forEach(row => table.appendChild(row));
    filterLogs(); // Initial filter on load
});
</script>
<script>
document.querySelectorAll('input[name="sortOrder"]').forEach(radio => {
    radio.addEventListener('change', sortLogsByRadio);
});

function sortLogsByRadio() {
    const selected = document.querySelector('input[name="sortOrder"]:checked').value;
    const table = document.getElementById("BotLogsTable"); // Make sure this matches your table ID
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((a, b) => {
        const dateA = new Date(a.cells[0].textContent.trim());
        const dateB = new Date(b.cells[0].textContent.trim());
        return selected === "newest" ? dateB - dateA : dateA - dateB;
    });

    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));
}
</script>
</body>
</html>
