if (!window.twitterUnfollower) {
    window.twitterUnfollower = {
        state: {
            isRunning: false,
            totalUnfollowedInSession: 0,
            processedUsernames: new Set(),
            maxUnfollowsPerBatch: 200,
            waitAfterBatchSeconds: 30,
            jitterMinMs: 500,
            jitterMaxMs: 1500,
            filters: {
                notVerified: true,
                notFollowingYou: true
            }
        },

        async unfollowSingleUser(user) {
            const followingButton = user.element.querySelector('button[data-testid*="unfollow"]');
            if (followingButton) {
                followingButton.click();
                await new Promise(resolve => setTimeout(resolve, 200));

                const confirmButton = document.querySelector('button[data-testid="confirmationSheetConfirm"]');
                if (confirmButton) {
                    confirmButton.click();
                }

                const jitter = Math.random() * (this.state.jitterMaxMs - this.state.jitterMinMs) + this.state.jitterMinMs;
                await new Promise(resolve => setTimeout(resolve, jitter));

                if(user.element) {
                    user.element.style.backgroundColor = '#4a0e0e';
                    user.element.style.transition = 'opacity 1s ease-out';
                    user.element.style.opacity = '0';
                }
            }
        },

        async startUnfollowingProcess() {
            this.state.isRunning = true;
            this.state.totalUnfollowedInSession = 0;
            this.state.processedUsernames.clear();
            console.log("Starting unfollowing process with filters:", this.state.filters);

            while (this.state.isRunning) {
                let currentBatchCount = 0;

                while (this.state.isRunning && currentBatchCount < this.state.maxUnfollowsPerBatch) {
                    const rateLimitModal = document.querySelector('div[role="dialog"]');
                    if (rateLimitModal && rateLimitModal.innerText.includes("try again later")) {
                        console.log("Rate limit modal detected. Stopping.");
                        chrome.runtime.sendMessage({ action: "rateLimitHit" });
                        this.state.isRunning = false;
                        break;
                    }

                    const userElements = document.querySelectorAll('div[data-testid="cellInnerDiv"]');
                    let newUsersOnScreen = false;

                    for (const el of userElements) {
                        if (!this.state.isRunning || currentBatchCount >= this.state.maxUnfollowsPerBatch) break;

                        const userLink = el.querySelector('a[href^="/"]');
                        if (!userLink) continue;
                        const username = userLink.href.split('/').pop();

                        if (this.state.processedUsernames.has(username)) continue;
                        
                        newUsersOnScreen = true;
                        this.state.processedUsernames.add(username);

                        const user = {
                            username: username,
                            isVerified: el.querySelector('svg[aria-label="Verified account"]') !== null,
                            followsYou: Array.from(el.querySelectorAll('span')).some(span => span.textContent.includes('Follows you')),
                            element: el
                        };

                        const shouldUnfollowNotVerified = this.state.filters.notVerified && !user.isVerified;
                        const shouldUnfollowNotFollowing = this.state.filters.notFollowingYou && !user.followsYou;

                        let shouldUnfollow = false;
                        if (this.state.filters.notVerified && this.state.filters.notFollowingYou) {
                            shouldUnfollow = shouldUnfollowNotVerified && shouldUnfollowNotFollowing;
                        } else if (this.state.filters.notVerified) {
                            shouldUnfollow = shouldUnfollowNotVerified;
                        } else if (this.state.filters.notFollowingYou) {
                            shouldUnfollow = shouldUnfollowNotFollowing;
                        }

                        if (shouldUnfollow) {
                            await this.unfollowSingleUser(user);
                            currentBatchCount++;
                            this.state.totalUnfollowedInSession++;
                            chrome.runtime.sendMessage({ action: "updateCount", count: this.state.totalUnfollowedInSession });
                        }
                    }

                    if (!this.state.isRunning) break;

                    if (!newUsersOnScreen) {
                        console.log("No new users found on screen. Ending process.");
                        this.state.isRunning = false;
                        break;
                    }

                    window.scrollBy(0, window.innerHeight);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                if (this.state.isRunning) {
                    console.log(`Batch limit reached. Waiting ${this.state.waitAfterBatchSeconds} seconds.`);
                    chrome.runtime.sendMessage({ action: "updateStatus", status: `Waiting for ${this.state.waitAfterBatchSeconds}s...` });
                    
                    await new Promise(resolve => setTimeout(resolve, this.state.waitAfterBatchSeconds * 1000));

                    if (this.state.isRunning) {
                        console.log("Resuming unfollowing process.");
                        chrome.runtime.sendMessage({ action: "updateStatus", status: "Running..." });
                    }
                }
            }

            console.log("Unfollowing process finished.");
            chrome.runtime.sendMessage({ action: "unfollowProcessFinished", reason: "complete" });
        },

        listen() {
            chrome.runtime.onMessage.addListener((request) => {
                if (request.action === "startUnfollowing") {
                    if (!this.state.isRunning) {
                        this.state.filters = request.filters;
                        this.startUnfollowingProcess();
                    }
                } else if (request.action === "stopUnfollowing") {
                    this.state.isRunning = false;
                }
            });
        }
    };

    window.twitterUnfollower.listen();
}
