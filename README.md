# Elbilkalkulator

This project is a Svelte application that allows users to compare the cost of using fuel (gasoline or diesel) versus electricity for their vehicles. The application fetches real-time fuel and electricity prices from APIs and performs calculations based on user inputs such as fuel type, fuel consumption per kilometer, and energy consumption per kilometer.

## Features

- Fetches real-time fuel prices from the SSB API.
- Fetches real-time electricity prices from the "Hva Koster Strømmen" API.
- Allows users to select their fuel type (gasoline or diesel).
- Allows users to input their vehicle's fuel consumption per kilometer.
- Allows users to input their vehicle's energy consumption per kilometer.
- Calculates and displays the cost per kilometer for both fuel and electricity.
- Determines which energy source is currently cheaper for the user.

## Project Structure

The project is divided into several Svelte components for better maintainability and readability:

- `Switch.svelte`: A reusable switch component for selecting the fuel type.
- `FuelCard.svelte`: Handles the fuel-related inputs and calculations.
- `ElectricityCard.svelte`: Handles the electricity-related inputs and calculations.
- `ComparisonCard.svelte`: Handles the comparison between fuel and electricity costs.

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/username/project.git`
2. Navigate into the project directory: `cd project`
3. Install the dependencies: `npm install`
4. Start the development server: `npm run dev`

Open [http://localhost:5000](http://localhost:5000) to view the application in your browser.

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.