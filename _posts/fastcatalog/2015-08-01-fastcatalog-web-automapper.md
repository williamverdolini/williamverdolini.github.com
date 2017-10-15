---
layout: wvpost
title: "Fast Catalog"
tagline: Automapper
header: Automapper
description: Prototyping, Tech, Automapper, Castle Windsor
group: FastCatalog
tags: [Technology,Prototyping,Automapper,Castle Windsor]
---
{% include JB/setup %}

<a href="http://automapper.org/" target="_blank">Automapper</a> is a nice discovery because it's very easy to setup, it's very easy to use and the code generated is very neat. _Yeah!_

What Automapper is? 

> A convention-based object-object mapper.

That's all, but it's enough! 

It can unload your code of all that boring, heavy, "often-business-less" code to map one object to another type of object. Never more without (or without something similar).

### Configuration

Setting up Automapper using an <a href="https://en.wikipedia.org/wiki/Inversion_of_control" target="_blank">IoC container</a> as <a href="https://github.com/castleproject/Windsor/blob/master/docs/README.md" target="_blank">Castle.Windsor</a> is very simple. Here are the steps I followed:

<ol>
<li>Configure the mapper searching and adding all the <a href="https://github.com/AutoMapper/AutoMapper/wiki/Configuration" target="_blank">Automapper profiles</a>.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [14]" >
<![CDATA[
// In Global.asax or during App Initialization
protected void Application_Start()
{
	...

	// Configure all AutoMapper Profiles
	AutoMapperConfig.Configure();
}

public static class AutoMapperConfig
{
	public static void Configure()
	{
		Mapper.Initialize(x => GetConfiguration(Mapper.Configuration));
	}

	private static void GetConfiguration(IConfiguration configuration)
	{
		var profiles = typeof(SearchInputMapperProfile).Assembly.GetTypes().Where(x => typeof(Profile).IsAssignableFrom(x));
		foreach (var profile in profiles)
		{
			configuration.AddProfile(Activator.CreateInstance(profile) as Profile);
		}
	}
}
]]></script> 


</li>
<li>Configure the DI container in order to use a factory method to instantiate the mapper engine everywhere you need it. 

<script type="syntaxhighlighter" class="brush: csharp;highlight: [5]" >
<![CDATA[
public class MappersInstaller : IWindsorInstaller
{
	public void Install(Castle.Windsor.IWindsorContainer container, Castle.MicroKernel.SubSystems.Configuration.IConfigurationStore store)
	{
		container.Register(Component.For<IMappingEngine>().UsingFactoryMethod(() => Mapper.Engine));
	}
}
]]></script> 

</li>
</ol>

### Usage
After the above configuration, using Automapper is very straightforward. Mapping is a cross-cutting concern, so you could use both in Controllers or in Business Logic or in Repository as well.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [6,19]" >
<![CDATA[
public class CatalogController : ApiController
{
	private readonly ICatalogWorker worker;
	private readonly IMappingEngine mapper;

	public CatalogController(ICatalogWorker worker, IMappingEngine mapper)
	{
		Contract.Requires<ArgumentNullException>(worker != null, "worker");
		Contract.Requires<ArgumentNullException>(mapper != null, "mapper");
		this.worker = worker;
		this.mapper = mapper;
	}

	[HttpPost]
	public async Task<IHttpActionResult> Search(SearchInputViewModel searchInput)
	{
		try
		{
			SearchInput input = mapper.Map<SearchInputViewModel, SearchInput>(searchInput);
			return Ok(await worker.Search(input));
		}
		catch (Exception ex)
		{
			return BadRequest(ex.Message);
		}
	}
}
]]></script> 

### Profiles
Profiles are the classes where the mapping logic resides. They could be very simple if the property names of source and target classes are exactly the same (or <a href="https://github.com/AutoMapper/AutoMapper/wiki/Flattening" target="_blank">flattened</a>). This is very useful when you have to work with <a href="https://en.wikipedia.org/wiki/Data_transfer_object" target="_blank">DTO</a>.

<script type="syntaxhighlighter" class="brush: csharp;highlight: [5,6]" >
<![CDATA[
public class SearchInputMapperProfile : Profile
{
	protected override void Configure()
	{
		CreateMap<SearchInputViewModel, SearchInput>();
		CreateMap<FilteredProductAttributeViewModel, FilteredProductAttribute>();
	}
}
]]></script> 

But it's very flexible and allow you to define your own mapping logic, e.g. using <a href="https://github.com/AutoMapper/AutoMapper/wiki/Custom-value-resolvers" target="_blank">custom value Resolver</a>.


<script type="syntaxhighlighter" class="brush: csharp;highlight: [6]" >
<![CDATA[
public class OrderedSearchInputMapperProfile : Profile
{
	protected override void Configure()
	{
		CreateMap<OrderedSearchInput, SearchInput>()
			.ForMember(dest => dest.Attributes, opt => opt.ResolveUsing<AttributesResolver>());
	}
}

public class AttributesResolver : ValueResolver<OrderedSearchInput, IList<FilteredProductAttribute>>
{
	protected override IList<FilteredProductAttribute> ResolveCore(OrderedSearchInput source)
	{
		var attributes = new List<FilteredProductAttribute>();
		foreach (string key in source.Attributes.Select(o => o.Key).Distinct())
		{
			attributes.Add(new FilteredProductAttribute { 
				Key = key,
				Values = source.Attributes.Where(s => s.Key.Equals(key)).Select(o => o.Value).ToList()
			});
		}
		return attributes;
	}
}
]]></script> 

or using a complete custom mapping like this:

<script type="syntaxhighlighter" class="brush: csharp;highlight: [6]" >
<![CDATA[
public class SearchResponseMapperProfile : Profile
{
	protected override void Configure()
	{
		CreateMap<ISearchResponse<Product>, IList<ProductAttributeAggregation>>()
			.ConvertUsing(mappingFunction);
	}

	Func<ISearchResponse<Product>, IList<ProductAttributeAggregation>> mappingFunction = (source) =>
	{
		var bucket = source.Aggs.Children("multi_properties");

		IList<ProductAttributeAggregation> aggs = new List<ProductAttributeAggregation>();
		foreach (var item in bucket.Terms("all_properties").Items)
		{
			IList<ValueCount> values = new List<ValueCount>();

			foreach (var val in item.Terms("all_values_per_property").Items)
			{
				values.Add(new ValueCount
				{
					Value = val.Key,
					Count = val.DocCount
				});
			}

			aggs.Add(new ProductAttributeAggregation
			{
				Key = item.Key,
				Values = values
			});
		}
		return aggs;
	};
}
]]></script> 
