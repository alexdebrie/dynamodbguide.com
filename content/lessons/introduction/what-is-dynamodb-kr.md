---
title: "DynamoDB는 무엇인가?"
description: "Background on DynamoDB, the NoSQL database provided by AWS"
lesson: 1
chapter: 1
date: "2/1/2020"
type: "lesson"
---

[DynamoDB](https://aws.amazon.com/dynamodb/)는 Amazon Web Service(AWS)에서 운영하는 NOSQL Database입니다. DynamoDB는 다음과 같은 특성이 있습니다.

- 규모와 상관없는 "신뢰성 있는 퍼포먼스"
- 매니지드 서비스이기 때문에 SSH를 이용한 접속 및 암호화 라이브러리의 업그레이드가 필요가 없음.
- key-value 엑세스와 고급 쿼리 패을 사용하는 간단한 API 제공

DynamoDB는 다음과 같은 사례에 적합합니다:

**대용량 데이터를 다루며 latency에 엄격함을 요구하는 어플리케이션.** 데이터의 규모가 커짐에 따라 JOIN과 복잡한 SQL문으로 인해 query속도가 느려질 수 있습니다. DynamoDB를 통하여, query가 [100 TB 이상](https://medium.com/building-timehop/one-year-of-dynamodb-at-timehop-f761d9fe5fa1) 이더라도 예측가능한 latency를 설계할 수 있습닏다.

**Lambda를 이용한 Serverless Application**. [AWS Lambda](https://aws.amazon.com/lambda/)는 이벤트 trigger애 대한 응답으로 오토스케일링, 무상태, 임시 컴퓨팅자원을 제공합니다. DynamoDB는 HTTP API를 통해 접근이 가능하며 IAM을 통해 인증 및 권한 부여가 가능하기 때문에 Serverless Application을 만드는데 최적화 되어있습니다.

**간단하며 잘 알려진 패턴을 가진 데이터셋**. DynamoDB의 간단한 엑세스 key-value 패턴은 유저들에게 빠르고 신뢰적으로 데이터를 제공해줄 수 있게 합니다. (Please explain this sentence what you think.)

### 더 배울 준비가 되셨습니까?

Table, Item 등 여러 DynamoDB의 기본요소는 [key concepts](./key-concepts)에서 서술할 것입니다. 만약 DynamoDB의 computer science 사상에 대해 궁금하다면, [Dynamo Paper](./the-dynamo-paper)를 참조바랍니다.

학습을 시작할 준비가 되었다면, DynamoDB 개발환경을 구성해보십시오. 구성이 끝났다면 [Single-Item Action](./anatomy-of-an-item), query와 scan을 이용하는 [Multi-Item Action](./working-with-multiple-items)을 차례대로 읽는 것을 권장드립니다.

심화된 개념을 원한다면 [secondary indexes](./secondary-indexes)와 [DynamoDB Streams](./dynamodb-streams)를 통해 퍼포먼스를 강화하십시오!

더 많은 자료를 원하십니까? [Additional Reading](./additional-reading)에서 다양한 커뮤니티의 글을 읽으실 수 있습니다.

