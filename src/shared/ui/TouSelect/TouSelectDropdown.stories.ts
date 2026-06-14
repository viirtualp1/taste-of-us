import type { Meta, StoryObj } from '@storybook/vue3'
import TouSelectDropdown from './TouSelectDropdown.vue'

const meta: Meta<typeof TouSelectDropdown> = {
  title: 'UI/TouSelectDropdown',
  component: TouSelectDropdown,
  tags: ['autodocs'],
  args: {
    placeholder: 'Select a meal',
    options: [
      { value: 'brunch', label: 'Brunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'dessert', label: 'Dessert' },
    ],
  },
  render: (args) => ({
    components: { TouSelectDropdown },
    setup: () => ({ args }),
    template: `<div class="max-w-sm"><TouSelectDropdown v-bind="args" /></div>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = { args: { disabled: true } }
