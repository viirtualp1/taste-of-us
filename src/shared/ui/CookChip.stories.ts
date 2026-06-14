import type { Meta, StoryObj } from '@storybook/vue3'
import CookChip from './CookChip.vue'

const meta: Meta<typeof CookChip> = {
  title: 'UI/CookChip',
  component: CookChip,
  tags: ['autodocs'],
  argTypes: {
    selected: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { label: 'Me', selected: false },
  render: (args) => ({
    components: { CookChip },
    setup: () => ({ args }),
    template: `<div class="max-w-[160px]"><CookChip v-bind="args" /></div>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = { args: { selected: true } }

export const Group: Story = {
  render: () => ({
    components: { CookChip },
    template: `
      <div class="grid grid-cols-3 gap-2 max-w-sm">
        <CookChip label="—" :selected="false" />
        <CookChip label="Me" :selected="true" />
        <CookChip label="Partner" :selected="false" />
      </div>
    `,
  }),
}
