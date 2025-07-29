<?php
// ✅ Start session (if not already active)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// ✅ Ensure visitor_start_time and pages_visited exist
if (!isset($_SESSION['visitor_start_time'])) {
    $_SESSION['visitor_start_time'] = time();
}
if (!isset($_SESSION['pages_visited'])) {
    $_SESSION['pages_visited'] = [];
}

// Ensure IP details are retrieved properly before storing in session
if (!isset($_SESSION['ip'])) {
    $_SESSION['ip'] = $ip;
    $_SESSION['ipType'] = $ipType ?? 'Normal'; // Default to Normal if not set
    $_SESSION['city'] = $city ?? 'Unknown';
    $_SESSION['region'] = $region ?? 'Unknown';
    $_SESSION['countryFullName'] = $countryFullName ?? 'Unknown';
}

// ✅ Load excluded IPs from file
$excludedIpsFile = __DIR__ . "/Logging-Dashboard/Valid-Visitor-Logs/excluded-ips.txt";
$excludedIps = file_exists($excludedIpsFile) ? file($excludedIpsFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) : [];

$visitorIp = $_SESSION['ip'] ?? '';

// ✅ Check if visitor IP matches any pattern in the excluded list
foreach ($excludedIps as $excludedIp) {
    if (strpos($visitorIp, trim($excludedIp)) === 0) { // ✅ Check if IP starts with excluded IP
        return; // ❌ Skip logging this visitor
    }
}

// ✅ Define paths
$logFile = __DIR__ . "/Logging-Dashboard/Valid-Visitor-Logs/valid-visitors.log";
$blockedSubmissionLog = __DIR__ . "/Logging-Dashboard/Valid-Visitor-Logs/blocked-form-submission.log";
$currentPage = basename($_SERVER['PHP_SELF'], ".php");

// ✅ Convert timestamps to MST
date_default_timezone_set('America/Denver');
$date = date('F j, Y g:i A');

// ✅ Track Referrer
$_SESSION['referrer'] = $_SESSION['referrer'] ?? ($_SERVER['HTTP_REFERER'] ?? 'Direct Visit');

// ✅ Track pages visited
$currentPage = basename($_SERVER['PHP_SELF'], ".php");

if ($currentPage === "index") {
    $currentPage = "Home"; // ✅ Rename index to Home
}

// ✅ Ensure pages are tracked, but exclude valid-visitor-tracker
if ($currentPage !== "valid-visitor-tracker" && !in_array($currentPage, $_SESSION['pages_visited'])) {
    $_SESSION['pages_visited'][] = $currentPage;
}

// ✅ Function to check if the visitor had a blocked submission
function wasBlockedSubmission($ip) {
    global $blockedSubmissionLog;

    if (!file_exists($blockedSubmissionLog)) {
        return false; // No log, no blocks
    }

    $lastLines = array_slice(file($blockedSubmissionLog, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES), -5); // ✅ Check last 5 entries

    if (in_array($ip, $lastLines)) {
        return true;
    } else {
        return false;
    }
}


// ✅ Handle session timeout & log visitor
$sessionTimeout = 120; // 2 minutes for testing

if (isset($_SESSION['visitor_start_time']) && (time() - $_SESSION['visitor_start_time']) > $sessionTimeout) {
    if (!wasBlockedSubmission($_SESSION['ip'])) {
        logValidVisitor(); // ✅ Log the visit if NOT blocked
    }

    // ✅ Ensure session is only destroyed AFTER logging attempt
    session_unset();
    session_destroy();
}



// ✅ Function to log the valid visitor
function logValidVisitor() {
    global $logFile, $date, $sessionTimeout;

    if (!isset($_SESSION['visitor_start_time'])) {
        return;
    }

    // ✅ Calculate visit time
    $totalTime = time() - $_SESSION['visitor_start_time'];
    $totalTime -= $sessionTimeout;
    if ($totalTime < 0) $totalTime = 0;

    // ✅ Ensure required session data exists before logging
    if (!isset($_SESSION['pages_visited'])) {
        $_SESSION['pages_visited'] = [];
    }

    // ✅ Format log entry
    $pagesVisited = implode(', ', $_SESSION['pages_visited']);
    $logEntry = "$date | $pagesVisited | " . gmdate("i:s", $totalTime) . " | {$_SESSION['ip']} | {$_SESSION['ipType']} | {$_SESSION['city']} | {$_SESSION['region']} | {$_SESSION['countryFullName']} | {$_SESSION['referrer']}" . PHP_EOL;
    
    $result = file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

    session_unset();
    session_destroy();
}
?>
