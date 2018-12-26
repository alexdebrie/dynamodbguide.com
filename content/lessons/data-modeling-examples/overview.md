---
title: "Overview"
description: "Examples of data modeling with AWS DynamoDB"
slug: "data-modeling-overview"
lesson: 1
chapter: 6
date: "01/01/2018"
type: "lesson"
---

This chapter includes a number of case studies, each exploring a way to model data in DynamoDB for a particular scenario. Sometimes, seeing a single example is better than reading pages of documentation.

This chapter is intended to grow over time. Are there particular use cases you'd like to see? [Hit me up](mailto:alexdebrie1@gmail.com) and let me know!

### Available examples:

- [**Building a global leaderboard using write sharding**](./leaderboard-write-sharding)

	Learn how to organize your DynamoDB to allow for leaderboard-like queries -- "What are the most-viewed items in my table?" "Which users have the top score in my game?"
	
	You will also learn how to use write-sharding and scatter-gather queries to alleviate write throttling for high-usage keys.
	
- [**Modeling hierarchical data***](./hierarchical-data)

	This example shows how to model hierarchical data. **It includes a full code sample that uses >25,000 Starbucks store locations.** Learn how to satisfy multiple access patterns, including finding all stores in a particular state, all stores in a particular city, and all stores in a particular zip code.

	
### Planned examples:

- Time-based workflows*
- Enum attributes*
- Working with large items*
- ACID transactions*
- Geo-hashing*
- Graph queries and adjacency lists*

\* -- Example from Rick Houlihan's [excellent 2017 reInvent talk](https://www.youtube.com/watch?v=jzeKPKpucS0).
