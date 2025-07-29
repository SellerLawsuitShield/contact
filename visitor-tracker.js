let inactivityTime = 2 * 60 * 1000; // 2 minutes (for testing)
let timeout; 

function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(logVisitDueToInactivity, inactivityTime);
}

function logVisitDueToInactivity() {
    fetch("valid-visitor-tracker.php?timeout=1").catch(() => {});
}


// ✅ Listen for User Activity to Reset Timer
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keydown", resetTimer);
document.addEventListener("click", resetTimer);
document.addEventListener("scroll", resetTimer);

resetTimer(); // ✅ Start timer when page loads
