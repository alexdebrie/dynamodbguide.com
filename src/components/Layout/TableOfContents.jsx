import React from "react"
import Link from 'gatsby-link'
import styled from 'styled-components'


// This class should not be used for listing posts, but for chapter based Docs. See PostListing for that.
// You'll also need to add your chapters to siteConfig

class TableOfContents extends React.Component {
  buildNodes() {
    const {posts} = this.props
    const type = this.props.contentsType
    const postNodes = []
    posts.forEach(post => {
      if (post.node.frontmatter.type === type) {
        const postNode = {
          title: post.node.frontmatter.tocTitle || post.node.frontmatter.title,
          path: post.node.fields.slug,
          lessonNumber: post.node.frontmatter.lesson,
          chapter: post.node.frontmatter.chapter
        }
        postNodes.push(postNode)
      }
    })

    const postNodeChapters = [];
    postNodes.forEach(post => {
      if (postNodeChapters[post.chapter]) {
        postNodeChapters[post.chapter].push(post)
      } else {
        postNodeChapters[post.chapter] = [post]
      }
    })

    postNodeChapters.forEach(chapter => {
      chapter.sort((a, b) => a.lessonNumber - b.lessonNumber)
    })
    return postNodeChapters
  }

  nodeListItems() {
    const postNodeChapters = this.buildNodes()
    const listItems = []
    const chapterTitles = this.props.chapterTitles
    postNodeChapters.forEach((chapter, idx) => {
      const chapterLessons = []
      let chapterNumber;
      chapter.forEach(node => {
        let key = `${node.chapter}-${node.lessonNumber}`;
        chapterNumber = `${node.chapter}`;
        chapterLessons.push(
          <li key={key}>
            <StyledLink
              activeClassName="active"
              to={node.path}
            >
              {node.chapter}.{node.lessonNumber}&nbsp;&nbsp;{node.title}
            </StyledLink>
          </li>
        )
      })
      listItems.push(
        <li className='chapter' key={chapterNumber}>
          <h5 className='tocHeading'>
            {chapterTitles[idx].toUpperCase()}
          </h5>
          <ul className='chapterItems'>
            {chapterLessons}
          </ul>
        </li>
      )
    })
    return listItems
  }

  render() {
    return (
      <TableOfContentsContainer>
        <ul>
          {this.nodeListItems()}
        </ul>
      </TableOfContentsContainer>
    )
  }
}

const TableOfContentsContainer = styled.div`
  padding: ${props => props.theme.sitePadding};

  & > ul, .chapterItems {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul.chapterItems>li {
    margin: 2px 0;
  }

  a.active {
      color: black;
      font-weight: 700;
  }
  
  p, h6 {
    display: inline-block;
    font-weight: 200;
    margin: 0;
  }
  
  .tocHeading {
     font-weight: 700;
     margin-bottom: 10px;
  }
`

const StyledLink = styled(Link)`
  color: black;
  font-size: 1.6rem;
  font-weight: lighter;
`

export default TableOfContents

