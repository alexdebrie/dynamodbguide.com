import React, { Component } from 'react'
import Link from 'gatsby-link'
import styled from 'styled-components'

class ctaButton extends Component {
  render() {
    const { children } = this.props
    return(
      <Link style={{border: 'none'}} to={this.props.to}>
        <ButtonContainer>
          {children}
        </ButtonContainer>
      </Link>
    )
  }
}

export default ctaButton

const ButtonContainer = styled.div`
  background: white;
  border: 1px solid ${props => props.theme.brand};
  border-radius: 3px;
  padding: 25px;
  font-size: 2rem;
  color: black;
  display: inline-block;
  transition: all .3s ease;
  
  &:hover {
    background: black;
    color: white;
  }
`
