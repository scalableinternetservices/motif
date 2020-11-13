import { RouteComponentProps } from '@reach/router';
import * as React from 'react';
import { Button } from '../../../style/button';
import { Input } from '../../../style/input';
import { link } from '../../nav/Link';
import { AppRouteParams } from '../../nav/route';
import { Page } from '../../page/Page';


interface UserLoginProps extends RouteComponentProps, AppRouteParams {}

export function UserLogin (p: UserLoginProps) {
  const [userName, setUser] = React.useState("");

  return (
    <Page>
      <div className="baseCanvas bg-green">
        <div className="flex flex-column justify-center pa6">
          <UserNameField setUser={setUser}/>
          <SubmitUser userName={userName}/>
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
}

function SubmitUser(p: SubmitUserProps) {
  return (
    <div className="mh4 mv2 flex justify-center">
      <ButtonLink onClick={ () => {alert("Submitting User: " + p.userName)} }>
        Submit
      </ButtonLink>

    </div>
  )
}

const ButtonLink = link(Button)
