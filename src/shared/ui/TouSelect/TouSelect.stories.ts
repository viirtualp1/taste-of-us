import type { Meta, StoryObj } from '@storybook/vue3'
import TouSelect from './TouSelect.vue'

const meta: Meta<typeof TouSelect> = {
  title: 'UI/TouSelect',
  component: TouSelect,
  tags: ['autodocs'],
  render: (args) => ({
    components: { TouSelect },
    setup: () => ({ args }),
    template: `
      <div class="max-w-sm">
        <TouSelect v-bind="args">
          <option value="brunch">Brunch</option>
          <option value="dinner">Dinner</option>
          <option value="dessert">Dessert</option>
        </TouSelect>
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
