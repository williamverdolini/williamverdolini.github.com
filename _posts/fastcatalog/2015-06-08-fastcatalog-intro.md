---
title: "Intro"
excerpt: "Fast Catalog"
header:
    overlay_image: "https://images.unsplash.com/photo-1503449377594-32dd9ac4467c?auto=format&fit=crop&w=1351&q=80"
    caption: "Photo credit: [**Unsplash**](https://unsplash.com)"
toc: false
toc_label: "Contents"
author_profile: false
sidebar:
  nav: fastcatalog
description: NoSQL, Prototyping, Tech
group: FastCatalog
tags: [Technology,Prototyping,NoSQL]
---

These few articles born to share some thoughts about common functionality in e-commerce: multi-attribute catalog search. Something like the followings:

<img src="{{ BASE_PATH }}/images/fastcatalog/fastcatalog1.png"  class="img-rounded"  /><br/>
<img src="{{ BASE_PATH }}/images/fastcatalog/fastcatalog2.png"  class="img-rounded"  /><br/><br/>


Generally speaking it’s quite easy to implement this feature, but there are some situation where the size of product catalog could be huge (in terms of number of products) and so the performance could be a very strategic and vital key point to analyze.

All began with an our customer who works on Electronic components market. This market is characterized by an enormous number of product, because a product often differs from the other just for little variations on tolerance or whatever. So under a single category, it could be hundreds of thousands or millions of different products…that a user should be able to search and filter by the product’s properties.

Our (traditional) approach was with relational database: MSSQL, in particular. As always, you could define different implementation logic, but ours is a very common way to realize that. Here are the main (simplified) tables involved:

<img src="{{ BASE_PATH }}/images/fastcatalog/fastcatalog_tables.png"  class="img-rounded" /><br/><br/>

- **Properties & PropertyValues**: are the dictionaries of all possible attribute/values
- **Products**: (very simple) product entity table
- **ProductProperties**: are the links between products and their attribute values

Note: names and structure of tables from public repository are not exactly the same (because of original “italian” DB).

We actually use T-SQL Stored Procedure to improve performance (using temp tables and caching), but the basic query performs the following logic to get all the properties.

```sql
select IDProperty, ProprietyDesc, IDValue, ValueDesc, COUNT(*) as COUNT
from (
	select P.IDProperty,
		   P.description as ProprietyDesc,
			 P.IdCategory,
		   PV.IDValue,
		   PV.description as ValueDesc 			 
	from eice.ProductProperties PP 
	inner join eice.Products P on PP.idprodotto = P.IDProdotto
	inner join PropertyValues PV on PP.IDValue = PV.IDValue
	inner join Properties PR on PR.IDProperty = PV.IDProperty
	where P.IdCategory = @IdCategory
)  T
group by IDProprieta,ProprietaDesc,IDValore,ValoreDesc
order by IDProprieta,ProprietaDesc,IDValore,ValoreDesc
```

When the user makes some selection, things become more complex because we first have to populate a temp-table with the product Ids 
that match the selection criteria and, after that, we make grouping. 
That’s why we’ve used Store Procedures, because it’s hard to do that with a simple query and to improve general performance.

Starting from this, I tried to move this scenario into <a href="https://en.wikipedia.org/wiki/NoSQL" target="_blank">NoSQL</a> realm, 
prototyping simple migration procedures to move from SQL to <a href="https://www.mongodb.org/" target="_blank">MongoDB</a> and from SQL 
to <a href="https://www.elastic.co/" target="_blank">ElasticSearch</a> and tried to figure out pros and cons of different solutions, 
in order to scale out to high volumes.

**Disclaimer**: these are my first experimentations with MongoDB and ElasticSearch and, of course, there could be a better way to do what I did. 
I will thank anyone who wants to share his/her insights and let me grow. 
