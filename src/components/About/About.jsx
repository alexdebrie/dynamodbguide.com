import React, { Component } from "react";
import styled from "styled-components"

class About extends Component {
  render() {
    return (
      <AboutContainer>
        <h1>
            About dynamodbguide.com
        </h1>
        <p>
          <b>What:</b> An open guide that walks through the basic concepts and advanced features of the DynamoDB NoSQL database provided by AWS.
        </p>
        <p>
          <b>Why:</b> I started dynamodbguide.com as a way to share what I wish I knew about DynamoDB when I was getting started.
          It's modeled after Craig Kerstien's <a href="http://postgresguide.com/">Postgres Guide</a>, which was very useful to me when I was learning Postgres.
        </p>
        <p>
          <b>Who:</b> I'm <a href="https://twitter.com/alexbdebrie">Alex DeBrie</a>. I'm an <a href="https://aws.amazon.com/developer/community/heroes/alex-debrie/">AWS Data Hero</a> with a focus on DynamoDB. I blog on various tech topics, mostly related to AWS, at <a href="https://alexdebrie.com">alexdebrie.com</a>.
        </p>
        <p>
          Currently, I provide cloud-native training and consulting for companies with a focus on DynamoDB and serverless. Previously, I worked at <a href="https://www.serverless.com">Serverless, Inc.</a>, creators of the <a href="https://github.com/serverless/serverless">Serverless Framework</a>. ⚡️
          Before that, I was an Infrastructure Engineer & Data Engineer at a sports video startup, and I had a brief stint as a corporate lawyer.
        </p>
        <p>
          <b>How to contribute:</b> Open a pull request or an issue on this site's <a href="https://github.com/alexdebrie/dynamodbguide.com">repo</a>. You can also reach me via <a href="mailto:alexdebrie1@gmail.com">email</a>.
        </p>
      </AboutContainer>
    );
  }
}

const AboutContainer = styled.div`
  padding: ${props => props.theme.sitePadding};
  max-width: ${props => props.theme.contentWidthLaptop};
  margin: 0 auto;
`


export default About;
