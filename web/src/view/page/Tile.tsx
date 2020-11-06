import * as React from 'react'

class Tile extends React.Component {
  render() {
    return (
      <button className="button" onClick={this.wasclicked} key={1}>
        TEST
      </button>
    )
  }

  wasclicked = () => {
    this.setState({ bgcolor: 'blue' })
  }
}
interface IProps {
  children: React.ReactNode
  onclick: () => void
  // any other props that come into the component
}
export const Tile2 = ({ children, onclick }: IProps) => {
  return (
    <button className="tile" onClick={onclick}>
      {children}
    </button>
  )
}

export default Tile
