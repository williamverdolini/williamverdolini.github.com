---
layout: wvpost
title: "Fast Catalog"
tagline: Fast Catalog in ElasticSearch
header: Fast Catalog in ElasticSearch
description: ElasticSearch, Prototyping, Tech
group: FastCatalog
tags: [Technology,Prototyping,ElasticSearch]
---
{% include JB/setup %}

I did the same thing described in the <a href="{{ BASE_PATH }}/2015/06/22/fastcatalog-sql2mongo/" target="_blank">previous article</a> using <a href="https://www.elastic.co/" target="_blank">ElasticSearch</a> as target db. I'm using <a href="http://nest.azurewebsites.net/" target="_blank">Nest</a> as .NET driver. Here is the document model:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
namespace SQL2Elastic.Models
{    
	[ElasticType]
	public class ESProduct
	{
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed, Type = FieldType.String)]
		public Guid Id { get; set; }
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed)]
		public string Code { get; set; }
		public string Description { get; set; }
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed)]
		public double Price { get; set; }
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed)]
		public long IdCategory { get; set; }
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed)]
		public IList<string> Synonims { get; set; }
		[ElasticProperty(Type = FieldType.Nested)]
		public IList<ProductAttribute> Attributes { get; set; }
	}

	[ElasticType]
	public class ProductAttribute
	{
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed)]
		public string Key { get; set; }
		[ElasticProperty(Index = FieldIndexOption.NotAnalyzed)]
		public string Value { get; set; }
	}
}
]]></script> 

There are different ways to perform mapping with NEST: inference/dynamically generated, code based, attribute-based. I choosed **Attributed-based**, because I like the idea to link the document types to their mappings, it seems to me a natural way to see this thing. But, as you can see, <a href="https://www.elastic.co/guide/en/elasticsearch/guide/current/mapping-analysis.html" target="_blank">mapping comes with analysing</a>. <br/>
A step back: ElastiSearch was born to simplify text search in huge db. Full-text search is not particularly efficient in traditional RDBMS like MSSQL, while is very fast with ElasticSearch. Accordingly to that, ElasticSearch implicitly analyses all fields (because it wants to simplify the programmer's job), and text fields with full-text analysis, unless you say to NOT to do that, as I did in most of my document type fields.

Indeed the catalog I’m working with does not need the full-text search feature and, for this reason, ElasticSearch could be not the right choice for this scenario. But let’s give ElasticSearch a chance.

The migration logic is inside its specific <a href="https://github.com/williamverdolini/FastCatalog/blob/master/Catalog/SQL2Elastic/Logic/ElasticSearchClient.cs" target="_blank">ElasticSearchClient</a>. Again, I want to highlight three aspects about that:

<ol>
<li>In the initialization logic there is the mapping logic taken from the document type's attributes</li>
<li>XML-to-JSON mapping is natural too

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public void Save(SQLProduct dbProduct)
{
	Contract.Requires<ArgumentNullException>(dbProduct != null, "dbProduct");
	var product = new ESProduct
	{
		Id = Guid.NewGuid(),
		Code = dbProduct.Data.Code,
		Description = dbProduct.Data.Description,
		IdCategory = dbProduct.Data.IdCategory,
		Price = Math.Round(10 + rnd.NextDouble() * (1000 - 10), 2),
		Synonims = dbProduct.Synonims.ToStringList(),
		Attributes = dbProduct.Attributes.ToProductAttributes()
	};
	products.Add(product);
}
]]></script> 
</li>
<li>No post-migration logic is necessary, because, by now, all the analysis settings put on initialization step are good enough. I'm waiting, at this point, to have migration time greater than with MongoDb, because when ElasticSearch indexes a document, it populates some other fields and index data...let's see.</li>
</ol>

Here is the console log for SQl to ElasticSearch migration:

<img src="{{ BASE_PATH }}/images/fastcatalog/fastcatalog_elastic_console.png"  class="img-rounded"  /><br/>

as expected, but pretty good.

### Queries

Let's see the queries and times with ElastiSearch for multi-attribute catalog:

##### Query for all product attributes (~175ms)
<script type="syntaxhighlighter" class="brush: js">
<![CDATA[
GET /catalog/products/_search?search_type=count
{
  "aggs": {
    "multi_properties": {
      "nested": {
        "path": "attributes"
      },
      "aggs": {
        "all_properties": {
          "terms": {
            "field": "key",
            "size": 0,
            "order": {
              "_term": "asc"
            }
          },
          "aggs": {
            "all_values_per_property": {
              "terms": {
                "field": "value",
                "size": 10,
                "order": {
                  "_term": "asc"
                }
              }
            }
          }
        }
      }
    }
  }
}
]]></script> 

##### Query for product attributes filtered by some attribute values  (~6ms)
<script type="syntaxhighlighter" class="brush: js">
<![CDATA[
GET /catalog/products/_search?search_type=count
{
  "aggs": {
    "multi_properties": {
      "nested": {
        "path": "attributes"
      },
      "aggs": {
        "all_properties": {
          "terms": {
            "field": "key",
            "size": 0
          },
          "aggs": {
            "all_values_per_property": {
              "terms": {
                "field": "value",
                "size": 10
              }
            }
          }
        }
      }
    }
  },  
  "query": {
    "filtered": {
      "filter": {
        "bool": {
          "must": [
            {
              "nested": {
                "path": "attributes",
                "query": {
                  "bool": {
                    "must": [
                      {"term": {
                        "key": {
                          "value": "FORMATO"
                        }
                      }},
                      {"term": {
                        "value": {
                          "value": "0402 (1.0 x 0.5mm)"
                        }
                      }}
                    ]
                  }
                }
              }
            },
            {
              "nested": {
                "path": "attributes",
                "query": {
                  "bool": {
                    "must": [
                      {"term": {
                        "key": {
                          "value": "TOLLERANZA"
                        }
                      }},
                      {"terms": {
                        "value": ["± 0.01%","± 0.05%","± 0.1%"]
                      }
                       
                      }
                    ]
                  }
                }
              }
            },
            {
              "nested": {
                "path": "attributes",
                "query": {
                  "bool": {
                    "must": [
                      {"term": {
                        "key": {
                          "value": "TCR (ppm)"
                        }
                      }},
                      {"term": {
                        "value": {
                          "value": "5.0"
                        }
                      }}
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    }
  }
}
]]></script> 

##### Query for documents filtered by some attribute values 
The same queries as before, but without the **search_type=count** querystring parameter. So you don't need to perform two different queries to get all the result to display. Very powerful!!! Very Fast!!!

<div class="col-md-6">
<h4>Pros</h4>
<ul>
<li>Fast...wow!</li>
<li>Again, the query results give the complete <b>structured json object</b>, with the nested couples of attribute's value/count and, better than MongoDb, with Elastic'aggregates you can set the size of you aggregation and this fits very well with "see all values" feature in multi-attributes catalog.</li>
<li>No need for separate find queries: the aggregate without <b>search_type=count</b> querystring parameter, returns the matched documents</li>
</ul>
</div>
<div class="col-md-6">
<h4>Cons</h4>
<ul>
<li>IMHO, queries and aggregates are not so readable and maintainable as they are with MongoDb</li>
<li>Not so fast as MongoDb in the migration phase</li>
</ul>
</div>
