<script lang="ts">
	import { writable } from 'svelte/store';
	import { AppBar, AppShell } from '@skeletonlabs/skeleton';
	import MetamaskController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/MetamaskController';
	import { onMount } from 'svelte';

	const store = writable({
		isConneted: false,
		isWrongNetwork: false,
		isMetamaskInstalled: false,
		message: '',
		isLocked: false
	});

	const metamaskController = MetamaskController;

	onMount(async () => {
		await metamaskController.init(store);
	});

	async function connect() {
		await metamaskController.init(store);
	}

	$: ({ isConneted, isWrongNetwork, isMetamaskInstalled, message, isLocked } = $store);

	function onChainChanged(arg0: string, onChainChanged: any) {
		throw new Error('Function not implemented.');
	}
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar />
	</svelte:fragment>
	{#if isConneted}
		<p>Connected!</p>
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
