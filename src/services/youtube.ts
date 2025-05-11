/**
 * Represents a YouTube video with a title, URL, and optional thumbnail URL.
 */
export interface YouTubeVideo {
  /**
   * The title of the YouTube video.
   */
  title: string;
  /**
   * The URL of the YouTube video.
   */
  url: string;
   /**
    * The URL of the video's thumbnail image (optional).
    */
   thumbnailUrl?: string;
}

/**
 * Asynchronously retrieves YouTube videos related to a given recipe using YouTube Data API v3.
 *
 * @param recipeName The name of the recipe to search for on YouTube.
 * @param maxResults Maximum number of results to return (default: 15)
 * @returns A promise that resolves to an array of YouTubeVideo objects.
 */
export async function getYouTubeVideos(recipeName: string, maxResults = 15): Promise<YouTubeVideo[]> {
  try {
    // Get API key from environment variable
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    if (!apiKey) {
      // console.error('YouTube API key not found in environment variables');
      return getFallbackVideos(recipeName);
    }

    const query = `Recipe for '${recipeName}'`;
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${maxResults}&q=${encodedQuery}&key=${apiKey}`;

    console.log(`Fetching YouTube videos for recipe: "${recipeName}"`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`YouTube API failed with status ${response.status}: ${errorText}`);
      return getFallbackVideos(recipeName);
    }
    
    const data = await response.json();

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      console.warn(`No YouTube videos found for: ${recipeName}`);
      return getFallbackVideos(recipeName);
    }

    const videos = data.items.map((item: any) => {
      const videoId = item.id.videoId;
      return {
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || 
                     item.snippet.thumbnails?.medium?.url || 
                     item.snippet.thumbnails?.default?.url ||
                     `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    });

    console.log(`YouTube API returned ${videos.length} videos for: ${recipeName}`);
    return videos;
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return getFallbackVideos(recipeName);
  }
}

/**
 * Provides fallback videos when the API call fails or returns no results
 */
function getFallbackVideos(recipeName: string): YouTubeVideo[] {
  const encodedSearchTerm = encodeURIComponent(recipeName + ' recipe');
  const simpleSearchTerm = encodeURIComponent(recipeName + ' simple recipe');
  const restaurantSearchTerm = encodeURIComponent(recipeName + ' restaurant style');

  return [
    {
      title: `Best ${recipeName} Recipe Tutorial`,
      url: `https://www.youtube.com/results?search_query=${encodedSearchTerm}`,
      thumbnailUrl: `https://picsum.photos/seed/${encodedSearchTerm}/320/180`,
    },
    {
      title: `Simple ${recipeName} Recipe for Beginners`,
      url: `https://www.youtube.com/results?search_query=${simpleSearchTerm}`,
      thumbnailUrl: `https://picsum.photos/seed/${simpleSearchTerm}/320/180`,
    },
    {
      title: `Restaurant Style ${recipeName} Recipe`,
      url: `https://www.youtube.com/results?search_query=${restaurantSearchTerm}`,
      thumbnailUrl: `https://picsum.photos/seed/${restaurantSearchTerm}/320/180`,
    },
  ];
}
