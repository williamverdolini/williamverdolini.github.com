---
title: "Upgrate to version 7.1.8"
excerpt: "Umbraco Upgrade"
header:
    overlay_image: "/assets/images/hans-peter-gauster-252751.jpg"
    overlay_filter: 0.4
    caption: "Photo by Hans-Peter Gauster on [**Unsplash**](https://unsplash.com/photos/3y1zF4hIPCg)"
toc: true
toc_label: "Contents"
author_profile: false
sidebar:
  nav: umbraco
description: Umbraco, Prototyping, Tech
group: Umbraco_Update

---

After the <a href="/2014/12/03/umbup-installation/" target="_blank">previous step</a> I've got a fresh "To-be" database to compare with my legacy Umbraco database. So, it was arrived the moment to do the hard work: schema and data comparisons...

Big breath, switch off all notification alarms (email, phone) and go!

the comparison was realized thanks to Schema and Data Compare features offered by SQL Server Data Tools (SSDT) integrated in Visual Studio 2013. 
I've set some option for the schema comparison, in order to generate a better publishing sql script.


<img src="{{ BASE_PATH }}/images/umbracoupd/comparison-options.png" class="img-rounded" style="width: 100%; height:100%" />

the following is a summary of the differences founded, grouped by difficulty level (DL): 1 = simple, 5 = difficult.

**Tables with modified structure (DL:5)**<br/>
[cmsContentType]<br/>
[cmsContentTypeAllowedContentType]<br/>
[cmsContentVersion]<br/>
[cmsDataType]<br/>
[cmsPropertyType]<br/>
[cmsTagRelationship]<br/>
<br/>

**Tables removed  (DL:4)**<br/>
[cmsMacroPropertyType]<br/>
[cmsTab]<br/>
[umbracoApp]<br/>
[umbracoAppTree]<br/>
<br/>

**Tables with modified field's names or field's SQL types  (DL:3)**<br/>
[cmsMacroProperty]<br/>
[cmsTags]<br/>
[cmsTask]<br/>
[cmsTaskType]<br/>
[umbracoLanguage]<br/>
[umbracoNode]<br/>
[umbracoUser]<br/>
[umbracoUser2NodeNotify]<br/>
[umbracoUser2NodePermission]<br/>
<br/>

**Tables with modified indexes and other constraints (DL:2)**<br/>
[cmsContent]<br/>
[cmsDocumentType]<br/>
[cmsMember2MemberGroup]<br/>
[cmsMemberType]<br/>
[cmsPreviewXml]<br/>
[umbracoUserLogins]<br/>
<br/>

**Tables with modified field's collations  (DL:1)**<br/>
[cmsContentXml]<br/>
[cmsDataTypePreValues]<br/>
[cmsDictionary]<br/>
[cmsDocument]<br/>
[cmsLanguageText]<br/>
[cmsMacro]<br/>
[cmsMember]<br/>
[cmsPropertyData]<br/>
[cmsStylesheet]<br/>
[cmsStylesheetProperty]<br/>
[cmsTemplate]<br/>
[umbracoDomains]<br/>
[umbracoLog]<br/>
[umbracoRelation]<br/>
[umbracoRelationType]<br/>
[umbracoUser2app]<br/>
[umbracoUserLogins]<br/>
<br/>

Furthermore, there were some new tables...


## Upgrade Tables with modified structure
At first I faced the most difficult set of tables, because solving those could allow me to understand the global effort to complete the prototype and verify what could be closed at the end of my time-box.

### Upgrade ContentType tables
There are at least three tables in this group: cmsContentType, cmsContentType2ContentType (**NEW table!**), cmsContentTypeAllowedContentType.
Their purpose is to define the relations among <a href="http://our.umbraco.org/wiki/how-tos/working-with-document-types" target="_blank">Umbraco Document Types</a>.

I've changed the generated script in order to:

- <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35#file-dev_cms_4-7_update_to_umbraco_6-2-4-gist-sql-L796-L851" target="_blank">copy contentType records in a temporary table</a>
- <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35#file-dev_cms_4-7_update_to_umbraco_6-2-4-gist-sql-L1778-L1787" target="_blank">Populate new table cmsContentType2ContentType using the temp table</a>

### Upgrade PropertyType tables
There are two tables in this group: cmsPropertyType, cmsPropertyTypeGroup (**NEW table!**). These tables manage the relations of Document property, their relationship, their type, etc. About this topic there is another table involved: cmsTab (that groups properties in specific tabs), that was removed in the new release...

I've changed the generated script in order to:

- Keep cmsTab table till the end of upgrade process
- <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35#file-dev_cms_4-7_update_to_umbraco_6-2-4-gist-sql-L1222-L1278" target="_blank">Create a first version of new cmsPropertyType, without dropping the old one, but renaming it</a>
- <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35#file-dev_cms_4-7_update_to_umbraco_6-2-4-gist-sql-L2581-L2584" target="_blank">Populate new cmsPropertyTypeGroup table from cmsTab</a>
- <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35#file-dev_cms_4-7_update_to_umbraco_6-2-4-gist-sql-L2587-L2656" target="_blank">Create and run a procedure to correctly update cmsPropertyType, cmsPropertyTypeGroup</a>


### Upgrade DataType tables
Tables like cmsDataType contain data about how (macro's and content's) properties are managed. 
Here came some big problems...Actually we have customized some functionalities for insert/edit macro properties, creating some custom back-office module. So, besides the data and the tables, we should spend a lot of time to rewrite these functionalities for the renewed Umbraco back office, developed in Angular.js.
Probably it's not just a problem about my time-box, but also about my (implicit) goals: in this moment I can't spend too much time to allow the dev team learning Angular.js. I know that framework, it's cool, but <a href="http://www.bennadel.com/blog/2439-my-experience-with-angularjs-the-super-heroic-javascript-mvw-framework.htm" target="_blank">it's not so easy as it seems the first days</a>...and I’d want my dev team to spend time learning other framework that could pump the application performance, like AspNet.MVC (<a href="http://www.codeproject.com/Articles/821275/Webforms-vs-MVC-and-Why-MVC-is-better" target="_blank">vs WebForms</a>).

## So...
Umbraco 7.1.8 is NOT my landing version...<br/>
This prototype is failed. <br/>
<a href="/2014/12/02/umbup-process/#off-proc" target="_blank">Second failure</a>.
