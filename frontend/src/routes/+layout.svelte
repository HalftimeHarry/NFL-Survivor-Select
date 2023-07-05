<script lang="ts">
	// The ordering of these imports is critical to your app working properly
	import '@skeletonlabs/skeleton/themes/theme-crimson.css';
	// If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
	import '@skeletonlabs/skeleton/styles/all.css';
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import MetamaskController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/MetamaskController';
	import { onMount } from 'svelte';
	import navbarController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/NavbarController';

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

	let address: string | any[] | null = null;
	let balance: any;

	async function connect() {
		await MetamaskController.init();
	}

	function onChainChanged(arg0: string, onChainChanged: any) {
		throw new Error('Function not implemented.');
	}
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar
			{balance}
			gridColumns="grid-cols-3"
			slotDefault="place-self-center"
			slotTrail="place-content-end"
		>
			<svelte:fragment slot="lead">{balance}</svelte:fragment>
			<h2>NFL Survivor Select</h2>
			<svelte:fragment slot="trail">
				<button on:click={connect} type="button" class="btn variant-filled">
					{address ? `${address.slice(0, 5)}...${address.slice(-4)}` : 'Connect'}
				</button>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	{#if isConneted}
		<p>Connected! With address {address}</p>
	{:else if isWrongNetwork}
		<p>Wrong network connected</p>
	{:else if isMetamaskInstalled}
		<p>{message}</p>
	{:else if isLocked}
		<p>Please unlock your account</p>
	{:else}
		<p>Loading...</p>
	{/if}
	<slot />
</AppShell>
