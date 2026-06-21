# EcoSphere - Interactive Carbon Ledger & Impact Simulator

EcoSphere is a premium, single-page web application designed to help individuals track their daily carbon footprint, run real-time ecological simulations, and commit to sustainability challenges.

## 🚀 Features

- **Dynamic Emission Gauge**: Visually tracks daily carbon score in kg CO₂e using animated SVG indicators and dynamically colors status alerts (Low, Average, High).
- **Interactive Live Simulator**: Real-time range sliders let you adjust weekly habits (driving, flying, clean energy, diets, waste) and project immediate annual footprint metrics compared against target averages.
- **Eco Action Sandbox**: Clickable action cards allow users to toggle commitments (e.g. transitioning to electric mobility, smart LED retrofitting, rooftop solar harvesting) to see instant simulated yearly savings.
- **Green Canopy Offset**: A live forest equivalency calculator that converts carbon savings from committed habits into equivalent mature trees saved per year.
- **Interactive Logging Drawer**: Sliding daily input modal calculates transport, food, electricity, and waste metrics, updating dashboard trends instantly.
- **Gamified Achievements**: Unlocking green badges with dynamic particle effects.
- **Local Persistence**: Saves all logged days and committed habits inside your browser's `localStorage` using isolated namespaces.

## 🛠️ Technology Stack

- **Core Structure**: HTML5 Semantic Markup
- **Styling**: Vanilla CSS3 (Custom Glassmorphism, HSL variables, fluid layout, micro-animations)
- **Logic**: Vanilla JavaScript
- **Libraries**:
  - [Chart.js](https://www.chartjs.org/) (Data visualization & trends)
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

### LIVE Link: (https://neelu741.github.io/hack2skill/)

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
