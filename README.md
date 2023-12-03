# Elbilkalkulator

This project is a Svelte application that allows users to compare the cost of using fuel (gasoline or diesel) versus electricity for their vehicles. The application fetches real-time fuel and electricity prices from APIs and performs calculations based on user inputs such as fuel type, fuel consumption per kilometer, and energy consumption per kilometer.

[![Netlify Status](https://api.netlify.com/api/v1/badges/d57bfd76-8d98-499f-ba33-7c5771a323f0/deploy-status)](https://app.netlify.com/sites/celadon-custard-223aa6/deploys)

## Features

- Fetches real-time fuel prices from the SSB API.
- Fetches real-time electricity prices from the "Hva Koster Strømmen" API.
- Allows users to select their fuel type (gasoline or diesel).
- Allows users to input their vehicle's fuel consumption per kilometer.
- Allows users to input their vehicle's energy consumption per kilometer.
- Calculates and displays the cost per kilometer for both fuel and electricity.
- Determines which energy source is currently cheaper for the user.

## Project Structure

The project *will* be divided into several Svelte components for better maintainability and readability:

- `Switch.svelte`: A reusable switch component for selecting the fuel type.
- `FuelCard.svelte`: Handles the fuel-related inputs and calculations.
- `ElectricityCard.svelte`: Handles the electricity-related inputs and calculations.
- `ComparisonCard.svelte`: Handles the comparison between fuel and electricity costs.

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/jvik/elbilkalulator.git`
2. Navigate into the project directory: `cd elbilkalulator`
3. Install the dependencies: `npm install`
4. Start the development server: `npm run dev`

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.
