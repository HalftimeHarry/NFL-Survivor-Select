<script>
	import MetamaskController from '/workspace/NFL-Survivor-Select/frontend/src/lib/controllers/MetamaskController';

	export let address = null;
	export let balance;

	async function connect() {
		await MetamaskController.init();

		MetamaskController.store.subscribe(async (baseState) => {
			if (!baseState.isMetamaskInstalled) {
				console.log('MetaMask is not installed.');
				return;
			}
			if (!baseState.isConneted) {
				console.log('Connecting to MetaMask...');
				await window.ethereum.request({ method: 'eth_requestAccounts' });
			}
			if (baseState.isWrongNetwork) {
				console.log('Wrong network detected. Please switch to the correct network.');
				return;
			}
			console.log('MetaMask is connected and on the correct network.');
			// Allow user to interact with your dapp
		});
	}
</script>

<nav class="bg-black border-gray-200 px-2 sm:px-4 py-2.5 rounded dark:bg-gray-900">
	<div class="container flex flex-wrap items-center justify-between mx-auto">
		<a href="/" class="flex items-center">
			<img
				src="https://albatrossleague.com/wp-content/uploads/2022/10/albatros_horizontal-320x72.png"
				class="h-6 mr-3 sm:h-9"
				alt="Dulligan Logo"
			/>
			<span class="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
				{balance}
			</span>
		</a>
		<div class="flex md:order-2">
			<button
				type="button"
				class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				on:click={connect}
			>
				{address ? `${address.slice(0, 5)}...${address.slice(-4)}` : 'Connect'}
			</button>
			<button
				data-collapse-toggle="navbar-cta"
				type="button"
				class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
				aria-controls="navbar-cta"
				aria-expanded="false"
			>
				<span class="sr-only">Open main menu</span>
				<svg
					class="w-6 h-6"
					aria-hidden="true"
					fill="currentColor"
					viewBox="0 0 20 20"
					xmlns="http://www.w3.org/2000/svg"
					><path
						fill-rule="evenodd"
						d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
						clip-rule="evenodd"
					/></svg
				>
			</button>
		</div>
		<div
			class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
			id="navbar-cta"
		>
			<ul
				class="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700"
			>
				<li>
					<a
						href="/"
						class="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 dark:text-white"
						aria-current="page">Pick</a
					>
				</li>
				<li>
					<a
						href="/overview"
						class="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
						>Overview</a
					>
				</li>
				<li>
					<a
						href="/tip"
						class="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
						>Register your disk</a
					>
				</li>
				<li>
					<a
						href="/reset"
						class="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-white dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
						>Reset Address</a
					>
				</li>
			</ul>
		</div>
	</div>
</nav>
