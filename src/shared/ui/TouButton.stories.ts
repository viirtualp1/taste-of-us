import type { Meta, StoryObj } from '@storybook/vue3'
import TouButton from './TouButton.vue'

const meta: Meta<typeof TouButton> = {
  title: 'UI/TouButton',
  component: TouButton,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
    },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
    disabled: { control: 'boolean' },
  },
  args: { variant: 'default', size: 'default', disabled: false },
  render: (args) => ({
    components: { TouButton },
    setup: () => ({ args }),
    template: `<TouButton v-bind="args">Button</TouButton>`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Variants: Story = {
  render: () => ({
    components: { TouButton },
    template: `
      <div class="flex flex-wrap gap-3">
        <TouButton variant="default">Default</TouButton>
        <TouButton variant="destructive">Destructive</TouButton>
        <TouButton variant="outline">Outline</TouButton>
        <TouButton variant="secondary">Secondary</TouButton>
        <TouButton variant="ghost">Ghost</TouButton>
        <TouButton variant="link">Link</TouButton>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    components: { TouButton },
    template: `
      <div class="flex flex-wrap items-center gap-3">
        <TouButton size="sm">Small</TouButton>
        <TouButton size="default">Default</TouButton>
        <TouButton size="lg">Large</TouButton>
      </div>
    `,
  }),
}

export const Disabled: Story = { args: { disabled: true } }
