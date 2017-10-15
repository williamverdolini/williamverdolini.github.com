---
layout: wvpost
title: "Fast Catalog"
tagline: Multi-attribute Search with MongoDb
header: Multi-attribute Search with MongoDb
description: MongoDb, Prototyping, Tech, Multi-attribute Search
group: FastCatalog
tags: [Technology,Prototyping,MongoDb,Multi-attribute Search]
---
{% include JB/setup %}

<a href="{{ BASE_PATH }}/2015/07/26/fastcatalog-web-elastic/" target="_blank">Same story</a>, but with <a href="https://www.mongodb.org/" target="_blank">MongoDb</a>. After having implemented <a href="{{ BASE_PATH }}/2015/06/08/fastcatalog-intro/" target="_blank">the feature</a> with ElasticSearch, it was pretty straightforward to do the same thing with MongoDB (also because all the front-end code remained the same; that's one of the <a href="{{ BASE_PATH }}/2014/01/05/discitur-prerequisiti_en#" target="_blank">advantages of a SPA</a>).

Here are the key points during this part of development:

### Filter Definition
A MongoDb query is expressed by a <a href="http://mongodb.github.io/mongo-csharp-driver/2.0/reference/driver/definitions/#filters" target="_blank">filter definition</a>.
A filter could be expressed through both Type-safe or generic BsonDocument/String API. For example, the followings express the same filter:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
var bsonFilter = new BsonDocument{
	{
		"$and", new BsonArray{
			new BsonDocument{ {"Code", "Product Code"} },
			new BsonDocument{ {"Description", "Product Description"} }
		}
	}
};

var typeSafeFilter = Builders<MongoProduct>.Filter.And(
	Builders<MongoProduct>.Filter.Eq(a => a.Code, "Product Code"),
	Builders<MongoProduct>.Filter.Eq(a => a.Description, "Product Description")
	);
]]></script> 

surprisingly (for me) I prefer the first style, because it's easier to translate the JSON query to BsonDocument filter and it's easier to debug what query you're doing.

### Aggregation Pipeline
One of the part of MongoDb that I like the most is the <a href="http://docs.mongodb.org/manual/core/aggregation-pipeline/" target="_blank">Aggregation pipeline</a>, that allows to create complex aggregation logic in a very natural way. As shown in <a href="{{ BASE_PATH }}/2015/06/22/fastcatalog-sql2mongo/#query-for-all-product-attributes-2300ms" target="_blank">a previous article</a>, the following is the aggregation pipeline used to aggregate the products data:

<script type="syntaxhighlighter" class="brush: js">
<![CDATA[
db.Products.aggregate([
	{$unwind: "$Attributes"},
	{$group: { _id: "$Attributes", total: {$sum: 1} }},
	{$sort: {"_id.Value":1}},
	{$group: { _id: "$_id.Key", Properties: {$push: {Value:"$_id.Value", Count:"$total"}}}},
	{$sort: {_id:1, "Properties.Value": 1}}
]);
]]></script> 

The <a href="http://mongodb.github.io/mongo-csharp-driver/2.0/" target="_blank">.Net driver</a> was able to preserve the easiness to translate this aggregation logic in C# code.

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
var collection = database.GetCollection<BsonDocument>("Products");

var unwindAttributes = new BsonDocument{
	{
		"$unwind", "$Attributes"
	}
};

var groupAttributes = new BsonDocument{
	{
		"$group", new BsonDocument{
			{"_id", "$Attributes"}, 
			{"total", new BsonDocument("$sum", 1)} 
		}
	}
};

var sort = new BsonDocument{
	{
		"$sort", new BsonDocument{
			{"_id.Value", 1}
		}
	}
};

var groupValuesPerAttribute = new BsonDocument{
	{
		"$group", new BsonDocument{
			{"_id", "$_id.Key"}, 
			{"Properties", new BsonDocument{
				{
					"$push", new BsonDocument{
							{"Value", "$_id.Value"},
							{"Count", "$total"}
						}
					}
				} 
			}
		}
	}
};

var sortValues = new BsonDocument{
	{
		"$sort", new BsonDocument{
			{"_id", 1},
			{"Properties.Value", 1}
		}
	}
};

var aggregate = await collection.AggregateAsync<BsonDocument>(new[] { 
	unwindAttributes, 
	groupAttributes, 
	sort, 
	groupValuesPerAttribute, 
	sortValues 
});
]]></script> 

As for the filters, I prefer to use the BSonDocument format also for aggregations. This approach does NOT give you any clue about the correctness of your query at compile time, but, at the end, it's easier to translate the JSON and debug which commands you are sending to MongoDB.



### Aggregation + Find
The main difference in the <a href="https://github.com/williamverdolini/FastCatalog/blob/master/Catalog/Web/Areas/Mongo/Services/CatalogRepository.cs#L59-L69" target="_blank">Search service design</a> is that with MongoDb I had to do more than one single database request as <a href="https://github.com/williamverdolini/FastCatalog/blob/master/Catalog/Web/Areas/Elastic/Services/CatalogRepository.cs#L68" target="_blank">I was able to do with ElasticSearch</a>.

A request for getting the aggregation data.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [5]">
<![CDATA[
private async Task<IList<BsonDocument>> SearchAggregations(SearchInput input)
{
	...
	var collection = database.GetCollection<BsonDocument>(MONGO_COLLECTION);
	var aggregate = await collection.AggregateAsync<BsonDocument>(new[] { 
			match,
			unwindAttributes, 
			groupAttributes, 
			sort, 
			groupValuesPerAttribute, 
			sortValues 
	});

	return aggregate.ToListAsync().Result;
}
]]></script> 


and a request for getting the products data.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [4]">
<![CDATA[
private async Task<SearchResult> SearchDocuments(SearchInput input)
{
	var collection = database.GetCollection<MongoProduct>(MONGO_COLLECTION);
	var cursor = collection.Find(MatchDocuments(input));
	long count = await cursor.CountAsync();
	var result = await cursor.Skip(0).Limit(10).ToListAsync();
	...
}
]]></script> 

It's not a big deal and it's quite common to do, but this can underline how ElasticSearch seems to be more "prepared" to arrange this kind of aggregation-based functionality.