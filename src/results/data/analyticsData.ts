// FIX: Updated getBrandInfoWithLogos to prevent repeated warnings
export const getBrandInfoWithLogos = (): Array<{
  brand: string;
  geo_score: number;
  mention_score: number;
  mention_count: number;
  logo: string;
  geo_tier: string;
  mention_tier: string;
  summary: string;
  outlook: string;
  mention_breakdown: Record<string, number> | null;
}> => {
  const analytics = getAnalytics();
  
  // Early return with empty array if no analytics
  if (!analytics) {
    return [];
  }
  
  const brands = analytics?.brands;
  
  // Only warn once per session about missing brands array
  if (!brands || !Array.isArray(brands)) {
    // Check if we've already warned
    const hasWarned = sessionStorage.getItem('analytics_brands_warning');
    if (!hasWarned) {
      console.warn('⚠️ [ANALYTICS] No brands array found in analytics data');
      sessionStorage.setItem('analytics_brands_warning', 'true');
    }
    return [];
  }
  
  // Map the data to ensure consistent field names and format logos
  return brands.map((brand: any) => ({
    brand: brand.brand,
    geo_score: brand.geo_score || 0,
    mention_score: brand.mention_score || 0,
    mention_count: brand.mention_count || 0,
    logo: formatLogoUrl(brand.logo || ''),
    geo_tier: brand.geo_tier || 'Low',
    mention_tier: brand.mention_tier || 'Low',
    summary: brand.summary || '',
    outlook: brand.outlook || 'Neutral',
    mention_breakdown: brand.mention_breakdown || null
  }));
};

// FIX: Add safety check for getMentionsPosition
export const getMentionsPosition = (): { 
  position: number; 
  tier: string; 
  totalBrands: number;
  topBrandMentions: number;
  brandMentions: number;
  allBrandMentions: Record<string, number>;
} => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Safety check - return default values if no data
  if (!brandInfoWithLogos.length || !brandName) {
    return {
      position: 0,
      tier: 'Low',
      totalBrands: 0,
      topBrandMentions: 0,
      brandMentions: 0,
      allBrandMentions: {}
    };
  }
  
  // Use mention_score for all calculations
  const allMentionScores: Record<string, number> = {};
  brandInfoWithLogos.forEach(b => {
    allMentionScores[b.brand] = b.mention_score;
  });
  
  // Sort by mention_score descending to find position
  const sortedByMentions = [...brandInfoWithLogos].sort((a, b) => b.mention_score - a.mention_score);
  const brandIndex = sortedByMentions.findIndex(b => b.brand === brandName);
  const position = brandIndex >= 0 ? brandIndex + 1 : sortedByMentions.length;
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  const brandMentionScore = brandInfo?.mention_score || 0;
  const topMentionScore = sortedByMentions[0]?.mention_score || 0;
  
  const tier = brandInfo?.mention_tier || 'Low';
  
  return {
    position,
    tier,
    totalBrands: brandInfoWithLogos.length,
    topBrandMentions: topMentionScore,
    brandMentions: brandMentionScore,
    allBrandMentions: allMentionScores
  };
};

// FIX: Add safety check for getBrandMentionResponseRates
export const getBrandMentionResponseRates = (): Array<{
  brand: string;
  responseRate: number;
  logo: string;
  isTestBrand: boolean;
}> => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Safety check
  if (!brandInfoWithLogos.length || !brandName) {
    return [];
  }
  
  // Map all brands with their mention_score
  const allBrandsWithRates = brandInfoWithLogos.map(b => ({
    brand: b.brand,
    responseRate: b.mention_score,
    logo: b.logo,
    isTestBrand: b.brand === brandName
  }));
  
  // Sort all brands by mention_score descending
  const sortedBrands = [...allBrandsWithRates].sort((a, b) => b.responseRate - a.responseRate);
  
  // Get top 2 competitors (non-test brands with highest scores)
  const topTwoCompetitors = sortedBrands.filter(b => !b.isTestBrand).slice(0, 2);
  
  // Get the test brand
  const testBrand = sortedBrands.find(b => b.isTestBrand);
  
  // Combine all three brands
  const combinedBrands = [...topTwoCompetitors];
  if (testBrand) {
    combinedBrands.push(testBrand);
  }
  
  // Sort the final result by responseRate descending
  return combinedBrands.sort((a, b) => b.responseRate - a.responseRate);
};

// FIX: Add safety check for getSentiment
export const getSentiment = () => {
  const brandName = getBrandName();
  const brandInfoWithLogos = getBrandInfoWithLogos();
  
  // Safety check
  if (!brandInfoWithLogos.length || !brandName) {
    return { 
      dominant_sentiment: 'N/A', 
      summary: 'No sentiment data available' 
    };
  }
  
  const brandInfo = brandInfoWithLogos.find(b => b.brand === brandName);
  
  return { 
    dominant_sentiment: brandInfo?.outlook || 'N/A', 
    summary: brandInfo?.summary || 'No sentiment data available' 
  };
};

// FIX: Clear warning flag when new data is set
export const setAnalyticsData = (apiResponse: any) => {
  if (apiResponse && apiResponse.analytics && Array.isArray(apiResponse.analytics)) {
    const mostRecent = apiResponse.analytics?.[0];
    const signature = JSON.stringify({
      product_id: apiResponse.product_id || mostRecent?.product_id,
      id: mostRecent?.id,
      date: mostRecent?.date,
      updated_at: mostRecent?.updated_at,
      status: mostRecent?.status,
    });

    const existingSig = localStorage.getItem(`${ANALYTICS_STORAGE_KEY}__sig`);
    if (existingSig === signature) {
      currentAnalyticsData = apiResponse;
      return;
    }

    currentAnalyticsData = apiResponse;
    
    // Clear the warning flag when new data arrives
    sessionStorage.removeItem('analytics_brands_warning');
    
    try {
      localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(apiResponse));
      localStorage.setItem(`${ANALYTICS_STORAGE_KEY}__sig`, signature);
      console.log('📦 [ANALYTICS] Data stored in localStorage');
    } catch (e) {
      console.error('Failed to store analytics data in localStorage:', e);
    }
  } else {
    console.error('Invalid analytics data format');
  }
};