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
    <title>Downloads</title>
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

<h1 style class="log-title">Download Logs</h1>
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
<div id="mapPopup" class="map-popup" style="display: none; position: fixed; top: 50px; left: 50%; transform: translateX(-50%); z-index: 9999; background: white; padding: 20px; border: 2px solid #444; border-radius: 10px; box-shadow: 0 0 15px rgba(0,0,0,0.3);">
    <span class="close-btn" onclick="closeMapPopup()">&times;</span>
    <h2 id="mapTitle">Location Map</h2>
    <div id="mapContainer">
        <div id="map" style="height: 600px; width: 100%;"></div>
    </div>
    <button onclick="closeMapPopup()">OK</button>
</div>
</div>
  <div class="table-container">
    <table id="BlockedUserLogsTable">
        <thead>
            <tr>
                <th>Date</th>
                <th>IP Address</th>
                <th>IP Type</th>
                <th>Hosting</th>
                <th>City</th>
                <th>Region</th>
                <th>Country</th>
            </tr>
        </thead>
        <tbody>
<?php
$logFile = __DIR__ . "/../../download-counter.txt";
$totalEntries = 0;
$uniqueIps = [];

if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $columns = explode(" | ", $line);

        // ✅ Skip lines with fewer than 7 columns
        if (count($columns) < 7) continue;

        list($date, $ip, $ipType, $hosting, $city, $region, $country) = array_map('trim', $columns);

        echo "<tr>";
echo "<td>" . htmlspecialchars($columns[0] ?? '') . "</td>"; // Date
echo "<td>" . htmlspecialchars($columns[1] ?? '') . "</td>"; // IP
echo "<td>" . htmlspecialchars($columns[2] ?? '') . "</td>"; // IP Type
echo "<td>" . htmlspecialchars($columns[3] ?? '') . "</td>"; // Hosting
echo "<td>" . htmlspecialchars($columns[4] ?? '') . "</td>"; // City
echo "<td>" . htmlspecialchars($columns[5] ?? '') . "</td>"; // Region

        // ✅ Only link if valid country
        if (!empty($country) && $country !== "Unknown" && $country !== "NA") {
            echo "<td><a href='#' class='country-link' data-city='" . htmlspecialchars($city) . "' data-country='" . htmlspecialchars($country) . "'>" . htmlspecialchars($country) . "</a></td>";
        } else {
            echo "<td>" . htmlspecialchars($country) . "</td>";
        }
        echo "</tr>";

        $totalEntries++;
        if (!in_array($ip, $uniqueIps)) {
            $uniqueIps[] = $ip;
        }
    }

    // ✅ If no valid rows were added
    if ($totalEntries === 0) {
        echo "<tr><td colspan='7'>No log data available.</td></tr>";
    }
} else {
    echo "<tr><td colspan='7'>No log data available.</td></tr>";
}
?>
</tbody>
    </table>
</div>

<div class="counter-container">
    <div class="counter unique-blocked">Total Downloaded: <?php echo count($uniqueIps); ?></div>
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
<script src="fetch_logs.js"></script>

</body>
</html>
