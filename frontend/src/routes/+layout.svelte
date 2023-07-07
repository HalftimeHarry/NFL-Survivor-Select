<script>
	import '$lib/global.css';
	import { onMount } from 'svelte';
	import Navbar from '/workspace/NFL-Survivor-Select/frontend/src/lib/components/Navbar.svelte';
	import MetamaskController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/MetamaskController';
	import navbarController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/NavbarController';

	const onChainChanged = (chainId) => {
		chainId = parseInt(chainId, 16);
		MetamaskController.networkChanged(chainId);
	};

	const { store } = MetamaskController;
	const { nav_store } = navbarController;

	onMount(async () => {
		await MetamaskController.init();
		await navbarController.init();
		if ($store.isMetamaskInstalled) {
			window.ethereum.on('chainChanged', onChainChanged);
		}
	});

	$: ({ address, balance } = $nav_store);

	$: ({ isConneted, isWrongNetwork, isMetamaskInstalled, message, isLocked } = $store);
</script>

<div class="app">
	<Navbar {address} {balance} />
	<div class="bg-black">
		<header />
		<main>
			{#if isConneted}
				<slot />
			{:else if isWrongNetwork}
				<p>Wrong network connected</p>
			{:else if isMetamaskInstalled}
				<p>{message}</p>
			{:else if isLocked}
				<p>Please unlock your account</p>
			{:else}
				<p>Loading...</p>
			{/if}
		</main>
		<footer class="bg-gray-800 py-4">
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div class="flex justify-between">
					<div class="text-gray-400">LMS Demo © 2023</div>
					<div>
						<a href="/privacy" class="text-gray-400 hover:text-white"> Privacy Policy </a>
						<span class="text-gray-400 mx-2">|</span>
						<a href="/terms" class="text-gray-400 hover:text-white"> Terms of Use </a>
					</div>
				</div>
			</div>
		</footer>
	</div>
</div>

<style global lang="postcss">
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	.app {
		/* Add your custom styles here */
	}

	.bg-black {
		/* Add your custom styles here */
	}

	/* Add more custom styles as needed */
</style>
