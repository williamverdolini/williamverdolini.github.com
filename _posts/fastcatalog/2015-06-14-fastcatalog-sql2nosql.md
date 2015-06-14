---
layout: wvpost
title: "Fast Catalog"
tagline: SQL Migration to NoSQL
header: SQL Migration to NoSQL
description: NoSQL, Prototyping, Tech
group: FastCatalog
tags: [Technology,Prototyping,NoSQL]
---
{% include JB/setup %}

SQL Migration to NoSQL means move from table/rows to documents.There are several ways to hit the goal, but I’ve found a particularly efficient and clear way, using XML with SQL Server. The general ETL flow is depicted below:


<img src="{{ BASE_PATH }}/images/fastcatalog/fastcatalog_migration_flow.png"  class="img-rounded"  /><br/><br/>

In the <a href="https://github.com/williamverdolini/FastCatalog" target="_blank">public repository</a> you can find all the code: I’ve structured the code in order to move to a generic NoSQL DB, so I can change the NoSQL target (MongoDB, ElasticSearch, Raven, etc.) without changing the migration Logic. 

###XML Format Query

I’ve use XML format for query. From the <a href="https://msdn.microsoft.com/library/ms178107(v=sql.110).aspx" target="_blank">official SQL Server docs</a>:

> A SELECT query returns results as a rowset. You can optionally retrieve formal results of a SQL query as XML by specifying the FOR XML clause in the query. The FOR XML clause can be used in top-level queries and in sub queries. The top-level FOR XML clause can be used only in the SELECT statement

With XML format I can create all the object structure (with its XML tree) during the extract phase. This make the code very clear and efficient, because allow the migration logic to do a simple mapping between XML Object and JSON Object. Here is the query used to extract all the products catalog:

<script type="syntaxhighlighter" class="brush: sql">
<![CDATA[
select 
	'<Product>'+
	-- Raw Product data
	(select PC1.id, code as 'Code', description, IdCategory from eice.Products PC1 
		left outer join eice.ProductsCategories PCa on PCa.IDProduct = PC1.id
		where PC1.id=PC.id for XML path('Data')) +
	-- Product's attributes
	(select P.Description as 'Key', RTRIM(PV.Description) as 'Value' 
		from eice.ProductProperties PS
		inner join eice.PropertyValues PV on PV.id = PS.IdValue
		inner join eice.Properties P on P.Id = PV.IdProperty
		where PS.IDProduct=PC.id AND ISNULL(PV.Description,'')<>'' for XML path('Attribute')) +
	-- Product's Synonims
	(select PE.CODART as 'Code' from eice.ProductSynonims PE where IdProduct = PC.id for XML raw('Synonim')) +
	'</Product>'
from eice.Products PC
]]></script> 

This query produce a resultset of XML of the following format:


<script type="syntaxhighlighter" class="brush: xml">
<![CDATA[
<Product>
	<Data>
		<IdProduct>10000155769</IdProduct>
		<Code>VTCCR01F001330000000</Code>
		<Description>13.3R 1% 0201 RESISTENZA SMD THICK FILM 1/20W 200ppm VIKING</Description>
		<IdCategory>245710</IdCategory>
	</Data>
	<Attribute>
		<Key>MARCA</Key>
		<Value>VIKING TECH CORPORATION</Value>
	</Attribute>
	<Attribute>
		<Key>TOLLERANZA</Key>
		<Value>± 1%</Value>
	</Attribute>
	<Attribute>
		<Key>MONTAGGIO</Key>
		<Value>SMD</Value>
	</Attribute>
	<Attribute>
		<Key>TIPOLOGIA</Key>
		<Value>Thick Film</Value>
	</Attribute>
	<Attribute>
		<Key>POTENZA (W)</Key>
		<Value>1/20 (Standard)</Value>
	</Attribute>
	<Attribute>
		<Key>UNITA di MISURA</Key>
		<Value>Ohm</Value>
	</Attribute>
	<Attribute>
		<Key>TCR (ppm)</Key>
		<Value>200</Value>
	</Attribute>
	<Attribute>
		<Key>RESISTENZA</Key>
		<Value>13.3</Value>
	</Attribute>
	<Attribute>
		<Key>FORMATO</Key>
		<Value>0201 (0.6 x 0.3mm)</Value>
	</Attribute>
	<Synonim Code="CR0201F13R3P10"/>
	<Synonim Code="CRCW020113R3FNED"/>
	<Synonim Code="ERJ1GNF13R3X"/>
	<Synonim Code="MCR006YRTF13R3"/>
	<Synonim Code="PFR03S13R3-F-1-T10"/>
	<Synonim Code="RC0201FR-0713R3L"/>
	<Synonim Code="RK73H1HTTC13R3F"/>
	<Synonim Code="RM02FTN13R3"/>
	<Synonim Code="RMC1/20-13R3FTP"/>
	<Synonim Code="RTT01-13R3FTH"/>
	<Synonim Code="WCR020113R3FI"/>
	<Synonim Code="WR02X13R3FTL"/>
	<Synonim Code="CR-01FL6--13R3"/>
</Product>
]]></script> 


###Migration Logic

The generic (very simple) approach of migration is:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
new Migrator<NoSQLClient>()
.Initialize()
.Execute();
]]></script> 

In this way, it is possibile to create specific NoSQLClient having:

-	Initialization step to initialize client and database settings
-	Execution step having the XML-to-JSON mapping of a product and calls to specific driver for bulk insert logic. If needed, we can have some “post-migration” logic (e.g. for add some indexes)

The generic migration logic is here:

<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
namespace SQLMigration
{
    public class Migrator<T> where T : IDbClient, new()
    {
        protected IDbClient dbClient;
        private bool IsInitialized = false;
        private int commitStep = 0;

        public Migrator<T> Initialize()
        {
            dbClient = (new T()).Initialize();
            IsInitialized = true;
            commitStep = int.Parse(Resources.CommitStep);
            return this;
        } 

        public void Execute()
        {
            if (IsInitialized)
            {
                Stopwatch sw = new Stopwatch();
                sw.Start();
                int counter = 0;

                using (SqlConnection conn = new SqlConnection(ConfigurationManager.ConnectionStrings[Resources.ConnectionStringKey].ConnectionString))
                {
                    conn.Open();

                    SqlCommand cmd = new SqlCommand(Resources.InitialPopulate, conn);
                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            SQLProduct dbProduct = reader[0].ToString().FromXmlTo<SQLProduct>();
                            dbClient.Save(dbProduct);
                            dbClient.FlushProducts(commitStep);
                            Console.WriteLine("#{0} - code: {1}", (++counter), dbProduct.Data.Code);
                        }
                    }
                    dbClient.FlushProducts();
                }
                sw.Stop();
                Console.WriteLine("Elapsed; {0}", sw.Elapsed);
                Console.WriteLine("Total Records inserted: {0}", counter);
                Console.WriteLine("Insert Rate: {0} rec/sec", (counter / (sw.ElapsedMilliseconds / 1000)));

                dbClient.PostMigration();                
            }
        }
    }
}
]]></script> 

Here you can see the extension method FromXMLTo<T>, that performs the XML deserialization into generic POCO


<script type="syntaxhighlighter" class="brush: csharp">
<![CDATA[
public static T FromXmlTo<T>(this String xml)
{
		T returnedXmlClass = default(T);

		try
		{
				using (TextReader reader = new StringReader(xml))
				{
						try
						{
								returnedXmlClass = (T)new XmlSerializer(typeof(T)).Deserialize(reader);
						}
						catch (InvalidOperationException)
						{
								// String passed is not XML, simply return defaultXmlClass
								throw;
						}
				}
		}
		catch (Exception)
		{
				throw;
		}
		return returnedXmlClass;
}
]]></script> 
