<script>
	import Switch from '$lib/components/Switch.svelte';

	import { onMount } from 'svelte';

	/**
	 * @type {{ value: any; }}
	 */
	let fuelData;
	let standingChargeEnabled = false;
	let standingChargePrice = 0;
	/**
	 * @type {import('../types/energyprice').EnergyPrice[]}}
	 */
	let elData;
	let fuelType = 'Bensin';
	/**
	 * @type {number | undefined}
	 */
	let userInputFuelPrice = undefined;
	/**
	 * @type {number | undefined}
	 */
	let fuelPrice = undefined;
	/**
	 * @type {number | undefined}
	 */
	let userInputEnergyPrice = undefined;
	/**
	 * @type {number | undefined}
	 */
	let energyPrice = undefined;
	let gasolineLitersPerKm = 0.05;
	let whPerKm = 0.2;
	/**
	 * @type {string | undefined}
	 */
	let difference = undefined;
	/**
	 * @type {string}
	 */
	let cheapestFuel;

	let selectedArea = 'NO3';

	/**
	 * @type {import('../types/energyareas').EnergyArea[]}}
	 */
	const areas = [
		{ code: 'NO1', name: 'Oslo / Øst-Norge' },
		{ code: 'NO2', name: 'Kristiansand / Sør-Norge' },
		{ code: 'NO3', name: 'Trondheim / Midt-Norge' },
		{ code: 'NO4', name: 'Tromsø / Nord-Norge' },
		{ code: 'NO5', name: 'Bergen / Vest-Norge' }
	];

	onMount(async () => {
		fetchStations();
		fetchEnergyPrices(selectedArea);
		fetchStandingCharges();
	});

	async function fetchStations() {
		const response = await fetch(
			'https://api.drivstoffappen.no/api/stations?stationType=0&countryCode=NO',
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'X-API-KEY': '24ACBFDD74F54688B46D425104009AD9FC48CEBC-A',
					'User-Agent':
						'Drivstoffappen/1.3.8 (com.raskebiler.drivstoff.appen; build:130; iOS 15.2.1) Alamofire/5.4.4'
				}
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();
		calculateAveragePrice(data);
		return data;
	}

	/**
	 * @param {any[]} stations
	 */
	function calculateAveragePrice(stations) {
		let totalSumDiesel = 0;
		let totalCountDiesel = 0;
		let totalSumGasoline = 0;
		let totalCountGasoline = 0;

		stations.forEach((station) => {
			station.stationDetails.forEach((detail) => {
				if (detail.type === 'D') {
					totalSumDiesel += detail.price;
					totalCountDiesel += 1;
				} else if (detail.type === '95') {
					totalSumGasoline += detail.price;
					totalCountGasoline += 1;
				}
			});
		});
		fuelData = {
			value: [
				+(totalSumGasoline / totalCountGasoline).toFixed(2),
				+(totalSumDiesel / totalCountDiesel).toFixed(2)
			]
		};
	}

	$: {
		fuelPrice = fuelData?.value[fuelType === 'Bensin' ? 0 : 1];
		if (userInputFuelPrice === undefined) {
			userInputFuelPrice = fuelPrice;
		}
		if (userInputEnergyPrice === undefined) {
			userInputEnergyPrice = energyPrice;
		}
		cheapestFuel =
			whPerKm * (userInputEnergyPrice ?? 0) < gasolineLitersPerKm * userInputFuelPrice
				? 'Strøm'
				: fuelType;
		difference = calculateDifference();
	}

	/**
	 * @param {string} area
	 */
	async function fetchEnergyPrices(area) {
		const today = new Date();
		const year = today.getFullYear();
		const month = String(today.getMonth() + 1).padStart(2, '0'); // JS months are 0-based
		const day = String(today.getDate()).padStart(2, '0');

		const response = await fetch(
			`https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${area}.json`
		);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		elData = await response.json();
		const total = elData.reduce((sum, item) => sum + item.NOK_per_kWh, 0);
		energyPrice = +(total / elData.length).toFixed(2);

		return energyPrice;
	}

	async function fetchStandingCharges() {
		const now = new Date();
		let year = now.getFullYear();
		let quarter = Math.floor((now.getMonth() + 3) / 3);

		// Adjust year and quarter for the first quarter
		if (quarter === 1) {
			quarter = 4;
			year -= 1;
		} else {
			quarter -= 1;
		}

		const timeValue = `${year}K${quarter}`;
		const requestData = {
			query: [
				{
					code: 'ContentsCode',
					selection: {
						filter: 'item',
						values: ['KraftprisUA']
					}
				},
				{
					code: 'Tid',
					selection: {
						filter: 'item',
						values: [timeValue]
					}
				}
			],
			response: {
				format: 'json-stat2'
			}
		};
		const response = await fetch('https://data.ssb.no/api/v0/no/table/09387/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData)
		});
		standingChargePrice = +((await response.json()).value[0] / 100).toFixed(2);
	}

	function calculateDifference() {
		const difference = Math.abs(
			whPerKm * (userInputEnergyPrice ?? 0) - gasolineLitersPerKm * (userInputFuelPrice ?? 0)
		);
		return difference.toFixed(2);
	}

	/**
	 * @param {{ detail: string; }} event
	 */
	function handleFuelTypeChange(event) {
		userInputFuelPrice = fuelData?.value[event.detail === 'Bensin' ? 0 : 1];
	}

	/**
	 * @param {{ target: { value: any; }; }} event
	 */
	async function handleAreaChange(event) {
		// A bit of an ugly hack to avoid nettleie being added twice or removed twice
		const wasStandingChargeEnabled = standingChargeEnabled;
		if (wasStandingChargeEnabled) {
			standingChargeEnabled = false;
		}

		const selectedOptionCode = event.target.value;
		userInputEnergyPrice = await fetchEnergyPrices(selectedOptionCode);

		// Continue the hack
		if (wasStandingChargeEnabled) {
			standingChargeEnabled = true;
			handleStandingChargeChange();
		}
	}

	function handleStandingChargeChange() {
		if (standingChargeEnabled) {
			userInputEnergyPrice = +((userInputEnergyPrice ?? 0) + standingChargePrice).toFixed(2);
		} else {
			userInputEnergyPrice = +((userInputEnergyPrice ?? 0) - standingChargePrice).toFixed(2);
		}
	}
</script>

<svelte:head>
	<title>Elbilkalkulator</title>
	<meta name="description" content="Elbilkalkulator" />
</svelte:head>

<section class="container">
	<div class="card">
		<h2>Fossilbil</h2>
		<br />
		<Switch on:change={handleFuelTypeChange} bind:value={fuelType} options={['Bensin', 'Diesel']} />
		<p style="margin-bottom:0;">Dagens {fuelType.toLowerCase()}pris</p>
		<input type="number" step=".1" min="0" bind:value={userInputFuelPrice} /> kr

		<p style="margin-bottom:0;">Estimert forbruk av {fuelType.toLowerCase()}bilen per km</p>

		<input type="number" step=".01" min="0" bind:value={gasolineLitersPerKm} /> liter per km
		<p>
			En kilometer vil koste {(gasolineLitersPerKm * (userInputFuelPrice ?? 0)).toFixed(2)} kr med {fuelType.toLowerCase()}
		</p>
	</div>

	<div class="card">
		<h2>Elbil</h2>
		<p style="margin-bottom:0;">Velg din strømregion</p>
		<select on:change={handleAreaChange} bind:value={selectedArea}>
			{#each areas as area (area.code)}
				<option value={area.code}>{area.name}</option>
			{/each}
		</select>
		<br />
		<p style="margin-bottom:0;">Gjennomsnittlig pris per kWh</p>

		<input type="number" step=".1" min="0" bind:value={userInputEnergyPrice} /> kr per kWh
		<p style="margin-bottom:0;">Estimert strømforbruk på din elbil</p>

		<input type="number" min="0" step=".1" bind:value={whPerKm} /> kWh per km
		<p>
			En kilometer vil koste {(whPerKm * (userInputEnergyPrice ?? 0)).toFixed(2)} kr per km med strøm
		</p>
		<label>
			<input
				type="checkbox"
				bind:checked={standingChargeEnabled}
				on:change={handleStandingChargeChange}
			/>
			Legg til nettleie ({standingChargePrice} kr per kWh)
		</label>
	</div>
</section>
<section class="lower-container">
	<div class="card">
		<h2>Sammendrag</h2>
		<p>I dag er det billigst for deg å bruke <b>{cheapestFuel.toLowerCase()}</b></p>

		<p>
			Med denne utregningen er differansen {difference} kr mellom strøm og {fuelType.toLowerCase()} per
			km
		</p>

		<p></p>
	</div>
</section>

<style>
	.container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30px;
		padding: 20px;
	}

	@media (max-width: 768px) {
		.container {
			grid-template-columns: 1fr;
		}
	}

	.lower-container {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 20px;
		padding: 20px;
	}

	.card {
		padding: 20px;
		border-radius: 10px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		background-color: #f5f5f5;
	}

	h2 {
		margin-top: 5px;
		margin-bottom: 0;
		font-size: x-large;
	}

	select,
	input {
		/* width: 50%; */
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #ddd;
		margin-top: 10px;
	}
</style>
