---
title: "Umbraco Upgrade"
tagline: Upgrate to version 6.2.4
header: Upgrate to version 6.2.4
description: Umbraco, Prototyping, Tech
group: Umbraco_Update
tags: [Technology,Umbraco,Prototyping]
---

I did the same steps of <a href="/2014/12/04/umbup-718-manual-upgrade/" target="_blank">previous prototype</a>, now with Umbraco version 6.2.4. And the database schema and data comparison gave a simpler result (I've stroke out the differences):


**Tables with modified structure (DL:5)**<br/>
[cmsContentType]<br/>
[cmsContentTypeAllowedContentType]<br/>
[cmsContentVersion]<br/>
<del>[cmsDataType]</del><br/>
[cmsPropertyType]<br/>
<del>[cmsTagRelationship]</del><br/>
<br/>

**Tables removed  (DL:4)**<br/>
<del>[cmsMacroPropertyType]</del><br/>
[cmsTab]<br/>
[umbracoApp]<br/>
[umbracoAppTree]<br/>
<br/>

**Tables with modified field's names or field's SQL types  (DL:3)**<br/>
[cmsMacroProperty]<br/>
[cmsTags]<br/>
<del>[cmsTask]</del><br/>
[cmsTaskType]<br/>
[umbracoLanguage]<br/>
[umbracoNode]<br/>
[cmsDataType]<br/>
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
[cmsTagRelationship]<br/>
[cmsTask]<br/>
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

###Upgrade Tables with modified structure

####Upgrade ContentType tables
Same script as previous prototype (prototype's failure is never a complete failure)

####Upgrade PropertyType tables
Same script as previous prototype

####Upgrade PropertyData tables
cmsPropertyData Table contains data about macro and document property's content. What I've figured out is that the new release want that the property data (in XML format) has a specific format, like the following:

<script type="syntaxhighlighter" class="brush: html">
<![CDATA[
<?UMBRACO_MACRO macroAlias="......"  otherProperties="values" />
]]></script> 

with properties name in <a href="http://en.wikipedia.org/wiki/CamelCase" target="_blank">CamelCase</a> format.

To achieve this result I've used <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35#file-dev_cms_4-7_update_to_umbraco_6-2-4-gist-sql-L2663-L2822" target="_blank">Regular Expressions in OLE Automation Procedures</a>, inside SQL Server. 

###Removed Tables
Besides cmsTab, other two tables have been removed: umbracoApp, umbracoAppTree. For these there is no migration script, because they became two different config files: <a href="http://our.umbraco.org/documentation/extending-umbraco/section-trees/" target="_blank">application.config and trees.config</a>.
Initially I've created a T-SQL procedure to write the XML files from the legacy tables, but the informations were few and, at the end, I made some manual corrections.

###The complete Upgrade script
I've published <a href="https://gist.github.com/williamverdolini/5c369b4d620405033b35" target="_blank">the complete SQL script to upgrade from Umbraco version 4.7.1 to version 6.2.4</a>.
It uses <a href="http://msdn.microsoft.com/library/ms162773.aspx" target="_blank">sqlcmd</a>, but it's quite easy to remove that variables.

