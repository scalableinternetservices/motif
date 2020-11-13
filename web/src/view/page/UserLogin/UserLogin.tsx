import { RouteComponentProps } from '@reach/router';
import * as React from 'react';
import { check } from '../../../../../common/src/util';
import { Button } from '../../../style/button';
import { Input } from '../../../style/input';
import { link } from '../../nav/Link';
import { AppRouteParams } from '../../nav/route';
import { Page } from '../../page/Page';
import { toastErr } from '../../toast/toast';


interface UserLoginProps extends RouteComponentProps, AppRouteParams {}

export function UserLogin (p: UserLoginProps) {
  const [userName, setUser] = React.useState("");
  const [err, setError] =  React.useState({ userName: false })

  // reset error when email/name change

  React.useEffect(() => setError({ ...err, userName: false }), [userName])

  function login() {
    if (!validate(userName, setError)) {
      toastErr('name')
      return
    }

    fetch('/auth/createUser_', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    })
      .then(res => {
        check(res.ok, 'response status ' + res.status)
        return res.text()
      })
      .then(() => window.location.replace('/'))
      .catch(err => {
        toastErr(err.toString())
        setError({ userName: true })
      })
  }



  return (
    <Page>
      <div className="baseCanvas bg-green">
        <div className="flex flex-column justify-center pa6">
          <UserNameField setUser={setUser}/>
          <SubmitUser login={()=> login()} userName={userName}/>
        </div>
      </div>
    </Page>
  )
}

interface UserNameProps {
  setUser(name: string) : void,
}

function UserNameField (p : UserNameProps)
{
  return (
    <div className="mh4 mv2 bg-light-blue">
      <Input placeholder="Username" $onChange={p.setUser}/>
    </div>
  )
}

interface SubmitUserProps {
  userName : string,
  login(): void
}

function SubmitUser(p: SubmitUserProps) {
  return (
    <div className="mh4 mv2 flex justify-center">
      <ButtonLink onClick={p.login}>
        Submit
      </ButtonLink>

    </div>
  )
}

const ButtonLink = link(Button)


function validate(
  userName: string,
  setError: React.Dispatch<React.SetStateAction<{ userName: boolean }>>
) {
  const validName = Boolean(userName)
  console.log('valid',  validName)
  setError({ userName: !validName })
  return validName
}