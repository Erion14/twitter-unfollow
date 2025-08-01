document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const statusText = document.getElementById('status-text');
    const unfollowCount = document.getElementById('unfollow-count');
    const filterNotVerified = document.getElementById('filter-not-verified');
    const filterNotFollowingYou = document.getElementById('filter-not-following-you');

    startBtn.addEventListener('click', () => {
        const filters = {
            notVerified: filterNotVerified.checked,
            notFollowingYou: filterNotFollowingYou.checked
        };

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.scripting.executeScript({
                target: {tabId: tabs[0].id},
                files: ['content/scanner.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, {action: "startUnfollowing", filters: filters});
                statusText.textContent = 'Running...';
                startBtn.style.display = 'none';
                stopBtn.style.display = 'block';
                unfollowCount.textContent = '0';
            });
        });
    });

    stopBtn.addEventListener('click', () => {
         chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: "stopUnfollowing"});
            statusText.textContent = 'Stopped';
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        });
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "updateCount") {
            unfollowCount.textContent = request.count;
        }
        
        if (request.action === "updateStatus") {
            statusText.textContent = request.status;
        }
        
        if (request.action === "unfollowProcessFinished" || request.action === "rateLimitHit") {
            statusText.textContent = `Finished (${request.reason || 'rate limit'})`;
            startBtn.style.display = 'block';
            stopBtn.style.display = 'none';
        }
    });
});
