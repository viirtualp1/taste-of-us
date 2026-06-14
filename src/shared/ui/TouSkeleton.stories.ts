import type { Meta, StoryObj } from '@storybook/vue3'
import TouSkeleton from './TouSkeleton.vue'

const meta: Meta<typeof TouSkeleton> = {
  title: 'UI/TouSkeleton',
  component: TouSkeleton,
  tags: ['autodocs'],
  render: (args) => ({
    components: { TouSkeleton },
    setup: () => ({ args }),
    template: `<TouSkeleton v-bind="args" class="h-10 w-48" />`,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ListPlaceholder: Story = {
  render: () => ({
    components: { TouSkeleton },
    template: `
      <div class="space-y-3 max-w-sm">
        <TouSkeleton class="h-12 rounded-[12px]" />
        <TouSkeleton class="h-12 rounded-[12px]" />
        <TouSkeleton class="h-12 rounded-[12px]" />
      </div>
    `,
  }),
}
