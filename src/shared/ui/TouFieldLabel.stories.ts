import type { Meta, StoryObj } from '@storybook/vue3'
import TouFieldLabel from './TouFieldLabel.vue'
import TouInput from './TouInput.vue'

const meta: Meta<typeof TouFieldLabel> = {
  title: 'UI/TouFieldLabel',
  component: TouFieldLabel,
  tags: ['autodocs'],
  render: () => ({
    components: { TouFieldLabel, TouInput },
    template: `
      <div class="max-w-sm">
        <TouFieldLabel for="example">Your Chat ID</TouFieldLabel>
        <TouInput id="example" class="w-full" placeholder="123456789" />
      </div>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
