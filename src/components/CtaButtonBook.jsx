import React, { Component } from 'react'
import styled from 'styled-components'

class ctaButtonBook extends Component {
  render() {
    const { children } = this.props
    return(
      <a href={this.props.link}>
        <ButtonContainer>
          {children}
        </ButtonContainer>
      </a>
    )
  }
}

export default ctaButtonBook

const ButtonContainer = styled.div`
  background: ${props => props.theme.brand};
  border: 1px solid ${props => props.theme.brand};
  border-radius: 3px;
  padding: 25px;
  font-size: 2rem;
  color: black;
  display: inline-block;
  transition: all .3s ease;
  
  &:hover {
    background: ${props => props.theme.brand};
    color: white;
  }
`
