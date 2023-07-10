<script>
  let count = 0;

  function incrementCount() {
    count += 1;
  }
</script>

<main class="text-center p-4">
  <h1 class="text-2xl font-bold mb-2">Hello, World!</h1>
  <button class="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer" on:click={incrementCount}>
    Increment Count
  </button>
  <h2 class="text-xl mt-4">Count: {count}</h2>
</main>
