import { ApolloProvider, useQuery } from '@apollo/client'
import { Redirect, Router } from '@reach/router'
import * as React from 'react'
import { hydrate, render } from 'react-dom'
import { Provider as StyletronProvider } from 'styletron-react'
import { appContext } from '../../../common/src/context'
import { getApolloClient } from '../graphql/apolloClient'
import { FetchUserContext } from '../graphql/query.gen'
import { style } from '../style/styled'
import { fetchUser } from './auth/fetchUser'
import { UserContext, UserCtx } from './auth/user'
import { Route } from './nav/route'
import { BoardPage } from './page/BoardPage'
import { HomePage } from './page/HomePage'
import { LobbyMain } from './page/Lobby/LobbyMain'
import { LobbySearchMain } from './page/Lobby/LobbySearch'
import { LobbyWait } from './page/Lobby/LobbyWait'
import { UserLogin } from './page/UserLogin/UserLogin'

const Styletron = require('styletron-engine-monolithic')

export function init() {
  const renderFn = appContext().serverRendered ? hydrate : render
  const engine = new Styletron.Client({
    hydrate: document.getElementsByClassName('_styletron_hydrate_'),
  })

  renderFn(
    <ApolloProvider client={getApolloClient()}>
      <StyletronProvider value={engine}>
        <App />
      </StyletronProvider>
    </ApolloProvider>,
    document.getElementById('app')
  )
}

export function App() {
  const { loading, data } = useQuery<FetchUserContext>(fetchUser)
  if (loading || data == null) {
    return null
  }

  return (
    <UserContext.Provider value={new UserCtx(data.self)}>
      <AppBody />
    </UserContext.Provider>
  )
}

export function AppBody() {
  return (
    <>
      <Router className={bodyClass}>
        <Redirect noThrow from="app" to="index" />
        <HomePage path={Route.HOME} />
        <LobbySearchMain path={Route.LobbySearch} />
        <LobbyWait path={Route.LobbyWait} />
        <BoardPage path={Route.BOARD} />
        <UserLogin path={Route.USER_LOGIN} />
        <LobbyWait path={Route.Lobby_Inst} />
        <BoardPage path={Route.Game_Inst} />
        <LobbyMain path={Route.LobbyMain} />
      </Router>
      <Footer>
        <FooterText>© 2020 Elyse Yao, Nihar Mitra, Alan Guan, Juan Estrada</FooterText>
      </Footer>
    </>
  )
}

const bodyClass = 'flex flex-column items-center mh2 mh3-ns mh5-l pt6 min-vh-100 sans-serif'

const Footer = style('footer', 'fixed flex items-center bottom-0 w-100')

const FooterText = style('small', 'mid-gray avenir', { margin: 'auto', opacity: '0.2' })
