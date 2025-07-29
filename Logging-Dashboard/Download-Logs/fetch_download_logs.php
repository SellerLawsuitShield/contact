<?php
$logFile = __DIR__ . "/../../download-counter.txt";
$startDate = $_GET['startDate'] ?? '';
$endDate = $_GET['endDate'] ?? '';

$logsHtml = "";
$total = 0;
$uniqueIps = [];

if (file_exists($logFile)) {
    $lines = file($logFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        [$date, $ip, $ipType, $hosting, $city, $region, $country] = array_pad(explode(" | ", $line), 7, 'Unknown');

        // Filter by date range
        $logDate = date('Y-m-d', strtotime($date));
        if ($startDate && $endDate && ($logDate < $startDate || $logDate > $endDate)) {
            continue;
        }

        $logsHtml .= "<tr>";
        $logsHtml .= "<td>" . htmlspecialchars($date) . "</td>";
        $logsHtml .= "<td>" . htmlspecialchars($ip) . "</td>";
        $logsHtml .= "<td>" . htmlspecialchars($ipType) . "</td>";
        $logsHtml .= "<td>" . htmlspecialchars($hosting) . "</td>";
        $logsHtml .= "<td>" . htmlspecialchars($city) . "</td>";
        $logsHtml .= "<td>" . htmlspecialchars($region) . "</td>";

        // Make country clickable
        $logsHtml .= "<td>";
        if (!empty($country) && $country !== "NA") {
            $logsHtml .= "<a href='#' class='country-link' data-city='" . htmlspecialchars($city) . "' data-country='" . htmlspecialchars($country) . "'>" . htmlspecialchars($country) . "</a>";
        } else {
            $logsHtml .= htmlspecialchars($country);
        }
        $logsHtml .= "</td>";

        $logsHtml .= "</tr>";

        $total++;
        if (!in_array($ip, $uniqueIps)) {
            $uniqueIps[] = $ip;
        }
    }
}

header('Content-Type: application/json');
echo json_encode([
    'logs' => $logsHtml ?: null,
    'uniqueBlocked' => count($uniqueIps),
]);
