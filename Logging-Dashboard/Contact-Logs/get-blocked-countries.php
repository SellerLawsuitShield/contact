<?php
$logFile = __DIR__ . "/contact-forms.log";

// Capture the date range from GET request
$startDate = isset($_GET['startDate']) ? $_GET['startDate'] : null;
$endDate = isset($_GET['endDate']) ? $_GET['endDate'] : null;
$blockedCounts = [];

if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($lines as $line) {
        $columns = explode(" | ", $line);
        if (count($columns) < 9) continue; // Skip invalid lines

        $dateStr = trim($columns[0]);  // Extract the date
        $status = trim($columns[2]);   // Extract "Success" or "Blocked"
        $country = trim($columns[8]);  // Extract the country

        // Convert log date to YYYY-MM-DD format for filtering
        $formattedDate = date("Y-m-d", strtotime($dateStr));

        // Apply date filtering
        if (!empty($startDate) && !empty($endDate)) {
            if ($formattedDate < $startDate || $formattedDate > $endDate) {
                continue; // Skip entries outside the range
            }
        }

        // ✅ Count only "Blocked" entries, ignore "Success"
        if ($status === "Blocked") {
            if (!isset($blockedCounts[$country])) {
                $blockedCounts[$country] = 1;
            } else {
                $blockedCounts[$country]++;
            }
        }
    }
}

// ✅ Sort by most blocked countries (highest count first)
arsort($blockedCounts);

echo json_encode($blockedCounts);
?>
