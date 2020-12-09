import { RouteComponentProps } from '@reach/router'
import * as React from 'react'
import { Button } from '../../style/button'
import { Logout } from '../auth/Logout'
import { UserContext } from '../auth/user'
import { link } from '../nav/Link'
import { AppRouteParams, getPath, Route } from '../nav/route'

interface HomePageProps extends RouteComponentProps, AppRouteParams {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function HomePage(props: HomePageProps) {
  const { user } = React.useContext(UserContext)

  const buttons = user ? (
    <div className="buttonWrapper flex">
      <ButtonLink to={getPath(Route.LobbySearch)}>Find Lobbies</ButtonLink>
      <Logout />
    </div>
  ) : (
    <div className="buttonWrapper flex">
      <ButtonLink to={getPath(Route.USER_LOGIN)}>Login</ButtonLink>
    </div>
  )

  return (
    <div className="homeWrapper">
      <div className="homeContainer flex flex-column items-center mh2 mh3-ns mh5-l min-vh-100 sans-serif">
        <h1>Motif</h1>
        {buttons}
      </div>
    </div>
  )
}

const ButtonLink = link(Button)

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
