<script>
	// import welcome from '$lib/images/svelte-welcome.webp';
	// import welcome_fallback from '$lib/images/svelte-welcome.png';
	import Switch from './Switch.svelte';

	import { onMount } from 'svelte';

	/**
	 * @type {import('../types/ssb').APIResponse}}
	 */
	let fuelData;
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
	let energyPrice = 0;
	let gasolineLitersPerKm = 0.5;
	let whPerKm = 1.9;
	/**
	 * @type {string}
	 */
	let cheapestFuel;
	let { breakevenPrice, difference } = calculateBreakeven();

	let selectedArea = 'NO1';

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
		await fetchFuelPrices();
		await fetchEnergyPrices(selectedArea);
	});

	async function fetchFuelPrices() {
		const requestData = {
			query: [
				{
					code: 'Tid',
					selection: {
						filter: 'item',
						values: ['2023M10']
					}
				}
			],
			response: {
				format: 'json-stat2'
			}
		};

		const response = await fetch('https://data.ssb.no/api/v0/no/table/09654/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(requestData)
		});

		fuelData = await response.json();
	}

	$: {
		fuelPrice = fuelData?.value[fuelType === 'Bensin' ? 0 : 1];
		if (userInputFuelPrice === undefined) {
			userInputFuelPrice = fuelPrice;
		}
		cheapestFuel =
			(whPerKm * energyPrice).toFixed(2) < (gasolineLitersPerKm * fuelPrice).toFixed(2)
				? 'Strøm'
				: fuelType;
		({ breakevenPrice, difference } = calculateBreakeven());
		fetchEnergyPrices(selectedArea), selectedArea;
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
	}

	function calculateBreakeven() {
		const costPerKmFuel = gasolineLitersPerKm * fuelPrice;

		if (whPerKm === 0 || costPerKmFuel === 0) {
			return { breakevenPrice: 0, difference: 0 };
		}

		const breakevenPrice = costPerKmFuel / whPerKm;
		const difference = breakevenPrice - energyPrice;

		return { breakevenPrice, difference };
	}

	function handleChange() {
		userInputFuelPrice = fuelData?.value[fuelType === 'Bensin' ? 0 : 1];
	}
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section class="container">
	<div class="card">
		<br />
		<Switch
			on:change={handleChange}
			bind:value={fuelType}
			label=""
			design="multi"
			options={['Bensin', 'Diesel']}
		/>
		<p>Dagens {fuelType.toLowerCase()}pris</p>
		<input type="number" step=".01" bind:value={userInputFuelPrice} />

		<p>Hvor mye bruker bensinbilen per km?</p>
		<input type="number" step=".01" bind:value={gasolineLitersPerKm} />
		<p>
			En kilometer vil koste {(gasolineLitersPerKm * fuelPrice).toFixed(2)} kr med {fuelType.toLowerCase()}
		</p>
	</div>

	<div class="card">
		<p>Velg din strømregion</p>
		<select bind:value={selectedArea}>
			{#each areas as area (area.code)}
				<option value={area.code}>{area.name}</option>
			{/each}
		</select>
		<br />

		<input type="number" step=".01" bind:value={energyPrice} /> kr per kWh
		<br />

		<input type="number" step=".1" bind:value={whPerKm} /> Wh per km
		<p>En kilometer vil koste {(whPerKm * energyPrice).toFixed(2)} kr per km med strøm</p>
	</div>
</section>
<section class="lower-container">
	<div class="card">
		<p>I dag er det billist for deg å bruke {cheapestFuel.toLowerCase()}</p>

		<p>
			Forskjellen mellom strøm og {fuelType.toLowerCase()} er i dag {breakevenPrice.toFixed(2)} kr per
			kWh.
		</p>
		<p>For øyeblikket er prisen {difference.toFixed(2)} kr per kilometer fra å koste det samme.</p>
	</div>
</section>

<style>
	.container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 20px;
		padding: 20px;
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

	select,
	input {
		width: 50%;
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #ddd;
		margin-top: 10px;
	}
</style>
