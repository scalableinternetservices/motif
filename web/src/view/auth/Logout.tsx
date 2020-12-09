import * as React from 'react'
import { check } from '../../../../common/src/util'
import { Button } from '../../style/button'
import { handleError } from '../toast/error'

export function Logout() {
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
  return <Button onClick={logout}>Logout</Button>
}
