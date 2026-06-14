import type { Meta, StoryObj } from '@storybook/vue3'
import TouCard from './TouCard.vue'
import TouCardHeader from './TouCardHeader.vue'
import TouCardTitle from './TouCardTitle.vue'
import TouCardContent from './TouCardContent.vue'

const meta: Meta<typeof TouCard> = {
  title: 'UI/TouCard',
  component: TouCard,
  tags: ['autodocs'],
  render: () => ({
    components: { TouCard, TouCardHeader, TouCardTitle, TouCardContent },
    template: `
      <TouCard class="max-w-md">
        <TouCardHeader>
          <TouCardTitle>Weekly menu</TouCardTitle>
        </TouCardHeader>
        <TouCardContent>
          <p class="text-sm text-muted-foreground">
            Compose your card from header, title and content sub-components.
          </p>
        </TouCardContent>
      </TouCard>
    `,
  }),
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ContentOnly: Story = {
  render: () => ({
    components: { TouCard, TouCardContent },
    template: `
      <TouCard class="max-w-md">
        <TouCardContent>Just some content inside a card.</TouCardContent>
      </TouCard>
    `,
  }),
}
