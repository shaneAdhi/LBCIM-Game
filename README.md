# 🎯 CIM Precision Scan Challenge

A fast-paced interactive web application built for the CIM event to test players' reflexes and timing.

## 🚀 Features
* **Real-time Precision Tracking:** Calculates the exact pixel offset between the moving phone frame and the target QR code.
* **Dynamic Feedback:** Features a "Neon Green" glow effect when the player enters the "Optimal Scan Zone."
* **Persistent Leaderboard:** Automatically saves and ranks the Top 10 players based on accuracy using Browser LocalStorage.
* **EPF Validation:** Prevents duplicate entries by tracking EPF numbers and restricts input to numeric values only.
* **Dual-Attempt System:** Players get two chances to hit the perfect mark, with the second round featuring a speed boost for increased difficulty.

## 🛠️ Tech Stack
* **HTML5 / CSS3:** Custom iPhone-inspired UI and neon-line animations.
* **Vanilla JavaScript:** Game loop logic, collision/alignment detection, and data persistence.
* **LocalStorage API:** Stores leaderboards and participant logs locally without needing a backend database.

## 🎮 How to Play
1. Enter your **Full Name** and **EPF Number**.
2. Tap **Start Challenge**.
3. Watch the moving phone frame. When it aligns with the QR code, the border will glow **Neon Green**.
4. Tap **TAP TO PAY** to lock in your scan.
5. Aim for the lowest `px` offset to top the leaderboard!

## ⚙️ Admin Functions
* **Reset Data:** Double-click the "RESET ALL DATA" button at the bottom of the leaderboard to clear all scores and EPF logs for a new event session.
