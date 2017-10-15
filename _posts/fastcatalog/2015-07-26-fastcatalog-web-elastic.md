---
layout: wvpost
title: "Fast Catalog"
tagline: Multi-attribute Search with ElasticSearch
header: Multi-attribute Search with ElasticSearch
description: ElasticSearch, Prototyping, Tech, NEST, Multi-attribute Search
group: FastCatalog
tags: [Technology,Prototyping,ElasticSearch,NEST,Multi-attribute Search]
---
{% include JB/setup %}

So, ElastiSearch is very fast.<br/>
I was very excited to develop the multi-attribute feature starting with ElasticSearch. Here are the key points during this development:

### From JSON to NEST
<a href="http://nest.azurewebsites.net/" target="_blank">NEST</a> is one of the official .NET clients for ElasticSearch; 
NEST is a high level client with a lot of functionalities, like a <a href="http://nest.azurewebsites.net/nest/writing-queries.html#query-dsl" target="_blank">strongly typed query DSL</a>. 
In particular, in the NEST docs, you can read:

> NEST offers you several possibilities [to write queries]...
>
> **Raw Strings**: Although not preferred, many folks like to build their own JSON strings and just pass that along.
>
> **Query DSL**: The preferred way to write queries, since it gives you alot of cool features [Fluent Syntax, Conditionless Queries, etc.]

I like fluent syntax, but...I don't know how to say...probably I like a little less now.
After some tries and attempts, I've finally rewritten the <a href="{{ BASE_PATH }}/2015/06/24/fastcatalog-sql2elastic/#query-for-all-product-attributes-175ms" target="_blank">Query for all product attributes</a>, here it is:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
var result = await client.SearchAsync<Product>(s => s
	.Aggregations(a => a
	.Nested("multi_properties", n => n
		.Path("attributes")
		.Aggregations(na => na
			.Terms("all_properties", f => f
				.Field(o => o.Attributes.First().Key)
				.Size(0)
				.Aggregations(nna => nna
					.Terms("all_values_per_property", nf => nf
						.Field(o => o.Attributes.First().Value)
						.Size(10)))
			)))
	));
]]></script> 

After looking at it again and again it seems not as so bad as at first, but it was not easy to rewrite the JSON query. But what is not neglectable for me is the 
readability: honestly it’s not easy to understand at glance this kind of query, so it’s important that you and your team will gain strong skills with Elastic fluent Syntax 
in order to minimize this aspect for maintenance and evolution.

Thinking again about that it's not so different than learning SQL for the first time.

The following is the NEST query for <a href="{{ BASE_PATH }}/2015/06/24/fastcatalog-sql2elastic/#query-for-product-attributes-filtered-by-some-attribute-values--6ms" target="_blank">Query for product attributes filtered by some attribute values</a>:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
var result = await client.SearchAsync<Product>(s => s
	.Aggregations(a => a
	.Nested("multi_properties", n => n
		.Path("attributes")
		.Aggregations(na => na
			.Terms("all_properties", f => f
				.Field(o => o.Attributes.First().Key)
				.Size(0)
				.Aggregations(nna => nna
					.Terms("all_values_per_property", nf => nf
						.Field(o => o.Attributes.First().Value)
						.Size(0))))))
	)
	.Query(q =>
		(input != null ? GetInputQueryContainer(input) : q.MatchAll())
	));
	
...
	
private QueryContainer GetInputQueryContainer(SearchInput input)
{
		Contract.Requires<ArgumentNullException>(input != null, "SearchInput");

		IList<FilterContainer> filters = new List<FilterContainer> { };
		foreach (var attribute in input.Attributes)
		{
			filters.Add(new FilterDescriptor<Product>().Nested(n => n.Path("attributes")
				.Query(q => q
					.Bool(qq => qq
						.Must(iq =>
						{
							QueryContainer query = null;
							query &= q.Term(t => t.Attributes.First().Key, attribute.Key);
							query &= q.Terms(t => t.Attributes.First().Value, attribute.Values);
							return query;
						})
			 ))));
		}

		var termQuery = Query<Product>
			.Filtered(f => f
				.Filter(ff => ff
					.Bool(fff => fff
						.Must(filters.ToArray())))
			);
		return termQuery;
}	
]]></script> 

In doing this step I looked a lot for some on-line resources and documentation to improve my understanding and to write more readable queries, 
but usually I’ve only found the JSON queries, not queries in fluent syntax…
I think that it’s common spend the most of your time writing fluent NEST queries when you work with ElasticSearch and NEST. 


### Multi-value per attribute

This is the capability to select more than one value for the same product attribute, e.g. if you want to search for all the TVs with 40-inch or 42-inch size. To hit the goal, when your user selects an attribute value, the application should update all other attributes values (and counters), keeping the values of the selected attribute unchanged, in order to allow the user to choose other values for the same  attribute.

You can achieve this in different ways, for example using data stored in session memory. In general it could be a good solution, but what if 
your requisite is “let the user to share with its friends the link of the research of TVs, in order to get some useful advices”? 
Using the session memory is not a good option because the user and its friends will not share the same session memory and the final result will not be the same.

Another way is to use a **double query** solution, that means that the search service will execute two very similar queries in sequence:

- the first one is done to get the values for the last attribute selected. 
- the second one is done to get all other attributes values.

The key word in this sentence is "_last_", because it implies that **the search criteria are sent to the search service in an ordered sequence**. This allows the search service to execute the first query without the criteria about the last selected attribute and get all the values for that attribute and, consequently, to execute the second query with all the search criteria.

Here is the search service _skeleton_ (highlighted the two queries):

<script type="syntaxhighlighter" class="brush: csharp;highlight: [10,13]" >
<![CDATA[
public async Task<SearchResult> Search(SearchInput input)
{
	SearchResult result;
	if (input != null & input.Attributes.Count > 0)
	{
		SearchInput clonedInput = mapper.Map<SearchInput, SearchInput>(input);
		FilteredProductAttribute lastAttribute = clonedInput.Attributes.Last();
		clonedInput.Attributes.Remove(lastAttribute);

		SearchResult first = await SingleSearch(clonedInput);
		var previousAggregation = first.Aggregations.First(a => a.Key.Equals(lastAttribute.Key));

		result = await SingleSearch(input);
		result.Aggregations.Add(previousAggregation);
	}
	else
	{
		result = await SingleSearch(input);
	}
	result.Aggregations = result.Aggregations.OrderBy(a => a.Key).ToList();

	return result;
}
]]></script> 


### Search Service "Optimization"
**Disclaimer**: <a href="https://github.com/williamverdolini/FastCatalog" target="_blank">all the code published</a> is not ready for production, because a lot of aspects are missing (validation, pagination, logging, etc.), and, based on that, talking about optimization is quite naïve. 
Anyway I want to share some thoughts and my point of view (if you have some other solution please share).

Executing two aggregation queries in sequence could be a pain, so it's important to evaluate some optimization. Here the list from where I began.

#### Only Counts
ElasticSearch allow to execute aggregation queries and return only the counter values, without the first page of documents. This avoids executing the fetch phase of the search making the request more efficient.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [2]" >
<![CDATA[
var result = await client.SearchAsync<Product>(s => s
	.SearchType(Elasticsearch.Net.SearchType.Count);
	.Aggregations(a => a
	...
	);
]]></script> 

#### Caching
ElasticSearch allow to cache your query.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [2]" >
<![CDATA[
var result = await client.SearchAsync<Product>(s => s
	.QueryCache(true)
	.Aggregations(a => a
	...
	);
]]></script> 

In official docs you can read:

> the query cache will only cache the results of search requests where ?search_type=count, so it will not cache hits, but it will cache hits.total, aggregations, and suggestions.

and keep in mind that:

> The whole JSON body is used as the cache key. This means that if the JSON changes — for instance if keys are output in a different order — then the cache key will not be recognised.


#### Exclude/Include results
Controversial topic about optimization. ElasticSearch allow to filter the aggregation result using exclude/include regEx pattern, as shown in the code:

<script type="syntaxhighlighter" class="brush: csharp;highlight: [27,28,29,30]" >
<![CDATA[
public async Task<SearchResult> Search(SearchInput input)
{
private async Task<SearchResult> SingleSearch(SearchInput input, bool onlyCount = false, string toExclude = null, string toInclude = null)
{
	var result = await client.SearchAsync<Product>(s =>
	{
		SearchDescriptor<Product> search = new SearchDescriptor<Product>();
		if (onlyCount)
			search.SearchType(Elasticsearch.Net.SearchType.Count);

		search
			.QueryCache(true)
			.Aggregations(a => a
			.Nested(MULTI_PROPERTIES_QUERY, n => n
				.Path(PATH_ATTRIBUTES)
				.Aggregations(na => na
					.Terms(ALL_PROPERTIES_AGG, f =>
					{
						TermsAggregationDescriptor<Product> propertyAgg = new TermsAggregationDescriptor<Product>();
						propertyAgg
							.Field(o => o.Attributes.First().Key)
							.Size(0)
							.Aggregations(nna => nna
								.Terms(ALL_VALUES_PER_PROPERTY, nf => nf
									.Field(o => o.Attributes.First().Value)
									.Size(0)));
						if (!string.IsNullOrEmpty(toExclude))
							propertyAgg.Exclude(toExclude, "LITERAL");
						if (!string.IsNullOrEmpty(toInclude))
							propertyAgg.Include(toInclude, "LITERAL");
						return propertyAgg;
					})))
			)
			.Query(q =>
					(input != null ? GetInputQueryContainer(input) : q.MatchAll())
			);
		return search;
	});

	return MapToSearchResult(result);
}
]]></script> 

It's a controversial point because probably it's the opposite of an optimization because these options force Elastic to do some extra controls/actions on the result applying regex on it. I've not done some comparisons and I've not found anything about it in the documentation to prove that, but I suppose so...anyway the whole search time is always fast and the service logic cleaner.

### Some chat
During the last period I've had the opportunity to ask to some <a href="http://dev.marche.it/" target="_blank">DevMarche guys</a> their opinion about ElasticSearch. 
Their enlightened opinion was that ElasticSearch 
is a very good product, one of the best product of the last period and probably is the best choice if you need to develop some "aggregation-based" application.
This is particularly true in this proof of concept: a multi-attribute Search is _definitely_ an "aggregation-based" application and that is proved very well by 
the differences of the <a href="{{ BASE_PATH }}/2015/06/22/fastcatalog-sql2mongo/#queries" target="_blank">queries time seen with MongoDb</a> and with <a href="{{ BASE_PATH }}/2015/06/24/fastcatalog-sql2elastic/#queries" target="_blank">ElastiSearch</a>.
