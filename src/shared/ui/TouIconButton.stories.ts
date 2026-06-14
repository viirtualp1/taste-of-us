import type { Meta, StoryObj } from '@storybook/vue3'
import TouIconButton from './TouIconButton.vue'

const meta: Meta<typeof TouIconButton> = {
  title: 'UI/TouIconButton',
  component: TouIconButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['ghost', 'close', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
    icon: { control: 'text' },
  },
  args: {
    icon: 'heroicons:x-mark',
    variant: 'ghost',
    size: 'md',
    disabled: false,
  },
  render: (args) => ({
    components: { TouIconButton },
    setup: () => ({ args }),
    template: `<TouIconButton v-bind="args" />`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { TouIconButton },
    template: `
      <div class="flex items-center gap-3">
        <TouIconButton icon="heroicons:pencil" variant="ghost" />
        <TouIconButton icon="heroicons:x-mark" variant="close" />
        <TouIconButton icon="heroicons:trash" variant="danger" />
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { TouIconButton },
    template: `
      <div class="flex items-center gap-3">
        <TouIconButton icon="heroicons:plus" size="sm" />
        <TouIconButton icon="heroicons:plus" size="md" />
        <TouIconButton icon="heroicons:plus" size="lg" />
      </div>
    `,
  }),
}
