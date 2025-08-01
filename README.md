# Twitter/X Unfollow Extension

This is a simple, for-personal-use Chrome extension to help manage your Twitter/X "Following" list by automatically unfollowing accounts based on selected criteria.

## Features

We built this extension iteratively, adding features as we went. Here's a summary of what it can do:

- **Selective Unfollowing**: The popup UI allows you to choose your unfollow criteria. You can unfollow users if they:
    - Aren't verified.
    - Don't follow you back.
    - Or any combination of the two.
- **Automated & Continuous Operation**: The script works in a continuous loop:
    1.  It unfollows up to 200 users in a batch.
    2.  It then pauses for a 30-second cooldown period to appear more human.
    3.  It automatically resumes the process after the cooldown.
    This continues until it reaches the end of your following list or you manually stop it.
- **Safe & Human-like Automation**:
    - **Jittered Delay**: A randomized delay (0.5s - 1.5s) between each unfollow action helps mimic human speed.
    - **Rate-Limit Detection**: The script attempts to detect and automatically pause if it receives a "try again later" message from Twitter/X.
- **Dynamic Page Handling**: Instead of trying to load thousands of users at once, the script intelligently scrolls the page, processing only the users currently visible before scrolling again. This makes it compatible with modern, infinitely-scrolling web apps like X.com.
- **Real-time Control & Feedback**:
    - Start and stop the process at any time from the popup.
    - The popup displays the current status (Running, Waiting, Finished) and a live count of unfollowed users.

## How to Install and Use

Since this is an unpacked extension, you can load it directly from the source code.

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  In the top-right corner, turn on the **Developer mode** toggle.
3.  Click the **Load unpacked** button that appears.
4.  In the file selection dialog, choose the entire `twitter-unfollow` project folder.
5.  The extension icon will appear in your Chrome toolbar. Navigate to your Twitter/X "Following" page, click the icon, select your filters, and click "Start".
