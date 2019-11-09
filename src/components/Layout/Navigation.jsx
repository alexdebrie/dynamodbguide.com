import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'
import UserLinks from '../UserLinks'

const NavContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: ${props => props.theme.brand};
  
  .nav-link {
    font-size: 1.6rem;
    margin-right: 10px;
    font-weight: 200;
    color: black;
  }

  .highlight {
    border: 1px solid white;
    border-radius: 3px;
    padding: 6px;
    background: #F6F6F6;
    font-weight: bolder;
  }

  @media screen and (max-width: 600px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    section {
      margin-bottom: 20px;
    }
    
    span {
      display: none;
    }
  }

`

class Navigation extends React.Component {

  render() {
    return (
      <NavContainer>
        <section>
          <Link className='nav-link' to='/' > HOME </Link>
          <Link className='nav-link' to='/what-is-dynamo-db' > GUIDE </Link>
          <Link className='nav-link' to='/about' > ABOUT </Link>
          <a className='nav-link highlight' href="https://www.dynamodbbook.com">GET THE BOOK!</a>
        </section>
        <span><UserLinks /></span>
      </NavContainer>
    )
  }
}

export default Navigation
