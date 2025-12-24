import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown, BarChart3, Globe, Target, AlertTriangle, ExternalLink, Lightbulb } from "lucide-react";
import {
  getBrands,
  getBrandName,
  getModelsUsed,
  getLLMWiseData,
  getExecutiveSummary,
  getRecommendations,
  getPlatformPresence,
  getAIVisibilityMetrics,
  loadAnalyticsFromStorage,
  initializeWithSampleData,
  getPrimaryBrand,
  formatLogoUrl
} from "../lib/analyticsData";

export default function Dashboard() {
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
  const primaryBrand = getPrimaryBrand();
  const brandName = getBrandName();
  const modelsUsed = getModelsUsed();
  const llmData = getLLMWiseData();
  const executiveSummary = getExecutiveSummary();
  const recommendations = getRecommendations();
  const platformPresence = getPlatformPresence();
  const metrics = getAIVisibilityMetrics();

  // Prepare chart data
  const brandScoreData = brands.map(b => ({
    name: b.brand.length > 15 ? b.brand.slice(0, 15) + '...' : b.brand,
    fullName: b.brand,
    geoScore: b.geo_score,
    mentionScore: b.mention_score,
    logo: b.logo
  })).sort((a, b) => b.geoScore - a.geoScore);

  const llmChartData = Object.entries(llmData).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    mentions: data.mentions_count,
    sources: data.sources,
    avgRank: data.average_rank
  }));

  const outlookColors: Record<string, string> = {
    'Positive': '#10b981',
    'Neutral': '#6b7280',
    'Negative': '#ef4444'
  };

  const tierColors: Record<string, string> = {
    'High': '#10b981',
    'Medium': '#f59e0b',
    'Low': '#ef4444'
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">Executive Dashboard</h1>
          <p className="text-muted-foreground">Brand visibility analysis for <span className="font-semibold text-primary">{brandName}</span></p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">GEO Score</h3>
                <Badge className={`${tierColors[metrics.tier] === '#10b981' ? 'bg-emerald-100 text-emerald-800' : tierColors[metrics.tier] === '#f59e0b' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {metrics.tier}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-foreground">{metrics.score}</div>
              <p className="text-sm text-muted-foreground mt-1">Brand visibility score</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Mention Score</h3>
                <Badge className={`${tierColors[metrics.mentionTier] === '#10b981' ? 'bg-emerald-100 text-emerald-800' : tierColors[metrics.mentionTier] === '#f59e0b' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                  {metrics.mentionTier}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-foreground">{metrics.mentionScore}</div>
              <p className="text-sm text-muted-foreground mt-1">Across {metrics.mentionCount} mentions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Competitors Analyzed</h3>
              </div>
              <div className="text-3xl font-bold text-foreground">{metrics.totalBrands}</div>
              <p className="text-sm text-muted-foreground mt-1">Brands in analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">LLMs Used</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                {modelsUsed.map((model, i) => (
                  <Badge key={i} variant="outline" className="capitalize">{model}</Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-3">AI models analyzed</p>
            </CardContent>
          </Card>
        </div>

        {/* Brand Score Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Brand GEO Score Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandScoreData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg shadow-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <img src={data.logo} alt="" className="w-6 h-6 rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                              <span className="font-medium">{data.fullName}</span>
                            </div>
                            <p className="text-sm">GEO Score: <span className="font-bold">{data.geoScore}</span></p>
                            <p className="text-sm">Mention Score: <span className="font-bold">{data.mentionScore}</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="geoScore" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Competitors Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Competitor Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Brand</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">GEO Score</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Mention Score</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">GEO Tier</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">Outlook</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand, index) => (
                    <tr key={index} className={`border-b hover:bg-muted/50 ${brand.brand === brandName ? 'bg-primary/5' : ''}`}>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={brand.logo} 
                            alt={brand.brand} 
                            className="w-8 h-8 rounded object-contain bg-background"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brand)}&background=random&size=32`;
                            }}
                          />
                          <div>
                            <span className="font-medium text-foreground">{brand.brand}</span>
                            {brand.brand === brandName && (
                              <Badge className="ml-2 text-xs" variant="secondary">Primary</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-semibold">{brand.geo_score}</td>
                      <td className="py-4 px-4 text-center">{brand.mention_score}</td>
                      <td className="py-4 px-4 text-center">
                        <Badge className={`${tierColors[brand.geo_tier] === '#10b981' ? 'bg-emerald-100 text-emerald-800' : tierColors[brand.geo_tier] === '#f59e0b' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                          {brand.geo_tier}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 ${brand.outlook === 'Positive' ? 'text-emerald-600' : brand.outlook === 'Negative' ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {brand.outlook === 'Positive' ? <TrendingUp className="w-4 h-4" /> : brand.outlook === 'Negative' ? <TrendingDown className="w-4 h-4" /> : null}
                          {brand.outlook}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Executive Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {executiveSummary.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 mt-1">✓</span>
                    <span className="text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {executiveSummary.weaknesses.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-red-500 mt-1">✗</span>
                    <span className="text-foreground">{weakness}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.slice(0, 4).map((rec, i) => (
                <div key={i} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={rec.impact === 'High' ? 'destructive' : rec.impact === 'Medium' ? 'secondary' : 'outline'}>
                      {rec.impact} Impact
                    </Badge>
                    <Badge variant="outline">{rec.overall_effort} Effort</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{rec.overall_insight}</p>
                  <p className="text-sm font-medium text-foreground">{rec.suggested_action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Presence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Platform Presence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(platformPresence).map(([platform, url]) => (
                <div key={platform} className="flex flex-col items-center p-3 border rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${url ? 'bg-emerald-100' : 'bg-muted'}`}>
                    <span className={`text-sm font-bold ${url ? 'text-emerald-700' : 'text-muted-foreground'}`}>
                      {platform.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs capitalize text-center">{platform.replace('_', ' ')}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground mt-1">Not listed</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conclusion */}
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground leading-relaxed">{executiveSummary.conclusion}</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
