import * as React from 'react'
import { NavBar } from '../nav/NavBar'

export function Page(props: React.PropsWithChildren<JSX.IntrinsicElements['div']>) {
  return (
    // <div className="mw8">
    <div className="mw8 mh2 mh3-ns mh5-l pt6">
      <NavBar />
      {props.children}
    </div>
  )
}
