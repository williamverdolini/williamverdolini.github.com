---
layout: wvpost
title: "Discitur Project"
tagline: Angular.js Autocomplete
header: Angular.js Autocomplete
description: Discitur Project,Tech,Angular.js,Auto Complete,Autocomplete
group: Discitur_en
tags: [Angular.js]
---
{% include JB/setup %}
<!-- Markup JSON-LD generato da Assistente per il markup dei dati strutturati di Google. -->
<script type="application/ld+json">
{
  "@context" : "http://schema.org",
  "@type" : "Article",
  "name" : "Angular.js Autocomplete",
  "author" : {
    "@type" : "Person",
    "name" : "williamverdolini"
  },
  "datePublished" : "2014-01-30",
  "articleSection" : [ "autocomplete", "Angular.js" ],
  "url" : "http://williamverdolini.github.io/2014/01/30/discitur-Autocomplete_en/"
}
</script>

Among the many positive aspects of this sprint, one of those that has increased my appreciation of Angular framework more than others
was the creation of a textbox with autocomplete feature. Schematizing brutally the feature flow, I can identify four main steps:



<img src="{{ BASE_PATH }}/images/discitur/Autocomplete_en.png" />


1.   The user begins to type the letters of the required field

2.   to each letter entered a request is made to a search service

3.   the search service returns the JSON object values ​​that contain the letters entered

4.   the array of returned data values ​​is rendered as a combobox

 

The functionality, even if small, is a vertical component that runs through all layers of the architecture. 
In the framework with which we normally work (ASP.NET Web Forms, Custom Web Architectures, or in the past JSP, JSF), 
this component can be quite complicated to implement. This type of functionality, seemingly simple and quite complex in practice, 
are the typical "traitor" features: they are usually underestimaded because we do not enter so deep in detail, in the estimation phase (at least the first few times ) 
and punctually the "burned" is definitely higher than the "earned".

In Angular + WebAPI , realize the feature was instead very simple. Here are the steps in detail:
 

**1) Use of <a href="http://angular-ui.github.io/bootstrap/" target="_blank">Angular-ui Bootstrap</a>**

In Angular Bootstrap library exists a component (directive) for 
rendering this feature: the <a href="http://angular-ui.github.io/bootstrap/#/typeahead" target="_blank">Typeahead</a>.

the component can be configured for binding promises, as result of backend service (common $http or $resource). here an example:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[
<input class="form-control input-sm" type="text"
       name="school"
       ng-model="local.school"
       typeahead-wait-ms="300"
       typeahead="k for k in getSchools($viewValue) | filter:$viewValue"
       typeahead-on-select="select('school')"
       typeahead-editable='false'>

]]></script> 


The controller contains the fields for linked object model and the methods to call server-side service:

<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

$scope.local = {
    school: null,
};

$scope.getSchools = function (q) {
    return LessonService.getDistinctValues('school', { schoolQ: q });
}
]]></script> 


**2) Use of standard Angular Service for calling server-side service**

Nothing new. Cleaning the code, remains:


<script type="syntaxhighlighter" class="brush: javascript">
<![CDATA[

.factory('LessonService', [
'$resource',
'$http',
'$q',
'LessonDTO',
'DisciturSettings',
'DiscUtil',
function ($resource, $http, $q, LessonDTO, DisciturSettings, DiscUtil) {
  return {
    // Get Async list of disciplines
    getDistinctValues: function (type, inputParams) {
      switch (type) {
        case ('school'):
          DiscUtil.validateInput('LessonService.getDistinctValues.school', 
               { schoolQ: null }, 
               inputParams);
          break;
        default:
          throw { 
               code: 20003, 
               message: 'invalid type string for LessonService.getDistinctValues :' + type 
          }
    }

    // create deferring result
    var deferred = $q.defer();

    // Retrieve Async data for lesson id in input        
    $http({ method: 'GET', url: DisciturSettings.apiUrl + 'lesson', params: inputParams })
      .success(function (result) {deferred.resolve(result) })
      .error(function (data) {deferred.reject("Error for LessonService.getDistinctValues:" + data); });
    // create deferring result
    return deferred.promise;
    }
  };
}]);
]]></script> 

**2) WebApi 2 + Entity Framework 6**

The realization of this service was ... simple:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
 [HttpGet]
public async Task<List<string>> FindSchool(string schoolQ)
{
   IQueryable<string> schools = db.Lessons
                                  .Where(l => l.School.Contains(schoolQ))
                                  .Select(l => l.School).Distinct();

   return await schools.ToListAsync();
}

]]></script>

**4) Bootstrap Theming (to complete)**

For rendering and the final effect I'm leaning to one of the available themes Bootstrap 3. The effect is very pleasant:

<img src="{{ BASE_PATH }}/images/discitur/Autocomplete-screenshot.png" />


In this component everything was pretty easy (unsurprisingly). 
Surely the Angular Bootstrap directive has the most important role because it does most of the work. 
Who develops a bit knows that it is better to try to find what we need, if someone else has already done it (better) before us.



_<a href="http://www.codinghorror.com/blog/2009/02/dont-reinvent-the-wheel-unless-you-plan-on-learning-more-about-wheels.html" target="_blank">Don’t reinvent the wheel</a>_ Americans say. 