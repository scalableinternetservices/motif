import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { check } from '../../../../common/src/util'
import { Button } from '../../style/button'
import { style } from '../../style/styled'
import { UserContext } from '../auth/user'
import { link } from '../nav/Link'
import { AppRouteParams, getPath, Route } from '../nav/route'
import { handleError } from '../toast/error'
import { Page } from './Page'

interface HomePageProps extends RouteComponentProps, AppRouteParams {}

function logout() {
  return fetch('/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => {
      check(res.ok, 'response status ' + res.status)
      window.location.replace('/')
    })
    .catch(handleError)
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePage(props: HomePageProps) {
  const { user } = React.useContext(UserContext)

  const buttons = user ? (
    <ButtonWrapper>
      <ButtonLink to={getPath(Route.LobbySearch)}>Find Lobbies</ButtonLink>
      <ButtonLink onClick={() => logout()}>Logout</ButtonLink>
    </ButtonWrapper>
  ) : (
    <ButtonWrapper>
      <ButtonLink to={getPath(Route.USER_LOGIN)}>Login</ButtonLink>
    </ButtonWrapper>
  )

  return (
    <Page>
      <Title>
        <h1>Motif</h1>
      </Title>
      {buttons}
    </Page>
  )
}

const ButtonLink = link(Button)
const ButtonWrapper = style('div', 'flex-l')

const Title = style('div', {
  textAlign: 'center',
  fontSize: '2em',
})

// const Hero = style('div', 'mb4 w-100 ba b--mid-gray br2 pa3 tc', {
//   borderLeftColor: Colors.lemon + '!important',
//   borderRightColor: Colors.lemon + '!important',
//   borderLeftWidth: '4px',
//   borderRightWidth: '4px',
// })

// const Content = style('div', 'flex-l')

// const LContent = style('div', 'flex-grow-0 w-70-l mr4-l')

// const RContent = style('div', 'flex-grow-0  w-30-l')

// const Section = style('div', 'mb4 mid-gray ba b--mid-gray br2 pa3', (p: { $color?: ColorName }) => ({
//   borderLeftColor: Colors[p.$color || 'lemon'] + '!important',
//   borderLeftWidth: '3px',
// }))

// const TD = style('td', 'pa1', p => ({
//   color: p.$theme.textColor(),
// }))
