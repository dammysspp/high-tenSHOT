# War.io - Jetpack Arena Shooter (Serverless Multiplayer)

A fast-paced, jetpack-fueled multiplayer shooter inspired by classic arena games. Now with **Serverless Multiplayer**!

## 🚀 Deployment Guide

This project is fully serverless and can be hosted for FREE on GitHub Pages or Vercel.

### 1. Host on Vercel / GitHub
- Push this repository to GitHub.
- Import the project into **Vercel** or enable **GitHub Pages**.
- No backend configuration is needed! The game uses **PeerJS** for direct browser-to-browser communication.

### 2. How to Play Multiplayer
1. **Host a Game**: Click **MULTIPLAYER** -> **CREATE ROOM**. You will receive a unique Room ID.
2. **Join a Game**: Share your Room ID with a friend. They click **MULTIPLAYER**, paste the ID into the box, and click **JOIN**.
3. **Start**: Once everyone is in the lobby, the Host can click **START MATCH**.

---

## 🛠️ Local Development

1. Simply open `index.html` in any modern web browser.
2. To test multiplayer locally, open `index.html` in two different browser tabs.

---

## 🎮 Controls
- **WASD**: Move / Jetpack
- **Mouse**: Aim & Shoot
- **G / Right Click**: Throw Grenade
- **R**: Reload
- **E**: Pickup Weapon
- **- / =**: Zoom Camera

## 🏗️ Technical Details
- **Frontend**: Vanilla JavaScript + HTML5 Canvas
- **Multiplayer**: PeerJS (WebRTC) for peer-to-peer data synchronization.
- **Physics**: Custom 2D physics engine with platform collisions and projectile ballistics.
