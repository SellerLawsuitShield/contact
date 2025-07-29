<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="icon" href="../../../favicon.ico" type="image/x-icon">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
<!-- 🌍 Leaflet CSS -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />

<!-- 🌍 Leaflet JS -->
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Logs</title>
<link rel="stylesheet" href="../styles.css">
</head>
<body>
<header>
    <div class="header-container">
       <p><img class="logo" style="display: block; margin-left: auto; margin-right: auto;" src="../../images/unbreakable-will.png" alt="Unbreakable Will Logo Logo"></p>
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

<h1 class="log-title">Contact Form Logs</h1>
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

    <!-- Custom Date Range Inputs (Hidden by Default) -->
    <input type="date" id="startDate" class="date-input" style="display: none;">
    <input type="date" id="endDate" class="date-input" style="display: none;">
    <button id="applyDateRange" style="display: none;" onclick="applyCustomRange()">Apply</button>
</div>
<label class="sort-label">Sort:</label>
<input type="radio" id="sortNewToOld" name="sortOrder" value="new" checked>
<label for="sortNewToOld">Newest to Oldest</label>

<input type="radio" id="sortOldToNew" name="sortOrder" value="old">
<label for="sortOldToNew">Oldest to Newest</label>
<!-- 🌍 Map Popup Window (Hidden by Default) -->
<div id="mapPopup" class="map-popup">
    <span class="close-btn" onclick="closeMapPopup()">&times;</span>
    <h2 id="mapTitle">Location Map</h2>
    <div id="mapContainer">
        <div id="map" style="height: 600px; width: 100%;"></div>
    </div>
    <button onclick="closeMapPopup()">OK</button>
</div>

<div class="table-container">
    <table id="ContactLogsTable">
        <thead>
            <tr>
                <th>Date</th>
                <th>Form</th>
                <th>Status</th>
                <th>Reason</th>
                <th>IP</th>
                <th>IP Type</th>
                <th>City</th>
                <th>Region</th>
                <th>Country</th>
            </tr>
        </thead>
        <tbody>
       <?php
$logFile = __DIR__ . "/contact-forms.log";
$successCount = 0;
$blockedCount = 0;

if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $columns = explode(" | ", $line);
        echo "<tr>";
        foreach ($columns as $index => $column) {
            if ($index === 2) { // ✅ "Status" column
                $statusClass = strpos($column, 'Success') !== false ? 'status-success' : (strpos($column, 'Blocked') !== false ? 'status-blocked' : '');
                echo "<td class='$statusClass'>" . htmlspecialchars($column) . "</td>";
            } elseif ($index === 8) { // ✅ "Country" column - Make Clickable
                $city = htmlspecialchars($columns[6] ?? "NA");
                $country = htmlspecialchars($column);
                echo "<td><a href='#' class='country-link' data-city='$city' data-country='$country'>$country</a></td>";
            } else {
                echo "<td>" . htmlspecialchars($column) . "</td>";
            }
        }
        echo "</tr>";

        if (strpos($line, 'Success') !== false) $successCount++;
        if (strpos($line, 'Blocked') !== false) $blockedCount++;
    }
} else {
    echo "<tr><td colspan='11'>No log data available.</td></tr>";
}
?>


        </tbody>
    </table>
<script>
    document.addEventListener("DOMContentLoaded", function () {
        attachCountryClickEvents(); // ✅ Ensure click events are attached on page load
    });
</script>

</div>

<div class="counter-container">
    <div class="counter success">Success: <?php echo $successCount; ?></div>
    <div class="counter blocked">Blocked: <?php echo $blockedCount; ?></div>
</div>

<!-- New Button to Show Top Blocked Countries -->
<div class="button-container">
    <button onclick="showTopBlockedCountries()" class="top-blocked-btn">Top Blocked Countries</button>
</div>

</main>
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
<script src="contact_logs.js"></script>

</body>
</html>
