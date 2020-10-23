import { Meta, Story } from '@storybook/react'
import * as React from 'react'
import { LobbySearchMain as LobbySearchComponent } from '../web/src/view/playground/LobbySearch'

export default {
  title: 'LobbySearch',
} as Meta

const LobbySearchTemplate: Story = args => <LobbySearchComponent {...args} />

export const LobbySearch = LobbySearchTemplate.bind({})
LobbySearch.args = {
  surveyId: 1,
}
