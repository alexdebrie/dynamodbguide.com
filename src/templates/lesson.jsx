import React from "react";
import Helmet from "react-helmet";
import styled from "styled-components"

import Disqus from '../components/Disqus/Disqus'
import SEO from "../components/SEO/SEO"
import SiteHeader from '../components/Layout/Header'
import CtaButtonBook from '../components/CtaButtonBook'
import config from "../../data/SiteConfig"
import TableOfContents from "../components/Layout/TableOfContents";

export default class LessonTemplate extends React.Component {
  render() {
    const { slug } = this.props.pathContext;
    const postNode = this.props.data.postBySlug;
    const post = postNode.frontmatter;
    if (!post.id) {
      post.id = slug;
    }
    if (!post.id) {
      post.category_id = config.postDefaultCategoryID;
    }
    return (
      <div>
        <Helmet>
          <title>{`${post.title} | ${config.siteTitle}`}</title>
        </Helmet>
        <SEO postPath={slug} postNode={postNode} postSEO />
        <BodyGrid>
          <HeaderContainer>
            <SiteHeader location={this.props.location} />
          </HeaderContainer>
          <ToCContainer>
            <TableOfContents
              posts={this.props.data.allPostTitles.edges}
              contentsType="lesson"
              chapterTitles={config.toCChapters}
            />
          </ToCContainer>
          <BodyContainer>
            <div>
              <h1>
                {post.title}
              </h1>
              <div dangerouslySetInnerHTML={{ __html: postNode.html }} />
              <div className="book-blurb">
                <h3>Want to learn more about DynamoDB data modeling?</h3>
                <a href="https://www.dynamodbbook.com"><h4><u>Get the DynamoDB Book!</u></h4></a>
                <p>The DynamoDB Book is a <strong>comprehensive guide</strong> to modeling your DynamoDB tables</p>
                <p> Learn the how, what, and why to DynamoDB modeling with <strong>real examples</strong></p>
                <CtaButtonBook link={'https://www.dynamodbbook.com'}>I want the book!</CtaButtonBook>
              </div>
            </div>
            <Disqus postNode={postNode} />
          </BodyContainer>
        </BodyGrid>
      </div>
    );
  }
}

const BodyGrid = styled.div`
  height: 100vh;
  display: grid;
  grid-template-rows: 75px 1fr;
  grid-template-columns: 300px 1fr;

  @media screen and (max-width: 600px) {
    display: flex;
    flex-direction: column;
    height: inherit;
  }
`

const BodyContainer = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  overflow: scroll;
  -webkit-overflow-scrolling: touch;  
  justify-self: center;
  width: 100%;
  padding: ${props => props.theme.sitePadding};
  @media screen and (max-width: 600px) {
    order: 2;
  }

  ul, ol {
    margin-left: 30px;
  }

  img {
    max-width: 60vw;
    display: block;
    margin-left: auto;
    margin-right: auto
  }
  
  & > div {
    max-width: ${props => props.theme.contentWidthLaptop};
    margin: auto;
  }
  
  & > h1 {
    color: ${props => props.theme.accentDark};
  }
`

const HeaderContainer = styled.div`
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  z-index: 2;
  @media screen and (max-width: 600px) {
    order: 1;
  }
`

const ToCContainer = styled.div`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  background: ${props => props.theme.lightGrey};
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
  @media screen and (max-width: 600px) {
    order: 3;
    overflow: inherit;
  }
`

/* eslint no-undef: "off"*/
export const pageQuery = graphql`
  query LessonBySlug($slug: String!) {
    allPostTitles: allMarkdownRemark{
        edges {
          node {
            frontmatter {
              tocTitle
              title
              lesson
              chapter
              type
            }
            fields {
              slug
            }
          }
        }
      }
      postBySlug: markdownRemark(fields: { slug: { eq: $slug } }) {
        html
        timeToRead
        excerpt
        frontmatter {
          title
          date
          category
          description
        }
        fields {
          slug
        }
      } 
  }
`;
