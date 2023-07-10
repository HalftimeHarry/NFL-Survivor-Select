import { render } from '@testing-library/svelte';
import ExampleComponent from '/workspace/NFL-Survivor-Select/frontend/src/lib/components/ExampleComponent.svelte';

describe('ExampleComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(ExampleComponent);
    expect(getByText('Hello, World!')).toBeInTheDocument();
  });

  it('increments the count on button click', async () => {
    const { getByRole } = render(ExampleComponent);
    const button = getByRole('button');
    const countDisplay = getByRole('heading', { name: /count:/i });

    expect(countDisplay).toHaveTextContent('Count: 0');

    // Simulate button click
    await button.click();

    expect(countDisplay).toHaveTextContent('Count: 1');
  });
});
