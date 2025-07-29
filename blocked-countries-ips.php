<?php
// Load blocked countries and IPs
function loadBlockedCountriesAndIPs() {
    static $blocklist = [];
    $file = __DIR__ . "/Logging-Dashboard/Blocked-User-Logs/blocked_countries_ips.txt";
    if (!file_exists($file)) return $blocklist;

    $lines = file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        [$type, $value] = explode(':', $line, 2);
        $blocklist[trim($type)][] = trim($value);
    }
    return $blocklist;
}

$visitor_ip = $_SERVER['REMOTE_ADDR'];
$country = "Unknown";
$region = "Unknown";
$city = "Unknown";
$isProxy = "Unknown";

// IP-API call (pro tier)
$ipApiResponse = @file_get_contents("http://pro.ip-api.com/json/{$visitor_ip}?fields=country,regionName,city,proxy,status&key=RNraGZ4ub9516zy");
session_start();

if ($geoData && $geoData['status'] === 'success') {
    $country = $geoData['country'] ?? "Unknown";
    $region = $geoData['regionName'] ?? "Unknown";
    $city = $geoData['city'] ?? "Unknown";
    $isProxy = $geoData['proxy'] ? 'Proxy/VPN' : 'Normal';

    // Store in session for access in download-counter.php
    $_SESSION['countryFullName'] = $country;
    $_SESSION['region'] = $region;
    $_SESSION['city'] = $city;
    $_SESSION['proxy'] = $isProxy;
    $_SESSION['hosting'] = 'Unknown';
}

// ✅ Now that we have accurate values, log them
log_visit($visitor_ip, $country, $region, $city, $isProxy);

function log_visit($ip, $country, $region, $city, $proxy) {
    $log_entry = date("F j, Y, g:i a") . " | $ip | $proxy | $country | $region | $city\n";
    file_put_contents(__DIR__ . "/Logging-Dashboard/Download-Logs/ip-log.txt", $log_entry, FILE_APPEND);
}


$countryNames = [
    "AF" => "Afghanistan", "AL" => "Albania", "DZ" => "Algeria", "AS" => "American Samoa", "AD" => "Andorra",
    "AO" => "Angola", "AI" => "Anguilla", "AQ" => "Antarctica", "AG" => "Antigua and Barbuda", "AR" => "Argentina",
    "AM" => "Armenia", "AW" => "Aruba", "AU" => "Australia", "AT" => "Austria", "AZ" => "Azerbaijan",
    "BS" => "Bahamas", "BH" => "Bahrain", "BD" => "Bangladesh", "BB" => "Barbados", "BY" => "Belarus",
    "BE" => "Belgium", "BZ" => "Belize", "BJ" => "Benin", "BM" => "Bermuda", "BT" => "Bhutan",
    "BO" => "Bolivia", "BA" => "Bosnia and Herzegovina", "BW" => "Botswana", "BR" => "Brazil", "BN" => "Brunei",
    "BG" => "Bulgaria", "BF" => "Burkina Faso", "BI" => "Burundi", "KH" => "Cambodia", "CM" => "Cameroon",
    "CA" => "Canada", "CV" => "Cape Verde", "KY" => "Cayman Islands", "CF" => "Central African Republic",
    "TD" => "Chad", "CL" => "Chile", "CN" => "China", "CO" => "Colombia", "KM" => "Comoros",
    "CG" => "Congo", "CR" => "Costa Rica", "HR" => "Croatia", "CU" => "Cuba", "CY" => "Cyprus",
    "CZ" => "Czechia", "DK" => "Denmark", "DJ" => "Djibouti", "DM" => "Dominica", "DO" => "Dominican Republic",
    "EC" => "Ecuador", "EG" => "Egypt", "SV" => "El Salvador", "GQ" => "Equatorial Guinea", "ER" => "Eritrea",
    "EE" => "Estonia", "ET" => "Ethiopia", "FJ" => "Fiji", "FI" => "Finland", "FR" => "France", "GA" => "Gabon",
    "GM" => "Gambia", "GE" => "Georgia", "DE" => "Germany", "GH" => "Ghana", "GR" => "Greece", "GD" => "Grenada",
    "GT" => "Guatemala", "GN" => "Guinea", "GW" => "Guinea-Bissau", "GY" => "Guyana", "HT" => "Haiti",
    "HN" => "Honduras", "HK" => "Hong Kong", "HU" => "Hungary", "IS" => "Iceland", "IN" => "India",
    "ID" => "Indonesia", "IR" => "Iran", "IQ" => "Iraq", "IE" => "Ireland", "IL" => "Israel", "IT" => "Italy",
    "JM" => "Jamaica", "JP" => "Japan", "JO" => "Jordan", "KZ" => "Kazakhstan", "KE" => "Kenya",
    "KI" => "Kiribati", "KW" => "Kuwait", "KG" => "Kyrgyzstan", "LA" => "Laos", "LV" => "Latvia",
    "LB" => "Lebanon", "LS" => "Lesotho", "LR" => "Liberia", "LY" => "Libya", "LI" => "Liechtenstein",
    "LT" => "Lithuania", "LU" => "Luxembourg", "MO" => "Macao", "MK" => "North Macedonia", "MG" => "Madagascar",
    "MW" => "Malawi", "MY" => "Malaysia", "MV" => "Maldives", "ML" => "Mali", "MT" => "Malta", "MH" => "Marshall Islands",
    "MR" => "Mauritania", "MU" => "Mauritius", "MX" => "Mexico", "FM" => "Micronesia", "MD" => "Moldova",
    "MC" => "Monaco", "MN" => "Mongolia", "ME" => "Montenegro", "MA" => "Morocco", "MZ" => "Mozambique",
    "MM" => "Myanmar", "NA" => "Namibia", "NR" => "Nauru", "NP" => "Nepal", "NL" => "Netherlands",
    "NZ" => "New Zealand", "NI" => "Nicaragua", "NE" => "Niger", "NG" => "Nigeria", "NO" => "Norway",
    "OM" => "Oman", "PK" => "Pakistan", "PW" => "Palau", "PA" => "Panama", "PG" => "Papua New Guinea",
    "PY" => "Paraguay", "PE" => "Peru", "PH" => "Philippines", "PL" => "Poland", "PT" => "Portugal",
    "QA" => "Qatar", "RO" => "Romania", "RU" => "Russia", "RW" => "Rwanda", "WS" => "Samoa",
    "SM" => "San Marino", "ST" => "Sao Tome and Principe", "SA" => "Saudi Arabia", "SN" => "Senegal",
    "RS" => "Serbia", "SC" => "Seychelles", "SL" => "Sierra Leone", "SG" => "Singapore", "SK" => "Slovakia",
    "SI" => "Slovenia", "SO" => "Somalia", "ZA" => "South Africa", "KR" => "South Korea", "SS" => "South Sudan",
    "ES" => "Spain", "LK" => "Sri Lanka", "SD" => "Sudan", "SR" => "Suriname", "SE" => "Sweden",
    "CH" => "Switzerland", "SY" => "Syria", "TW" => "Taiwan", "TJ" => "Tajikistan", "TZ" => "Tanzania",
    "TH" => "Thailand", "TL" => "Timor-Leste", "TG" => "Togo", "TO" => "Tonga", "TT" => "Trinidad and Tobago",
    "TN" => "Tunisia", "TR" => "Turkey", "TM" => "Turkmenistan", "TV" => "Tuvalu", "UG" => "Uganda",
    "UA" => "Ukraine", "AE" => "United Arab Emirates", "GB" => "United Kingdom", "US" => "United States",
    "UY" => "Uruguay", "UZ" => "Uzbekistan", "VU" => "Vanuatu", "VA" => "Vatican City", "VE" => "Venezuela",
    "VN" => "Vietnam", "YE" => "Yemen", "ZM" => "Zambia", "ZW" => "Zimbabwe"
];

$countryFullName = $countryNames[$country] ?? $country;  // Convert to full country name

// Load blocked countries and IPs
$blockedList = loadBlockedCountriesAndIPs();

$isBlocked = false;
$reason = "";

// ✅ Check if the visitor's country is blocked
if (in_array($countryFullName, $blockedList['Country'] ?? [])) {
    $isBlocked = true;
    $reason = 'Blocked Country';
}

// ✅ Check if the visitor's IP is blocked (supports IP ranges)
foreach ($blockedList['IP'] ?? [] as $blockedIp) {
    $blockedIp = trim(str_replace("IP: ", "", $blockedIp)); // Remove "IP: " prefix
    if (strpos($ip, $blockedIp) === 0) { // Check if visitor IP starts with blocked IP
        $isBlocked = true;
        $reason = 'Blocked IP';
        break; // No need to check further once matched
    }
}

// ✅ If the visitor is blocked, log and redirect
if ($isBlocked) {
    // Log the redirect
    $logFile = __DIR__ . "/Logging-Dashboard/Blocked-User-Logs/blocked-users.log";
    $page = basename($_SERVER['PHP_SELF'], '.php');  // Get the current page name (without .php)

    if ($page === "index") {
        $page = "Home"; // ✅ Rename index to Home
    }

    date_default_timezone_set('America/Denver');
    $date = date('F j, Y g:i A');
    $logEntry = "$date | $page | Blocked | $reason | $ip | $ipType | $city | $region | $countryFullName" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);

    // Redirect to the under construction page
    header("Location: /under-construction.php");
    exit;
}

?>
