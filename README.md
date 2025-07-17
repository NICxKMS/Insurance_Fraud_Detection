<div align="center">
  <img src="https://raw.githubusercontent.com/NICxKMS/Insurance_Fraud_Detection/main/images/hero-image.png" alt="FraudShield Logo" width="150">
  <h1 align="center">FraudShield Frontend</h1>
  <p align="center">
    <i>A stunning and intuitive frontend for the FraudShield insurance fraud detection system. This interface is engineered for real-time analysis and dynamic visualization of claim data, providing an unparalleled user experience.</i>
  </p>
  <!-- Badges -->
  <p align="center">
    <a href="https://github.com/NICxKMS/Insurance_Fraud_Detection/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/NICxKMS/Insurance_Fraud_Detection?style=for-the-badge" alt="License">
    </a>
    <a href="https://github.com/NICxKMS/Insurance_Fraud_Detection/actions/workflows/static.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/NICxKMS/Insurance_Fraud_Detection/static.yml?branch=main&style=for-the-badge" alt="CI/CD Status">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg?style=for-the-badge" alt="Version">
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/Maintained-Yes-green.svg?style=for-the-badge" alt="Maintained">
    </a>
  </p>
</div>

---

## 🚀 Live Demo

A live demo of the project is not available at this time.

---

---

## ✨ Features

- **Real-Time Fraud Analysis**: Get instant predictions on insurance claims with our high-performance machine learning model.
- **Interactive & Responsive UI**: A modern, single-page application with a user-friendly interface that looks great on all devices.
- **Detailed Risk Factors**: Understand the "why" behind each prediction with a clear, color-coded breakdown of contributing risk factors.
- **Secure API Integration**: Seamlessly connects to a robust backend API for secure and efficient data processing.
- **Elegant Dark Mode**: A beautifully designed dark mode for a comfortable viewing experience in low-light conditions.
- **Engaging Animations**: Smooth and subtle animations using the AOS library to enhance the user experience.
- **Comprehensive Claim Form**: A multi-tab form that intelligently guides the user through the claim submission process.

---

## 🛠️ Technologies Used

### Frontend
- **HTML5**: For structuring the web content.
- **CSS3**: For styling the user interface.
- **JavaScript (ES6)**: For application logic and interactivity.
- **Google Fonts & Font Awesome**: For typography and icons.
- **AOS (Animate On Scroll)**: For engaging scroll animations.

### Development
- **Node.js**: For running build scripts.
- **Python**: For the local development server.
- **Clean-CSS & UglifyJS**: For code minification and optimization.

### Deployment
- **GitHub Actions**: For automated CI/CD and deployment to GitHub Pages.

---

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- **Node.js**: Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/en/).
- **Python**: Ensure Python is installed on your system. You can download it from [python.org](https://www.python.org/downloads/).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NICxKMS/Insurance_Fraud_Detection.git
   cd Insurance_Fraud_Detection
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   This command starts a local server at `http://localhost:8000`.

---

## 🚀 Deployment

This project is set up for automatic deployment to GitHub Pages whenever changes are pushed to the `main` branch.

### Manual Deployment

For manual deployment, follow these steps:

1. **Configure the API URL:**
   In `js/app.js`, update the `API_BASE_URL` constant to point to your production API endpoint.

2. **Build for production:**
   ```bash
   npm run build:prod
   ```
   This script will minify the CSS and JavaScript files and prepare them for production.

3. **Deploy the files:**
   Upload the contents of the repository to your hosting provider.

---

## 📂 Project Structure

The project follows a standard structure for a static web application:

```
Insurance_Fraud_Detection/
├── .github/
│   └── workflows/
│       └── static.yml        # CI/CD workflow for GitHub Pages deployment
├── css/
│   ├── styles.css            # Main stylesheet for the application
│   └── dark-mode.css         # Styles specifically for the dark mode theme
├── images/
│   └── hero-image.png        # Hero image displayed on the landing page
├── js/
│   ├── app.js                # Core application logic, event handling, and state management
│   ├── api.js                # Handles all communication with the backend API
│   ├── ui.js                 # Functions for manipulating the DOM and updating the UI
│   └── utils.js              # Utility functions and helpers
├── .gitignore                # Specifies intentionally untracked files to ignore
├── build.js                  # Node.js script for minifying CSS and JavaScript files
├── index.html                # The main HTML file for the single-page application
├── LICENSE                   # The MIT License file
├── package.json              # Project metadata and script definitions
└── README.md                 # This file!
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### How to Contribute

1. **Fork the Project**
2. **Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the Branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms.

### Bug Reports

If you find a bug, please open an issue on GitHub and provide a clear description of the issue, including steps to reproduce it.

---

## 📜 License

This project is distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  <a href="https://github.com/NICxKMS/Insurance_Fraud_Detection/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/NICxKMS/Insurance_Fraud_Detection?style=for-the-badge" alt="License">
  </a>
</p>

---

<p align="center">
  Developed by Nikhil Kumar
</p>