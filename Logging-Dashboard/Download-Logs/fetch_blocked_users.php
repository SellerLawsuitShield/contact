<?php
header('Content-Type: application/json');

$logFile = __DIR__ . "/blocked-users.log";
$startDate = isset($_GET['startDate']) && !empty($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) && !empty($_GET['endDate']) ? $_GET['endDate'] : null;

$totalBlocked = 0;
$uniqueBlockedIps = [];
$topBlockedCountries = [];

$filteredLogs = "";

if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
// ✅ Get sorting order from AJAX request
$sortOrder = $_GET['sortOrder'] ?? 'new'; // Default: Newest to Oldest

// ✅ Reverse lines if sorting is Newest to Oldest
if ($sortOrder === 'new') {
    $lines = array_reverse($lines);
}
    
    foreach ($lines as $line) {
        $columns = explode(" | ", $line);

     // Extract log date
date_default_timezone_set("America/Edmonton"); // ✅ Set MST Timezone
$logDate = date("Y-m-d", strtotime($columns[0]));

if ($startDate !== null && $endDate !== null) { 
    if (($logDate < $startDate) || ($logDate > $endDate)) { 
        continue; // Skip logs outside selected range
    }
} else {
    error_log("[Debug] Show All selected - No date filtering applied!"); // ✅ Debugging log
}

		

        // Append filtered logs
        $filteredLogs .= "<tr>";
        foreach ($columns as $index => $column) {
            $filteredLogs .= "<td>" . htmlspecialchars($column) . "</td>";
        }
        $filteredLogs .= "</tr>";

        // Count total blocked
        $totalBlocked++;

        // Track unique blocked IPs
        $ip = $columns[4] ?? ''; // Assuming IP is in the 5th column
if (!in_array($ip, $uniqueBlockedIps)) {
    $uniqueBlockedIps[] = $ip;

    // Track Unique Blocked Countries
    $country = $columns[8] ?? ''; // Assuming country is in the 9th column
    if (!empty($country)) {
        if (!isset($topBlockedCountries[$country])) {
            $topBlockedCountries[$country] = 0;
        }
        $topBlockedCountries[$country]++;
    }
}


        // Track top blocked countries
        $country = $columns[8] ?? ''; // Assuming country is in the 9th column
        if (!empty($country)) {
            if (!isset($topBlockedCountries[$country])) {
                $topBlockedCountries[$country] = 0;
            }
            $topBlockedCountries[$country]++;
        }
    }
}

// Sort Top Blocked Countries by highest count
arsort($topBlockedCountries);

if (empty($topBlockedCountries)) {
    $topBlockedCountries = null; // Ensure empty response is handled properly
}

// Debugging: Check filtered country counts before sending response
error_log("Filtered Top Blocked Countries: " . print_r($topBlockedCountries, true));

// Return JSON response
// ✅ Filter top blocked countries to only include UNIQUE blocked IPs
$filteredTopBlockedCountries = [];

// ✅ Ensure each unique IP is counted only once per country
$seenIps = [];

foreach ($uniqueBlockedIps as $ip) {
    foreach ($lines as $line) {
        $columns = explode(" | ", $line);
        if (isset($columns[4]) && $columns[4] == $ip) { // 5th column is IP
            $country = $columns[8] ?? ''; // 9th column is Country

            // ✅ Only count if this IP hasn't been counted for this country yet
            if (!empty($country) && !isset($seenIps[$ip])) {
                $filteredTopBlockedCountries[$country] = ($filteredTopBlockedCountries[$country] ?? 0) + 1;
                $seenIps[$ip] = true; // ✅ Mark this IP as counted
            }
        }
    }
}

// ✅ Sort by highest count first
arsort($filteredTopBlockedCountries);

// ✅ Return JSON response
echo json_encode([
    "logs" => $filteredLogs,
    "totalBlocked" => $totalBlocked,
    "uniqueBlocked" => count($uniqueBlockedIps),
    "topBlockedCountries" => $filteredTopBlockedCountries // ✅ Now correctly counting unique blocked per country
]);

?>
