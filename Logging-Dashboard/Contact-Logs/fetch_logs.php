<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

$logFile = __DIR__ . "/contact-forms.log";
$startDate = isset($_GET['startDate']) && !empty($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) && !empty($_GET['endDate']) ? $_GET['endDate'] : null;

// ✅ Ensure the correct timezone is set
date_default_timezone_set("America/Edmonton");

$successCount = 0;
$blockedCount = 0;
$logEntries = [];
$topBlockedCountries = []; // ✅ Track blocked countries

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

        // ✅ Convert log date (e.g., "February 18, 2025 11:16 PM") to YYYY-MM-DD
        $logDate = DateTime::createFromFormat("F j, Y g:i A", $columns[0]);

        if (!$logDate) {
            continue; // Skip invalid lines
        }

        $formattedDate = $logDate->format("Y-m-d");

        // ✅ Ensure correct date filtering
        if (($startDate && $formattedDate < $startDate) || ($endDate && $formattedDate > $endDate)) {
            continue;
        }

       $logEntries[] = "<tr>";

foreach ($columns as $index => $column) {
    $column = htmlspecialchars($column);

    if ($index === 8) { // ✅ Country column (assuming it's the 9th column)
        $city = htmlspecialchars($columns[6] ?? "NA"); // Get the city
        $logEntries[] = "<td><a href='#' class='country-link' data-city='$city' data-country='$column'>$column</a></td>";
    } else {
        $logEntries[] = "<td>$column</td>";
    }
}

$logEntries[] = "</tr>";


        // ✅ Count Success & Blocked messages
        if (strpos($columns[2], 'Success') !== false) {
            $successCount++;
        } elseif (strpos($columns[2], 'Blocked') !== false) {
            $blockedCount++;

            // ✅ Track blocked country
            $country = trim($columns[8] ?? ''); // 9th column is Country
            if (!empty($country)) {
                $topBlockedCountries[$country] = ($topBlockedCountries[$country] ?? 0) + 1;
            }
        }
    }
}

// ✅ Sort Top Blocked Countries by highest count
arsort($topBlockedCountries);

// ✅ Debugging: Print top blocked countries in error log
error_log("Debug: Top Blocked Countries - " . print_r($topBlockedCountries, true));

// ✅ Ensure valid JSON response
echo json_encode([
    "logs" => implode("", $logEntries),
    "successCount" => $successCount,
    "blockedCount" => $blockedCount,
    "topBlockedCountries" => $topBlockedCountries // ✅ Now included in the response!
]);
?>
