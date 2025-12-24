import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, Search, FileText, ExternalLink } from "lucide-react";
import {
  getBrands,
  getBrandName,
  getLLMWiseData,
  getSearchKeywords,
  getSourcesAndContentImpact,
  loadAnalyticsFromStorage,
  initializeWithSampleData,
  formatLogoUrl
} from "../lib/analyticsData";

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadAnalyticsFromStorage();
    if (!loaded) {
      initializeWithSampleData();
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const brands = getBrands();
  const brandName = getBrandName();
  const llmData = getLLMWiseData();
  const searchKeywords = getSearchKeywords();
  const sourcesData = getSourcesAndContentImpact();

  // LLM Performance Data
  const llmChartData = Object.entries(llmData).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    mentions: data.mentions_count,
    sources: data.sources,
    avgRank: data.average_rank,
    prompts: data.prompts,
    t1: data.t1,
    t2: data.t2,
    t3: data.t3
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  // Brand mention scores for pie chart
  const brandMentionData = brands.map((b, i) => ({
    name: b.brand,
    value: b.mention_score,
    color: COLORS[i % COLORS.length]
  }));

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Detailed performance insights for <span className="font-semibold text-primary">{brandName}</span></p>
        </div>

        <Tabs defaultValue="llm" className="space-y-6">
          <TabsList>
            <TabsTrigger value="llm">LLM Performance</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="sources">Sources</TabsTrigger>
            <TabsTrigger value="brands">Brand Comparison</TabsTrigger>
          </TabsList>

          {/* LLM Performance */}
          <TabsContent value="llm" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>LLM Mentions Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={llmChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="mentions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Mentions" />
                        <Bar dataKey="sources" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Sources" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>LLM Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {llmChartData.map((llm, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">{llm.name}</h4>
                          <Badge variant={llm.avgRank <= 3 ? 'default' : 'secondary'}>
                            Avg Rank: #{llm.avgRank}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Mentions</span>
                            <p className="font-semibold">{llm.mentions}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Sources</span>
                            <p className="font-semibold">{llm.sources}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Prompts</span>
                            <p className="font-semibold">{llm.prompts}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Badge variant="outline" className="text-xs">T1: {llm.t1}%</Badge>
                          <Badge variant="outline" className="text-xs">T2: {llm.t2}%</Badge>
                          <Badge variant="outline" className="text-xs">T3: {llm.t3}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Keywords */}
          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="w-5 h-5 mr-2" />
                  Search Keywords & Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {searchKeywords.map((keyword, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-3">{keyword.name}</h4>
                      <div className="space-y-2">
                        {keyword.prompts.map((prompt, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                            <span className="text-muted-foreground">{i + 1}.</span>
                            <span className="text-foreground">{prompt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources */}
          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Sources & Content Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(sourcesData).map(([sourceName, data], index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-3">{sourceName}</h4>
                      
                      {/* Brand mentions */}
                      {data.mentions && Object.entries(data.mentions).map(([brand, mentionData], i) => (
                        <div key={i} className="bg-muted/50 rounded p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{brand}</span>
                            <div className="flex gap-2">
                              <Badge variant="outline">Count: {mentionData.count}</Badge>
                              <Badge variant="secondary">Score: {mentionData.score}</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{mentionData.insight}</p>
                        </div>
                      ))}

                      {/* Pages used */}
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">Pages Used:</p>
                        <div className="flex flex-wrap gap-2">
                          {data.pages_used.map((page, i) => (
                            <a 
                              key={i} 
                              href={page} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1 bg-primary/10 px-2 py-1 rounded"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {new URL(page).hostname}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Brand Comparison */}
          <TabsContent value="brands" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Mention Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={brandMentionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name.length > 10 ? name.slice(0, 10) + '...' : name}: ${value}`}
                          outerRadius={100}
                          dataKey="value"
                        >
                          {brandMentionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Brand Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {brands.map((brand, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                          <img 
                            src={brand.logo} 
                            alt={brand.brand}
                            className="w-8 h-8 rounded object-contain bg-background"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brand)}&background=random&size=32`;
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{brand.brand}</h4>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">GEO: {brand.geo_score}</Badge>
                              <Badge variant="secondary" className="text-xs">Mentions: {brand.mention_score}</Badge>
                            </div>
                          </div>
                          <span className={`text-sm ${brand.outlook === 'Positive' ? 'text-emerald-600' : brand.outlook === 'Negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
                            {brand.outlook === 'Positive' ? <TrendingUp className="w-4 h-4" /> : brand.outlook === 'Negative' ? <TrendingDown className="w-4 h-4" /> : null}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{brand.summary}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
