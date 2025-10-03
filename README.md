# 🕹️ Gyroscope Controller & Game - Roel
> Project Status: Concluded ✔️

---

### Table of Contents

* [Project Description](#project-description)
* [Application Demo](#application-demo)
* [Features](#-features)
* [Technologies Used](#️-technologies-used)
* [How to Run the Project Locally](#️-how-to-run-the-project-locally)
* [Core Focus: Motion Control](#-core-focus-motion-control-system)
* [Author](#-author)

---

### Project Description

<p align="center">
This project is a mobile application developed with **React Native** and **Expo** that serves as a demonstration and exploration of the device's **Gyroscope sensor**. It features several screens to showcase different applications of motion data, culminating in a simple, fun, motion-controlled game: **Orb Collector**.
</p>

---

### Application Demo

<p align="center">
<img src="link-to-your-gif-or-video.gif" alt="App Demonstration" width="300"/>
</p>

---

### 🚀 Features

* **Raw Sensor Reading:** Dedicated screen to display real-time, raw data ($x, y, z$) from the gyroscope, ideal for debugging and understanding motion physics.
* **Floating Orb Simulation:** A physics simulation where the device's tilt directly controls the movement and velocity of an object (orb) on the screen.
* **Orb Collector Game:** A time-based game where the user must navigate the player object using the gyroscope to "collect" target orbs before the timer runs out.
* **Score and High Score Tracking:** Tracks the player's score and determines if they beat the target score.
* **Sound and Haptics Feedback:** Uses `expo-av` and `expo-haptics` to provide tactile and audio feedback during the game.

---

### 🛠️ Technologies Used

* [**React Native**](https://reactnative.dev/) (Core framework for mobile development)
* [**Expo**](https://expo.dev/) (Managed workflow, tooling, and build platform)
* [**TypeScript**](https://www.typescriptlang.org/) (For static typing and reliable code structure)
* **`expo-sensors`** (API for accessing device gyroscope data)
* **`expo-router`** (For file-based navigation between demo screens)
* **`expo-av` & `expo-haptics`** (For media and tactile feedback)

---

### ⚙️ How to Run the Project Locally

```bash
# 1. Clone the repository
$ git clone [link-to-your-repository]

# 2. Navigate to the project directory
$ cd gyroscope-app

# 3. Install dependencies
$ npm install

# 4. Start the development server
$ npm start