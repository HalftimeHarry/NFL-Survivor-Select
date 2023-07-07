<script>
	import { crossfade, fade, fly } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import EthersProvider from '/workspace/NFL-Survivor-Select/frontend/src/lib/providers/ethersProvider';
	import entryController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/EntryController';
	import poolMasterController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/PoolMasterController';
	import poolRewardsManagerController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/PoolRewardsManagerController';
	import { onMount } from 'svelte';

	onMount(async () => {
		await entryController.init(1);
		await poolMasterController.init(1); // These are hardcoded for testing
		await poolMasterController.init(1);
		await poolRewardsManagerController.init();
	});

	const entryStore = entryController.entryStore;
	const poolMasterStore = poolMasterController.poolMasterStore;
	const poolRewardsManagerStore = poolRewardsManagerController.poolRewardsManagerStore;

	$: ({ entryOwner, totalSupply, nfts } = $entryStore);

	$: ({ deployer, participant } = $poolMasterStore);

	$: ({ poolMaster, totalEntries, totalActiveEntries, rewardPool } = $poolRewardsManagerStore);

	const ethersProvider = new EthersProvider();
</script>

<section class="container mx-auto ml-auto">
	<div>
		Entry Owner: {entryOwner}
	</div>
	<div>
		Total Supply: {totalSupply}
	</div>
	<div>
		Deployer: {deployer}
	</div>
	<div>
		Participant: {participant}
	</div>
	<div>
		Pool Master: {poolMaster}
	</div>
	<div>
		Total Entries: {totalEntries}
	</div>
	<div>
		Total Active Entries: {totalActiveEntries}
	</div>
	<div>
		Reward Pool: {rewardPool}
	</div>
</section>
