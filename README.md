# EcoImpact - Carbon Footprint Tracker & Interactive Insights

EcoImpact is a premium, highly interactive single-page web application designed to help individuals track their daily carbon footprint, simulate eco-friendly lifestyle changes in real-time, and commit to sustainability habits.

## 🚀 Features

- **Dynamic Emission Gauge**: Visually tracks daily carbon score in kg CO₂e using animated SVG indicators and dynamically colors status alerts (Low, Average, High).
- **Interactive Live Simulator**: Real-time range sliders let you adjust weekly habits (driving, flying, clean energy, diets, waste) and project immediate annual footprint metrics compared against target averages.
- **Eco Action Sandbox**: Clickable action cards allow users to toggle commitments (e.g. going vegetarian, biking, upgrading to solar) to see instant simulated yearly savings.
- **Interactive Logging Drawer**: Sliding daily input modal calculates transport, food, electricity, and waste metrics, updating dashboard trends instantly.
- **Gamified Achievements**: Unlocking green badges with dynamic particle effects.
- **Local Persistence**: Saves all logged days and committed habits inside your browser's `localStorage`.

## 🛠️ Technology Stack

- **Core Structure**: HTML5 Semantic Markup
- **Styling**: Vanilla CSS3 (Custom Glassmorphism, animations, HSL variables, fluid layout)
- **Logic**: Vanilla JavaScript
- **Libraries**:
  - [Chart.js](https://www.chartjs.org/) (Data visualization & graphs)
  - [Lucide Icons](https://lucide.dev/) (Crisp vector icons)

## 💻 How to Run Locally

Since this is a static Single Page Application (SPA), you can run it using any simple local server:

### Option A: Using Python (Recommended)
Open your terminal inside the project directory and run:
```bash
python -m http.server 8000
```
Then visit **`http://localhost:8000`** in your browser.

### Option B: Double-click index.html
Simply navigate to the project directory and double-click the **`index.html`** file to open it directly in your browser.

### LIVE Link: (https://neelu741.github.io/hack2skill/)(Click)

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
