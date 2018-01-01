import React from "react"
import Helmet from "react-helmet"
import styled from "styled-components"

import SEO from "../components/SEO/SEO"
import config from "../../data/SiteConfig"
import CtaButton from '../components/CtaButton'
import Navigation from '../components/Layout/Navigation'

class Index extends React.Component {

  render() {
    const postEdges = this.props.data.allMarkdownRemark.edges;
    return (
      <div className="index-container">
        <Helmet title={config.siteTitle} />
        <SEO postEdges={postEdges} />
        <main>
          <IndexHeadContainer>
            <Navigation />
            <Hero>
              <img src={config.siteLogo} width='150px' />
              <h1>{config.siteTitle}</h1>
              <h4>{config.siteDescription}</h4>
              <CtaButton to={'/what-is-dynamo-db'}>Start Learning DynamoDB</CtaButton>
              <p>{"Inspired by Craig Kerstiens'"} <a href="http://postgresguide.com/">Postgres Guide</a>.</p>
              <p>Built with <a href="https://www.gatsbyjs.org/">Gatsbyjs</a> and the <a href="https://github.com/ericwindmill/gatsby-starter-docs">gatsby-starter-docs</a> template.</p>
            </Hero>
          </IndexHeadContainer>
        </main>
      </div>
    );
  }
}

export default Index;

const IndexHeadContainer = styled.div`
  background: ${props => props.theme.brand};
  padding: ${props => props.theme.sitePadding};
  text-align: center;
`

const Hero = styled.div`
  padding: 50px 0;
  & > h1 {
    font-weight: 600;  
  }
`


/* eslint no-undef: "off"*/
export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      edges { 
        node {
          fields {
            slug
          }
          excerpt
          timeToRead
          frontmatter {
            title
            date
          }
        }
      }
    }
  }
`;

