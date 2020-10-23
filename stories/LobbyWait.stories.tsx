import { Meta, Story } from '@storybook/react'
import * as React from 'react'
import { LobbyWaitMain as LobbyWaitComponent } from '../web/src/view/playground/LobbyWait'

export default {
  title: 'LobbyWait',
} as Meta

const LobbyWaitTemplate: Story = args => <LobbyWaitComponent {...args} />

export const LobbyWait = LobbyWaitTemplate.bind({})
LobbyWait.args = {
  surveyId: 1,
}
